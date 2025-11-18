import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import Config from 'react-native-config';
import { authConfig } from './config/auth';

// REQUIRED ENV VARS:
// MSAL_CLIENT_ID, MSAL_REDIRECT_URI (e.g. wardapp://auth), MSAL_AUTHORITY (e.g. https://login.microsoftonline.com/common)
console.warn('Using AAD Client ID:', Config.MSAL_CLIENT_ID);
console.warn('Using AAD Redirect URI:', Config.MSAL_REDIRECT_URI);
console.warn('Using AAD Authority:', Config.MSAL_AUTHORITY);

if (!Config.MSAL_CLIENT_ID || !Config.MSAL_REDIRECT_URI || !Config.MSAL_AUTHORITY) {
  console.warn('Missing required AAD env vars.');
}

const { scopes, authorizeEndpoint, tokenEndpoint, clientId, redirectUri } = authConfig;

function randomVerifier(len = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function sha256Base64Url(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const bytes = Array.from(new Uint8Array(digest));
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return b64;
}

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{ givenName?: string; surname?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const signIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const codeVerifier = randomVerifier();
      const codeChallenge = await sha256Base64Url(codeVerifier);

      const authUrl =
        `${authorizeEndpoint}?client_id=${encodeURIComponent(clientId)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent(scopes.join(' '))}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        `&code_challenge_method=S256`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type !== 'success' || !result.url) {
        throw new Error('User cancelled or no redirect.');
      }

      const parsed = Linking.parse(result.url);
      const code = parsed.queryParams?.code as string | undefined;
      if (!code) throw new Error('No authorization code returned.');

      const form = new URLSearchParams();
      form.append('client_id', clientId);
      form.append('scope', scopes.join(' '));
      form.append('redirect_uri', redirectUri);
      form.append('grant_type', 'authorization_code');
      form.append('code_verifier', codeVerifier);

      const tokenResp = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString()
      });

      if (!tokenResp.ok) {
        const t = await tokenResp.text();
        throw new Error(`Token error ${tokenResp.status}: ${t}`);
      }
      const tokenJson = await tokenResp.json();
      const at = tokenJson.access_token;
      if (!at) throw new Error('No access token in response.');
      setAccessToken(at);
      await loadProfile(at);
    } catch (e: any) {
      setError(e.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (token: string) => {
    const resp = await fetch('https://graph.microsoft.com/v1.0/me?$select=givenName,surname', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Graph error ${resp.status}: ${text}`);
    }
    const json = await resp.json();
    setProfile({ givenName: json.givenName, surname: json.surname });
  };

  const signOut = () => {
    // Front-end sign-out: clear tokens and profile. (For full sign-out open end-session endpoint.)
    setAccessToken(null);
    setProfile(null);
  };

  return (
    <View style={styles.container}>
      {!profile && !loading && <Button title="Sign in" onPress={signIn} />}
      {profile && !loading && (
        <View style={{ gap: 8 }}>
          <Text style={styles.text}>
            {profile.givenName} {profile.surname}
          </Text>
          <Button title="Sign out" onPress={signOut} />
        </View>
      )}
      {loading && <ActivityIndicator color="#fff" />}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  text: { color: '#fff', fontSize: 18 },
  error: { color: '#ff6b6b', marginTop: 8 }
});

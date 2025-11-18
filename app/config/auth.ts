import Config from 'react-native-config';

type AuthConfig = {
  clientId: string;
  redirectUri: string;
  authority: string;
  scopes: string[];
  authorizeEndpoint: string;
  tokenEndpoint: string;
};

const trim = (v: string) => v.replace(/\/+$/,'');
const clientId = Config.MSAL_CLIENT_ID || '';
const redirectUri = Config.MSAL_REDIRECT_URI || '';
const authority = trim(Config.MSAL_AUTHORITY || 'https://login.microsoftonline.com/common');
const scopes = ['openid','profile','User.Read'];

if (!clientId || !redirectUri || !authority) {
  console.warn('Missing MSAL env vars in .env');
}

export const authConfig: AuthConfig = {
  clientId,
  redirectUri,
  authority,
  scopes,
  authorizeEndpoint: `${authority}/oauth2/v2.0/authorize`,
  tokenEndpoint: `${authority}/oauth2/v2.0/token`
};
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies
   ```bash
   npm install
   ```

2. Create a .env file (already ignored by .gitignore)
   Windows (PowerShell):
   ```powershell
   New-Item .env -ItemType File -Force
   ```
   Windows (cmd):
   ```cmd
   type NUL > .env
   ```
   macOS/Linux:
   ```bash
   touch .env
   ```

   Add values:
   ```
   MSAL_CLIENT_ID=YOUR_CLIENT_ID
   MSAL_REDIRECT_URI=wardapp://auth
   MSAL_AUTHORITY=https://login.microsoftonline.com/common
   ```

   Notes:
   - react-native-config loads .env by default at native build time.
   - If you change .env, rebuild your development client: `npx expo run:android` or `npx expo run:ios`.
   - Ensure the redirect URI is added to your Azure App Registration and that the app scheme matches in app.json (e.g., "scheme": "wardapp").

3. Start the app
   ```bash
   npx expo start
   ```
   - Use a development build for native modules: `npx expo run:android` / `npx expo run:ios` (first time and whenever .env changes).

You can run in:
- development build
- Android emulator
- iOS simulator
- Expo Go (env vars from react-native-config require a development build)

Edit files inside the `app` directory (file-based routing).

## Reset
```bash
npm run reset-project
```
Moves starter code to `app-example` and creates a blank `app` directory.

## Learn more
- [Expo documentation](https://docs.expo.dev/)
- [Tutorial](https://docs.expo.dev/tutorial/introduction/)
- [Expo on GitHub](https://github.com/expo/expo)
- [Discord](https://chat.expo.dev)

# Firebase Authentication Setup

## 1. Create the web app

1. Open Firebase Console and create or select a project.
2. In **Project settings > Your apps**, add a Web app.
3. Copy the Web app configuration values into `.env`:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

Restart `npm start` after changing `.env`.

## 2. Enable providers

Open **Firebase Console > Authentication > Sign-in method**.

- Enable **Email/Password**.
- Enable **Google** and choose a support email.
- Enable **Phone**. Add test phone numbers while developing to avoid sending real SMS.
- Enable **Apple** after completing the Apple Developer configuration below.

Also add every deployed hostname under **Authentication > Settings > Authorized domains**.

## 3. Configure Sign in with Apple

An Apple Developer Program membership is required.

1. In Apple Developer, create or configure a Services ID with Sign in with Apple.
2. Add the Firebase callback URL:

```text
https://YOUR_FIREBASE_PROJECT_ID.firebaseapp.com/__/auth/handler
```

3. Create a Sign in with Apple private key.
4. In Firebase's Apple provider settings, enter the Services ID, Apple Team ID,
   Key ID, and private key.

## 4. Run locally

```powershell
npm start
```

Open `http://localhost:3000`. Phone authentication uses Firebase reCAPTCHA and
phone numbers must use international format, for example `+15551234567`.

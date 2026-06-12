# Aemona v3

Aemona v3 is the current integrated prototype for emotional check-ins, guided reflection, entries, tools, and pattern exploration.

## Login status

Currently supported and working:

- Email registration and login
- Google login
- Beta access code

For testing, **Beta access code is recommended** because it is the quickest way to enter the prototype and keeps the test flow simple.

Phone and Apple login are not currently supported as stable login methods.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in the required values.

3. Start the server:

   ```bash
   npm run dev
   ```

4. Open:

   ```text
   http://localhost:3000
   ```

## Required configuration

Firebase values are required for Email and Google login. Enable both providers in Firebase Authentication and add the local or deployed hostname to Firebase Authorized Domains.

Set `BETA_ACCESS_CODE` in `.env` to enable the recommended beta-code testing flow.

## Validation

```bash
npm test
```

The v3 package excludes `.env`, `node_modules`, editor files, unused development dependencies, and removed tool files.

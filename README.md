# Haven — Student Wellness App

A real, working full-stack version of the Haven wellness prototype:
an Express backend with hashed passwords, JWT-based sessions, optional
Google sign-in, and a small JSON-file database — plus the same frontend
you saw before, now talking to real APIs instead of pretend ones.

## What's real here

- **Signup / login** — passwords are hashed with bcrypt, never stored in plain text
- **Sessions** — handled with signed JWT tokens (7-day expiry)
- **Forgot password** — generates a real time-limited reset code (shown on-screen since there's no email service connected — see "Going further" below)
- **Google sign-in** — real OAuth 2.0 via Google, once you add your own credentials (steps below)
- **Mood check-ins & journal entries** — saved per-user in `data/db.json` and reloaded from the server, not just kept in the browser tab

## 1. Install

You'll need [Node.js](https://nodejs.org) installed (version 18 or newer).

```bash
cd haven-app
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` and `SESSION_SECRET` to any long random strings.
You can leave the Google variables as they are for now — Google sign-in will
simply show a friendly error until you set it up (step 4).

## 3. Run it

```bash
npm run seed     # creates the demo account: student / wellness123
npm start
```

Then open **http://localhost:4000** in your browser.

## 4. (Optional) Set up real Google sign-in

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials)
2. Create a project (or pick an existing one)
3. Configure the **OAuth consent screen** — choose "External," add your own email as a test user
4. Create an **OAuth Client ID** → Application type: **Web application**
5. Under "Authorized redirect URIs," add:
   `http://localhost:4000/api/auth/google/callback`
6. Copy the **Client ID** and **Client Secret** into your `.env` file
7. Restart the server (`npm start`)

The "Continue with Google" buttons will now perform a real Google login.

## Project structure

```
haven-app/
  server.js              — Express app entry point
  config/passport.js      — Google OAuth strategy
  middleware/auth.js       — JWT verification middleware
  routes/auth.js           — signup, login, forgot/reset password, Google OAuth
  routes/wellness.js       — mood check-ins and journal entries (protected)
  utils/db.js              — tiny JSON-file database helper
  data/db.json             — where all data actually lives
  scripts/seed.js          — creates the demo account
  public/                  — the frontend (index.html, style.css, app.js)
```

## API reference

| Method | Endpoint                       | Auth required | Description |
|--------|--------------------------------|----------------|--------------|
| POST   | `/api/auth/signup`             | no  | Create an account |
| POST   | `/api/auth/login`              | no  | Log in, returns a token |
| POST   | `/api/auth/forgot-password`    | no  | Request a reset code |
| POST   | `/api/auth/reset-password`     | no  | Reset password with the code |
| GET    | `/api/auth/google`             | no  | Start Google sign-in |
| GET    | `/api/auth/google/callback`    | no  | Google OAuth redirect target |
| GET    | `/api/wellness/mood`           | yes | Get your mood check-ins |
| POST   | `/api/wellness/mood`           | yes | Log a mood check-in |
| GET    | `/api/wellness/journal`        | yes | Get your journal entries |
| POST   | `/api/wellness/journal`        | yes | Save a journal entry |

Protected routes expect an `Authorization: Bearer <token>` header — the
frontend handles this automatically once you're logged in.

## Why a JSON file instead of a "real" database?

For a classroom project, `data/db.json` keeps things dependency-free and
easy to run on any machine — no database server to install, no native
modules to compile. Every read/write goes through `utils/db.js`, so
swapping in a real database (SQLite, PostgreSQL, MongoDB) later is a
contained change, not a rewrite.

## Going further (good talking points for your reflection)

- **Email delivery**: forgot-password codes are shown on screen for the
  demo. A real deployment would email them using a service like
  SendGrid or Nodemailer.
- **A real database**: swap `utils/db.js` for a proper database once
  more than a handful of students are using it at once.
- **HTTPS & deployment**: this runs on `localhost` for the project demo;
  a real launch would need hosting (Render, Railway, etc.) with HTTPS.

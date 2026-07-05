import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { readDB, writeDB } from "../utils/db.js";
import dotenv from "dotenv";

dotenv.config();

/* -----------------------
   GOOGLE CREDENTIAL CHECK
------------------------ */
export const hasGoogleCreds =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here" &&
  process.env.GOOGLE_CLIENT_SECRET;

/* -----------------------
   GOOGLE STRATEGY
------------------------ */
if (hasGoogleCreds) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        const db = readDB();

        const email =
          profile.emails?.[0]?.value || null;

        let user = db.users.find((u) => u.googleId === profile.id);

        if (!user) {
          user = {
            id: String(Date.now()),
            name: profile.displayName || "Student",
            username: email ? email.split("@")[0] : `google_${profile.id}`,
            email,
            googleId: profile.id,
            passwordHash: null,
            provider: "google",
            createdAt: new Date().toISOString(),
          };

          db.users.push(user);
          writeDB(db);
        }

        return done(null, user);
      }
    )
  );
}

/* -----------------------
   SESSION SERIALIZATION
------------------------ */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === id);
  done(null, user || null);
});

export default passport;

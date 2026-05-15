import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

import { configDotenv } from "dotenv";

configDotenv({
  path: ".env",
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;

        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        // Find user by Google ID or email
        let user = await User.findOne({
          $or: [{ googleId }, { email }],
        });

        if (!user) {
          // Create new user
          user = await User.create({
            name,
            email,
            password: null, // No password for Google users
            googleId,
            isVerified: true, // Google emails are pre-verified
          });
        } else if (!user.googleId) {
          // Link Google ID to existing email account
          user.googleId = googleId;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// Serialize user ID to session (required by Passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

import express from "express";
import passport from "passport";
import {
  googleAuth,
  googleCallback,
  oauthLogout,
} from "../controllers/oauthController.js";

const router = express.Router();

// ✅ Route to start Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // We handle sessions via JWT, not Passport
  }),
);

// ✅ Route to handle Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/oauth/failed",
  }),
  googleCallback,
);

// ✅ Route for OAuth failure (optional fallback)
router.get("/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

// ✅ Route to logout OAuth user (clears JWT cookie)
router.get("/logout", oauthLogout);

export default router;

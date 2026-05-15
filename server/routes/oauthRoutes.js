import express from "express";
import passport from "passport";
import { googleCallback, oauthLogout } from "../controllers/oauthController.js";

const router = express.Router();

/**
 * 🚀 START GOOGLE LOGIN
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/**
 * 🚀 GOOGLE CALLBACK (IMPORTANT)
 * MUST MATCH GOOGLE CLOUD EXACTLY
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleCallback
);

/**
 * ❌ FAILURE ROUTE
 */
router.get("/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

/**
 * 🚪 LOGOUT
 */
router.get("/logout", oauthLogout);

export default router;
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getCookieConfig } from "../config/cookieConfig.js";

// Token Generator
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Google Auth Start (Passport)
export const googleAuth = (req, res, next) => {
  next();
};

// ✅ Updated Google Callback with Ban Check
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.redirect(`${getFrontendUrl()}/login?error=auth_failed`);
    }

    // 🔥 BAN CHECK
    if (user.isBanned === true) {
      const reason = user.banReason
        ? encodeURIComponent(user.banReason)
        : "Your account has been suspended";

      return res.redirect(
        `${getFrontendUrl()}/login?error=account_banned&reason=${reason}`
      );
    }

    // Generate Token
    const token = generateToken(user._id);

    // Set Cookie
    res.cookie("token", token, getCookieConfig());

    // Redirect to Home (or dashboard)
    return res.redirect(`${getFrontendUrl()}/`);

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(`${getFrontendUrl()}/login?error=server_error`);
  }
};

// Logout
export const oauthLogout = (req, res) => {
  res.clearCookie("token", getCookieConfig());
  return res.json({ success: true, message: "Logged out successfully" });
};

// Helper Function
const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://yourapp.com"
      : "http://localhost:5173")
  );
};
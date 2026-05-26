import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getCookieConfig } from "../config/cookieConfig.js";

// ========================
// JWT GENERATOR
// ========================
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ========================
// GOOGLE CALLBACK
// ========================
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    // ❌ AUTH FAILED
    if (!user || !user._id) {
      return res.redirect(
        `${getFrontendUrl()}/login?error=auth_failed`
      );
    }

    // 🔥 BAN CHECK (PRESERVED EXACT LOGIC)
    if (user.isBanned === true) {
      const reason = user.banReason
        ? encodeURIComponent(user.banReason)
        : "Your account has been suspended";

      return res.redirect(
        `${getFrontendUrl()}/login?error=account_banned&reason=${reason}`
      );
    }

    // ========================
    // GENERATE JWT TOKEN
    // ========================
    const token = generateToken(user._id);

    // ========================
    // SET COOKIE (FIXED FOR VERCEL + RENDER)
    // ========================
    res.cookie("token", token, getCookieConfig());

    // ========================
    // REDIRECT TO FRONTEND
    // ========================
    return res.redirect(`${getFrontendUrl()}/`);

  } catch (error) {
    console.error("Google OAuth callback error:", error);

    return res.redirect(
      `${getFrontendUrl()}/login?error=server_error`
    );
  }
};

// ========================
// LOGOUT
// ========================
export const oauthLogout = (req, res) => {
  res.clearCookie("token", getCookieConfig());

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

// ========================
// FRONTEND URL HELPER
// ========================
const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    "https://expensesplit-nine.vercel.app"
  );
};
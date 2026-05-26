import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import { protect } from "./middleware/authMiddleware.js";
import User from "./models/User.js";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./routes/uploadthing.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import geminiRoutes from './routes/gemini.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================
app.use(express.json());
app.use(cookieParser());

// Trust Reverse Proxy (Crucial for Render HTTPS cookie forwarding)
app.set("trust proxy", 1);

// CORS Config (Supports both Local Development & Vercel Production)
const allowedOrigins = [
  "https://expensesplit-nine.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173" // Vite default local port
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or tools like Postman (no origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Initialize Passport (Session tracking entirely removed for smooth standalone JWT execution)
app.use(passport.initialize());

// ==========================================
// ROUTE REGISTRATION
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes); // Handles /api/oauth/google and /api/oauth/google/callback
app.use("/api/auth/users", userRoutes);
app.use("/api/auth/groups", groupRoutes);
app.use("/api/auth/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploadthing", createRouteHandler({ router: uploadRouter }));
app.use("/api/gemini", geminiRoutes);

/**
 * 👤 CURRENT USER PROFILE ENDPOINT
 * Fetches user profile data securely extracted via the protect middleware
 */
app.get("/api/auth/me", protect, async (req, res) => {
  try {
    // Fetch user from DB using req.userId injected by 'protect' middleware
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Base Test Route
app.get("/", (req, res) => {
  res.send("API is running smoothly...");
});

// Environment Variable Debug Route
app.get("/api/debug/env", (req, res) => {
  res.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "✗ MISSING",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ MISSING",
    CALLBACK_URL: process.env.CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Catch Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
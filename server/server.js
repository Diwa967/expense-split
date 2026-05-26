import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
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
import geminiRoutes from './routes/gemini.js'

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS config
app.use(
  cors({
    origin: "https://expensesplit-nine.vercel.app",
    credentials: true,
  })
);

// Session config (required by Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Database
connectDB();

app.use("/api/auth", authRoutes); // Traditional: /api/auth/login, /register, etc.
app.use("/api/oauth", oauthRoutes);
app.use("/api/auth/users", userRoutes);
app.use("/api/auth/groups", groupRoutes);
app.use("/api/auth/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploadthing", createRouteHandler({ router: uploadRouter }));
app.use("/api/gemini", geminiRoutes);

app.get("/api/auth/me", protect, async (req, res) => {
  try {
    // Fetch user from DB, exclude password field
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

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.get("/api/debug/env", (req, res) => {
  res.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "✗ MISSING",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      ? "✓ Set"
      : "✗ MISSING",
    CALLBACK_URL: process.env.CALLBACK_URL,
    SESSION_SECRET: process.env.SESSION_SECRET ? "✓ Set" : "✗ MISSING",
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

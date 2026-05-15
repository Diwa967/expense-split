import express from "express";
import {
  register,
  login,
  logout,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import { updatePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { updateProfile } from "../controllers/authController.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);

router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.put("/update-password", protect, updatePassword);
router.put("/profile", protect, updateProfile);
router.get("/is-auth", protect, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      isVerified: user.isVerified,
      role: user.role,
      isBanned: user.isBanned,
      banReason: user.banReason,
    },
  });
});

export default router;

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transporter from "../config/nodemailer.js";
import { getCookieConfig } from "../config/cookieConfig.js";

// Generate token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// export const register = async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     // Generate OTP
//     const otp = String(Math.floor(100000 + Math.random() * 900000));

//     console.log("REGISTER OTP:", otp);
//     console.log("REGISTER EMAIL:", email);

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashed,
//       verifyOtp: otp,
//       verifyOtpExpireAt: Date.now() + 15 * 60 * 1000,
//     });

//     // Send verification email
//     try {
//       const info = await transporter.sendMail({
//         from: process.env.SENDER_EMAIL,
//         to: email,
//         subject: "Verify Your Email",
//         text: `Your verification OTP is ${otp}`,
//       });

//       console.log("Verify email sent:", info.response);
//     } catch (mailError) {
//       console.error("Verify email error:", mailError);
//     }

//     res.json({
//       message: "Registered successfully. Please verify your email.",
//       email,
//     });
//   } catch (error) {
//     console.error("Register error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



export const register = async (req, res) => {
  const { name, email, password } = req.body;

  console.log("=== REGISTER START ===");

  try {
    console.log("Incoming data:", {
      name,
      email,
      hasPassword: !!password,
    });

    // Check env variables
    console.log("ENV CHECK:", {
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
      SENDER_EMAIL: process.env.SENDER_EMAIL,
      CLIENT_URL: process.env.CLIENT_URL,
    });

    if (!name || !email || !password) {
      console.log("Missing fields");
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    console.log("Checking existing user...");

    const exists = await User.findOne({ email });

    if (exists) {
      console.log("User already exists");
      return res.status(400).json({
        message: "User already exists",
      });
    }

    console.log("Hashing password...");

    const hashed = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    console.log("Generated OTP:", otp);

    console.log("Creating user in DB...");

    const user = await User.create({
      name,
      email,
      password: hashed,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 15 * 60 * 1000,
    });

    console.log("User created successfully:", user._id);

    // SEND EMAIL
    try {
      console.log("Attempting to send verification email...");

      const info = await transporter.sendMail({
        from: `"Expense Split" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Verify Your Email",
        text: `Your verification OTP is ${otp}`,
      });

      console.log("EMAIL SENT SUCCESSFULLY");
      console.log("Mail response:", info.response);
      console.log("Message ID:", info.messageId);
    } catch (mailError) {
      console.error("=== EMAIL ERROR ===");
      console.error(mailError);

      if (mailError.response) {
        console.error("SMTP Response:", mailError.response);
      }

      if (mailError.code) {
        console.error("Error Code:", mailError.code);
      }

      if (mailError.command) {
        console.error("SMTP Command:", mailError.command);
      }
    }

    console.log("Sending success response to frontend...");

    res.json({
      success: true,
      message: "Registered successfully. Please verify your email.",
      email,
    });

    console.log("=== REGISTER END SUCCESS ===");
  } catch (error) {
    console.error("=== REGISTER MAIN ERROR ===");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ ADD THIS CHECK
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);


    res.cookie("token", token, getCookieConfig());

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        profile: user.profile,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
  });

  res.json({ message: "Logged out" });
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Request email:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.json({ message: "If email exists, OTP sent" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    console.log("Generated OTP:", otp);

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}`,
    });

    console.log("Email sent:", info.response);

    res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Clear OTP after successful verification
    // user.resetOtp = null;
    // user.resetOtpExpireAt = null;
    // await user.save();

    res.json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetOtp = null;
    user.resetOtpExpireAt = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.json({ message: "Already verified" });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpireAt = null;

    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating password.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true },
    ).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

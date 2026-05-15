import React, { useState } from "react";
import axios from "axios";
import { MdOutlineEmail, MdVpnKey } from "react-icons/md";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import api from "./api/api";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Handle OTP input
  const handleChange = (event, index) => {
    const newOtp = [...otp];
    const value = event.target.value;

    if (value === "" || (value.match(/[0-9]/) && value.length === 1)) {
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleBackspace = (event, index) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const paste = event.clipboardData
      .getData("text")
      .slice(0, otp.length)
      .split("");

    if (paste.every((char) => /[0-9]/.test(char))) {
      setOtp(paste);
      document.getElementById(`otp-input-${otp.length - 1}`).focus();
    }
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/send-reset-otp", { email });

      toast.success(res.data.message || "OTP sent successfully");
      setIsEmailSent(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ STEP 2: Verify OTP - NOW CONNECTED TO BACKEND
  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Enter full 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/verify-reset-otp", {
        email,
        otp: enteredOtp,
      });

      toast.success(res.data.message || "OTP verified");
      setIsOtpSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
      // Optional: Clear OTP inputs on failure
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/api/auth/reset-password", {
        email,
        otp: otp.join(""), // Send OTP for final verification
        newPassword,
      });

      toast.success(res.data.message || "Password reset successful");

      // Optional: Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login"; // Adjust route as needed
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/30">
        {/* STEP 1: EMAIL */}
        {!isEmailSent && (
          <>
            <div className="flex justify-center mb-5">
              <div className="bg-indigo-100 p-4 rounded-full">
                <MdOutlineEmail className="text-4xl text-indigo-600" />
              </div>
            </div>

            <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </h2>

            <p className="text-center text-sm text-gray-500 mb-6">
              Enter your email to receive a reset code
            </p>

            <form onSubmit={onSubmitEmail}>
              <div className="relative mb-5">
                <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border border-gray-300 rounded-xl w-full pl-10 p-3 outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-white font-semibold bg-linear-to-r from-indigo-500 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: OTP */}
        {isEmailSent && !isOtpSubmitted && (
          <>
            <h2 className="text-center text-2xl font-bold text-indigo-600 mb-2">
              Verify OTP
            </h2>

            <p className="text-center text-sm text-gray-500 mb-6">
              Enter the 6-digit code sent to {email}
            </p>

            <form onSubmit={onSubmitOTP}>
              <div
                className="flex justify-center gap-3 mb-8"
                onPaste={handlePaste}
              >
                {otp.map((value, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    disabled={isLoading}
                    className="w-14 h-14 text-center text-xl border-2 rounded-xl focus:border-indigo-500 outline-none disabled:opacity-50"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-white font-semibold bg-linear-to-r from-blue-500 to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 3: PASSWORD */}
        {isOtpSubmitted && (
          <>
            <div className="flex justify-center mb-5">
              <div className="bg-indigo-100 p-4 rounded-full">
                <MdVpnKey className="text-4xl text-indigo-600" />
              </div>
            </div>

            <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
              Set New Password
            </h2>

            <form onSubmit={onSubmitNewPassword}>
              <div className="relative mb-5">
                <MdVpnKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Enter new password (min 6 chars)"
                  className="border border-gray-300 rounded-xl w-full pl-10 pr-10 p-3 outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />

                {isPasswordVisible ? (
                  <IoEyeOffOutline
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setIsPasswordVisible(false)}
                  />
                ) : (
                  <IoEyeOutline
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setIsPasswordVisible(true)}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-white font-semibold bg-linear-to-r from-indigo-500 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;

import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import img from "../images/Expense.png";
import { FcGoogle } from "react-icons/fc";
import { message } from "antd";           // ← Ant Design Message
import api, { backendUrl } from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Handle URL params (Google OAuth errors)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authError = params.get("error");

    if (authError) {
      message.error(`Login failed: ${authError.replace("_", " ")}`);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        const user = result.user;

        // 🔥 BAN CHECK
        if (user?.isBanned) {
          const banMessage = user.banReason
            ? `Your account has been banned. Reason: ${user.banReason}`
            : "Your account has been banned. Please contact support.";

          message.error(banMessage, 6); // 6 seconds duration
          setError(banMessage);
          setLoading(false);
          return; // Stop login process
        }

        // Store user data
        localStorage.setItem("user", JSON.stringify(user));
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        message.success("Login successful!");

        // Role-based navigation
        if (user?.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        const errMsg = result.error || "Invalid email or password";
        setError(errMsg);
        message.error(errMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      const messageText =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password";

      setError(messageText);
      message.error(messageText);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/oauth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-[60%] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Image */}
        <div className="w-1/2 hidden md:block">
          <img src={img} alt="Login" className="object-cover h-full w-full" />
        </div>

        {/* Form */}
        <div className="p-8 w-full md:w-1/2">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Smart Expense Splitter
          </h2>
          <p className="text-sm text-center text-gray-600 mb-8">
            Split Expenses with your friends
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/reset-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Sign up now
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex border-gray-300 w-full" />
            <span className="px-2 text-gray-500 text-sm">OR</span>
            <hr className="flex border-gray-300 w-full" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 w-full hover:bg-gray-100 transition disabled:opacity-70 cursor-pointer"
          >
            <FcGoogle className="text-xl" />
            <span className="text-gray-700 font-medium">
              {loading ? "Redirecting..." : "Login with Google"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
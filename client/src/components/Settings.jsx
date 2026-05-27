import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import {
  FaUser,
  FaCamera,
  FaSave,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTrash,
} from "react-icons/fa";
import HeaderTop from "../components/layout/HeaderTop";
import { generateUploadButton } from "@uploadthing/react";
import api, { backendUrl } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { message } from "antd";

const UploadButton = generateUploadButton({
  url: `${backendUrl}/api/uploadthing`,
});

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize profile image
  useEffect(() => {
    console.log("USER OBJECT:", user);
    if (user?.profile) {
      setProfileImage(`https://utfs.io/f/${user.profile}`);
    }
  }, [user]);

  // 🔥 BAN CHECK HELPER
  const checkIfBanned = () => {
    if (user?.isBanned === true) {
      const banMessage = user.banReason
        ? `Your account is banned.\nReason: ${user.banReason}`
        : "Your account has been banned by the administrator. You cannot make any changes.";

      message.error(banMessage);
      return true; // banned
    }
    return false; // not banned
  };

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (checkIfBanned()) return;

    setIsSavingProfile(true);

    try {
      await api.put(
        "/api/auth/profile",
        {
          name: profileData.fullName,
          email: profileData.email,
        },
        { withCredentials: true }
      );
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Password handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (checkIfBanned()) return;

    if (passwordData.newPassword.length < 6) {
      message.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      message.error("New passwords do not match");
      return;
    }

    if (!passwordData.currentPassword) {
      message.error("Please enter your current password");
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await api.put(
        "/api/auth/update-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        message.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";
      message.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Image Upload with Ban Check
  const handleUploadBegin = () => {
    if (checkIfBanned()) return false;
    setIsUploading(true);
    return true;
  };

  const handleRemoveImage = () => {
    if (checkIfBanned()) return;
    setProfileImage(null);
    message.info("Profile picture removed (changes will apply on save)");
    // Optional: Call API to remove image from backend
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6)
      return { width: "w-1/4", color: "bg-red-500", label: "Weak" };
    if (password.length < 10)
      return { width: "w-2/4", color: "bg-yellow-500", label: "Medium" };
    return { width: "w-full", color: "bg-green-500", label: "Strong" };
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <HeaderTop
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Settings"
        />

        <div className="p-6 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
            <p className="text-slate-400 text-sm">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FaUser className="text-blue-400" />
              Profile
            </h2>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-800">
              <div className="relative group mb-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-slate-700 ring-4 ring-slate-800/50">
                  {profileImage ? (
                    <>
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-600/90 hover:bg-red-700 rounded-full transition-colors"
                          title="Remove image"
                        >
                          <FaTrash className="text-white text-sm" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <FaUser className="text-4xl mb-1 opacity-50" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <UploadButton
                  endpoint="profileUploader"
                  input={{ user_id: user?.id }}
                  headers={{ "user-id": user?.id }}
                  onUploadBegin={handleUploadBegin}
                  onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    const filekey = res[0]?.key;
                    if (filekey) {
                      setProfileImage(`https://utfs.io/f/${filekey}`);
                      message.success("Profile picture updated successfully!");
                    }
                  }}
                  onUploadError={(error) => {
                    setIsUploading(false);
                    message.error(error.message || "Upload failed");
                  }}
                  className="ut-button bg-transparent hover:bg-slate-800 border-0 p-0 shadow-none"
                  content={{
                    button: isUploading ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        <FaCamera className="text-base" />
                        Choose Photo
                      </button>
                    ),
                  }}
                />
                <p className="text-slate-600 text-[10px]">JPG, PNG • Max 5MB</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 text-white rounded-xl font-medium transition-all"
                >
                  <FaSave />
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProfileData({
                      fullName: user?.name || "",
                      email: user?.email || "",
                    })
                  }
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800/50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FaLock className="text-blue-400" />
              Change Password
            </h2>

            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-10 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-10 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-10 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {passwordData.newPassword && (
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs font-medium">Strength:</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getPasswordStrength(passwordData.newPassword).color} ${getPasswordStrength(passwordData.newPassword).width}`}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {getPasswordStrength(passwordData.newPassword).label}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 text-white rounded-xl font-medium transition-all"
                >
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800/50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
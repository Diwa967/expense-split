import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

const ProfileDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //  Safe initials
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  //  Profile image (UploadThing)
  const profileImage = user?.profile
    ? `https://utfs.io/f/${user.profile}`
    : null;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-inner">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-gray-800 max-w-30 truncate">
          {user?.name?.split(" ")[0]}
        </span>

        {/* Arrow */}
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 bg-linear-to-br from-blue-50 to-white border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Menu */}
          <div className="py-1.5">
            <Link
              to={
                user?.role === "admin"
                  ? "/admin-dashboard"
                  : `/expense-tracker/${user?.id}/dashboard`
              }
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <FaUser className="text-gray-400 text-xs" />
              {user?.role === "admin" ? "Admin Dashboard" : "User Dashboard"}
            </Link>

            {/* <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <FaUser className="text-gray-400 text-xs" />
              My Profile
            </Link> */}

            <Link
              to={
                user?.role === "admin"
                  ? "/admin-settings"
                  : `/expense-tracker/${user?.id || user?._id}/settings`
              }
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <FaCog className="text-gray-400 text-xs" />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1.5">
            <button
              onClick={() => {
                onLogout?.();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <FaSignOutAlt className="text-xs" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

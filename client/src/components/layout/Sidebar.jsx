import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaWallet,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data (adjust based on your setup)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // If you have context logout function, use that instead
    // logout();

    navigate("/login");
  };

  const userId = user?.id || user?._id;

  console.log("USER OBJECT:", user);
  console.log("USER ID:", user?.id);
  console.log("CURRENT PATH:", location.pathname);
  console.log("FULL USER:", user);

  if (!user) {
    return (
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex items-center justify-center text-slate-400">
        Loading...
      </aside>
    );
  }

  console.log("USER ID:", userId);

  const dashboardPath = `/expense-tracker/${userId}/dashboard`;

  const isDashboardActive = location.pathname === dashboardPath;

  const isExpensesActive =
    location.pathname === `/expense-tracker/${userId}/expenses`;

  // const isAnalyticsActive =
  //   location.pathname === `/expense-tracker/${userId}/analytics`;

  const isSettingsActive =
    location.pathname === `/expense-tracker/${userId}/settings`;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Top */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Link
            to={dashboardPath}
            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <FaWallet className="text-white" />
          </Link>

          <div>
            <Link
              to={dashboardPath}
              className="font-bold text-lg hover:text-blue-400 transition-colors"
            >
              Expense Split
            </Link>
            <p className="text-xs text-slate-400">Smart Expense Splitter</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Dashboard */}
        <Link
          to={dashboardPath}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isDashboardActive
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          <FaHome className="w-4 h-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>

        {/* Expenses */}
        <Link
          to={`/expense-tracker/${userId}/expenses`}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isExpensesActive
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          <FaWallet className="w-4 h-4" />
          <span className="text-sm font-medium">Expenses</span>
        </Link>

        {/* Analytics
        <Link
          to={`/expense-tracker/${userId}/analytics`}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isAnalyticsActive
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          <FaChartLine className="w-4 h-4" />
          <span className="text-sm">Analytics</span>
        </Link> */}

        {/* Settings */}
        <Link
          to={`/expense-tracker/${userId}/settings`}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isSettingsActive
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          <FaCog className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors w-full text-left cursor-pointer"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

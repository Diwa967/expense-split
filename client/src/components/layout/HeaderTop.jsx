import React, { useContext } from "react";
import { FaSearch } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import ProfileDropdown from "../ProfileDropdown";

const HeaderTop = ({ searchTerm, setSearchTerm }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            {/* <FaBell className="w-5 h-5" /> */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>

          {/* Profile Dropdown */}
          {user && <ProfileDropdown user={user} onLogout={logout} />}
        </div>
      </div>
    </header>
  );
};

export default HeaderTop;

import React from "react";
import DashboardHeader from "./DashboardHeader";
import UserTable from "./UserTable";

const AdminUsers = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans">
      <DashboardHeader activeTab="Users" />
      <UserTable />
    </div>
  );
};

export default AdminUsers;

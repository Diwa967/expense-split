import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import GroupCard from "./GroupCard";
import api from "../../api/api";

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/api/admin/groups", {
          withCredentials: true,
        });

        setGroups(res.data.groups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans">
      <DashboardHeader activeTab="Groups" />

      {/* Filter and Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium">
            All Groups
          </button>
          {/* <button className="px-4 py-2 bg-[#1e293b] text-[#94a3b8] rounded-lg border border-[#334155] text-xs font-medium">
            Active
          </button>
          <button className="px-4 py-2 bg-[#1e293b] text-[#94a3b8] rounded-lg border border-[#334155] text-xs font-medium">
            Completed
          </button> */}
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {groups.map((group) => (
          <GroupCard key={group._id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default AdminGroups;
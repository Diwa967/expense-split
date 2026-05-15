import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../api/api";

import Sidebar from "./Layout/Sidebar";
import HeaderTop from "./layout/HeaderTop";
import StatsGrid from "./Dashboard/StatsGrid";
import ChartsSection from "./Dashboard/ChartsSection";
import GroupSection from "./groups/GroupSection";
import CreateGroupModal from "./groups/CreateGroupModal";
import GroupDetailModal from "./Dashboard/GroupDetailModal";
import { AuthContext } from "../context/AuthContext";

const ExpenseDashboard = () => {
  const [viewMode, setViewMode] = useState("cards");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Group Creation/Edit States
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);

  // Member Search & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState([]);

  // Groups
  const [groups, setGroups] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [dashboardStats, setDashboardStats] = useState({
    totalGroups: 0,
    totalMembers: 0,
    totalSpent: 0,
    youOwe: 0,
    youAreOwed: 0,
  });
  const [expenseTrendsData, setExpenseTrendsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [groupSpendingData, setGroupSpendingData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const { user } = useContext(AuthContext);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await api.get("/api/auth/users/stats");
      if (response.data?.success) {
        const { stats, expenseTrendsData, categoryData, groupSpendingData } =
          response.data;
        setDashboardStats(stats);
        setExpenseTrendsData(expenseTrendsData);
        setCategoryData(categoryData);
        setGroupSpendingData(groupSpendingData);
      }
    } catch (error) {
      console.error(
        "Dashboard stats error:",
        error.response?.data || error.message,
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Reset Form
  const resetCreateGroupForm = () => {
    setGroupName("");
    setSelectedMembers([]);
    setSelectedMemberDetails([]);
    setSearchQuery("");
    setAvailableMembers([]);
    setIsEditMode(false);
    setEditingGroupId(null);
  };

  // Fetch Groups
  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.get("/api/auth/groups/myGroups");
      if (response.data?.success) {
        const formattedGroups = (response.data.groups || []).map((group) => ({
          id: group._id,
          name: group.name,
          totalExpenses: 0,
          youOwe: 0,
          youAreOwed: 0,
          members: group.members?.length || 0,
          perPerson: 0,
          memberDetails:
            group.members?.map((member) => ({
              id: member._id,
              name: member.name,
              email: member.email,
              avatar: member.avatar || "🧑",
            })) || [],
          memberSettlements: [],
          recentExpenses: [],
        }));
        setGroups(formattedGroups);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error(
        "Fetch groups error:",
        error.response?.data || error.message,
      );
      setGroups([]);
    }
  }, []);

  // Search Users
  const searchUsers = useCallback(
    async (query) => {
      try {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
          setAvailableMembers([]);
          return;
        }
        const response = await api.get(
          `/api/auth/users/search?query=${encodeURIComponent(trimmedQuery)}`,
        );
        if (response.data?.success) {
          const filteredUsers = (response.data.users || []).filter(
            (user) => !selectedMembers.includes(user._id),
          );
          setAvailableMembers(filteredUsers);
        } else {
          setAvailableMembers([]);
        }
      } catch (error) {
        console.error(
          "Search users error:",
          error.response?.data || error.message,
        );
        setAvailableMembers([]);
      }
    },
    [selectedMembers],
  );

  useEffect(() => {
    fetchGroups();
    fetchDashboardStats();
  }, [fetchGroups, fetchDashboardStats]);

  useEffect(() => {
    const delay = setTimeout(() => searchUsers(searchQuery), 400);
    return () => clearTimeout(delay);
  }, [searchQuery, searchUsers]);

  // Toggle Member
  const toggleMemberSelection = (member) => {
    if (!member || !member._id) return;
    const isAlreadySelected = selectedMembers.includes(member._id);
    if (isAlreadySelected) {
      setSelectedMembers((prev) => prev.filter((id) => id !== member._id));
      setSelectedMemberDetails((prev) =>
        prev.filter((m) => m._id !== member._id),
      );
    } else {
      setSelectedMembers((prev) => [...prev, member._id]);
      setSelectedMemberDetails((prev) => [...prev, member]);
      setSearchQuery("");
      setAvailableMembers([]);
    }
  };

  const removeSelectedMember = (memberId) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    setSelectedMemberDetails((prev) => prev.filter((m) => m._id !== memberId));
  };

  // Open Create Modal
  const handleOpenCreateModal = () =>
    resetCreateGroupForm() || setIsCreateModalOpen(true);

  // Close Create Modal
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateGroupForm();
  };

  // Create or Update Group — refetch stats after mutation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert("Please enter a group name");
    if (selectedMembers.length === 0)
      return alert("Please select at least one member");

    setLoading(true);
    try {
      let response;
      if (isEditMode && editingGroupId) {
        response = await api.put(`/api/auth/groups/${editingGroupId}`, {
          name: groupName.trim(),
          members: selectedMembers,
        });
      } else {
        response = await api.post("/api/auth/groups/createGroup", {
          name: groupName.trim(),
          members: selectedMembers,
        });
      }

      if (response.data?.success) {
        await fetchGroups();
        await fetchDashboardStats(); // refresh stats after group change
        alert(
          isEditMode
            ? "Group updated successfully!"
            : "Group created successfully!",
        );
        handleCloseCreateModal();
      } else {
        alert(response.data?.message || "Failed to save group");
      }
    } catch (error) {
      console.error("Group save error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to save group");
    } finally {
      setLoading(false);
    }
  };

  // Open Group Details
  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setIsDetailModalOpen(true);
  };

  // Edit Group
  const handleEditGroup = (group) => {
    setGroupName(group.name);
    setSelectedMembers(group.memberDetails.map((m) => m.id));
    setSelectedMemberDetails(
      group.memberDetails.map((m) => ({
        _id: m.id,
        name: m.name,
        email: m.email,
        avatar: m.avatar,
      })),
    );
    setEditingGroupId(group.id);
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  // Delete Group — refetch stats after mutation
  const handleGroupDeleted = (deletedGroupId) => {
    setGroups((prev) => prev.filter((group) => group.id !== deletedGroupId));
    fetchDashboardStats();
  };

  // Close Details
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedGroup(null), 300);
  };

  // ── Stats array wired to real data ─────────────────────────────────────────
  const stats = [
    {
      label: "Total Groups",
      value: statsLoading ? "..." : `${dashboardStats.totalGroups}`,
      subtext: "Active expense groups",
      color: "text-green-400",
    },
    {
      label: "Total Spent",
      value: statsLoading
        ? "..."
        : `$${dashboardStats.totalSpent.toLocaleString()}`,
      subtext: "Your share across groups",
      color: "text-green-400",
    },
    {
      label: "You Owe",
      value: statsLoading
        ? "..."
        : `$${dashboardStats.youOwe.toLocaleString()}`,
      subtext: "To settle balances",
      color: "text-red-400",
    },
    {
      label: "You Are Owed",
      value: statsLoading
        ? "..."
        : `$${dashboardStats.youAreOwed.toLocaleString()}`,
      subtext: "Pending from others",
      color: "text-green-400",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <HeaderTop searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-1">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-blue-100 text-sm">
              Track shared expenses with smart calculations and real-time
              insights
            </p>
          </div>

          {/* Stats Grid */}
          <StatsGrid stats={stats} />

          {/* Charts — pass real data + groupSpendingData */}
          <ChartsSection
            expenseTrendsData={expenseTrendsData}
            categoryData={categoryData}
            groupSpendingData={groupSpendingData}
            loading={statsLoading}
          />

          {/* Groups Section */}
          <GroupSection
            viewMode={viewMode}
            setViewMode={setViewMode}
            groups={filteredGroups}
            onOpenCreateModal={handleOpenCreateModal}
            onViewDetails={handleViewDetails}
            onGroupDeleted={handleGroupDeleted}
            onEditGroup={handleEditGroup}
            currentUser={user} // ✅ add this
          />
        </div>
      </main>

      {/* Create/Edit Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateGroup}
        groupName={groupName}
        setGroupName={setGroupName}
        selectedMembers={selectedMembers}
        toggleMemberSelection={toggleMemberSelection}
        availableMembers={availableMembers}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedMemberDetails={selectedMemberDetails}
        removeSelectedMember={removeSelectedMember}
        isEditMode={isEditMode}
      />

      {/* Group Detail Modal */}
      <GroupDetailModal
        group={selectedGroup}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default ExpenseDashboard;

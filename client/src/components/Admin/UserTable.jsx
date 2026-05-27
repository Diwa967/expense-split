import React, { useEffect, useState, useMemo } from "react";
import { Table, Modal, message, Input, Button, Select } from "antd";
import { FaEye, FaBan, FaCheck, FaTrash, FaFilter } from "react-icons/fa";
import api from "../../api/api";

const { TextArea } = Input;
const { Option } = Select;

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Ban Modal States
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [isBanning, setIsBanning] = useState(false);

  // Bulk Delete Modal States
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/admin/users", { withCredentials: true });

        const formattedUsers = res.data.users.map((user) => ({
          key: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          groups: user.totalGroups || 0,
          totalSplit: `$${user.totalSpent || 0}`,
          joinDate: new Date(user.createdAt).toISOString().split("T")[0],
          status: user.isBanned
            ? "Banned"
            : user.isVerified
              ? "Active"
              : "Inactive",
          raw: user,
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  // Filtered Users Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchText, statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Inactive":
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
      case "Banned":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      default:
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getColor = (id) => {
    const colors = [
      "from-blue-500 to-indigo-500",
      "from-emerald-500 to-teal-500",
      "from-pink-500 to-rose-500",
      "from-amber-500 to-orange-500",
      "from-purple-500 to-violet-500",
      "from-cyan-500 to-sky-500",
    ];
    const index = id?.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleView = (record) => {
    setSelectedUser(record.raw);
    setIsViewModalOpen(true);
  };

  const openBanModal = (record) => {
    const user = record.raw || record;
    if (user.isBanned) {
      Modal.confirm({
        title: "Unban User",
        content: `Are you sure you want to unban ${user.name}?`,
        okText: "Yes, Unban",
        cancelText: "Cancel",
        onOk: () => handleBanToggle(user, ""),
      });
    } else {
      setUserToBan(user);
      setBanReason("");
      setIsBanModalOpen(true);
    }
  };

  const handleBanToggle = async (user, reason = "") => {
    const isCurrentlyBanned = user.isBanned || false;
    const action = isCurrentlyBanned ? "unban" : "ban";

    setIsBanning(true);

    try {
      await api.post(
        `/api/auth/users/${user._id}/${action}`,
        { reason },
        { withCredentials: true }
      );

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === user._id) {
            const updatedRaw = { ...u.raw, isBanned: !isCurrentlyBanned };
            return {
              ...u,
              raw: updatedRaw,
              status: updatedRaw.isBanned
                ? "Banned"
                : updatedRaw.isVerified
                  ? "Active"
                  : "Inactive",
            };
          }
          return u;
        })
      );

      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser((prev) => ({ ...prev, isBanned: !isCurrentlyBanned }));
      }

      message.success(`User successfully ${isCurrentlyBanned ? "unbanned" : "banned"}`);
    } catch (error) {
      message.error(`Failed to ${action} user`);
    } finally {
      setIsBanning(false);
      setIsBanModalOpen(false);
    }
  };

  const handleBulkDeleteInactive = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete("/api/admin/users/bulk-delete-inactive", {
        withCredentials: true,
      });

      message.success(res.data.message || `${res.data.deletedCount} inactive users deleted successfully!`);
      window.location.reload();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete inactive users");
    } finally {
      setIsDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("All");
    setIsFilterModalOpen(false);
  };

  const columns = [
    {
      title: <span className="text-[#94a3b8] text-xs">User</span>,
      render: (user) => {
        const hasImage = !!user.profile;
        const initials = getInitials(user.name);
        const color = getColor(user.id);

        return (
          <div className="flex items-center gap-3">
            {hasImage ? (
              <img
                src={`https://utfs.io/f/${user.profile}`}
                className="w-8 h-8 rounded-full object-cover border border-[#334155]"
                alt={user.name}
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white bg-gradient-to-br ${color}`}
              >
                {initials}
              </div>
            )}
            <div>
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-[#64748b] text-xs">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: <span className="text-[#94a3b8] text-xs">Groups</span>,
      dataIndex: "groups",
      render: (val) => <span className="text-white text-sm">{val}</span>,
    },
    {
      title: <span className="text-[#94a3b8] text-xs">Total Split</span>,
      dataIndex: "totalSplit",
      render: (val) => <span className="text-white text-sm font-medium">{val}</span>,
    },
    {
      title: <span className="text-[#94a3b8] text-xs">Join Date</span>,
      dataIndex: "joinDate",
      render: (val) => <span className="text-[#94a3b8] text-sm">{val}</span>,
    },
    {
      title: <span className="text-[#94a3b8] text-xs">Status</span>,
      dataIndex: "status",
      render: (status) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusStyle(status)}`}
        >
          {status}
        </span>
      ),
    },
    {
      title: <span className="text-[#94a3b8] text-xs">Actions</span>,
      render: (record) => {
        const isBanned = record.raw?.isBanned || false;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleView(record)}
              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded"
              title="View"
            >
              <FaEye className="text-xs" />
            </button>

            <button
              onClick={() => openBanModal(record)}
              className={`p-1.5 rounded transition-colors ${
                isBanned
                  ? "text-emerald-400 hover:bg-emerald-500/10"
                  : "text-red-400 hover:bg-red-500/10"
              }`}
              title={isBanned ? "Unban User" : "Ban User"}
            >
              {isBanned ? <FaCheck className="text-xs" /> : <FaBan className="text-xs" />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <div className="p-5 border-b border-[#334155] flex justify-between items-center">
          <h3 className="text-white font-semibold text-sm">User Management</h3>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center gap-2 transition-colors"
            >
              <FaFilter /> Filter
            </button>

            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs flex items-center gap-2 transition-colors"
            >
              <FaTrash /> Bulk Delete Inactive
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          pagination={false}
          className="custom-dark-table"
        />
      </div>

      {/* ====================== FILTER MODAL ====================== */}
      <Modal
        title="Filter Users"
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        centered
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search by Name or Email</label>
            <Input
              placeholder="Type name or email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
            >
              <Option value="All">All Users</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Banned">Banned</Option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={clearFilters}>Clear Filters</Button>
            <Button type="primary" onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>

      {/* View User Modal */}
      <Modal
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={620}
        centered
        title={null}
      >
        {selectedUser && (
          <div className="text-sm">
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200">
              {selectedUser.profile ? (
                <img
                  src={`https://utfs.io/f/${selectedUser.profile}`}
                  className="w-14 h-14 rounded-full object-cover border border-gray-300"
                  alt={selectedUser.name}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xl">
                  {getInitials(selectedUser.name)}
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">{selectedUser.name}</h2>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    selectedUser.isBanned
                      ? "bg-red-100 text-red-600 border-red-200"
                      : selectedUser.isVerified
                        ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {selectedUser.isBanned ? "BANNED" : selectedUser.isVerified ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>

            {/* Add your full view modal content here if needed */}
          </div>
        )}
      </Modal>

      {/* Ban Reason Modal */}
      <Modal
        title={
          <span className="text-red-600 flex items-center gap-2">
            <FaBan /> Ban User
          </span>
        }
        open={isBanModalOpen}
        onCancel={() => {
          setIsBanModalOpen(false);
          setBanReason("");
        }}
        footer={null}
        centered
      >
        {userToBan && (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-800">
                You are about to ban: <strong>{userToBan.name}</strong>
              </p>
              <p className="text-sm text-gray-500">{userToBan.email}</p>
            </div>

            <div>
              <p className="text-gray-600 mb-2 text-sm">Reason for banning (visible to user)</p>
              <TextArea
                rows={4}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for banning this user..."
                maxLength={500}
                showCount
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsBanModalOpen(false);
                  setBanReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                loading={isBanning}
                disabled={!banReason.trim()}
                onClick={() => handleBanToggle(userToBan, banReason.trim())}
              >
                Confirm Ban
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        title={
          <span className="text-red-600 flex items-center gap-2">
            <FaTrash /> Delete Inactive Users
          </span>
        }
        open={isBulkDeleteModalOpen}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
        footer={null}
        centered
      >
        <div className="space-y-4 py-2">
          <p className="text-lg font-medium text-gray-800">
            Do you want to delete <strong>all inactive users</strong>?
          </p>
          <p className="text-red-600 font-medium">
            This action cannot be undone and is permanent.
          </p>

          <div className="flex justify-end gap-3 pt-6">
            <Button onClick={() => setIsBulkDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              loading={isDeleting}
              onClick={handleBulkDeleteInactive}
            >
              Yes, Delete All Inactive Users
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserTable;
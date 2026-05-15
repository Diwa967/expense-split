

import React, { useState, useEffect } from "react";
import { IoMdClose, IoMdSearch } from "react-icons/io";
import { toast } from "react-toastify";
import { generateUploadButton } from "@uploadthing/react";
import api, { backendUrl } from "../../api/api";

// SAME STYLE AS PROFILE UPLOAD - Using Button, not Dropzone
const UploadButton = generateUploadButton({
  url: `${backendUrl}/api/uploadthing`,
});

const AddExpenseModal = ({ isOpen, onClose, onAdd, currentUserId }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food & Dining",
    group: "",
    paidBy: currentUserId || "",
  });

  const [receipts, setReceipts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [userGroups, setUserGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "Food & Dining",
    "Entertainment",
    "Transport",
    "Groceries",
    "Shopping",
    "Bills",
    "Others",
  ];

  useEffect(() => {
    if (isOpen) fetchUserGroups();
  }, [isOpen]);

  const fetchUserGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await api.get("/api/auth/groups/myGroups");
      if (res.data.success) {
        setUserGroups(res.data.groups || []);
        if (res.data.groups?.length > 0) {
          const firstId = res.data.groups[0]._id;
          setFormData((prev) => ({ ...prev, group: firstId }));
          fetchGroupMembers(firstId);
        }
      }
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    if (!groupId) return;
    setLoadingMembers(true);
    try {
      const res = await api.get(`/api/auth/groups/${groupId}/members`);
      if (res.data.success) {
        const members = res.data.members || [];
        setGroupMembers(members);
        setSelectedUsers(members);

        const currentInGroup = members.find((m) => m._id === currentUserId);
        setFormData((prev) => ({
          ...prev,
          paidBy: currentInGroup?._id || members[0]?._id || "",
        }));
      }
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setFormData((prev) => ({ ...prev, group: groupId }));
    setSelectedUsers([]);
    fetchGroupMembers(groupId);
  };

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const filtered = groupMembers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, groupMembers]);

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
    setSearchQuery("");
  };

  const removeUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.amount) {
      return toast.warning("Title and amount are required");
    }
    if (selectedUsers.length === 0) {
      return toast.warning("Please select at least one participant");
    }

    setSubmitting(true);

    const expenseData = {
      title: formData.title.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      groupId: formData.group,
      paidBy: formData.paidBy,
      participants: selectedUsers.map((u) => u._id),
      // Store only keys (same pattern as profile image upload)
      receipts: receipts,
    };

    try {
      const res = await api.post("/api/auth/expenses/addExpense", expenseData);

      if (res.data.success) {
        toast.success("Expense added successfully!");
        onAdd(res.data.expense);
        setReceipts([]);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add New Expense</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Lunch at restaurant"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm mb-2 block">
                Amount ($)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Group */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Group</label>
            <select
              value={formData.group}
              onChange={handleGroupChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loadingGroups}
            >
              {loadingGroups ? (
                <option>Loading groups...</option>
              ) : userGroups.length === 0 ? (
                <option>No groups found</option>
              ) : (
                userGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Paid By */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Paid By</label>
            <select
              value={formData.paidBy}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, paidBy: e.target.value }))
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loadingMembers ? (
                <option>Loading members...</option>
              ) : (
                groupMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Split With - Search & Selection */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">
              Split With ({selectedUsers.length} selected)
            </label>

            {/* Search Input */}
            <div className="relative mb-3">
              <IoMdSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-11 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && searchQuery && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg mb-3 max-h-48 overflow-auto">
                {searchResults
                  .filter(
                    (user) => !selectedUsers.some((su) => su._id === user._id),
                  )
                  .map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleUserSelection(user)}
                      className="w-full px-4 py-3 hover:bg-slate-700 flex items-center gap-3 text-left border-b border-slate-700 last:border-0"
                    >
                      <span className="text-xl">
                        {user.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          "🧑"
                        )}
                      </span>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            {/* Selected Users Chips */}
            <div className="space-y-2">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    {user.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">🧑</span>
                    )}
                    <p className="text-white">{user.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUser(user._id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <IoMdClose size={20} />
                  </button>
                </div>
              ))}
              {selectedUsers.length === 0 && (
                <p className="text-slate-500 text-sm italic">
                  Select at least one participant to split with
                </p>
              )}
            </div>
          </div>

          {/* Receipt Upload - Using UploadButton (Fixed Style) */}
          <div>
            <label className="text-slate-300 text-sm block mb-2">
              Upload Receipts
            </label>

            <UploadButton
              endpoint="receiptUploader"
              onUploadBegin={() => setUploading(true)}
              onClientUploadComplete={async (res) => {
                console.log("UPLOAD RESPONSE:", res);
                setUploading(false);

                const files = res.map((file) => ({
                  key: file.key,
                  url: file.ufsUrl,
                  name: file.name,
                }));

                setReceipts((prev) => [...prev, ...files]);
                toast.success("Receipt uploaded!");

                // ✅ AUTO READ AMOUNT FROM FIRST RECEIPT
                try {
                  const response = await fetch(files[0].url);
                  const blob = await response.blob();

                  const formDataImage = new FormData();
                  formDataImage.append("image", blob, "receipt.jpg");

                  const scanRes = await fetch(
                    "http://localhost:5000/api/gemini/scan-receipt",
                    {
                      method: "POST",
                      body: formDataImage,
                    }
                  );

                  const data = await scanRes.json();

                  if (data.success && data.amount) {
                    setFormData((prev) => ({
                      ...prev,
                      amount: data.amount,
                    }));

                    toast.success(`Detected amount: ${data.amount}`);
                  } else {
                    toast.warning("Could not detect amount");
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to scan receipt");
                }
              }}
            />

            {/* Receipt Preview Grid */}
            {receipts.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {receipts.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.url}
                      alt={`receipt-${i}`}
                      className="h-20 w-full object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setReceipts((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition"
                    >
                      <IoMdClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploading}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                !formData.title.trim() ||
                !formData.amount ||
                selectedUsers.length === 0
              }
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition cursor-pointer"
            >
              {submitting ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;

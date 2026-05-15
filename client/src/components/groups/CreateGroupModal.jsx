import React from "react";
import { FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const CreateGroupModal = ({
  isOpen,
  onClose,
  onCreate,
  groupName,
  setGroupName,
  selectedMembers,
  toggleMemberSelection,
  availableMembers,
  loading,
  searchQuery,
  setSearchQuery,
  selectedMemberDetails,
  removeSelectedMember,
  isEditMode = false, // <-- new prop
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Group" : "Create New Group"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Weekend Trip, Office Lunch"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              autoFocus
            />
          </div>

          {/* Search Members */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search Members
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Available Users */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Available Users
            </label>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scroll">
              {availableMembers.length > 0 ? (
                availableMembers.map((member) => (
                  <button
                    key={member._id}
                    onClick={() => toggleMemberSelection(member)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${selectedMembers.includes(member._id)
                        ? "bg-blue-600/20 border-blue-500/50"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                  >
                    <span className="text-3xl flex-shrink-0">🧑</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <p className="text-slate-400 text-sm truncate">{member.email}</p>
                    </div>
                    {selectedMembers.includes(member._id) && (
                      <FaCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                ))
              ) : searchQuery.trim().length >= 2 ? (
                <div className="text-center py-8 text-slate-500">
                  No users found for "{searchQuery}"
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Type at least 2 characters to search users
                </div>
              )}
            </div>
          </div>

          {/* Selected Members */}
          {selectedMemberDetails.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Selected Members ({selectedMemberDetails.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedMemberDetails.map((member) => (
                  <div
                    key={member._id}
                    className="bg-blue-600/50 text-white text-sm px-4 py-1.5 rounded-full flex items-center gap-2"
                  >
                    {member.name}
                    <button
                      onClick={() => removeSelectedMember(member._id)}
                      className="ml-1 hover:text-red-300 transition-colors font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMembers.length > 0 && (
            <p className="text-slate-400 text-sm">
              {selectedMembers.length} member(s) selected
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0 || loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Group"
                : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
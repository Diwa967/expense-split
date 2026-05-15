import React from "react";
import { message } from "antd";
import CardViewGroup from "../dashboard/CardViewGroup";
import ManageGroupCard from "../dashboard/ManageGroupCard";

const GroupSection = ({
  viewMode,
  setViewMode,
  groups = [],
  onOpenCreateModal,
  onViewDetails,
  onGroupDeleted,
  onEditGroup,
  currentUser, // ✅ pass logged-in user here
}) => {
  const isCardsView = viewMode === "cards";

  //  Handle New Group Click
  const handleCreateGroup = () => {
    if (currentUser?.isBanned) {
      message.error(
        "Your account is restricted temporarily.\n You cannot create a new group.",
      );
      return;
    }

    onOpenCreateModal();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-white">Your Groups</h3>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isCardsView
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cards
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentUser?.isBanned) {
                  message.error(
                    "Your account is restricted temporarily.\n You cannot access manage mode.",
                  );
                  return;
                }
                setViewMode("manage");
              }}
              className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isCardsView
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Manage
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreateGroup} // ✅ updated handler
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-all cursor-pointer"
          >
            New Group
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500">
          No groups yet. Create your first group!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) =>
            isCardsView ? (
              <CardViewGroup
                key={group.id}
                group={group}
                onViewDetails={onViewDetails}
              />
            ) : (
              <ManageGroupCard
                key={group.id}
                group={group}
                onGroupDeleted={onGroupDeleted}
                onEditGroup={onEditGroup}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default GroupSection;

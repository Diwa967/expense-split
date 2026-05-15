import React from "react";
import { IoMdArrowForward } from "react-icons/io";

const ExpenseCard = ({ expense, onClick }) => {
  const amount = Number(expense?.amount || 0);

  const title = expense?.title || expense?.description || "Untitled Expense";

  const groupName =
    expense?.group?.name || expense?.groupName || expense?.group || "";

  const paidByName =
    expense?.paidBy?.name || expense?.paidByName || expense?.paidBy || "Unknown";

  const category = expense?.category || "Others";

  const memberCount =
    expense?.participants?.length ||
    expense?.splits?.length ||
    expense?.splitDetails?.length ||
    expense?.members ||
    0;

  const formattedDate = expense?.createdAt
    ? new Date(expense.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : expense?.date || "Today";

  const iconMap = {
    "Food & Dining": "🍽️",
    Entertainment: "🎬",
    Transport: "🚕",
    Groceries: "🛒",
    Shopping: "🛍️",
    Bills: "💡",
    Others: "📦",
    Food: "🍔",
    Travel: "✈️",
    Rent: "🏠",
    Utilities: "⚡",
  };

  const displayIcon = expense?.icon || iconMap[category] || "📦";

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            {displayIcon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-white font-semibold text-lg truncate max-w-full">
                {title}
              </h3>

              {groupName && (
                <span className="px-2.5 py-0.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded font-medium whitespace-nowrap">
                  {groupName}
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm truncate">
              Paid by <span className="text-white">{paidByName}</span>
              {" • "}
              {category}
              {" • "}
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Amount & Arrow */}
        <div className="flex flex-col items-end flex-shrink-0">
          <p className="text-2xl font-bold text-white">
            ${amount.toLocaleString("en-IN")}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </p>
          <IoMdArrowForward className="w-5 h-5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all mt-2" />
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
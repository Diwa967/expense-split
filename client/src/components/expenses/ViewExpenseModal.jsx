import React from "react";
import { IoMdClose } from "react-icons/io";

const ViewExpenseModal = ({ expense, isOpen, onClose }) => {
  if (!isOpen || !expense) return null;

  const totalAmount = Number(expense?.amount || 0);

  const title = expense?.title || expense?.description || "Untitled Expense";

  const category = expense?.category || "Others";

  const paidById = expense?.paidBy?._id || expense?.paidBy;
  const paidByName =
    expense?.paidBy?.name ||
    expense?.paidByName ||
    expense?.paidBy ||
    "Unknown";

  const groupName =
    expense?.group?.name || expense?.groupName || expense?.group || "No Group";

  const formattedDate = expense?.createdAt
    ? new Date(expense.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : expense?.date || "Today";

  const participants = expense?.participants || [];
  const splits = expense?.splits || [];
  const memberCount = participants.length || splits.length || 1;

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

  const getAvatarLetter = (name) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {displayIcon}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{title}</h2>
              <p className="text-xs text-slate-400 truncate">{groupName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Total Amount */}
          <div className="bg-slate-800/60 rounded-2xl p-5 text-center border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Amount</p>
            <p className="text-4xl font-bold text-white">
              ${totalAmount.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-xs mb-1">Category</p>
              <p className="text-white font-medium">{category}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-xs mb-1">Date</p>
              <p className="text-white font-medium">{formattedDate}</p>
            </div>
          </div>

          {/* Paid By */}
          <div>
            <p className="text-slate-400 text-sm mb-2">Paid By</p>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {getAvatarLetter(paidByName)}
              </div>
              <div>
                <p className="text-white font-medium">{paidByName}</p>
                <p className="text-xs text-slate-400">Paid the full amount</p>
              </div>
            </div>
          </div>

          {/* Split Details */}
          <div>
            <p className="text-slate-400 text-sm mb-3">
              Split Among ({memberCount}{" "}
              {memberCount === 1 ? "member" : "members"})
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {splits.length > 0 ? (
                splits.map((split, index) => {
                  const memberId = split?.user?._id || split?.user;
                  const memberName =
                    split?.user?.name || split?.name || "Unknown User";
                  const memberAmount = Number(split?.amount || 0);
                  const isPaidBy =
                    memberId?.toString() === paidById?.toString();

                  return (
                    <div
                      key={index}
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold ${
                            isPaidBy
                              ? "bg-linear-to-br from-orange-400 to-pink-500"
                              : "bg-linear-to-br from-blue-400 to-cyan-500"
                          }`}
                        >
                          {getAvatarLetter(memberName)}
                        </div>

                        <div>
                          <p className="text-white font-medium">{memberName}</p>
                          <p
                            className={`text-xs ${
                              isPaidBy ? "text-orange-400" : "text-slate-400"
                            }`}
                          >
                            {isPaidBy
                              ? "Paid by this person"
                              : "Owes this amount"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          ${memberAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isPaidBy ? "payer" : "owes"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 text-center">
                  <p className="text-slate-500">No split details available</p>
                </div>
              )}
            </div>
          </div>
          {/* Receipts */}
          {expense?.receipts?.length > 0 && (
            <div>
              <p className="text-slate-400 text-sm mb-3">Receipts</p>

              <div className="grid grid-cols-3 gap-2">
                {expense.receipts.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={file.url}
                      alt={file.name || "receipt"}
                      className="h-20 w-full object-cover rounded-lg border border-slate-700 hover:opacity-80 transition"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenseModal;

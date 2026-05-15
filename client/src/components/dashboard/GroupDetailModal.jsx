import React from "react";
import { IoMdClose } from "react-icons/io";
import { FaUsers, FaDollarSign, FaChartLine } from "react-icons/fa";

const GroupDetailModal = ({ group, isOpen, onClose }) => {
  if (!isOpen || !group) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-xl z-10">
            <h2 className="text-xl font-bold text-white">{group.name}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            >
              <IoMdClose className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <FaDollarSign className="text-blue-400 text-xs" />
                  <p className="text-slate-400 text-xs">Total Expenses</p>
                </div>
                <p className="text-lg font-bold text-white">
                  ${group.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <FaUsers className="text-green-400 text-xs" />
                  <p className="text-slate-400 text-xs">Members</p>
                </div>
                <p className="text-lg font-bold text-white">{group.members}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <FaChartLine className="text-orange-400 text-xs" />
                  <p className="text-slate-400 text-xs">Per Person</p>
                </div>
                <p className="text-lg font-bold text-white">
                  ${group.perPerson.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">
                Member Settlement
              </h3>
              <div className="space-y-2">
                {group.memberSettlements?.map((member, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-lg font-semibold text-sm flex-shrink-0 ${
                        member.balance > 0
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {member.balance > 0 ? "+" : ""}${Math.abs(member.balance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">
                Recent Expenses ({group.recentExpenses?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {group.recentExpenses?.map((expense, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium">
                        {expense.title}
                      </p>
                      <p className="text-white font-bold text-sm">
                        ${expense.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-xs">
                        {expense.paidBy} paid
                      </p>
                      <p className="text-slate-400 text-xs">{expense.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800 sticky bottom-0 bg-slate-900 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupDetailModal;

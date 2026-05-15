import React from "react";
import { FaEye } from "react-icons/fa";
import { IoMdArrowForward } from "react-icons/io";

const CardViewGroup = ({ group, onViewDetails }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h4 className="font-semibold text-white">{group.name}</h4>
        </div>
        <span className="px-2.5 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg font-medium">
          {group.members} members
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-slate-400 text-xs mb-1 font-medium">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-white">
            ${group.totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-800">
          <div>
            <p className="text-slate-400 text-xs mb-1 font-medium">You Owe</p>
            <p
              className={`text-lg font-bold ${group.youOwe > 0 ? "text-red-400" : "text-green-400"}`}
            >
              ${group.youOwe}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1 font-medium">
              You're Owed
            </p>
            <p
              className={`text-lg font-bold ${group.youAreOwed > 0 ? "text-green-400" : "text-red-400"}`}
            >
              ${group.youAreOwed}
            </p>
          </div>
        </div>

        <div>
          <p className="text-slate-400 text-xs mb-2 font-medium">Members</p>
          <div className="flex -space-x-2">
            {group.memberDetails.map((member, idx) => (
              <div
                key={member.id}
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-lg border-2 border-slate-900 hover:scale-110 transition-transform cursor-pointer"
                title={member.name}
              >
                {member.avatar}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onViewDetails(group)}
          className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/25 cursor-pointer"
        >
          <FaEye className="w-4 h-4" />
          View Details
          <IoMdArrowForward className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default CardViewGroup;

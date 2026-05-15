import React from "react";

const ExpenseItem = ({ title, subtitle, amount, time, status }) => {
  // Determine status styles
  const isSettled = status === "Settled";

  const badgeClass = isSettled
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : "bg-amber-500/15 text-amber-400 border-amber-500/30";

  return (
    <div className="flex items-center justify-between p-4 bg-[#162032] rounded-lg border border-[#334155] hover:border-[#475569] transition-colors">
      {/* Left Side: Info */}
      <div className="flex flex-col gap-1">
        <h4 className="text-white text-sm font-medium">{title}</h4>
        <p className="text-[#94a3b8] text-xs">{subtitle}</p>
      </div>

      {/* Right Side: Amount & Status */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white text-sm font-bold">{amount}</p>
          <p className="text-[#64748b] text-[10px]">{time}</p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${badgeClass}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};

export default ExpenseItem;

import React from "react";

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  iconBg = "bg-blue-500",
}) => {
  return (
    <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155] relative overflow-hidden">

      <div className="flex justify-between items-start mb-3">

        {/* Icon */}
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          {Icon && <Icon className="text-white text-lg" />}
        </div>

        {/* Trend (only if exists) */}
        {trend && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${trendUp
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
              }`}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-[#94a3b8] text-xs mb-1">{label}</p>

      {/* Value */}
      <h3 className="text-xl font-bold text-white">
        {value !== undefined && value !== null ? value : 0}
      </h3>
    </div>
  );
};

export default StatCard;
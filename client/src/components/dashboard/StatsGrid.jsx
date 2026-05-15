import React from "react";

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[140px] flex flex-col justify-between hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div>
            <p className="text-slate-400 text-sm mb-3">{stat.label}</p>
            <p className="text-3xl font-bold mb-3 text-white">{stat.value}</p>
          </div>
          <p className={`text-xs ${stat.color}`}>{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;

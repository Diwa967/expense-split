import React from "react";

// Convert timestamp → "time ago"
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = Math.floor((now - past) / 1000); // seconds

  if (diff < 10) return "Just now";

  if (diff < 60) return `${diff}s ago`;

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7)
    return `${days} day${days > 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4)
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

const ActivityItem = ({ title, subtitle, amount, time, status }) => {
  const statusStyle =
    status === "Settled"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30";

  return (
    <div className="flex items-center justify-between p-4 bg-[#162032] rounded-lg border border-[#1e293b] hover:bg-[#1e293b] transition-colors">

      {/* LEFT SIDE */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium truncate">
          {title}
        </h4>
        <p className="text-[#94a3b8] text-xs mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      {/* AMOUNT + TIME */}
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-white text-sm font-semibold">
          ${amount.toLocaleString()}
        </p>
        <p className="text-[#64748b] text-xs">
          {getTimeAgo(time)}
        </p>
      </div>

      {/* STATUS */}
      <span
        className={`ml-4 px-2.5 py-1 rounded-full text-[10px] font-semibold border flex-shrink-0 ${statusStyle}`}
      >
        {status}
      </span>
    </div>
  );
};

export default ActivityItem;
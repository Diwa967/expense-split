import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import DashboardHeader from "./DashboardHeader";
import ActivityItem from "./ActivityItem";
import api from "../../api/api";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

const SpendingTrendsChart = ({ data }) => {
  const formattedData = data.map((item) => ({
    month: item.month,
    split: item.split,
    settled: item.settled,
    pending: item.pending,
  }));

  return (
    <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
      <h3 className="text-white font-semibold text-sm mb-4">
        Spending & Settlement Trends
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          <Line
            type="monotone"
            dataKey="split"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="settled"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const GroupDistributionChart = ({ data }) => {
  return (
    <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
      <h3 className="text-white font-semibold text-sm mb-4">
        Group Types Distribution
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [overviewRes, trendsRes, groupsRes] = await Promise.all([
          api.get(`/api/admin/overview`),
          api.get(`/api/admin/spending-trends`),
          api.get(`/api/admin/group-distribution`),
        ]);

        setOverview(overviewRes.data.data);
        setTrends(trendsRes.data.data);
        setGroups(groupsRes.data.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-red-400">
        Failed to load data
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans">
      {/* ✅ Header no longer needs props */}
      <DashboardHeader activeTab="Overview" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SpendingTrendsChart data={trends} />
        <GroupDistributionChart data={groups} />
      </div>

      {/* Activities */}
      <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-sm">
            Recent Expense Activity
          </h3>
          {/* <button className="text-blue-400 text-xs font-medium hover:text-blue-300">
            View All
          </button> */}
        </div>

        <div className="space-y-2">
          {overview.activities?.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaChartLine,
  FaDollarSign,
  FaExclamationTriangle,
  FaDownload,
  FaSpinner,
  FaPlus,
} from "react-icons/fa";

import { Modal, Form, Input, message, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import StatCard from "./StatCard";
import api from "../../api/api";
import { generateAdminReport } from "./generateAdminReport";

// ─── Currency Formatter ─────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

// 🎨 avatar color palette
const avatarColors = [
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-purple-500 to-violet-500",
  "from-cyan-500 to-sky-500",
];

const DashboardHeader = ({ activeTab = "Overview" }) => {
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);

  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalExpenses: 0,
    totalSpent: 0,
  });

  const [admin, setAdmin] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  // ── Fetch stats ─────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, meRes] = await Promise.all([
          api.get("/api/admin/overview", { withCredentials: true }),
          api.get("/api/auth/me", { withCredentials: true }),
        ]);

        setStatsData(overviewRes.data.data);
        setAdmin(meRes.data.user);
      } catch (err) {
        console.error("Header error:", err);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { name: "Overview", path: "/admin-dashboard" },
    { name: "Users", path: "/admin-dashboard/users" },
    { name: "Groups", path: "/admin-dashboard/groups" },
    { name: "Expenses", path: "/admin-dashboard/expenses" },
  ];

  const stats = [
    {
      icon: FaUsers,
      label: "Total Users",
      value: statsData.totalUsers,
      iconBg: "bg-blue-500",
    },
    {
      icon: FaChartLine,
      label: "Total Groups",
      value: statsData.totalGroups,
      iconBg: "bg-emerald-500",
    },
    {
      icon: FaDollarSign,
      label: "Total Spent",
      value: fmt(statsData.totalSpent),
      iconBg: "bg-blue-500",
    },
    {
      icon: FaExclamationTriangle,
      label: "Total Expenses",
      value: statsData.totalExpenses,
      iconBg: "bg-orange-500",
    },
  ];

  // ── Avatar Helpers ─────────────────────
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
  };

  // ── Export ─────────────────────────────
  const handleExportReport = async () => {
    setExporting(true);
    try {
      const res = await api.get("/api/admin/export-report", {
        withCredentials: true,
      });

      await generateAdminReport(res.data);
    } catch (err) {
      message.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });

      // clear any local state if needed
      localStorage.clear();

      navigate("/login"); // or "/"
    } catch (err) {
      message.error("Logout failed");
    }
  };

  // ── Create Admin ───────────────────────
  const handleCreateAdmin = async (values) => {
    try {
      setCreating(true);

      await api.post("/api/admin/create-admin", values, {
        withCredentials: true,
      });

      message.success("Admin created successfully");
      form.resetFields();
      setIsModalOpen(false);
    } catch (err) {
      message.error("Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  // ── Dropdown UI ───────────────────────
  const dropdownContent = (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-3 w-56 shadow-lg">
      {/* Profile */}
      <div className="flex items-center gap-3 mb-3">
        {admin?.profile ? (
          <img
            src={`https://utfs.io/f/${admin.profile}`}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-linear-to-br ${getColor(
              admin?.name || "A",
            )}`}
          >
            {getInitials(admin?.name || "A")}
          </div>
        )}

        <div>
          <p className="text-white text-sm font-semibold">{admin?.name}</p>
          <p className="text-[#94a3b8] text-xs">{admin?.email}</p>
        </div>
      </div>

      <div className="border-t border-[#334155] my-2" />

      {/* Actions */}
      <button
        onClick={() => navigate("/")}
        className="w-full text-left text-xs text-[#94a3b8] hover:text-white py-1 cursor-pointer"
      >
        Back to Home
      </button>

      <button
        onClick={handleLogout}
        className="w-full text-left text-xs text-red-400 hover:text-red-300 py-1 cursor-pointer"
      >
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Admin Control Panel
            </h1>
            <p className="text-[#94a3b8] text-xs mt-0.5">
              Monitor users, groups, expenses & settlements
            </p>
          </div>

          <div className="flex gap-2">
            {/* Export */}
            <button
              onClick={handleExportReport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs bg-[#1e293b] text-[#94a3b8] border-[#334155] hover:bg-[#334155] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <FaSpinner className="animate-spin text-[10px]" />
                  Generating…
                </>
              ) : (
                <>
                  <FaDownload className="text-[10px]" />
                  Export Report
                </>
              )}
            </button>

            {/* Create Admin */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
            >
              <FaPlus className="text-[10px]" />
              Create Admin
            </button>

            {/* 🔥 Profile Dropdown */}
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              dropdownRender={() => dropdownContent}
            >
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                {/* Avatar */}
                {admin?.profile ? (
                  <img
                    src={`https://utfs.io/f/${admin.profile}`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold bg-linear-to-br ${getColor(
                      admin?.name || "A",
                    )}`}
                  >
                    {getInitials(admin?.name || "A")}
                  </div>
                )}

                <span>{admin?.name}</span>
                <DownOutlined className="text-[10px]" />
              </button>
            </Dropdown>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-5 border-b border-[#334155]">
          {tabs.map((tab) => (
            <a
              key={tab.name}
              href={tab.path}
              className={`pb-2 text-xs font-medium ${
                tab.name === activeTab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-[#64748b] hover:text-[#94a3b8]"
              }`}
            >
              {tab.name}
            </a>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Modal */}
      <Modal
        title="Create New Admin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={creating}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateAdmin}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DashboardHeader;

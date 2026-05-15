import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import ExpenseItem from "./ExpenseItem";
import api from "../../api/api";

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // 🔥 Fetch expenses from API
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get("/api/admin/expenses", {
          withCredentials: true,
        });

        const formatted = res.data.expenses.map((exp) => ({
          id: exp._id,
          title: exp.title,
          subtitle: `${exp.groupName} • ${exp.participantsCount} way split`,
          amount: `$${exp.amount}`,
          time: formatTime(exp.createdAt),
          status: "Settled",

          // 🔥 store full object for modal
          full: exp,
        }));

        setExpenses(formatted);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  // ⏱️ Time formatter
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const diff = Math.floor((new Date() - date) / (1000 * 60 * 60));

    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff} hours ago`;
    return `${Math.floor(diff / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans">
      <DashboardHeader activeTab="Expenses" />

      {/* Expenses Container */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155]">

        {/* Header */}
        <div className="p-5 border-b border-[#334155] flex justify-between items-center">
          <h3 className="text-white font-semibold text-sm">All Expenses</h3>

          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] text-[#94a3b8] rounded-lg border border-[#334155] text-xs hover:bg-[#334155] transition-colors">
              Filter
            </button>

          </div>
        </div>

        {/* Expense List */}
        <div className="p-5 space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              onClick={() => setSelectedExpense(expense.full)}
              className="cursor-pointer"
            >
              <ExpenseItem {...expense} />
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">

          <div className="bg-[#1e293b] w-full max-w-[520px] rounded-2xl border border-[#334155] shadow-xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155]">
              <h2 className="text-white font-semibold text-sm">
                Expense Details
              </h2>

              <button
                onClick={() => setSelectedExpense(null)}
                className="text-[#94a3b8] hover:text-red-400 transition text-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">

              {/* Title Section */}
              <div>
                <p className="text-[#94a3b8] text-xs">Title</p>
                <p className="text-white font-medium text-base">
                  {selectedExpense.title}
                </p>
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-3">

                <div className="bg-[#162032] p-3 rounded-lg border border-[#334155]">
                  <p className="text-[#94a3b8] text-xs">Amount</p>
                  <p className="text-white font-semibold text-sm">
                    ${selectedExpense.amount}
                  </p>
                </div>

                <div className="bg-[#162032] p-3 rounded-lg border border-[#334155]">
                  <p className="text-[#94a3b8] text-xs">Category</p>
                  <p className="text-white font-medium text-sm">
                    {selectedExpense.category}
                  </p>
                </div>

              </div>

              {/* Group Info */}
              <div className="bg-[#162032] p-3 rounded-lg border border-[#334155]">
                <p className="text-[#94a3b8] text-xs">Group</p>
                <p className="text-white font-medium text-sm">
                  {selectedExpense.groupName}
                </p>
              </div>

              {/* People Info */}
              <div className="grid grid-cols-2 gap-3">

                <div className="bg-[#162032] p-3 rounded-lg border border-[#334155]">
                  <p className="text-[#94a3b8] text-xs">Paid By</p>
                  <p className="text-white font-medium text-sm">
                    {selectedExpense.paidBy}
                  </p>
                  <p className="text-[#94a3b8] text-[11px]">
                    {selectedExpense.paidByEmail}
                  </p>
                </div>

                <div className="bg-[#162032] p-3 rounded-lg border border-[#334155]">
                  <p className="text-[#94a3b8] text-xs">Participants</p>
                  <p className="text-white font-semibold text-sm">
                    {selectedExpense.participantsCount} users
                  </p>
                </div>

              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-center text-xs text-[#94a3b8] pt-2 border-t border-[#334155]">
                <span>Created By: {selectedExpense.createdBy}</span>
                <span>{formatTime(selectedExpense.createdAt)}</span>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminExpenses;
import React, { useState, useEffect } from "react";
import Sidebar from "./Layout/Sidebar";

import HeaderTop from "./layout/HeaderTop";
import ExpenseCard from "./expenses/ExpenseCard";
import AddExpenseModal from "./expenses/AddExpenseModal";
import ViewExpenseModal from "./expenses/ViewExpenseModal";
import api from "../api/api"; // Adjust path if needed
import { toast } from "react-toastify";
import { message } from "antd"; // Ant Design Message
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Adjust path if needed

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext); // Get logged-in user

  const categories = [
    "all",
    "Food & Dining",
    "Entertainment",
    "Transport",
    "Groceries",
    "Shopping",
    "Bills",
    "Others",
  ];

  // Fetch expenses when component mounts
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/expenses/myExpenses");

      if (res.data.success) {
        setExpenses(res.data.expenses || []);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // Handle new expense added from modal
  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]); // Add to top
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.group?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.paidBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || expense.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <HeaderTop
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Expenses"
        />

        <div className="p-6 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Expenses</h1>
              <p className="text-slate-400 text-sm">
                Track all shared expenses across your groups
              </p>
            </div>

            <button
              onClick={() => {
                if (currentUser?.isBanned) {
                  message.error(
                    "Your account is restricted temporarily. You cannot add expenses.",
                  );
                  return;
                }
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all w-full sm:w-auto cursor-pointer"
            >
              + Add Expense
            </button>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2">
              <span className="text-slate-400 text-sm">Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-slate-400 text-sm ml-auto">
              {filteredExpenses.length} expense
              {filteredExpenses.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Expense List */}
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Loading expenses...
            </div>
          ) : filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense._id}
                  expense={expense}
                  onClick={() => {
                    setSelectedExpense(expense);
                    setIsViewModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
              <p className="text-slate-400 text-lg">No expenses found</p>
              <p className="text-slate-500 mt-2">
                Add your first expense to get started
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ViewExpenseModal
        expense={selectedExpense}
        isOpen={isViewModalOpen}
        onClose={() => {
          setSelectedExpense(null);
          setIsViewModalOpen(false);
        }}
      />

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExpense}
        // currentUserId={/* Pass your logged-in user ID here */}
      />
    </div>
  );
};

export default Expenses;

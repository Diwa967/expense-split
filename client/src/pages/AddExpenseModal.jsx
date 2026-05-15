import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";

const AddExpenseModal = ({
  isOpen,
  onClose,
  onAddExpense,
  groups,
  members,
}) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Food & Dining",
    group: groups[0]?.name || "",
    paidBy: members[0]?.name || "",
    splitWith: members.map((m) => m.id), // Select all by default
  });

  const categories = [
    "Food & Dining",
    "Entertainment",
    "Transport",
    "Groceries",
    "Shopping",
    "Bills",
    "Others",
  ];

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      splitWith: prev.splitWith.includes(memberId)
        ? prev.splitWith.filter((id) => id !== memberId)
        : [...prev.splitWith, memberId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.description ||
      !formData.amount ||
      formData.splitWith.length === 0
    ) {
      return;
    }

    onAddExpense({
      ...formData,
      amount: parseFloat(formData.amount),
    });

    // Reset form
    setFormData({
      description: "",
      amount: "",
      category: "Food & Dining",
      group: groups[0]?.name || "",
      paidBy: members[0]?.name || "",
      splitWith: members.map((m) => m.id),
    });

    onClose();
  };

  const selectedMemberCount = formData.splitWith.length;

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-xl z-10">
            <div>
              <h2 className="text-xl font-bold text-white">Add New Expense</h2>
              <p className="text-slate-400 text-xs mt-1">
                Add and split an expense with your group members
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            >
              <IoMdClose className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Description */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g. Lunch at restaurant"
                className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Group */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Group
              </label>
              <div className="relative">
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm appearance-none cursor-pointer"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Paid By
              </label>
              <div className="relative">
                <select
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm appearance-none cursor-pointer"
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Split With */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Split With
                <span className="text-slate-400 text-xs ml-1">
                  ({selectedMemberCount} selected)
                </span>
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.splitWith.includes(member.id)}
                      onChange={() => handleCheckboxChange(member.id)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500/20 focus:ring-2 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-sm flex-shrink-0">
                        {member.avatar}
                      </div>
                      <span className="text-white text-sm font-medium truncate">
                        {member.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 sticky bottom-0 bg-slate-900">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !formData.description ||
                  !formData.amount ||
                  formData.splitWith.length === 0
                }
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddExpenseModal;

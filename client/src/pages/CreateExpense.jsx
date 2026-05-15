import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth.js";

export default function CreateExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    date: new Date().toISOString().split("T")[0],
    paidBy: user?._id || "",
    splitType: "equal",
    splits: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await groupAPI.getGroup(id);
      setGroup(response.data);

      // Initialize splits for all members
      const initialSplits =
        response.data.members?.map((member) => ({
          user: member._id,
          amount: 0,
        })) || [];

      setFormData((prev) => ({
        ...prev,
        splits: initialSplits,
        paidBy: user?._id || response.data.members?.[0]?._id || "",
      }));
    } catch (err) {
      setError("Failed to load group");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, amount }));

    // Auto-calculate splits based on split type
    if (prev.splitType === "equal") {
      const splitAmount = amount / (prev.splits.length || 1);
      const newSplits = prev.splits.map((split) => ({
        ...split,
        amount: splitAmount,
      }));
      setFormData((prev) => ({ ...prev, splits: newSplits }));
    }
  };

  const handleSplitChange = (index, value) => {
    const newSplits = [...formData.splits];
    newSplits[index].amount = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, splits: newSplits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    if (formData.amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const totalSplit = formData.splits.reduce(
      (sum, split) => sum + split.amount,
      0,
    );
    if (Math.abs(totalSplit - formData.amount) > 0.01) {
      setError(
        `Split total (${totalSplit.toFixed(2)}) must equal amount (${formData.amount.toFixed(2)})`,
      );
      return;
    }

    setSubmitting(true);

    try {
      await expenseAPI.createExpense({
        groupId: id,
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        paidBy: formData.paidBy,
        splits: formData.splits.map((split) => ({
          user: split.user,
          amount: split.amount,
        })),
      });

      navigate(`/groups/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create expense");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-lg text-gray-600">Loading...</div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-lg text-gray-600">Group not found</div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to={`/groups/${id}`}
        className="text-primary hover:underline mb-4 inline-block"
      >
        Back to {group.name}
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Expense</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Details
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Dinner, Movie tickets"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">$</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    step="0.01"
                    min="0"
                    required
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="paidBy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Paid by
              </label>
              <select
                id="paidBy"
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                className="input-field"
              >
                {group.members?.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Split Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Split Expense
          </h2>

          <div className="mb-4">
            <label
              htmlFor="splitType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Split Type
            </label>
            <select
              id="splitType"
              name="splitType"
              value={formData.splitType}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, splitType: e.target.value }));
              }}
              className="input-field"
            >
              <option value="equal">Equal Split</option>
              <option value="custom">Custom Split</option>
            </select>
          </div>

          <div className="space-y-3">
            {group.members?.map((member, idx) => (
              <div
                key={member._id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <span className="text-gray-700 font-medium">{member.name}</span>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">$</span>
                  <input
                    type="number"
                    value={formData.splits[idx]?.amount || 0}
                    onChange={(e) => handleSplitChange(idx, e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Total Amount:</span> $
              {formData.splits
                .reduce((sum, split) => sum + split.amount, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating Expense..." : "Create Expense"}
        </button>
      </form>
    </main>
  );
}

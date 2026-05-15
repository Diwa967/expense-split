import React, { useState } from "react";
import { FiArrowLeft, FiChevronDown } from "react-icons/fi";
// import Header from "./Header";

const CreateNewGroup = () => {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD ($)");
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    currency: "USD ($)",
  });

  const currencies = [
    "USD ($)",
    "EUR (€)",
    "GBP (£)",
    "INR (₹)",
    "JPY (¥)",
    "AUD (A$)",
    "CAD (C$)",
  ];

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setFormData({ ...formData, currency });
    setCurrencyOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reusable Header Component */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Centered Content Wrapper */}
        <div className="flex flex-col items-center">
          {/* Back Link - Centered */}
          <div className="mb-6">
            <a
              href="#"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Groups
            </a>
          </div>

          {/* Page Header - Centered */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Group
            </h1>
            <p className="mt-2 text-gray-600">
              Set up a new expense group for you and your friends
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-xl space-y-6"
          >
            {/* Group Name Field */}
            <div>
              <label
                htmlFor="groupName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="groupName"
                value={formData.groupName}
                onChange={(e) =>
                  setFormData({ ...formData, groupName: e.target.value })
                }
                placeholder="e.g., Weekend Trip, House Bills, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description of the group"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              />
            </div>

            {/* Currency Field */}
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Currency
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-left flex justify-between items-center"
                >
                  <span>{selectedCurrency}</span>
                  <FiChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      currencyOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Currency Dropdown */}
                {currencyOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {currencies.map((currency) => (
                      <button
                        key={currency}
                        type="button"
                        onClick={() => handleCurrencySelect(currency)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                          selectedCurrency === currency
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : ""
                        }`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Click outside to close dropdown */}
      {currencyOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setCurrencyOpen(false)}
        />
      )}
    </div>
  );
};

export default CreateNewGroup;

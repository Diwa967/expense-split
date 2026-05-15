import React, { useContext, useState, useRef, useEffect } from "react";
import {
  FaUsers,
  FaReceipt,
  FaBolt,
  FaChevronRight,
  FaSignOutAlt,
  FaUser,
  FaCog,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProfileDropdown from "../components/ProfileDropdown";

// ── Home Page ─────────────────────────────────────────────────────────────────
const Home = () => {
  const { user, logout } = useContext(AuthContext);

  console.log(user);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaReceipt className="text-white text-lg" />
              </div>
              <span className="font-bold text-gray-900">Expense Splitter</span>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <ProfileDropdown user={user} onLogout={logout} />
              ) : (
                <>
                  <Link to="/login">
                    <button className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 cursor-pointer">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-6 py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 cursor-pointer">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-linear-to-b from-blue-50/50 to-white pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>
              {user
                ? `Welcome back, ${user.name.split(" ")[0]}! 👋`
                : "Welcome to Expense Splitter"}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Split Expenses
            <br />
            the <span className="text-blue-600">Smart Way</span>
          </h1>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
            Keep track of shared expenses with friends, family, and roommates.
            Settle debts instantly with intelligent calculations.
          </p>

          {/* Smart Hero Buttons */}
          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link
                to={
                  user?.role === "admin"
                    ? "/admin-dashboard"
                    : `/expense-tracker/${user?.id}/dashboard`
                }
              >
                <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
                  Go to Dashboard
                  <FaChevronRight className="text-sm" />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    Get Started Free
                    <FaChevronRight className="text-sm" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors">
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Powerful Features
            </h2>
            <p className="text-gray-500">
              Everything you need to manage shared expenses effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <FaUsers className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Create Groups
              </h3>
              <p className="text-gray-600 text-sm">
                Organize expenses by group - trips, roommates, events, or
                anything else. Simple and intuitive.
              </p>
            </div>

            <div className="bg-green-50/50 rounded-xl p-6 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <FaReceipt className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Track Expenses
              </h3>
              <p className="text-gray-600 text-sm">
                Add expenses and split them equally, by percentage, or with
                custom amounts for each person.
              </p>
            </div>

            <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FaBolt className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Settle Instantly
              </h3>
              <p className="text-gray-600 text-sm">
                Calculate who owes whom with real-time balance updates and make
                payments as settled.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              How it Works
            </h2>
            <p className="text-gray-500">
              4 simple steps to manage your shared expenses
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Create a Group",
                desc: "Set up a group for your trip, event, or regular expenses",
              },
              {
                step: 2,
                title: "Add Members",
                desc: "Invite friends and family to join the group",
              },
              {
                step: 3,
                title: "Log Expenses",
                desc: "Record who paid and how to split the expense",
              },
              {
                step: 4,
                title: "Settle Up",
                desc: "See who owes who and settle the balances instantly",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow text-center relative"
              >
                {step > 1 && (
                  <div className="hidden md:block absolute top-1/2 -left-3 transform -translate-y-1/2">
                    <FaChevronRight className="text-gray-300" />
                  </div>
                )}
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">
              {user
                ? "Ready to Split Your Next Expense?"
                : "Ready to Simplify Expenses?"}
            </h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">
              {user
                ? "Head to your dashboard to manage groups and track expenses."
                : "Start splitting expenses today. It's free and takes less than a minute."}
            </p>

            {/* Smart CTA Button */}
            {user ? (
              <Link to="/dashboard">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
                  Go to Dashboard
                  <FaChevronRight className="text-sm" />
                </button>
              </Link>
            ) : (
              <Link to="/register">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
                  Get Started Now
                  <FaChevronRight className="text-sm" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>© 2026 Expense Splitter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

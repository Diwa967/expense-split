import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailVerify from "./Emailverify.jsx";
import ResetPassword from "./ResetPassword.jsx";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register";

import ExpenseDashboard from "./components/ExpenseDashboard.jsx";
import Expenses from "./components/Expenses.jsx";
import Settings from "./components/Settings.jsx";

import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AdminUsers from "./components/Admin/AdminUsers.jsx";
import AdminExpenses from "./components/Admin/AdminExpenses.jsx";
import AdminGroups from "./components/Admin/AdminGroups.jsx";

function App() {
  return (
    <div className="main">
      <ToastContainer position="top-right" autoClose={3000} />

      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerify />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* <Route path="/dashboard/:id" element={<Dashboard />} /> */}
              {/*  */}
              <Route
                path="/expense-tracker/:id/dashboard"
                element={<ExpenseDashboard />}
              />
              {/* Expenses List Page */}
              <Route
                path="/expense-tracker/:id/expenses"
                element={<Expenses />}
              />
              <Route
                path="/expense-tracker/:id/settings"
                element={<Settings />}
              />

              {/* Admin Dashboard Routes */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/users" element={<AdminUsers />} />
              <Route path="/admin-dashboard/expenses" element={<AdminExpenses />} />
              <Route path="/admin-dashboard/groups" element={<AdminGroups />} />


              {/* Protected Routes */}
              {/* <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Dashboard />
                  </ProtectedRoute>
                }
              /> */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;

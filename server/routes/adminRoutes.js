// routes/adminRoutes.js
import express from "express";
import {
    getAllUsers,
    getAllExpenses,
    getAllGroups,
    getAdminOverview,
    getGroupDistribution,
    getSpendingTrends,
    getExportReportData,
    createAdmin,
    bulkDeleteInactiveUsers
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// 🔐 Apply middleware to all admin routes
router.use(protect, isAdmin);

// 📊 Get all users (with groups + expenses)
router.get("/users", getAllUsers);
router.get("/expenses", getAllExpenses);
router.get("/groups", getAllGroups);

// 🔐 Admin dashboard overview
router.get("/overview", getAdminOverview);

// 📈 chart data
router.get("/spending-trends", getSpendingTrends);

// 🥧 pie chart
router.get("/group-distribution", getGroupDistribution);

router.get("/export-report", getExportReportData);
router.post("/create-admin", createAdmin);

router.delete("/users/bulk-delete-inactive", bulkDeleteInactiveUsers);

export default router;
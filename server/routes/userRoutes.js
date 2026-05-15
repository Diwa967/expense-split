import express from "express";
import {
    searchUsers,
    getDashboardStats,
    banUser,
    unbanUser
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Search users by email or name
router.get("/search", searchUsers);
router.get("/stats", protect, getDashboardStats);
router.post("/:id/ban", protect, isAdmin, banUser);
router.post("/:id/unban", protect, isAdmin, unbanUser);

export default router;

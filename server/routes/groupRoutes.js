import express from "express";
import { createGroup, getGroups, deleteGroup, updateGroup, getGroupMembers, sendGroupMessage } from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createGroup", protect, createGroup);
router.get("/myGroups", protect, getGroups);
router.delete("/:id", protect, deleteGroup);
router.put("/:id", protect, updateGroup);
router.get("/:groupId/members", protect, getGroupMembers);
router.post("/:groupId/message", protect, sendGroupMessage);   // New route for sending messages to group members

export default router;

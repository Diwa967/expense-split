import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import { calculateEqualSplit } from "../utils/split.js";

// Helper: Validate ObjectId
const validateObjectId = (id, name = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${name}: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
};

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, groupId, paidBy, participants, receipts } =
      req.body;

    if (!title || !amount || !groupId || !paidBy || !participants?.length) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, group, paidBy and participants are required",
      });
    }

    // Verify user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      members: req.userId,
    });

    if (!group) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Calculate equal split
    const splitAmount = Number(amount) / participants.length;

    const splits = participants.map((userId) => ({
      user: userId,
      amount: splitAmount,
    }));

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || "Others",
      group: groupId,
      paidBy,
      participants,
      splits,
      createdBy: req.userId,
      receipts: receipts || [],
    });

    // Return populated expense
    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email avatar")
      .populate("participants", "name email avatar")
      .populate("group", "name");

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add expense",
    });
  }
};

// Get expenses by group
export const getExpensesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Validate groupId
    const groupObjectId = validateObjectId(groupId, "groupId");

    const expenses = await Expense.find({ group: groupObjectId })
      .populate("paidBy", "name")
      .populate("participants", "name");

    res.json({ success: true, expenses });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: error.message });
  }
};

// controllers/expenseController.js

// Get all expenses of the logged-in user (across all groups)
export const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [
        { paidBy: req.userId }, // Expenses I paid
        { participants: req.userId }, // Expenses I am part of
      ],
    })
      .populate("group", "name") // Get group name
      .populate("paidBy", "name email avatar") // Who paid
      .populate("participants", "name email avatar") // All participants
      .populate("splits.user", "name email avatar") // Split details
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error("Get my expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
};

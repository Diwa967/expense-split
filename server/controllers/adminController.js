// controllers/adminController.js
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.aggregate([
            // ❌ exclude admin users
            {
                $match: {
                    role: { $ne: "admin" },
                },
            },

            {
                $lookup: {
                    from: "groups",
                    localField: "_id",
                    foreignField: "members",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "expenses",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "expenses",
                },
            },

            {
                $addFields: {
                    totalGroups: { $size: "$groups" },
                    totalExpenses: { $size: "$expenses" },
                    totalSpent: { $sum: "$expenses.amount" },
                },
            },

            {
                $project: {
                    groups: 0,
                    expenses: 0,
                    password: 0,
                    verifyOtp: 0,
                    resetOtp: 0,
                    __v: 0,
                },
            },

            {
                $sort: { createdAt: -1 },
            },
        ]);

        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getAllExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const expenses = await Expense.aggregate([
            // Paid By
            {
                $lookup: {
                    from: "users",
                    localField: "paidBy",
                    foreignField: "_id",
                    pipeline: [{ $project: { name: 1, email: 1 } }],
                    as: "paidByUser",
                },
            },
            {
                $unwind: {
                    path: "$paidByUser",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Group
            {
                $lookup: {
                    from: "groups",
                    localField: "group",
                    foreignField: "_id",
                    pipeline: [{ $project: { name: 1 } }],
                    as: "groupData",
                },
            },
            {
                $unwind: {
                    path: "$groupData",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Created By
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    pipeline: [{ $project: { name: 1 } }],
                    as: "createdByUser",
                },
            },
            {
                $unwind: {
                    path: "$createdByUser",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Project
            {
                $project: {
                    title: 1,
                    amount: 1,
                    category: 1,
                    createdAt: 1,

                    groupName: "$groupData.name",

                    paidBy: "$paidByUser.name",
                    paidByEmail: "$paidByUser.email",

                    createdBy: "$createdByUser.name",

                    participantsCount: {
                        $size: { $ifNull: ["$participants", []] },
                    },
                },
            },

            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json({
            success: true,
            page,
            count: expenses.length,
            expenses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch expenses",
            error: error.message,
        });
    }
};


export const getAllGroups = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const groups = await Group.aggregate([
            // 👤 Created By
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    pipeline: [{ $project: { name: 1, email: 1 } }],
                    as: "createdByUser",
                },
            },
            {
                $unwind: {
                    path: "$createdByUser",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // 👥 Members (lightweight)
            {
                $lookup: {
                    from: "users",
                    localField: "members",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { name: 1, email: 1, profile: 1 } },
                    ],
                    as: "memberDetails",
                },
            },

            // 💰 Expense stats (optimized)
            {
                $lookup: {
                    from: "expenses",
                    let: { groupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$group", "$$groupId"] } } },
                        {
                            $group: {
                                _id: null,
                                totalSpent: { $sum: "$amount" },
                                totalExpenses: { $sum: 1 },
                            },
                        },
                    ],
                    as: "expenseStats",
                },
            },

            {
                $addFields: {
                    totalMembers: { $size: { $ifNull: ["$members", []] } },
                    totalSpent: {
                        $ifNull: [{ $arrayElemAt: ["$expenseStats.totalSpent", 0] }, 0],
                    },
                    totalExpenses: {
                        $ifNull: [{ $arrayElemAt: ["$expenseStats.totalExpenses", 0] }, 0],
                    },
                },
            },

            // 🧹 Final response
            {
                $project: {
                    name: 1,
                    createdAt: 1,

                    createdBy: "$createdByUser.name",
                    createdByEmail: "$createdByUser.email",

                    members: {
                        $map: {
                            input: "$memberDetails",
                            as: "m",
                            in: {
                                _id: "$$m._id",
                                name: "$$m.name",
                                email: "$$m.email",
                                profile: "$$m.profile",
                            },
                        },
                    },

                    totalMembers: 1,
                    totalExpenses: 1,
                    totalSpent: 1,
                },
            },

            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json({
            success: true,
            page,
            count: groups.length,
            groups,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch groups",
            error: error.message,
        });
    }
};

// 📊 ADMIN DASHBOARD OVERVIEW
export const getAdminOverview = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalGroups = await Group.countDocuments();
        const totalExpenses = await Expense.countDocuments();

        const expenseAgg = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount" },
                },
            },
        ]);

        const totalSpent = expenseAgg[0]?.totalSpent || 0;

        // 🟢 recent activities (last 5 expenses)
        const recentExpenses = await Expense.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("group", "name")
            .populate("paidBy", "name");

        const activities = recentExpenses.map((exp) => ({
            title: exp.title,
            subtitle: `${exp.group?.name} • Split Expense`,
            amount: exp.amount,
            time: exp.createdAt,
            status: "Settled",
        }));

        res.json({
            success: true,
            data: {
                totalUsers,
                totalGroups,
                totalExpenses,
                totalSpent,
                activities,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


export const getSpendingTrends = async (req, res) => {
    try {
        const rawData = await Expense.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    split: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Create full 12-month template
        const fullYear = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            split: 0,
            settled: 0,
            pending: 0,
        }));

        // Fill real data
        rawData.forEach((item) => {
            const index = item._id - 1;

            fullYear[index] = {
                month: item._id,
                split: item.split,
                settled: Math.floor(item.split * 0.85),
                pending: Math.floor(item.split * 0.15),
            };
        });

        res.json({
            success: true,
            data: fullYear,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};


export const getGroupDistribution = async (req, res) => {
    try {
        const groups = await Group.find().populate("members");

        const data = groups.map((group) => ({
            name: group.name,
            value: group.members.length,
        }));

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};


/**
 * GET /api/admin/export-report
 * Returns all data needed for the admin PDF report in one request.
 */
export const getExportReportData = async (req, res) => {
    try {
        // ─── 1. Summary Stats ────────────────────────────────────────────
        const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
        const totalGroups = await Group.countDocuments();
        const totalExpenses = await Expense.countDocuments();

        const expenseAgg = await Expense.aggregate([
            { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
        ]);
        const totalSpent = expenseAgg[0]?.totalSpent || 0;

        // ─── 2. Users ────────────────────────────────────────────────────
        const users = await User.aggregate([
            { $match: { role: { $ne: "admin" } } },
            {
                $lookup: {
                    from: "groups",
                    localField: "_id",
                    foreignField: "members",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "expenses",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "expenses",
                },
            },
            {
                $addFields: {
                    totalGroups: { $size: "$groups" },
                    totalExpenses: { $size: "$expenses" },
                    totalSpent: { $sum: "$expenses.amount" },
                },
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    isVerified: 1,
                    createdAt: 1,
                    totalGroups: 1,
                    totalExpenses: 1,
                    totalSpent: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        // ─── 3. Groups ───────────────────────────────────────────────────
        const groups = await Group.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdByUser",
                },
            },
            { $unwind: "$createdByUser" },
            {
                $lookup: {
                    from: "expenses",
                    localField: "_id",
                    foreignField: "group",
                    as: "expenses",
                },
            },
            {
                $addFields: {
                    totalMembers: { $size: "$members" },
                    totalExpenses: { $size: "$expenses" },
                    totalSpent: { $sum: "$expenses.amount" },
                },
            },
            {
                $project: {
                    name: 1,
                    createdAt: 1,
                    createdBy: "$createdByUser.name",
                    createdByEmail: "$createdByUser.email",
                    totalMembers: 1,
                    totalExpenses: 1,
                    totalSpent: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        // ─── 4. Expenses ─────────────────────────────────────────────────
        const expenses = await Expense.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "paidBy",
                    foreignField: "_id",
                    as: "paidByUser",
                },
            },
            { $unwind: "$paidByUser" },
            {
                $lookup: {
                    from: "groups",
                    localField: "group",
                    foreignField: "_id",
                    as: "groupData",
                },
            },
            { $unwind: "$groupData" },
            {
                $project: {
                    title: 1,
                    amount: 1,
                    category: 1,
                    createdAt: 1,
                    groupName: "$groupData.name",
                    paidBy: "$paidByUser.name",
                    participantsCount: { $size: "$participants" },
                },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 100 }, // cap at 100 rows to keep PDF manageable
        ]);

        // ─── 5. Category breakdown ───────────────────────────────────────
        const categoryBreakdown = await Expense.aggregate([
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
        ]);

        res.status(200).json({
            success: true,
            generatedAt: new Date().toISOString(),
            summary: { totalUsers, totalGroups, totalExpenses, totalSpent },
            users,
            groups,
            expenses,
            categoryBreakdown,
        });
    } catch (error) {
        console.error("Export report error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate export data",
            error: error.message,
        });
    }
};


// Create Admin (for testing purposes)
export const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ── Validation ─────────────────────────
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // ── Check existing user ────────────────
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // ── Hash password ──────────────────────
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ── Create admin ───────────────────────
        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",        // 🔥 important
            isVerified: true,     // optional (skip email verification)
        });

        // ── Response ───────────────────────────
        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Create Admin Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create admin",
            error: error.message,
        });
    }
};


export const bulkDeleteInactiveUsers = async (req, res) => {
    try {
        const result = await User.deleteMany({ isVerified: false });

        res.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} inactive users.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import { sendEmail } from "../utils/sendEmail.js"; // adjust path if needed


// Search users API
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ success: true, users: [] });
    }

    // Use req.userId from protect middleware
    const users = await User.find({
      _id: { $ne: req.userId }, // exclude current user
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    })
      .select("_id name email avatar")
      .limit(10);

    res.json({ success: true, users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: error.message });
  }
};



// GET /api/dashboard/stats
// Returns all data needed for the dashboard charts and stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id; // from your auth middleware

    // ─── 1. Get all groups this user belongs to ───────────────────────────────
    const userGroups = await Group.find({ members: userId }).select("_id name");
    const groupIds = userGroups.map((g) => g._id);
    const groupNameMap = {};
    userGroups.forEach((g) => {
      groupNameMap[String(g._id)] = g.name;
    });

    // ─── 2. Get all expenses in those groups ──────────────────────────────────
    const allExpenses = await Expense.find({
      group: { $in: groupIds },
    }).lean();

    // ─── 3. STATS ─────────────────────────────────────────────────────────────

    // Total spent: sum of all splits where this user owes
    let totalSpent = 0;
    let youOwe = 0;
    let youAreOwed = 0;

    allExpenses.forEach((expense) => {
      const isParticipant = expense.participants.some(
        (p) => String(p) === String(userId)
      );
      const iPaid = String(expense.paidBy) === String(userId);

      if (isParticipant) {
        // What this user owes in this expense
        const mySplit = expense.splits.find(
          (s) => String(s.user) === String(userId)
        );
        if (mySplit) {
          totalSpent += mySplit.amount;
          if (!iPaid) {
            youOwe += mySplit.amount; // I owe the payer
          }
        }
      }

      if (iPaid) {
        // What others owe me
        const othersOweMe = expense.splits
          .filter((s) => String(s.user) !== String(userId))
          .reduce((sum, s) => sum + s.amount, 0);
        youAreOwed += othersOweMe;
      }
    });

    // ─── 4. EXPENSE TRENDS (last 7 weeks, line chart) ─────────────────────────
    const now = new Date();
    const weeks = Array.from({ length: 7 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (6 - i) * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { label: `Week ${i + 1}`, start: weekStart, end: weekEnd };
    });

    const expenseTrendsData = weeks.map(({ label, start, end }) => {
      const amount = allExpenses
        .filter((e) => {
          const createdAt = new Date(e.createdAt);
          const isParticipant = e.participants.some(
            (p) => String(p) === String(userId)
          );
          return isParticipant && createdAt >= start && createdAt <= end;
        })
        .reduce((sum, e) => {
          const mySplit = e.splits.find(
            (s) => String(s.user) === String(userId)
          );
          return sum + (mySplit?.amount || 0);
        }, 0);

      return { name: label, amount: Math.round(amount) };
    });

    // ─── 5. CATEGORY BREAKDOWN (pie chart) ────────────────────────────────────
    const categoryColors = {
      "Food & Dining": "#06b6d4",
      Transport: "#8b5cf6",
      Entertainment: "#10b981",
      Shopping: "#f59e0b",
      Travel: "#ef4444",
      Utilities: "#3b82f6",
      Others: "#94a3b8",
    };

    const categoryMap = {};
    allExpenses.forEach((expense) => {
      const isParticipant = expense.participants.some(
        (p) => String(p) === String(userId)
      );
      if (!isParticipant) return;

      const mySplit = expense.splits.find(
        (s) => String(s.user) === String(userId)
      );
      if (!mySplit) return;

      const cat = expense.category || "Others";
      categoryMap[cat] = (categoryMap[cat] || 0) + mySplit.amount;
    });

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Math.round(value),
      color: categoryColors[name] || "#94a3b8",
    }));

    // ─── 6. PER GROUP SPENDING (bar chart) ────────────────────────────────────
    const groupSpendingMap = {};
    allExpenses.forEach((expense) => {
      const isParticipant = expense.participants.some(
        (p) => String(p) === String(userId)
      );
      if (!isParticipant) return;

      const mySplit = expense.splits.find(
        (s) => String(s.user) === String(userId)
      );
      if (!mySplit) return;

      const gId = String(expense.group);
      groupSpendingMap[gId] = (groupSpendingMap[gId] || 0) + mySplit.amount;
    });

    const groupSpendingData = Object.entries(groupSpendingMap).map(
      ([gId, amount]) => ({
        name: groupNameMap[gId] || "Unknown Group",
        amount: Math.round(amount),
      })
    );

    // ─── 7. STATS ARRAY (matches your existing stats format) ──────────────────
    const stats = {
      totalGroups: userGroups.length,
      totalMembers: userGroups.reduce((sum, g) => sum + (g.members?.length || 0), 0),
      totalSpent: Math.round(totalSpent),
      youOwe: Math.round(youOwe),
      youAreOwed: Math.round(youAreOwed),
    };

    return res.status(200).json({
      success: true,
      stats,
      expenseTrendsData,
      categoryData,
      groupSpendingData,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};




export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot ban an admin",
      });
    }

    // Update user
    user.isBanned = true;
    user.banReason = reason || "No reason provided";
    user.bannedAt = new Date();
    user.bannedBy = req.user?._id;

    await user.save();

    // ================= EMAIL SEND =================
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #ef4444;">Account Suspended</h2>
          
          <p>Dear <strong>${user.name}</strong>,</p>
          
          <p>
            Your account on <strong>Expense-Split</strong> has been 
            <span style="color: red; font-weight: bold;">banned</span>.
          </p>

          <p><strong>Reason:</strong></p>
          <div style="background: #f3f4f6; padding: 10px; border-radius: 6px;">
            ${user.banReason}
          </div>

          <p style="margin-top: 15px;">
            If you believe this action was taken in error, you may contact our support team.
          </p>

          <hr style="margin: 20px 0;" />

          <p style="font-size: 12px; color: gray;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: "Your Account Has Been Banned",
        html,
      });

      console.log("Ban email sent to:", user.email);
    } catch (emailError) {
      // IMPORTANT: Don't break API if email fails
      console.error("Email failed:", emailError.message);
    }

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      message: "User banned successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason,
      },
    });

  } catch (error) {
    console.error("Ban Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Reset ban fields
    user.isBanned = false;
    user.banReason = "";
    user.bannedAt = null;
    user.bannedBy = null;

    await user.save();

    // ================= EMAIL SEND =================
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #10b981;">Account Restored</h2>

          <p>Dear <strong>${user.name}</strong>,</p>

          <p>
            Good news! Your account on <strong>Expense-Split</strong> has been 
            <span style="color: #10b981; font-weight: bold;">unbanned</span>.
          </p>

          <p>
            You can now log in and continue using all features as usual.
          </p>

          <p>
            Please make sure to follow our guidelines to avoid any future restrictions.
          </p>

          <hr style="margin: 20px 0;" />

          <p style="font-size: 12px; color: gray;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: "Your Account Has Been Restored",
        html,
      });

      console.log("Unban email sent to:", user.email);
    } catch (emailError) {
      // Do not break main API if email fails
      console.error("Unban Email Error:", emailError.message);
    }

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned,
      },
    });

  } catch (error) {
    console.error("Unban Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
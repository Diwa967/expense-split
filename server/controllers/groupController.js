import Group from "../models/Group.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";


export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const uniqueMembers = [...new Set([...(members || []), req.userId])];

    const group = await Group.create({
      name,
      members: uniqueMembers,
      createdBy: req.userId,
    });

    // ✅ Fetch all users
    const users = await User.find({ _id: { $in: uniqueMembers } })
      .select("email name");

    const creator = await User.findById(req.userId).select("name");


    // ✅ Send email to all members about the new group
    await Promise.all(
      users.map((user) => {
        const otherMembers = users.filter(
          (u) => u._id.toString() !== user._id.toString()
        );

        const membersList = otherMembers
          .map((m) => `<li>${m.name || "User"}</li>`)
          .join("");

        return sendEmail({
          to: user.email,
          subject: "Added to new group 🎉",
          html: `
        <h3>Hello ${user.name || "User"},</h3>
        <p>You have been added to a new group.</p>
        <p><strong>Group Name:</strong> ${name}</p>
        <p><strong>Created by:</strong> ${creator.name}</p>
        <ul>Members:${membersList}</ul>
      `,
        });
      })
    );

    res.status(201).json({
      success: true,
      group,
    });

  } catch (error) {
    console.error("Create Group Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get all groups of user
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.userId,
    }).populate("members", "name email");

    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id; // ✅ FIXED

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required",
      });
    }

    const group = await Group.findOne({
      _id: groupId,
      members: req.userId, // user must be in group
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not a member of this group",
      });
    }

    await Group.findByIdAndDelete(groupId);

    return res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Delete group error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting group",
    });
  }
};



// Update Group Controller
export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name, members } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one member is required",
      });
    }

    // Find group and ensure current user is a member
    const group = await Group.findOne({
      _id: groupId,
      members: req.userId,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not a member of this group",
      });
    }

    // Optional stricter rule:
    // Only creator can edit
    // if (group.createdBy.toString() !== req.userId.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only the group creator can edit this group",
    //   });
    // }

    // Validate all member IDs exist
    const validUsers = await User.find({ _id: { $in: members } }).select("_id");

    if (validUsers.length !== members.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected members are invalid",
      });
    }

    // Ensure current user stays in the group (important)
    const memberIds = [...new Set(members.map((id) => id.toString()))];

    if (!memberIds.includes(req.userId.toString())) {
      memberIds.push(req.userId.toString());
    }

    group.name = name.trim();
    group.members = memberIds;

    await group.save();

    const updatedGroup = await Group.findById(group._id).populate(
      "members",
      "name email avatar"
    );

    return res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Update group error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating group",
    });
  }
};


// NEW: Get members of a specific group
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({
      _id: groupId,
      members: req.userId,        // Security: Only if user is member
    }).populate("members", "name email avatar");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not a member",
      });
    }

    res.json({
      success: true,
      members: group.members,
    });
  } catch (error) {
    console.error("Get group members error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching group members",
    });
  }
};



export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;
    // const admin = req.user;

    // // ✅ Only Admin Check
    // if (admin.role !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only administrators can send messages to group members.",
    //   });
    // }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Find group and populate members
    const group = await Group.findById(groupId).populate("members", "name email");

    console.log(group);


    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (!group.members || group.members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This group has no members",
      });
    }

    const senderName = "Admin"; // You can replace this with actual admin name if available
    const groupName = group.name;

    // Email Content
    const emailSubject = `Important Message from Admin - ${groupName}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">Message from Administrator</h2>
        <p><strong>Group:</strong> ${groupName}</p>
        <p><strong>From:</strong> ${senderName}</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 16px; line-height: 1.7; color: #1f2937;">
          ${message}
        </p>
        <br>
        <small style="color: #6b7280;">
          This is an official message sent by the administrator to all members of <strong>${groupName}</strong>.
        </small>
      </div>
    `;

    // Send email to all members
    const emailPromises = group.members.map((member) => {
      if (!member.email) return null; // safety check

      return sendEmail({
        to: member.email,     // ✅ correct key
        subject: emailSubject,
        html: emailHtml,      // ✅ correct key
      });
    }).filter(Boolean);

    await Promise.all(emailPromises);

    res.status(200).json({
      success: true,
      message: `Message sent successfully to ${group.members.length} members`,
    });
  } catch (error) {
    console.error("Send Group Message Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
};
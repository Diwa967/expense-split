import React, { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import { FaEye, FaPaperPlane } from "react-icons/fa";
import api from "../../api/api";   // Adjust path as needed

const { TextArea } = Input;

const GroupCard = ({ group }) => {
  const {
    _id,           // Important: Group ID
    name,
    createdBy,
    createdByEmail,
    members,
    totalMembers,
    totalExpenses,
    totalSpent,
  } = group;

  // Modal States
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // Open Message Modal
  const openMessageModal = () => {
    setMessageText("");
    setIsMessageModalOpen(true);
  };

  // Send Message to Backend
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      message.warning("Please enter a message");
      return;
    }

    setSending(true);

    try {
      await api.post(
        `/api/auth/groups/${_id}/message`,   // Adjust endpoint as per your backend
        { message: messageText.trim() },
        { withCredentials: true }
      );

      message.success("Message sent to all group members successfully!");
      setIsMessageModalOpen(false);
      setMessageText("");
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const {
    name: creatorName = createdBy,
  } = group;

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden hover:border-[#475569] transition-colors">

      {/* Header */}
      <div className="p-5 border-b border-[#334155] flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-base mb-1">
            {name}
          </h3>
          <p className="text-[#94a3b8] text-xs">
            Created by {creatorName} • {createdByEmail}
          </p>
        </div>

        <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-semibold">
          {totalMembers} Members
        </span>
      </div>

      {/* Members Avatars */}
      <div className="px-5 pt-4 flex items-center">
        <div className="flex -space-x-3">
          {members?.slice(0, 6).map((m) => {
            const hasImage = !!m?.profile;
            const initials = m?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            const colors = [
              "from-blue-500 to-indigo-500",
              "from-emerald-500 to-teal-500",
              "from-pink-500 to-rose-500",
              "from-amber-500 to-orange-500",
              "from-purple-500 to-violet-500",
              "from-cyan-500 to-sky-500",
            ];

            const getColorIndex = (str) => {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash += str.charCodeAt(i);
              }
              return hash % colors.length;
            };

            const colorIndex = getColorIndex(m._id || m.name || "user");
            const bgColor = colors[colorIndex];

            return hasImage ? (
              <img
                key={m._id}
                src={`https://utfs.io/f/${m.profile}`}
                alt={m.name}
                title={m.name}
                className="w-8 h-8 rounded-full border-2 border-[#1e293b] object-cover"
              />
            ) : (
              <div
                key={m._id}
                title={m.name}
                className={`w-8 h-8 rounded-full border-2 border-[#1e293b] flex items-center justify-center text-[11px] font-semibold text-white bg-gradient-to-br ${bgColor}`}
              >
                {initials}
              </div>
            );
          })}

          {members?.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-[10px] text-white border-2 border-[#1e293b]">
              +{members.length - 6}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
        <div className="bg-[#162032] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#94a3b8] text-xs mb-2">Total Spent</p>
          <h4 className="text-white text-xl font-bold">${totalSpent}</h4>
        </div>

        <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
          <p className="text-emerald-400 text-xs mb-2">Members</p>
          <h4 className="text-emerald-400 text-xl font-bold">{totalMembers}</h4>
        </div>

        <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
          <p className="text-amber-400 text-xs mb-2">Expenses</p>
          <h4 className="text-amber-400 text-xl font-bold">{totalExpenses}</h4>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-[#334155] flex gap-3">
        {/* <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition">
          View Details
        </button> */}

        <button
          onClick={openMessageModal}
          className="flex-1 px-4 py-2 bg-[#334155] hover:bg-[#475569] text-[#94a3b8] hover:text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
        >
          <FaPaperPlane className="text-sm" />
          Message Members
        </button>
      </div>

      {/* ====================== MESSAGE MODAL ====================== */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <FaPaperPlane /> Message Group Members
          </span>
        }
        open={isMessageModalOpen}
        onCancel={() => setIsMessageModalOpen(false)}
        footer={null}
        centered
        width={500}
      >
        <div className="space-y-4 py-2">
          <p className="text-slate-400 text-sm">
            Send a message to all <strong>{totalMembers}</strong> members in <strong>{name}</strong>
          </p>

          <TextArea
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write your message here..."
            maxLength={500}
            showCount
            className="bg-[#0f172a] border-slate-600 text-white placeholder-slate-500"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setIsMessageModalOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<FaPaperPlane />}
              loading={sending}
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              Send Message
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupCard;
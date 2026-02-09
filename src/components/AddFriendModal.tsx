"use client";

import { X, Copy, UserPlus, Mail } from "lucide-react";
import { useState } from "react";

type Props = {
  inviteLink: string;
  onClose: () => void;
};

export default function AddFriendModal({ inviteLink, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied");
  };

  const sendInvite = async () => {
    if (!email) return;

    setSending(true);

    await fetch("/api/path/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, inviteLink }),
    });

    setSending(false);
    setEmail("");
    alert("Invite sent");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Invite people</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Add by email */}
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <button
            onClick={sendInvite}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg"
          >
            <Mail className="h-4 w-4" />
            {sending ? "Sending..." : "Send Invite"}
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center">
          Or share this link
        </p>

        <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <span className="text-sm truncate">{inviteLink}</span>
          <button onClick={copyLink}><Copy className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

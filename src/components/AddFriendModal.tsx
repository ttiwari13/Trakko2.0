"use client";

import { X, Copy, UserPlus } from "lucide-react";

type Props = {
  inviteLink: string;
  onClose: () => void;
};

export default function AddFriendModal({ inviteLink, onClose }: Props) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your path is ready</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add others button */}
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full">
          <UserPlus className="h-4 w-4" />
          Add others
        </button>

        <p className="text-sm text-gray-600">
          Or share this link with people you want on this path
        </p>

        {/* Link box */}
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <span className="text-sm truncate">{inviteLink}</span>
          <button onClick={copyLink}>
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

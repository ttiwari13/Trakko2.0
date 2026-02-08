"use client";

import { Play, UserPlus, Share2, Bookmark } from "lucide-react";
import { useState,useEffect } from "react";
import AddFriendModal from "./AddFriendModal";

type ActiveBtn = "start" | "friend" | "share" | "save" | null;

type BottomBarProps = {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onStart: () => void;
};

export default function BottomBar({
  isAuthenticated,
  onRequireAuth,
  onStart,
}: BottomBarProps) {
  const [active, setActive] = useState<ActiveBtn>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const base =
    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ease-out active:scale-95";

  const inactive =
    "bg-white text-black border border-gray-300 hover:bg-gray-100";

  const activeStyle =
    "bg-blue-600 text-white shadow-md";

  const handleStart = () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    setActive("start");
    onStart();
  };
   useEffect(() => {
    setInviteLink(`${window.location.origin}/join/abc123`);
  }, []);
  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-4">
        <button
          onClick={handleStart}
          className={`${base} ${active === "start" ? activeStyle : inactive}`}
        >
          <Play className="h-4 w-4" />
          Start
        </button>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              onRequireAuth();
              return;
            }
            setActive("friend");
            setShowAddFriend(true);
          }}
          className={`${base} ${active === "friend" ? activeStyle : inactive}`}
        >
          <UserPlus className="h-4 w-4" />
          Add
        </button>

        <button
          onClick={() => setActive("share")}
          className={`${base} ${active === "share" ? activeStyle : inactive}`}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <button
          onClick={() => setActive("save")}
          className={`${base} ${active === "save" ? activeStyle : inactive}`}
        >
          <Bookmark className="h-4 w-4" />
          Save
        </button>
      </div>
   {showAddFriend && (
        <AddFriendModal
          inviteLink={inviteLink}
          onClose={() => setShowAddFriend(false)}
        />
      )}
    </>
  );
}

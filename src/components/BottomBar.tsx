"use client";

import { Play, UserPlus, Share2, Bookmark, Heart, StopCircle } from "lucide-react";
import { useState, useEffect } from "react";
import AddFriendModal from "./AddFriendModal";
import ShareLink from "./Sharelink";

type ActiveBtn =
  | "start"
  | "friend"
  | "share"
  | "save"
  | "favourite"
  | "stop"
  | null;

type BottomBarProps = {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onStart: () => void;
  onStop: () => void;
};

export default function BottomBar({
  isAuthenticated,
  onRequireAuth,
  onStart,
  onStop,
}: BottomBarProps) {
  const [active, setActive] = useState<ActiveBtn>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [showShare, setShowShare] = useState(false);

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

  const handleStop = () => {
    setActive("stop");
    onStop();
  };

  useEffect(() => {
    setInviteLink(`${window.location.origin}/join/abc123`);
  }, []);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-4">

        {/* START */}
        <button
          onClick={handleStart}
          className={`${base} ${active === "start" ? activeStyle : inactive}`}
        >
          <Play className="h-4 w-4" />
          Start
        </button>

        {/* ADD FRIEND */}
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

        {/* SHARE */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              onRequireAuth();
              return;
            }
            setActive("share");
            setShowShare(true);
          }}
          className={`${base} ${active === "share" ? activeStyle : inactive}`}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        {/* SAVE */}
        <button
          onClick={() => setActive("save")}
          className={`${base} ${active === "save" ? activeStyle : inactive}`}
        >
          <Bookmark className="h-4 w-4" />
          Save
        </button>

        {/* FAVOURITE */}
        <button
          onClick={() => setActive("favourite")}
          className={`${base} ${active === "favourite" ? activeStyle : inactive}`}
        >
          <Heart className="h-4 w-4" />
          Favourite
        </button>

        {/* STOP */}
        <button
          onClick={handleStop}
          className={`${base} ${active === "stop" ? activeStyle : inactive}`}
        >
          <StopCircle className="h-4 w-4" />
          Stop
        </button>

      </div>

      {showAddFriend && (
        <AddFriendModal
          inviteLink={inviteLink}
          onClose={() => setShowAddFriend(false)}
        />
      )}

      {showShare && (
        <ShareLink onClose={() => setShowShare(false)} />
      )}
    </>
  );
}

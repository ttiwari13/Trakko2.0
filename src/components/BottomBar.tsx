"use client";

import { useState } from "react";
import { Play, UserPlus, Share2 } from "lucide-react";
type ActiveBtn = "start" | "friend" | "share" | null;
export default function BottomBar() {
  const [active, setActive] = useState<ActiveBtn>(null);

  const base =
    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ease-out active:scale-95";

  const inactive =
    "bg-white text-black border border-gray-300 hover:bg-gray-100";

  const activeStyle =
    "bg-blue-600 text-white shadow-md";

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-4 z-50">
      {/* Start */}
      <button
        onClick={() => setActive("start")}
        className={`${base} ${
          active === "start" ? activeStyle : inactive
        }`}
      >
        <Play className="h-4 w-4" />
        Start
      </button>
      {/* Add Friend */}
      <button
        onClick={() => setActive("friend")}
        className={`${base} ${
          active === "friend" ? activeStyle : inactive
        }`}
      >
        <UserPlus className="h-4 w-4" />
        Add Friend
      </button>
      {/* Share */}
      <button
        onClick={() => setActive("share")}
        className={`${base} ${
          active === "share" ? activeStyle : inactive
        }`}
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

    </div>
  );
}

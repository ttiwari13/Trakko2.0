"use client";

import { Menu, Heart, Bookmark, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type SidebarProps = {
  user: { username: string } | null;
  onRequireLogin: () => void;
  onLogout: () => void;
};

export default function Sidebar({
  user,
  onRequireLogin,
  onLogout,
}: SidebarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstLetter = user?.username?.[0]?.toUpperCase();
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAvatarClick = () => {
    if (!user) {
      onRequireLogin();
    } else {
      setOpen((prev) => !prev);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setOpen(false);
    onLogout();
  };

  return (
    <aside className="relative z-[1000] w-16 bg-white border-r flex flex-col items-center py-4 gap-6">
      {/* Avatar */}
      <button
        onClick={handleAvatarClick}
        className="h-10 w-10 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center"
      >
        {firstLetter ?? "?"}
      </button>
      {open && user && (
        <div
          ref={dropdownRef}
          className="absolute left-16 top-4 w-48 bg-white shadow-lg rounded-md border z-[2000]"
        >
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            Signed in as <br />
            <span className="font-semibold">{user.username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}

      <Menu className="cursor-pointer" />
      <Bookmark className="cursor-pointer" />
      <Heart className="cursor-pointer" />
    </aside>
  );
}

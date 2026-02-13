"use client";

import { Menu, Heart, LogOut, User, MapPinned } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ViewType = "map" | "saved" | "favourites";

type SidebarProps = {
  user: { username: string } | null;
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
  onRequireLogin: () => void;
  onLogout: () => void;
};

export default function Sidebar({
  user,
  activeView,
  onChangeView,
  onRequireLogin,
  onLogout,
}: SidebarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstLetter = user?.username?.[0]?.toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    onLogout();
    setOpen(false);
  };

  return (
    <aside className="relative z-[1000] w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-8 shadow-sm">
    
      <div className="relative">
        <button
          onClick={handleAvatarClick}
          className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-200 ring-2 ring-blue-100"
          title={user ? `@${user.username}` : "Login"}
        >
          {firstLetter ?? <User size={20} />}
        </button>

        {open && user && (
          <div
            ref={dropdownRef}
            className="absolute left-20 top-0 w-56 bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden z-[2000] animate-in fade-in slide-in-from-left-2 duration-200"
          >
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Signed in as</p>
              <p className="font-semibold text-gray-900 text-base">
                @{user.username}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-red-50 text-red-600 font-medium transition-colors group"
            >
              <LogOut
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="w-8 h-px bg-gray-200"></div>
      <nav className="flex flex-col items-center gap-6">

        <button
          onClick={() => onChangeView("map")}
          className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
            activeView === "map"
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          }`}
          title="Map"
        >
          <Menu size={22} />
        </button>

        <button
          onClick={() => onChangeView("saved")}
          className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
            activeView === "saved"
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          }`}
          title="Saved Routes"
        >
          <MapPinned size={22} />
        </button>

        <button
          onClick={() => onChangeView("favourites")}
          className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
            activeView === "favourites"
              ? "bg-red-100 text-red-500"
              : "hover:bg-gray-100 text-gray-600 hover:text-red-500"
          }`}
          title="Favorites"
        >
          <Heart size={22} />
        </button>

      </nav>
    </aside>
  );
}

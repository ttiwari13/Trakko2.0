"use client";

import { Menu, Heart, Bookmark } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-16 bg-white border-r flex flex-col items-center py-4 gap-6">
      <Menu className="h-6 w-6 cursor-pointer" />
      <Bookmark className="h-6 w-6 cursor-pointer" />
      <Heart className="h-6 w-6 cursor-pointer" />
    </aside>
  );
}

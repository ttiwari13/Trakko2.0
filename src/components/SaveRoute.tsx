"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import type { PinData } from "@/app/page";

type Props = {
  routePoints: { lat: number; lng: number }[];
  pins?: PinData[];
  onSaveSuccess: () => void;
};

export default function SaveRoute({ routePoints, pins = [], onSaveSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a route title");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/routes/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          routePoints: routePoints,
          activityType: "walking",
          pins: pins, // Include pins in the save
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      alert("Route saved successfully!");
      setTitle("");
      onSaveSuccess();
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save route");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4">
      <input
        type="text"
        placeholder="Route name (e.g., Morning jog)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={saving}
      />
      <button
        onClick={handleSave}
        disabled={saving || !title.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Route"}
      </button>
    </div>
  );
}
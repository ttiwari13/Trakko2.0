"use client";

import { Play, UserPlus, Share2, Bookmark, StopCircle } from "lucide-react";
import { useState, useEffect } from "react";
import AddFriendModal from "./AddFriendModal";
import ShareLink from "./Sharelink";

type ActiveBtn = "start" | "friend" | "share" | "save" | "stop" | null;

type PinData = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
  pointIndex: number;
};

type BottomBarProps = {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onStart: () => void;
  onStop: () => void;
  routePoints: { lat: number; lng: number }[];
  pins?: PinData[];
  onSaveRoute?: () => void;
};

export default function BottomBar({
  isAuthenticated,
  onRequireAuth,
  onStart,
  onStop,
  routePoints,
  pins = [],
  onSaveRoute,
}: BottomBarProps) {
  const [active, setActive] = useState<ActiveBtn>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const base = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ease-out active:scale-95";
  const inactive = "bg-white text-black border border-gray-300 hover:bg-gray-100";
  const activeStyle = "bg-blue-600 text-white shadow-md";

  const handleStart = () => {
    if (!isAuthenticated) { onRequireAuth(); return; }
    setActive("start");
    onStart();
  };

  const handleStop = () => {
    setActive("stop");
    onStop();
  };

  const handleSaveClick = () => {
    if (!isAuthenticated) { onRequireAuth(); return; }
    if (routePoints.length === 0) {
      alert("No route to save! Start tracking first.");
      return;
    }
    setActive("save");
    setShowSaveModal(true);
  };

  const handleSaveRoute = async () => {
    if (!saveTitle.trim()) {
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
          title: saveTitle,
          routePoints,
          activityType: "walking",
          pins,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      alert("Route saved successfully!");
      setShowSaveModal(false);
      setSaveTitle("");
      setActive(null);
      if (onSaveRoute) onSaveRoute();
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save route");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchInviteCode = async () => {
      try {
        const res = await fetch("/api/path/create", {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (data.inviteCode) {
          setInviteLink(`${window.location.origin}/join/${data.inviteCode}`);
        }
      } catch (err) {
        console.error("Failed to fetch invite code:", err);
      }
    };
    fetchInviteCode();
  }, [isAuthenticated]);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-4">
        <button onClick={handleStart} className={`${base} ${active === "start" ? activeStyle : inactive}`}>
          <Play className="h-4 w-4" />
          Start
        </button>

        <button
          onClick={() => {
            if (!isAuthenticated) { onRequireAuth(); return; }
            setActive("friend");
            setShowAddFriend(true);
          }}
          className={`${base} ${active === "friend" ? activeStyle : inactive}`}
        >
          <UserPlus className="h-4 w-4" />
          Add
        </button>

        <button
          onClick={() => {
            if (!isAuthenticated) { onRequireAuth(); return; }
            setActive("share");
            setShowShare(true);
          }}
          className={`${base} ${active === "share" ? activeStyle : inactive}`}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <button onClick={handleSaveClick} className={`${base} ${active === "save" ? activeStyle : inactive}`}>
          <Bookmark className="h-4 w-4" />
          Save
        </button>

        <button onClick={handleStop} className={`${base} ${active === "stop" ? activeStyle : inactive}`}>
          <StopCircle className="h-4 w-4" />
          Stop
        </button>
      </div>

      {showAddFriend && (
        <AddFriendModal inviteLink={inviteLink} onClose={() => setShowAddFriend(false)} />
      )}

      {showShare && <ShareLink onClose={() => setShowShare(false)} />}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Save Route</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Route Name *</label>
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Morning jog, Evening walk..."
                disabled={saving}
                autoFocus
              />
            </div>

            <div className="mb-6 text-sm text-gray-600">
              <p>Points tracked: {routePoints.length}</p>
              {pins.length > 0 && <p>Memories: {pins.length}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowSaveModal(false); setSaveTitle(""); setActive(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoute}
                disabled={saving || !saveTitle.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
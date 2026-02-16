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
  onSaveRoute?: () => void; // Callback to switch to saved routes view
  onFavouriteRoute?: () => void; // Callback to switch to favourites view
};

export default function BottomBar({
  isAuthenticated,
  onRequireAuth,
  onStart,
  onStop,
  routePoints,
  pins = [],
  onSaveRoute,
  onFavouriteRoute,
}: BottomBarProps) {
  const [active, setActive] = useState<ActiveBtn>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [showFavouriteModal, setShowFavouriteModal] = useState(false);
  const [favouriteTitle, setFavouriteTitle] = useState("");
  const [favouriting, setFavouriting] = useState(false);

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

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (routePoints.length === 0) {
      alert("No route to save! Start tracking first.");
      return;
    }

    setActive("save");
    setShowSaveModal(true);
  };

  const handleFavouriteClick = () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (routePoints.length === 0) {
      alert("No route to favourite! Start tracking first.");
      return;
    }

    setActive("favourite");
    setShowFavouriteModal(true);
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
          routePoints: routePoints,
          activityType: "walking",
          pins: pins, // Include pins
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      alert("Route saved successfully!");
      setShowSaveModal(false);
      setSaveTitle("");
      setActive(null);
      
      // Optionally switch to saved routes view
      if (onSaveRoute) {
        onSaveRoute();
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save route");
    } finally {
      setSaving(false);
    }
  };

  const handleFavouriteRoute = async () => {
    if (!favouriteTitle.trim()) {
      alert("Please enter a route title");
      return;
    }

    setFavouriting(true);

    try {
      // Save route with isFavourite = true
      const res = await fetch("/api/routes/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: favouriteTitle,
          routePoints: routePoints,
          activityType: "walking",
          isFavourite: true, // Mark as favourite
          pins: pins, // Include pins
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      alert("Route saved to favourites!");
      setShowFavouriteModal(false);
      setFavouriteTitle("");
      setActive(null);
      
      // Switch to favourites view
      if (onFavouriteRoute) {
        onFavouriteRoute();
      }
    } catch (err: any) {
      console.error("Favourite error:", err);
      alert(err.message || "Failed to save route to favourites");
    } finally {
      setFavouriting(false);
    }
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
          onClick={handleSaveClick}
          className={`${base} ${active === "save" ? activeStyle : inactive}`}
        >
          <Bookmark className="h-4 w-4" />
          Save
        </button>

        {/* FAVOURITE */}
        <button
          onClick={handleFavouriteClick}
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

      {/* Save Route Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Save Route</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Route Name *
              </label>
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
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveTitle("");
                  setActive(null);
                }}
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

      {/* Favourite Route Modal */}
      {showFavouriteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Heart className="h-6 w-6 text-red-600 fill-red-600" />
              </div>
              <h3 className="text-2xl font-bold">Add to Favourites</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Route Name *
              </label>
              <input
                type="text"
                value={favouriteTitle}
                onChange={(e) => setFavouriteTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Favourite morning route..."
                disabled={favouriting}
                autoFocus
              />
            </div>

            <div className="mb-6 text-sm text-gray-600">
              <p>Points tracked: {routePoints.length}</p>
              {pins.length > 0 && <p>Memories: {pins.length}</p>}
              <p className="text-red-600 mt-1">✨ This route will be marked as favourite</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFavouriteModal(false);
                  setFavouriteTitle("");
                  setActive(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={favouriting}
              >
                Cancel
              </button>
              <button
                onClick={handleFavouriteRoute}
                disabled={favouriting || !favouriteTitle.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {favouriting ? (
                  "Saving..."
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Save to Favourites
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
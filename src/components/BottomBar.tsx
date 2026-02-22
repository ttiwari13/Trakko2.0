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
  onClearRoute?: () => void;
};

const BUTTONS = [
  { key: "start",  label: "Start",  angle: 180, Icon: Play },
  { key: "friend", label: "Add",    angle: 202, Icon: UserPlus },
  { key: "share",  label: "Share",  angle: 225, Icon: Share2 },
  { key: "save",   label: "Save",   angle: 248, Icon: Bookmark },
  { key: "stop",   label: "Stop",   angle: 270, Icon: StopCircle },
] as const;

const RADIUS = 110;

function toXY(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

export default function BottomBar({
  isAuthenticated,
  onRequireAuth,
  onStart,
  onStop,
  routePoints,
  pins = [],
  onSaveRoute,
   onClearRoute, 
}: BottomBarProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ActiveBtn>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAction = (key: typeof BUTTONS[number]["key"]) => {
    setActive(key as ActiveBtn);
    setOpen(false);
    if (key === "start") {
      if (!isAuthenticated) { onRequireAuth(); return; }
      onStart();
    } else if (key === "stop") {
      onStop();
    } else if (key === "friend") {
      if (!isAuthenticated) { onRequireAuth(); return; }
      setShowAddFriend(true);
    } else if (key === "share") {
      if (!isAuthenticated) { onRequireAuth(); return; }
      setShowShare(true);
    } else if (key === "save") {
      if (!isAuthenticated) { onRequireAuth(); return; }
      if (routePoints.length === 0) { alert("No route to save! Start tracking first."); return; }
      setShowSaveModal(true);
    }
  };

  const handleSaveRoute = async () => {
    if (!saveTitle.trim()) { alert("Please enter a route title"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/routes/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: saveTitle, routePoints, activityType: "walking", pins }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      alert("Route saved successfully!");
      setShowSaveModal(false);
      setSaveTitle("");
      setActive(null);
      if (onSaveRoute) onSaveRoute();
      if (onClearRoute) onClearRoute(); 
    } catch (err: any) {
      alert(err.message || "Failed to save route");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchInviteCode = async () => {
      try {
        const res = await fetch("/api/path/create", { method: "POST", credentials: "include" });
        const data = await res.json();
        if (data.inviteCode) setInviteLink(`${window.location.origin}/join/${data.inviteCode}`);
      } catch {}
    };
    fetchInviteCode();
  }, [isAuthenticated]);

  // FAB size
  const FAB = 56;

  return (
    <>

      <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 px-4 py-2.5">
        {BUTTONS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => handleAction(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
              ${active === key
                ? "bg-black text-white shadow-md"
                : "bg-white text-black border border-gray-200 hover:bg-gray-50 shadow-sm"
              }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <div
        className="sm:hidden"
        style={{ position: "relative", width: FAB, height: FAB }}
      >
        {/* Dimmed backdrop when open */}
        {open && (
          <div
            className="fixed inset-0 z-10 bg-black/10 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Radial action buttons */}
        {BUTTONS.map(({ key, label, Icon }, i) => {
          const { x, y } = toXY(BUTTONS[i].angle, RADIUS);
          // FAB center is at (FAB/2, FAB/2)
          const cx = FAB / 2;
          const cy = FAB / 2;
          return (
            <div
              key={key}
              style={{
                position: "absolute",
                left: cx + (open ? x : 0),
                top:  cy + (open ? y : 0),
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: [
                  `left 280ms cubic-bezier(0.34,1.56,0.64,1) ${i * 35}ms`,
                  `top  280ms cubic-bezier(0.34,1.56,0.64,1) ${i * 35}ms`,
                  `opacity 180ms ease ${open ? i * 35 : 0}ms`,
                ].join(", "),
              }}
            >
              <button
                onClick={() => handleAction(key)}
                className={`w-12 h-12 rounded-full shadow-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all duration-150 active:scale-90
                  ${active === key
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-100"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[8px] font-bold leading-none tracking-wide uppercase">
                  {label}
                </span>
              </button>
            </div>
          );
        })}

        {/* FAB — + becomes × when open */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close controls" : "Open controls"}
          style={{ position: "absolute", left: 0, top: 0, zIndex: 30 }}
          className="w-14 h-14 rounded-full bg-black text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform duration-150"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            viewBox="0 0 24 24"
            style={{
              transform: open ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 250ms cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="4"  y1="12" x2="20" y2="12" />
          </svg>
        </button>
      </div>

      {showAddFriend && (
        <AddFriendModal inviteLink={inviteLink} onClose={() => setShowAddFriend(false)} />
      )}
      {showShare && <ShareLink onClose={() => setShowShare(false)} />}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Save Route</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Route Name *</label>
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., Morning jog, Evening walk..."
                disabled={saving}
                autoFocus
              />
            </div>
            <div className="mb-6 text-sm text-gray-500">
              <p>Points tracked: {routePoints.length}</p>
              {pins.length > 0 && <p>Memories: {pins.length}</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSaveModal(false); setSaveTitle(""); setActive(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoute}
                disabled={saving || !saveTitle.trim()}
                className="flex-1 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition disabled:opacity-40 text-sm font-medium"
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
"use client";

import { X, Copy, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  onClose: () => void;
};

export default function ShareLink({ onClose }: Props) {
  const [shareLink, setShareLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `${window.location.origin}/share?lat=${latitude}&lng=${longitude}`;
        setShareLink(link);
      },
      () => {
        setError("Location permission denied");
      }
    );
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    alert("Location link copied");
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share live location</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!error && !shareLink && (
          <p className="text-sm text-gray-600">Fetching location…</p>
        )}

        {shareLink && (
          <>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm truncate flex-1">{shareLink}</span>
              <button onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Anyone with this link can see your current location.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

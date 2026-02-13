"use client";

import { useEffect, useState } from "react";

type LatLng = {
  lat: number;
  lng: number;
};

type SavedRouteType = {
  id: string;
  name: string;
  date: string;
  points: LatLng[];
};

type Props = {
  routePoints: LatLng[];
};

export default function SaveRoute({ routePoints }: Props) {
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteType[]>([]);
  const [routeName, setRouteName] = useState("");

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("trakko_saved_routes");
    if (stored) {
      setSavedRoutes(JSON.parse(stored));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "trakko_saved_routes",
      JSON.stringify(savedRoutes)
    );
  }, [savedRoutes]);

  const handleSaveRoute = () => {
    if (!routePoints || routePoints.length === 0) {
      alert("No route to save!");
      return;
    }

    if (!routeName.trim()) {
      alert("Please enter a route name.");
      return;
    }

    const newRoute: SavedRouteType = {
      id: crypto.randomUUID(),
      name: routeName,
      date: new Date().toLocaleString(),
      points: routePoints,
    };

    setSavedRoutes((prev) => [...prev, newRoute]);
    setRouteName("");
  };

  const handleDelete = (id: string) => {
    setSavedRoutes((prev) =>
      prev.filter((route) => route.id !== id)
    );
  };

  return (
    <div className="p-10 h-full overflow-y-auto bg-black text-white">
      <h2 className="text-3xl font-bold mb-6">Saved Routes</h2>

      {/* Save Section */}
      <div className="bg-neutral-900 p-6 rounded-xl mb-8">
        <h3 className="text-lg mb-4">Save Current Route</h3>

        <input
          type="text"
          placeholder="Enter route name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-neutral-800 text-white outline-none"
        />

        <button
          onClick={handleSaveRoute}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
        >
          Save Route
        </button>
      </div>

      {/* Saved Routes List */}
      <div className="space-y-4">
        {savedRoutes.length === 0 && (
          <p className="text-neutral-400">
            No routes saved yet.
          </p>
        )}

        {savedRoutes.map((route) => (
          <div
            key={route.id}
            className="bg-neutral-900 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <h4 className="text-lg font-semibold">
                {route.name}
              </h4>
              <p className="text-sm text-neutral-400">
                {route.date}
              </p>
              <p className="text-sm text-neutral-500">
                {route.points.length} points
              </p>
            </div>

            <button
              onClick={() => handleDelete(route.id)}
              className="text-red-400 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

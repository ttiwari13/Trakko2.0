"use client";

import { useEffect, useState } from "react";
import { Trash2, Calendar, X, Eye, Heart, Route } from "lucide-react";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/MapClient"), { ssr: false });

type LatLng = { lat: number; lng: number };

type RouteNote = {
  id: string;
  pathRouteId: string;
  userId: string;
  pointIndex: number;
  noteText: string | null;
  photoUrl: string | null;
  createdAt: string;
};

type PinData = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
  pointIndex: number;
};

type SavedRoute = {
  id: string;
  title: string;
  createdAt: string;
  distance: number;
  duration: number;
  activityType: string;
  routePoints: LatLng[];
  isFavourite: boolean;
  notes?: RouteNote[];
  pins?: PinData[];
};

type Props = { refreshTrigger?: number };

export default function FavouriteRoutes({ refreshTrigger }: Props) {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingRoute, setViewingRoute] = useState<SavedRoute | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/routes/favourites", { credentials: "include" });
      const data = await res.json();
      const transformedRoutes = (data.data || []).map((route: any) => {
        let routePoints = [];
        let pins = [];
        try {
          if (typeof route.encodedPolyline === "string") routePoints = JSON.parse(route.encodedPolyline);
          else if (Array.isArray(route.encodedPolyline)) routePoints = route.encodedPolyline;
          else if (route.routePoints) routePoints = route.routePoints;
          if (route.pins) {
            if (typeof route.pins === "string") pins = JSON.parse(route.pins);
            else if (Array.isArray(route.pins)) pins = route.pins;
          }
        } catch { routePoints = []; pins = []; }

        return {
          id: route.id,
          title: route.title,
          createdAt: route.createdAt,
          distance: route.distance,
          duration: route.duration,
          activityType: route.activityType,
          routePoints,
          isFavourite: route.isFavourite,
          notes: route.notes || [],
          pins,
        };
      });
      setRoutes(transformedRoutes);
    } catch { setError("Failed to load favourite routes"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchFavourites(); }, []);
  useEffect(() => { if (refreshTrigger && refreshTrigger > 0) fetchFavourites(); }, [refreshTrigger]);
  const handleToggleFavourite = async (routeId: string) => {
    setToggling(routeId);
    try {
      const res = await fetch(`/api/routes/${routeId}/favourite`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error();
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    } catch { alert("Failed to update favourite status"); }
    finally { setToggling(null); }
  };
  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Delete this route?")) return;
    try {
      const res = await fetch(`/api/routes/${routeId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    } catch { alert("Failed to delete route"); }
  };
  const fmt = {
    distance: (m: number) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(2)}km`,
    duration: (s: number) => {
      const m = Math.floor(s / 60);
      if (m < 60) return `${m}m`;
      return `${Math.floor(m / 60)}h ${m % 60}m`;
    },
    date: (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
  if (loading) return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading favourites</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 md:px-10">
          <div className="max-w-5xl mx-auto flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Favourites</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {routes.length === 0
                  ? "No favourites yet"
                  : `${routes.length} route${routes.length !== 1 ? "s" : ""} favourited`}
              </p>
            </div>
            <Heart size={18} className="text-red-400 fill-red-400 mb-1" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-10 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Route className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">No favourites yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Tap the heart on any saved route to add it here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {routes.map((route, idx) => (
                <div
                  key={route.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
                >
                  {/* Red accent bar for favourites */}
                  <div className="h-1 bg-red-400 w-full" />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 flex-1">
                        {route.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleFavourite(route.id)}
                          disabled={toggling === route.id}
                          title="Remove from favourites"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Heart size={15} className="fill-red-400 text-red-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          title="Delete route"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Distance</p>
                        <p className="text-sm font-bold text-gray-900">{fmt.distance(route.distance)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Duration</p>
                        <p className="text-sm font-bold text-gray-900">{fmt.duration(route.duration)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Activity</p>
                        <p className="text-sm font-bold text-gray-900 capitalize">{route.activityType || "walking"}</p>
                      </div>
                      {route.pins && route.pins.length > 0 && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Memories</p>
                          <p className="text-sm font-bold text-gray-900">{route.pins.length} pin{route.pins.length !== 1 ? "s" : ""}</p>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                      <Calendar size={11} />
                      <span>{fmt.date(route.createdAt)} at {fmt.time(route.createdAt)}</span>
                    </div>

                    {/* View button */}
                    <button
                      onClick={() => setViewingRoute(route)}
                      className="mt-auto w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
                    >
                      <Eye size={15} />
                      View on Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Route Map Modal ── */}
      {viewingRoute && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="min-w-0 flex items-center gap-3">
                <Heart size={16} className="fill-red-400 text-red-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate">{viewingRoute.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmt.distance(viewingRoute.distance)} &middot; {fmt.duration(viewingRoute.duration)} &middot; {viewingRoute.routePoints.length} points
                    {viewingRoute.pins && viewingRoute.pins.length > 0 && ` · ${viewingRoute.pins.length} memories`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingRoute(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors shrink-0 ml-4"
              >
                <X size={18} />
              </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative min-h-0">
              <MapClient
                currentLocation={viewingRoute.routePoints[viewingRoute.routePoints.length - 1]}
                routePoints={viewingRoute.routePoints}
                pins={viewingRoute.pins || []}
              />
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={12} />
                <span>{fmt.date(viewingRoute.createdAt)} at {fmt.time(viewingRoute.createdAt)}</span>
              </div>
              <button
                onClick={() => setViewingRoute(null)}
                className="px-5 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Activity, Trash2, Calendar, X, Eye, Heart } from "lucide-react";
import dynamic from "next/dynamic";
import PinModal, { PinFormData } from "@/components/PinModal";

const MapClient = dynamic(
  () => import("@/components/MapClient"),
  { ssr: false }
);

type LatLng = {
  lat: number;
  lng: number;
};

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
  isFavourite?: boolean;
  notes?: RouteNote[];
  pins?: PinData[];
};

type Props = {
  refreshTrigger?: number;
};

export default function ShowSavedRoute({ refreshTrigger }: Props) {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingRoute, setViewingRoute] = useState<SavedRoute | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [viewingPin, setViewingPin] = useState<PinData | null>(null); // NEW STATE

  const fetchRoutes = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/routes", {
        credentials: "include",
      });
      const data = await res.json();
      const transformedRoutes = (data.data || data.routes || data || []).map((route: any) => {
        let routePoints = [];
        let pins = [];
        try {
          if (typeof route.encodedPolyline === 'string') {
            routePoints = JSON.parse(route.encodedPolyline);
          } else if (Array.isArray(route.encodedPolyline)) {
            routePoints = route.encodedPolyline;
           
          } else if (route.routePoints) {
            routePoints = route.routePoints;
            
          }
          console.log("Checking for pins...");
          if (route.pins !== undefined && route.pins !== null) {
            console.log("Found pins field, type:", typeof route.pins);
            
            if (typeof route.pins === 'string') {
              try {
                pins = JSON.parse(route.pins);
              } catch (e) {
                console.error("Failed to parse pins string:", e);
                console.log("Raw pins value:", route.pins);
              }
            } else if (Array.isArray(route.pins)) {
              pins = route.pins;
            } else {
              console.warn("Unknown pins format:", typeof route.pins, route.pins);
            }
          } else {
            console.log("No pins field found in route object");
            console.log("All route fields:", Object.keys(route));
          }
        } catch (parseErr) {
          routePoints = [];
          pins = [];
        }

        const transformedRoute = {
          id: route.id,
          title: route.title,
          createdAt: route.createdAt,
          distance: route.distance,
          duration: route.duration,
          activityType: route.activityType,
          routePoints: routePoints,
          isFavourite: route.isFavourite || false,
          notes: route.notes || [],
          pins: pins,
        };
        
        console.log("Transformed route:", {
          id: transformedRoute.id,
          title: transformedRoute.title,
          points: transformedRoute.routePoints.length,
          pins: transformedRoute.pins.length
        });

        return transformedRoute;
      });
      setRoutes(transformedRoutes);
    } catch (err) {
      setError("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchRoutes();
    }
  }, [refreshTrigger]);

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Delete this route?")) return;

    try {
      const res = await fetch(`/api/routes/${routeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
      alert("Route deleted!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete route");
    }
  };

  const handleToggleFavourite = async (routeId: string, currentStatus: boolean) => {
    setToggling(routeId);
    try {
      const res = await fetch(`/api/routes/${routeId}/favourite`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle favourite");
      }
      const data = await res.json();
      setRoutes((prev) =>
        prev.map((route) =>
          route.id === routeId
            ? { ...route, isFavourite: data.isFavourite }
            : route
        )
      );
      alert(data.isFavourite ? "Added to favourites!" : "Removed from favourites!");
    } catch (err) {
      console.error("Toggle favourite error:", err);
      alert("Failed to update favourite status");
    } finally {
      setToggling(null);
    }
  };

  const handleViewRoute = (route: SavedRoute) => {
    setViewingRoute(route);
  };
  const handlePinClick = (pin: PinData) => {
    
    setViewingPin(pin);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved routes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Saved Routes</h2>
            <p className="text-gray-600">
              {routes.length === 0
                ? "No saved routes yet. Start tracking to save your first route!"
                : `${routes.length} route${routes.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-700">
              {error}
            </div>
          )}

          {routes.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <MapPin className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No saved routes yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start tracking a route on the map, then save it to view here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gray-900 pr-2 line-clamp-2">
                      {route.title}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleFavourite(route.id, route.isFavourite || false)}
                        disabled={toggling === route.id}
                        className={`hover:bg-red-50 p-2 rounded-lg transition flex-shrink-0 ${
                          route.isFavourite
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        title={route.isFavourite ? "Remove from favourites" : "Add to favourites"}
                      >
                        <Heart
                          size={18}
                          className={route.isFavourite ? "fill-red-500" : ""}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteRoute(route.id)}
                        className="text-gray-400 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition flex-shrink-0"
                        title="Delete route"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="font-semibold">{formatDistance(route.distance)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold">{formatDuration(route.duration)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Activity</p>
                        <p className="font-semibold capitalize">{route.activityType}</p>
                      </div>
                    </div>

                    {route.pins && route.pins.length > 0 && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Memories</p>
                          <p className="font-semibold">{route.pins.length} pin{route.pins.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewRoute(route)}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 mb-3"
                  >
                    <Eye size={18} />
                    View Route on Map
                  </button>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} />
                      <span>{formatDate(route.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {viewingRoute && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{viewingRoute.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDistance(viewingRoute.distance)} • {formatDuration(viewingRoute.duration)} • {viewingRoute.routePoints.length} points
                  {viewingRoute.pins && viewingRoute.pins.length > 0 && ` • ${viewingRoute.pins.length} memories`}
                </p>
              </div>
              <button
  onClick={() => { setViewingRoute(null); setViewingPin(null); }}
  className="p-2 hover:bg-gray-100 rounded-lg transition"
>
  <X size={24} />
</button>
            </div>
            <div className="flex-1 relative">
              <MapClient
                currentLocation={viewingRoute.routePoints[viewingRoute.routePoints.length - 1]}
                routePoints={viewingRoute.routePoints}
                pins={viewingRoute.pins || []}
                onPinClick={handlePinClick}
              />
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{formatDate(viewingRoute.createdAt)}</span>
                </div>
                <button
  onClick={() => { setViewingRoute(null); setViewingPin(null); }}
  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
>
  Close
</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {viewingPin && (
  <div className="z-[10000]"> 
    <PinModal
      lat={viewingPin.lat}
      lng={viewingPin.lng}
      title={viewingPin.title}
      description={viewingPin.description}
      image={viewingPin.image}
      readOnly={true}
      onChange={() => {}} 
      onClose={() => setViewingPin(null)}
      onSave={() => {}} 
    />
  </div>
)}
    </>
  );
}
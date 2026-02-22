import { useEffect, useRef, useState, useCallback } from "react";

type LocationPoint = {
  lat: number;
  lng: number;
  timestamp: number;
};

const STORAGE_KEY = "trakko_route_buffer";
const SESSION_KEY = "trakko_tracking_active";

// Load buffered points from localStorage
function loadBuffer(): LocationPoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save points to localStorage
function saveBuffer(points: LocationPoint[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch {
    // Storage full — trim oldest 20% and retry
    const trimmed = points.slice(Math.floor(points.length * 0.2));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch {}
  }
}

// Clear buffer after successful save
function clearBuffer() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function useLiveLocation() {
  // Restore any buffered points from a previous session
  const [routePoints, setRoutePoints] = useState<LocationPoint[]>(() => loadBuffer());
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(() => {
    // Restore tracking state if page was refreshed mid-track
    try { return localStorage.getItem(SESSION_KEY) === "true"; } catch { return false; }
  });
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const watchIdRef = useRef<number | null>(null);
  // Keep a ref to routePoints so the watchPosition callback always sees latest value
  const routePointsRef = useRef<LocationPoint[]>(routePoints);

  useEffect(() => {
    routePointsRef.current = routePoints;
  }, [routePoints]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // If tracking was active before a refresh, restart the watcher automatically
  useEffect(() => {
    if (isTracking && watchIdRef.current === null) {
      startWatcher();
    }
  }, []); // run once on mount

  const startWatcher = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    if (watchIdRef.current !== null) return; // already watching

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: LocationPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setCurrentLocation(newPoint);
        setRoutePoints((prev) => {
          const updated = [...prev, newPoint];
          // Persist every new point immediately — works offline too
          saveBuffer(updated);
          return updated;
        });
      },
      (error) => {
        console.error("GPS Error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    watchIdRef.current = id;
  }, []);

  const start = useCallback(() => {
    if (isTracking) return;
    // Don't wipe existing buffer — resume from where we left off
    startWatcher();
    setIsTracking(true);
    try { localStorage.setItem(SESSION_KEY, "true"); } catch {}
  }, [isTracking, startWatcher]);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    try { localStorage.setItem(SESSION_KEY, "false"); } catch {}
    // Buffer is intentionally kept — user still needs to save the route
  }, []);

  // Call this after the route has been successfully saved to clear local buffer
  const clearRoute = useCallback(() => {
    setRoutePoints([]);
    setCurrentLocation(null);
    clearBuffer();
  }, []);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    currentLocation,
    routePoints,
    isTracking,
    isOnline,       // use this to show offline banner in UI
    start,
    stop,
    clearRoute,     // call this after saving to wipe the buffer
  };
}
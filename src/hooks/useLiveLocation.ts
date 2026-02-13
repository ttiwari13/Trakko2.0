import { useEffect, useRef, useState } from "react";

type LocationPoint = {
  lat: number;
  lng: number;
  timestamp: number;
};

export function useLiveLocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [routePoints, setRoutePoints] = useState<LocationPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  const start = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    if (isTracking) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: LocationPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setCurrentLocation(newPoint);
        setRoutePoints((prev) => [...prev, newPoint]);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Unable to retrieve your location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    watchIdRef.current = id;
    setIsTracking(true);
  };

  const stop = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
  };

 
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
    start,
    stop,
  };
}

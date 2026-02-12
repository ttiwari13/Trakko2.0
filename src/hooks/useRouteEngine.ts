"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type LatLng = {
  lat: number;
  lng: number;
};

type Options = {
  route: LatLng[];
  interval?: number; // milliseconds between steps
};

export function useRouteEngine({ route, interval = 1000 }: Options) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);

  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Start Simulation ---
  const start = useCallback(() => {
    if (isRunning) return;
    if (!route || route.length === 0) return;

    setIsRunning(true);

    timerRef.current = setInterval(() => {
      if (indexRef.current >= route.length) {
        stop();
        return;
      }

      const nextPoint = route[indexRef.current];

      setCurrentLocation(nextPoint);
      setRoutePoints((prev) => [...prev, nextPoint]);

      indexRef.current += 1;
    }, interval);
  }, [isRunning, route, interval]);

  // --- Pause ---
  const pause = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // --- Stop (stop but keep drawn route) ---
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // --- Reset (clear everything completely) ---
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
    setCurrentLocation(null);
    setRoutePoints([]);
    indexRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    currentLocation,
    routePoints,
    start,
    pause,
    stop,
    reset,
  };
}

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


type LocationPoint = {
  lat: number;
  lng: number;
  timestamp: number;
};

type Props = {
  currentLocation: LocationPoint | null;
  routePoints: LocationPoint[];
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapClient({
  currentLocation,
  routePoints,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize map ONCE
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      center: [28.6139, 77.2090], // fallback center (Delhi)
      zoom: 15,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    const { lat, lng } = currentLocation;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    // Smooth auto-center
    mapRef.current.setView([lat, lng]);
  }, [currentLocation]);

  // Draw route polyline
  useEffect(() => {
    if (!mapRef.current) return;

    const latLngs = routePoints.map((p) => [p.lat, p.lng]) as L.LatLngExpression[];

    if (!polylineRef.current) {
      polylineRef.current = L.polyline(latLngs, {
        color: "blue",
        weight: 4,
      }).addTo(mapRef.current);
    } else {
      polylineRef.current.setLatLngs(latLngs);
    }
  }, [routePoints]);

  return <div id="map" className="h-full w-full" />;
}

"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from "react-leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LatLng = {
  lat: number;
  lng: number;
};

type MapProps = {
  currentLocation: LatLng | null;
  routePoints: LatLng[];
};

export default function MapClient({
  currentLocation,
  routePoints,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (mapRef.current && currentLocation) {
      mapRef.current.setView(
        [currentLocation.lat, currentLocation.lng],
        mapRef.current.getZoom(),
        { animate: false }
      );
    }
  }, [currentLocation]);

  return (
    <MapContainer
      center={[28.6139, 77.2090]}
      zoom={16}
      className="h-full w-full"
      ref={mapRef}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {routePoints.length > 0 && (
        <Polyline
          positions={routePoints.map((p) => [p.lat, p.lng])}
        />
      )}

      {currentLocation && (
        <Marker
          position={[currentLocation.lat, currentLocation.lng]}
        />
      )}
    </MapContainer>
  );
}

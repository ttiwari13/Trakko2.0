"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
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

type MapProps = {
  userLocation: {
    lat: number;
    lng: number;
  } | null;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 16, {
      animate: true,
      duration: 1.5,
    });
  }, [lat, lng, map]);

  return null;
}

export default function Map({ userLocation }: MapProps) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} />
          <RecenterMap
            lat={userLocation.lat}
            lng={userLocation.lng}
          />
        </>
      )}
    </MapContainer>
  );
}

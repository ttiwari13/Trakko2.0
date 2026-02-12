"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PinModal, { PinFormData } from "./PinModal";

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

type Pin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
};

type PreviewPin = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
};

function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapClient({
  currentLocation,
  routePoints,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  const [pins, setPins] = useState<Pin[]>([]);
  const [previewPin, setPreviewPin] = useState<PreviewPin | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
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
    <>
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={16}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapClickHandler
          onClick={(lat, lng) => {
            setPreviewPin({
              lat,
              lng,
              title: "",
              description: "",
              image: undefined,
            });
          }}
        />

        {/* Route */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng])}
          />
        )}

        {/* Moving Marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
          />
        )}

        {/* Preview Pin */}
        {previewPin && (
          <Marker position={[previewPin.lat, previewPin.lng]}>
            {previewPin.title && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -5]}
              >
                {previewPin.title}
              </Tooltip>
            )}
          </Marker>
        )}

        {/* Saved Pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            eventHandlers={{
              click: () => setSelectedPin(pin),
            }}
          >
            {pin.title && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -5]}
              >
                {pin.title}
              </Tooltip>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* Create Modal */}
      {previewPin && (
        <PinModal
          lat={previewPin.lat}
          lng={previewPin.lng}
          title={previewPin.title}
          description={previewPin.description}
          image={previewPin.image}
          onChange={(data: PinFormData) =>
            setPreviewPin((prev) =>
              prev ? { ...prev, ...data } : null
            )
          }
          onClose={() => setPreviewPin(null)}
          onSave={() => {
            if (!previewPin.title.trim()) return;

            setPins((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                ...previewPin,
              },
            ]);

            setPreviewPin(null);
          }}
        />
      )}

      {/* View Modal */}
      {selectedPin && (
        <PinModal
          lat={selectedPin.lat}
          lng={selectedPin.lng}
          title={selectedPin.title}
          description={selectedPin.description}
          image={selectedPin.image}
          readOnly
          onChange={() => {}}
          onClose={() => setSelectedPin(null)}
          onSave={() => {}}
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PinModal, { type PinFormData } from "./PinModal";
import type { PinData } from "@/app/page";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pinIcon = new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3" fill="white" stroke="#ef4444"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: "",
});

type Props = {
  currentLocation: { lat: number; lng: number } | null;
  routePoints: { lat: number; lng: number }[];
  pins?: PinData[];
  onPinsChange?: (pins: PinData[]) => void;
  onPinClick?: (pin: PinData) => void;
};

// ✅ Safely captures the map instance after it's fully initialized
function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

function MapUpdater({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (e: L.LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function MapClient({
  currentLocation,
  routePoints,
  pins = [],
  onPinsChange,
  onPinClick,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  const defaultCenter = { lat: 28.6139, lng: 77.209 };
  const center = currentLocation || defaultCenter;

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!onPinsChange) return;
    const { lat, lng } = e.latlng;
    const pointIndex = routePoints.length;
    setSelectedPin({ lat, lng, title: "", description: "", pointIndex });
    setEditingIndex(null);
    setReadOnly(false);
    setShowPinModal(true);
  };

  const handlePinClick = (pin: PinData, index: number) => {
    if (onPinClick) {
      onPinClick(pin);
      return;
    }
    setSelectedPin(pin);
    setEditingIndex(index);
    setReadOnly(!onPinsChange);
    setShowPinModal(true);
  };

  const handlePinChange = (data: PinFormData) => {
    if (selectedPin) {
      setSelectedPin({ ...selectedPin, ...data });
    }
  };

  const handleSavePin = () => {
    if (!selectedPin || !onPinsChange) return;
    if (!selectedPin.title.trim()) {
      alert("Please enter a title for the pin");
      return;
    }
    if (editingIndex !== null) {
      const newPins = [...pins];
      newPins[editingIndex] = selectedPin;
      onPinsChange(newPins);
    } else {
      onPinsChange([...pins, selectedPin]);
    }
    setShowPinModal(false);
    setSelectedPin(null);
    setEditingIndex(null);
  };

  const handleEdit = () => {
    setReadOnly(false);
  };

  const handleDeletePin = () => {
    if (!onPinsChange || editingIndex === null) return;
    if (!confirm("Delete this pin?")) return;
    const newPins = pins.filter((_, i) => i !== editingIndex);
    onPinsChange(newPins);
    setShowPinModal(false);
    setSelectedPin(null);
    setEditingIndex(null);
  };

  // ✅ Uses mapRef safely — only runs after MapRefSetter has populated it
  useEffect(() => {
    if (mapRef.current && routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints.map((p) => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routePoints]);

  return (
    <>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        // ✅ No ref prop here — react-leaflet v4 doesn't support it reliably
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ✅ This safely captures the map instance after mount */}
        <MapRefSetter mapRef={mapRef} />
        <MapUpdater center={currentLocation} />
        {onPinsChange && <MapClickHandler onMapClick={handleMapClick} />}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng])}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}

        {pins.map((pin, index) => (
          <Marker
            key={index}
            position={[pin.lat, pin.lng]}
            icon={pinIcon}
            eventHandlers={{
              click: () => handlePinClick(pin, index),
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>{pin.title}</strong>
                {pin.description && <p className="text-sm">{pin.description}</p>}
                {pin.image && (
                  <img
                    src={pin.image}
                    alt={pin.title}
                    className="w-32 h-32 object-cover mt-2 rounded"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showPinModal && selectedPin && !onPinClick && (
        <PinModal
          lat={selectedPin.lat}
          lng={selectedPin.lng}
          title={selectedPin.title}
          description={selectedPin.description}
          image={selectedPin.image}
          readOnly={readOnly}
          onChange={handlePinChange}
          onClose={() => {
            setShowPinModal(false);
            setSelectedPin(null);
            setEditingIndex(null);
          }}
          onSave={handleSavePin}
          onEdit={onPinsChange ? handleEdit : undefined}
          onDelete={onPinsChange && editingIndex !== null ? handleDeletePin : undefined}
        />
      )}
    </>
  );
}
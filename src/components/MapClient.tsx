"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PinModal, { PinFormData } from "./PinModal";

export type LocationPoint = {
  lat: number;
  lng: number;
};

type Memory = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
};

interface MapClientProps {
  currentLocation: LocationPoint | null;
  routePoints: LocationPoint[];
}
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapClient({
  currentLocation,
  routePoints,
}: MapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const memoryLayerRef = useRef<L.LayerGroup | null>(null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [clickedPosition, setClickedPosition] =
    useState<LocationPoint | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState<PinFormData>({
    title: "",
    description: "",
    image: undefined,
  });
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    memoryLayerRef.current = L.layerGroup().addTo(map);

    map.on("click", (e) => {
      setClickedPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
      setFormData({ title: "", description: "", image: undefined });
      setShowCreateModal(true);
    });

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const marker = L.marker([currentLocation.lat, currentLocation.lng])
      .addTo(mapRef.current)
      .bindPopup("You are here");

    userMarkerRef.current = marker;

    mapRef.current.setView([currentLocation.lat, currentLocation.lng], 15);
  }, [currentLocation]);
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    if (routePoints.length === 0) return;

    const latlngs = routePoints.map((p) => [p.lat, p.lng]) as [
      number,
      number
    ][];

    const polyline = L.polyline(latlngs, {
      color: "blue",
      weight: 5,
    }).addTo(mapRef.current);

    routeRef.current = polyline;
  }, [routePoints]);
  useEffect(() => {
    if (!memoryLayerRef.current) return;

    memoryLayerRef.current.clearLayers();

    memories.forEach((memory) => {
      const marker = L.marker([memory.lat, memory.lng]).addTo(
        memoryLayerRef.current!
      );

      marker.bindTooltip(memory.title, {
        permanent: true,
        direction: "top",
      });

      marker.on("click", () => {
        setSelectedMemory(memory);
      });
    });
  }, [memories]);

  const handleCreateMemory = () => {
    if (!clickedPosition) return;

    const newMemory: Memory = {
      id: Date.now().toString(),
      lat: clickedPosition.lat,
      lng: clickedPosition.lng,
      ...formData,
    };

    setMemories((prev) => [...prev, newMemory]);
    setShowCreateModal(false);
    setClickedPosition(null);
  };
  const handleEditMemory = () => {
    if (!editingMemory) return;

    setMemories((prev) =>
      prev.map((m) =>
        m.id === editingMemory.id ? { ...m, ...formData } : m
      )
    );

    setEditingMemory(null);
  };
  const startEditing = (memory: Memory) => {
    setFormData({
      title: memory.title,
      description: memory.description,
      image: memory.image,
    });
    setEditingMemory(memory);
    setSelectedMemory(null);
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {showCreateModal && clickedPosition && (
        <PinModal
          lat={clickedPosition.lat}
          lng={clickedPosition.lng}
          title={formData.title}
          description={formData.description}
          image={formData.image}
          readOnly={false}
          onChange={setFormData}
          onClose={() => {
            setShowCreateModal(false);
            setClickedPosition(null);
          }}
          onSave={handleCreateMemory}
        />
      )}
      {selectedMemory && !editingMemory && (
        <PinModal
          lat={selectedMemory.lat}
          lng={selectedMemory.lng}
          title={selectedMemory.title}
          description={selectedMemory.description}
          image={selectedMemory.image}
          readOnly={true}
          onChange={() => {}}
          onClose={() => setSelectedMemory(null)}
          onSave={() => {}}
          onEdit={() => startEditing(selectedMemory)}
        />
      )}
      {editingMemory && (
        <PinModal
          lat={editingMemory.lat}
          lng={editingMemory.lng}
          title={formData.title}
          description={formData.description}
          image={formData.image}
          readOnly={false}
          onChange={setFormData}
          onClose={() => setEditingMemory(null)}
          onSave={handleEditMemory}
        />
      )}
    </>
  );
}
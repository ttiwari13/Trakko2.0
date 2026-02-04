"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

type MapClientProps = {
  userLocation: {
    lat: number;
    lng: number;
  } | null;
};

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapClient({ userLocation }: MapClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 

  return <Map userLocation={userLocation} />;
}

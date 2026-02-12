export type LatLng = {
  lat: number;
  lng: number;
};

/**
 * Generates a smooth circular walking route
 * around a given center point.
 */
export function generateFakeRoute(
  center: LatLng,
  radiusMeters: number = 100,
  totalPoints: number = 120
): LatLng[] {
  const route: LatLng[] = [];

  const earthRadius = 6378137; // meters

  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / totalPoints) * 2 * Math.PI;

    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);

    const newLat =
      center.lat + (dy / earthRadius) * (180 / Math.PI);

    const newLng =
      center.lng +
      (dx / earthRadius) *
        (180 / Math.PI) /
        Math.cos((center.lat * Math.PI) / 180);

    route.push({
      lat: newLat,
      lng: newLng,
    });
  }

  return route;
}

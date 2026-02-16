type LatLng = { lat: number; lng: number };

export function calculateDistance(points: LatLng[]) {
  const R = 6371e3; 
  let total = 0;

  for (let i = 1; i < points.length; i++) {
    const φ1 = (points[i - 1].lat * Math.PI) / 180;
    const φ2 = (points[i].lat * Math.PI) / 180;
    const Δφ = ((points[i].lat - points[i - 1].lat) * Math.PI) / 180;
    const Δλ = ((points[i].lng - points[i - 1].lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }

  return total;
}

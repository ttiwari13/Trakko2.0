type LatLng = { lat: number; lng: number };

function getPerpendicularDistance(
  point: LatLng,
  lineStart: LatLng,
  lineEnd: LatLng
) {
  const x = point.lng;
  const y = point.lat;
  const x1 = lineStart.lng;
  const y1 = lineStart.lat;
  const x2 = lineEnd.lng;
  const y2 = lineEnd.lat;

  const numerator = Math.abs(
    (y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1
  );
  const denominator = Math.sqrt(
    (y2 - y1) ** 2 + (x2 - x1) ** 2
  );

  return numerator / denominator;
}

export function simplify(
  points: LatLng[],
  epsilon: number
): LatLng[] {
  if (points.length < 3) return points;

  let maxDist = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const dist = getPerpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1]
    );
    if (dist > maxDist) {
      index = i;
      maxDist = dist;
    }
  }

  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon);
    const right = simplify(points.slice(index), epsilon);

    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[points.length - 1]];
}

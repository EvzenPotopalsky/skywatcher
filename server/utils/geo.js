const DEFAULT_LAT = 49.8112;
const DEFAULT_LON = 13.9889;

export function parseCoordinates(query) {
  const rawLat = query.lat;
  const rawLon = query.lon;

  if (
    [rawLat, rawLon].some(
      (value) =>
        value !== undefined &&
        (typeof value !== "string" || (value !== "" && !value.trim())),
    )
  )
    return null;

  const lat =
    rawLat === undefined || rawLat === "" ? DEFAULT_LAT : Number(rawLat);

  const lon =
    rawLon === undefined || rawLon === "" ? DEFAULT_LON : Number(rawLon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null;
  }

  return { lat, lon };
}

export function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function rad2deg(rad) {
  return rad * (180 / Math.PI);
}

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // Floating-point error can put a just outside 0..1 near antipodal points.
  const boundedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(boundedA), Math.sqrt(1 - boundedA));

  return R * c;
}

export function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(deg2rad(lon2 - lon1)) * Math.cos(deg2rad(lat2));

  const x =
    Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
    Math.sin(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.cos(deg2rad(lon2 - lon1));

  return (rad2deg(Math.atan2(y, x)) + 360) % 360;
}

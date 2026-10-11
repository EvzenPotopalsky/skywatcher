export const CZECH_REGIONS = {
  "Hlavní město Praha": { lat: 50.0558, lon: 14.5844 },
  "Středočeský kraj": { lat: 49.8112, lon: 13.9889 },
  "Jihočeský kraj": { lat: 49.331, lon: 14.8527 },
  "Plzeňský kraj": { lat: 49.9489, lon: 13.5884 },
  "Karlovarský kraj": { lat: 50.0793, lon: 13.2143 },
  "Ústecký kraj": { lat: 50.5548, lon: 13.9312 },
  "Liberecký kraj": { lat: 50.5944, lon: 15.2631 },
  "Královéhradecký kraj": { lat: 50.4549, lon: 15.6946 },
  "Pardubický kraj": { lat: 49.9602, lon: 16.3739 },
  "Kraj Vysočina": { lat: 49.6708, lon: 16.0322 },
  "Jihomoravský kraj": { lat: 48.8694, lon: 16.6497 },
  "Olomoucký kraj": { lat: 49.705, lon: 16.8895 },
  "Zlínský kraj": { lat: 49.3802, lon: 17.7018 },
  "Moravskoslezský kraj": { lat: 49.8913, lon: 17.5228 },
};

export const GPS_LOCATION = "gps";
export const LOCATION_STORAGE_KEY = "skywatcher.location";

export function isRegion(value: string): value is keyof typeof CZECH_REGIONS {
  return Object.hasOwn(CZECH_REGIONS, value);
}

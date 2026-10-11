import { useEffect, useState } from "react";
import {
  CZECH_REGIONS,
  GPS_LOCATION,
  LOCATION_STORAGE_KEY,
  isRegion,
} from "../data/locations";

type Coordinates = { lat: number; lon: number };
type GpsResult = { coords: Coordinates | null; error: string | null };

function readLocation(): string {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved === GPS_LOCATION || (saved !== null && isRegion(saved)))
      return saved;
  } catch {
    // Storage may be unavailable; use the default location.
  }
  return GPS_LOCATION;
}

export function useLocation() {
  const [selectedLocation, setSelectedLocation] = useState(readLocation);
  const [gps, setGps] = useState<GpsResult>({ coords: null, error: null });
  const [gpsAttempt, setGpsAttempt] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLocation !== GPS_LOCATION) return;
    let active = true;

    const fail = (message: string) => {
      if (active) setGps({ coords: null, error: message });
    };

    if (!navigator.geolocation) {
      fail("Tento prohlížeč nepodporuje GPS.");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!active) return;
          setGps({
            coords: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            },
            error: null,
          });
        },
        (error) =>
          fail(
            error.code === 1
              ? "Přístup k GPS byl zamítnut."
              : "GPS polohu se nepodařilo zjistit.",
          ),
        { timeout: 10000, maximumAge: 60000 },
      );
    }

    return () => {
      active = false;
    };
  }, [selectedLocation, gpsAttempt]);

  function selectLocation(value: string) {
    if (value !== GPS_LOCATION && !isRegion(value)) return;
    setGps({ coords: null, error: null });
    setSelectedLocation(value);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, value);
      setStorageError(null);
    } catch {
      setStorageError(
        "Volbu polohy nelze uložit. Po obnovení stránky ji vyberte znovu.",
      );
    }
  }

  function retryGps() {
    setGps({ coords: null, error: null });
    setGpsAttempt((attempt) => attempt + 1);
  }

  const isGps = selectedLocation === GPS_LOCATION;
  const coords = isRegion(selectedLocation)
    ? CZECH_REGIONS[selectedLocation]
    : (gps.coords ?? CZECH_REGIONS["Středočeský kraj"]);

  return {
    selectedLocation,
    coords,
    isLocating: isGps && gps.coords === null && gps.error === null,
    gpsError: isGps ? gps.error : null,
    storageError,
    selectLocation,
    retryGps,
  };
}

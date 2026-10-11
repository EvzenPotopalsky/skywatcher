import axios from "axios";
import { getDistanceFromLatLonInKm } from "../utils/geo.js";

const MAX_DISTANCE_KM = 100;
const SEARCH_RADIUS_NM = Math.ceil(MAX_DISTANCE_KM / 1.852);

export function selectAircraft(aircraft, { lat, lon }) {
  const availableFlights = [];
  const emergencyFlights = [];

  for (const flight of aircraft) {
    if (
      flight &&
      Number.isFinite(flight.lat) &&
      Math.abs(flight.lat) <= 90 &&
      Number.isFinite(flight.lon) &&
      Math.abs(flight.lon) <= 180
    ) {
      const flightWithDistance = {
        ...flight,
        distance: getDistanceFromLatLonInKm(lat, lon, flight.lat, flight.lon),
      };

      if (flightWithDistance.distance > MAX_DISTANCE_KM) continue;

      const squawk = String(flight.squawk || "");

      if (["7500", "7600", "7700"].includes(squawk)) {
        emergencyFlights.push(flightWithDistance);
      } else {
        availableFlights.push(flightWithDistance);
      }
    }
  }

  const selectedFlights =
    emergencyFlights.length > 0 ? emergencyFlights : availableFlights;

  selectedFlights.sort((a, b) => a.distance - b.distance);

  return selectedFlights;
}

export async function getNearbyAircraft({ lat, lon }) {
  const adsbUrl = `https://opendata.adsb.fi/api/v3/lat/${lat}/lon/${lon}/dist/${SEARCH_RADIUS_NM}`;

  let response;

  try {
    response = await axios.get(adsbUrl, {
      timeout: 3000,
    });
  } catch (error) {
    const serviceError = new Error("Radar service unavailable");
    serviceError.code = "ADSB_UNAVAILABLE";
    serviceError.cause = error;

    throw serviceError;
  }

  const aircraft = response.data?.ac;

  if (!Array.isArray(aircraft)) {
    const error = new Error("Invalid radar response");
    error.code = "ADSB_UNAVAILABLE";
    throw error;
  }

  if (aircraft.length === 0) {
    return [];
  }

  return selectAircraft(aircraft, { lat, lon });
}

export function getEmergencyMessage(squawk) {
  if (squawk === "7700") {
    return "⚠️ NOUZE (GENERAL EMERGENCY) ⚠️";
  }

  if (squawk === "7600") {
    return "⚠️ ZTRÁTA SPOJENÍ (RADIO FAILURE) ⚠️";
  }

  if (squawk === "7500") {
    return "⚠️ ÚNOS LETADLA (HIJACKING) ⚠️";
  }

  return null;
}

import express from "express";

import { parseCoordinates, calculateBearing } from "../utils/geo.js";
import { getFlag } from "../utils/flags.js";

import {
  getNearbyAircraft,
  getEmergencyMessage,
} from "../services/adsbService.js";

import { findAircraftWithImage } from "../services/imageService.js";

import {
  getAircraftData,
  getAircraftAgeString,
} from "../services/aircraftService.js";

import { buildRouteData } from "../services/routeService.js";

const router = express.Router();

router.get("/flight", async (req, res) => {
  try {
    const location = parseCoordinates(req.query);

    if (!location) {
      return res.status(400).json({
        error: "Neplatné souřadnice.",
      });
    }

    const availableFlights = await getNearbyAircraft(location);

    if (availableFlights.length === 0) {
      return res.json({ found: false });
    }

    const { selectedPlane, imageUrl } =
      await findAircraftWithImage(availableFlights);

    if (!selectedPlane) {
      return res.json({ found: false });
    }

    const callsign = selectedPlane.flight
      ? selectedPlane.flight.trim()
      : "Neznámý let";

    const hasAltitude = Number.isFinite(selectedPlane.alt_baro);
    const altitude = hasAltitude
      ? Math.round(selectedPlane.alt_baro * 0.3048)
      : "N/A";

    const flightLevel = hasAltitude
      ? `FL${Math.round(selectedPlane.alt_baro / 100)}`
      : "";

    const distance = Math.round(selectedPlane.distance);
    const aircraftType = selectedPlane.desc || selectedPlane.t || "";

    const registration = selectedPlane.r || "";
    const flag = getFlag(registration);
    const track = Number.isFinite(selectedPlane.track) &&
      selectedPlane.track >= 0 && selectedPlane.track < 360
      ? selectedPlane.track : null;
    const baroRate = selectedPlane.baro_rate;

    const squawk = String(selectedPlane.squawk || "N/A");

    const emergency = getEmergencyMessage(squawk);

    let speed = "N/A";

    if (Number.isFinite(selectedPlane.gs) && selectedPlane.gs >= 0) {
      speed = Math.round(selectedPlane.gs * 1.852);
    }

    let vertSpeed = "";

    if (Number.isFinite(baroRate)) {
      const ms = Math.round(baroRate * 0.00508);

      vertSpeed = ms > 0 ? `+${ms} m/s` : `${ms} m/s`;
    }

    const bearing = calculateBearing(
      location.lat, location.lon, selectedPlane.lat, selectedPlane.lon,
    );

    const aircraftData = await getAircraftData(selectedPlane);

    const routeData = buildRouteData({
      selectedPlane,
      routeResponse: aircraftData.routeResponse,
      speedKmh: speed,
      track,
    });

    const ageStr = getAircraftAgeString(aircraftData.aircraftResponse);

    return res.json({
      found: true,
      icao24: selectedPlane.hex,
      callsign,
      registration,
      flag,
      squawk,
      emergency,
      type: aircraftType,
      ageStr,

      airline: routeData.airlineName,
      airlineIcao: routeData.airlineIcao,
      flightNumber: routeData.flightNumber,

      altitude,
      flightLevel,
      distance,
      speed,
      vertSpeed,
      track: track ?? null,

      imageUrl,

      route: routeData.routeInfo,
      progress: routeData.progress,

      radar: {
        distance,
        bearing,
      },
    });
  } catch (error) {
    if (error?.code === "ADSB_UNAVAILABLE") {
      console.error(
        `ADSB.fi Error: ${
          error.cause?.code || error.cause?.message || "Unknown error"
        }`,
      );

      return res.status(502).json({
        error: "Radar service unavailable",
      });
    }

    console.error("Internal Server Error:", error);

    return res.status(500).json({
      error: "Vnitřní chyba serveru",
    });
  }
});

export default router;

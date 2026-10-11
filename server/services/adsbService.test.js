import { describe, expect, test, vi } from "vitest";
import axios from "axios";
import { selectAircraft, getEmergencyMessage, getNearbyAircraft } from "./adsbService.js";

describe("getEmergencyMessage", () => {
  test("classifies squawk 7700 as a general emergency", () => {
    expect(getEmergencyMessage("7700")).toBe("⚠️ NOUZE (GENERAL EMERGENCY) ⚠️");
  });

  test("classifies squawk 7600 as radio failure", () => {
    expect(getEmergencyMessage("7600")).toBe(
      "⚠️ ZTRÁTA SPOJENÍ (RADIO FAILURE) ⚠️",
    );
  });

  test("classifies squawk 7500 as hijacking", () => {
    expect(getEmergencyMessage("7500")).toBe("⚠️ ÚNOS LETADLA (HIJACKING) ⚠️");
  });
});

describe("selectAircraft", () => {
  const location = {
    lat: 50.0755,
    lon: 14.4378,
  };

  test("selects the closest aircraft within 100 km", () => {
    const aircraft = [
      {
        hex: "farther",
        lat: 50.5,
        lon: 15.0,
      },
      {
        hex: "closer",
        lat: 50.1,
        lon: 14.5,
      },
    ];

    const result = selectAircraft(aircraft, location);

    expect(result).toHaveLength(2);
    expect(result[0].hex).toBe("closer");
  });

  test("prefers emergency aircraft even when a normal aircraft is closer", () => {
    const aircraft = [
      {
        hex: "normal",
        lat: 50.08,
        lon: 14.45,
        squawk: "1200",
      },
      {
        hex: "emergency",
        lat: 50.2,
        lon: 14.8,
        squawk: "7700",
      },
    ];

    const result = selectAircraft(aircraft, location);

    expect(result).toHaveLength(1);
    expect(result[0].hex).toBe("emergency");
  });
});

test("ignores malformed aircraft coordinates", () => {
  expect(selectAircraft([{ lat: "50", lon: 14 }, { lat: NaN, lon: 14 }], { lat: 50, lon: 14 })).toEqual([]);
});


test("includes aircraft at the 100 km boundary and excludes those beyond it", () => {
  const latitudeAtKm = (km) => km / (6371 * Math.PI / 180);
  const result = selectAircraft([
    { hex: "inside", lat: latitudeAtKm(99), lon: 0 },
    { hex: "boundary", lat: latitudeAtKm(100), lon: 0 },
    { hex: "outside", lat: latitudeAtKm(101), lon: 0 },
  ], { lat: 0, lon: 0 });
  expect(result.map((flight) => flight.hex)).toEqual(["inside", "boundary"]);
});

test("an emergency beyond 100 km does not replace an aircraft inside the range", () => {
  const result = selectAircraft([
    { hex: "nearby", lat: 0.1, lon: 0, squawk: "1200" },
    { hex: "distant-emergency", lat: 1, lon: 0, squawk: "7700" },
  ], { lat: 0, lon: 0 });
  expect(result.map((flight) => flight.hex)).toEqual(["nearby"]);
});

test("requests the 100 km search area in the API's nautical-mile units", async () => {
  const request = vi.spyOn(axios, "get").mockResolvedValue({ data: { ac: [] } });
  try {
    await getNearbyAircraft({ lat: 50, lon: 14 });
    expect(request).toHaveBeenCalledWith(
      "https://opendata.adsb.fi/api/v3/lat/50/lon/14/dist/54",
      { timeout: 3000 },
    );
  } finally {
    request.mockRestore();
  }
});

test("does not admit an aircraft beyond 100 km just because its displayed distance rounds down", () => {
  const latitudeAtKm = (km) => km / (6371 * Math.PI / 180);
  const result = selectAircraft([
    { hex: "inside", lat: latitudeAtKm(99.9), lon: 0 },
    { hex: "outside", lat: latitudeAtKm(100.004), lon: 0 },
  ], { lat: 0, lon: 0 });
  expect(result.map((flight) => flight.hex)).toEqual(["inside"]);
});

test("ignores null entries and finite coordinates outside geographical ranges", () => {
  expect(selectAircraft([null, {}, { lat: 91, lon: 0 }, { lat: 0, lon: 181 }], { lat: 0, lon: 0 })).toEqual([]);
});

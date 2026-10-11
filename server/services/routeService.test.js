import { describe, expect, test } from "vitest";
import { buildRouteData } from "./routeService.js";

const origin = {
  municipality: "Prague",
  latitude: "50.0755",
  longitude: "14.4378",
};

const destination = {
  municipality: "Brno",
  latitude: "49.1951",
  longitude: "16.6068",
};

const routeResponse = {
  airline: {
    name: "Test Airline",
    icao: "TST",
  },
  flightroute: {
    flight_number: "123",
    origin,
    destination,
  },
};

describe("buildRouteData", () => {
  test("keeps the route direction when aircraft track matches it", () => {
    const result = buildRouteData({
      selectedPlane: {
        lat: 49.635,
        lon: 15.522,
      },
      routeResponse,
      speedKmh: 800,
      track: 121,
    });

    expect(result.routeInfo).toBe("Prague ➔ Brno");
  });

  test("reverses the route when aircraft track is opposite", () => {
    const result = buildRouteData({
      selectedPlane: {
        lat: 49.635,
        lon: 15.522,
      },
      routeResponse,
      speedKmh: 800,
      track: 301,
    });

    expect(result.routeInfo).toBe("Brno ➔ Prague");
  });

  test("calculates flight progress when speed is available", () => {
    const result = buildRouteData({
      selectedPlane: {
        lat: 49.635,
        lon: 15.522,
      },
      routeResponse,
      speedKmh: 800,
      track: 121,
    });

    expect(result.progress).not.toBeNull();
    expect(result.progress.pct).toBeGreaterThan(45);
    expect(result.progress.pct).toBeLessThan(55);
    expect(result.progress.remainingMins).toBeGreaterThan(0);
  });
});

test("accepts airports on the equator", () => {
  const result = buildRouteData({
    selectedPlane: { lat: 0, lon: 1 }, track: 90, speedKmh: 800,
    routeResponse: { flightroute: {
      origin: { municipality: "Origin", latitude: 0, longitude: 0 },
      destination: { municipality: "Destination", latitude: 0, longitude: 2 },
    } },
  });
  expect(result.routeInfo).toBe("Origin ➔ Destination");
  expect(result.progress.pct).toBeCloseTo(50, 0);
});

test("does not calculate progress for identical endpoints", () => {
  const result = buildRouteData({
    selectedPlane: { lat: 0, lon: 0 }, track: 0, speedKmh: 800,
    routeResponse: { flightroute: {
      origin: { latitude: 0, longitude: 0 }, destination: { latitude: 0, longitude: 0 },
    } },
  });
  expect(result.progress).toBeNull();
});

test("reads airline metadata from the flightroute object", () => {
  const result = buildRouteData({ selectedPlane: {}, speedKmh: "N/A", track: null,
    routeResponse: { flightroute: { airline: { name: "Nested Airline", icao: "NST" } } },
  });
  expect(result.airlineName).toBe("Nested Airline");
});

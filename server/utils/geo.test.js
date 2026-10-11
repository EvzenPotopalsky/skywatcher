import { describe, expect, test } from "vitest";
import {
  parseCoordinates,
  getDistanceFromLatLonInKm,
  calculateBearing,
} from "./geo.js";

describe("parseCoordinates", () => {
  test("returns default coordinates when no coordinates are provided", () => {
    expect(parseCoordinates({})).toEqual({
      lat: 49.8112,
      lon: 13.9889,
    });
  });

  test("accepts valid coordinates", () => {
    expect(
      parseCoordinates({
        lat: "50.0755",
        lon: "14.4378",
      }),
    ).toEqual({
      lat: 50.0755,
      lon: 14.4378,
    });
  });

  test("rejects coordinates outside valid ranges", () => {
    expect(
      parseCoordinates({
        lat: "91",
        lon: "14",
      }),
    ).toBeNull();

    expect(
      parseCoordinates({
        lat: "50",
        lon: "181",
      }),
    ).toBeNull();
  });

  test("rejects malformed coordinate input", () => {
    expect(
      parseCoordinates({
        lat: "50.0755abc",
        lon: "14.4378",
      }),
    ).toBeNull();
  });
});

describe("getDistanceFromLatLonInKm", () => {
  test("calculates approximately the distance from Prague to Brno", () => {
    const distance = getDistanceFromLatLonInKm(
      50.0755,
      14.4378,
      49.1951,
      16.6068,
    );

    expect(distance).toBeCloseTo(184, 0);
  });
});

describe("calculateBearing", () => {
  test("calculates the bearing from Prague to Brno", () => {
    const bearing = calculateBearing(50.0755, 14.4378, 49.1951, 16.6068);

    expect(bearing).toBeCloseTo(121.25, 1);
  });
});

test("rejects repeated, object and whitespace coordinate inputs", () => {
  for (const lat of [["50"], {}, "   "]) {
    expect(parseCoordinates({ lat, lon: "14" })).toBeNull();
  }
});

test("keeps distance precision until the presentation boundary", () => {
  const latitude = 100.004 / ((6371 * Math.PI) / 180);
  expect(getDistanceFromLatLonInKm(0, 0, latitude, 0)).toBeCloseTo(100.004, 6);
});

import { afterEach, beforeEach, expect, test, vi } from "vitest";
import express from "express";
import flightRouter from "./flight.js";
import { getNearbyAircraft } from "../services/adsbService.js";
import { findAircraftWithImage } from "../services/imageService.js";
import { getAircraftData } from "../services/aircraftService.js";
vi.mock("../services/adsbService.js", async (original) => ({ ...await original(), getNearbyAircraft: vi.fn() }));
vi.mock("../services/imageService.js", () => ({ findAircraftWithImage: vi.fn() }));
vi.mock("../services/aircraftService.js", async (original) => ({ ...await original(), getAircraftData: vi.fn() }));
let server, base;
beforeEach(async () => {
  vi.clearAllMocks();
  const app = express();
  app.use("/api", flightRouter);
  server = await new Promise(resolve => { const s = app.listen(0, "127.0.0.1", () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}/api/flight`;
});
afterEach(() => new Promise(resolve => server.close(resolve)));
test("rejects invalid input before calling the radar", async () => {
  expect((await fetch(base + "?lat=100")).status).toBe(400);
  expect(getNearbyAircraft).not.toHaveBeenCalled();
});
test("returns an empty state when no aircraft are available", async () => {
  getNearbyAircraft.mockResolvedValue([]);
  expect(await (await fetch(base)).json()).toEqual({ found: false });
});
test.each([[0, 0, "FL0"], ["ground", "N/A", ""]])("formats altitude %s safely", async (input, altitude, flightLevel) => {
  const plane = { hex: "test", lat: 50, lon: 14, distance: 1, alt_baro: input };
  getNearbyAircraft.mockResolvedValue([plane]);
  findAircraftWithImage.mockResolvedValue({ selectedPlane: plane, imageUrl: null });
  getAircraftData.mockResolvedValue({ routeResponse: null, aircraftResponse: null });
  const result = await (await fetch(base)).json();
  expect(result).toMatchObject({ found: true, altitude, flightLevel, vertSpeed: "" });
});
test("maps radar failures to 502", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  getNearbyAircraft.mockRejectedValue(Object.assign(new Error("offline"), { code: "ADSB_UNAVAILABLE" }));
  expect((await fetch(base)).status).toBe(502);
  log.mockRestore();
});

test.each([
  [NaN, Infinity, "north", "N/A", "", null],
  [0, 0, 0, 0, "0 m/s", 0],
  [-1, "fast", 360, "N/A", "", null],
])("normalizes telemetry without fabricating valid numbers", async (gs, baro_rate, track, speed, vertSpeed, expectedTrack) => {
  const plane = { hex: "test", lat: 0, lon: -179.9, distance: 22.24, gs, baro_rate, track };
  getNearbyAircraft.mockResolvedValue([plane]);
  findAircraftWithImage.mockResolvedValue({ selectedPlane: plane, imageUrl: null });
  getAircraftData.mockResolvedValue({ routeResponse: null, aircraftResponse: null });
  const response = await fetch(base + "?lat=0&lon=179.9");
  expect(response.status).toBe(200);
  const result = await response.json();
  expect(result).toMatchObject({ speed, vertSpeed, track: expectedTrack, distance: 22 });
  expect(result.radar.bearing).toBeCloseTo(90, 5);
});

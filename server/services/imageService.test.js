import { beforeEach, describe, expect, test, vi } from "vitest";
import axios from "axios";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
let findAircraftWithImage;
beforeEach(async () => {
  vi.resetModules();
  axios.get.mockReset();
  ({ findAircraftWithImage } = await import("./imageService.js"));
});
const flights = [{ hex: "first", r: "OK-AAA" }, { hex: "second", r: "OK-BBB" }];
const photo = { data: { query: { pages: { 1: { imageinfo: [{ url: "https://example.com/plane.jpg" }] } } } } };

describe("photo selection", () => {
  test("tries the next aircraft after a missing photo and caches the result", async () => {
    axios.get.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce(photo);
    const result = await findAircraftWithImage(flights);
    expect(result.selectedPlane.hex).toBe("second");
    expect(result.imageUrl).toBe("https://example.com/plane.jpg");
    expect(await findAircraftWithImage(flights)).toEqual(result);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
  test("keeps the nearest aircraft if the photo service fails", async () => {
    axios.get.mockRejectedValue(new Error("offline"));
    expect(await findAircraftWithImage(flights)).toEqual({ selectedPlane: flights[0], imageUrl: null });
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
  test("bounds new photo lookups in a busy area", async () => {
    axios.get.mockResolvedValue({ data: {} });
    const many = Array.from({ length: 20 }, (_, i) => ({ hex: String(i) }));
    expect((await findAircraftWithImage(many)).selectedPlane).toEqual(many[0]);
    expect(axios.get).toHaveBeenCalledTimes(4);
  });
  test("retries a missing photo after its short cache expires", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1000);
    axios.get.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce(photo);
    await findAircraftWithImage([flights[0]]);
    now.mockReturnValue(62000);
    expect((await findAircraftWithImage([flights[0]])).imageUrl).toContain("plane.jpg");
    now.mockRestore();
  });
  test("returns no plane for an empty list", async () => {
    expect(await findAircraftWithImage([])).toEqual({ selectedPlane: null, imageUrl: null });
    expect(axios.get).not.toHaveBeenCalled();
  });
});

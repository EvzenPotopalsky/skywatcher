import axios from "axios";

export async function getAircraftData(selectedPlane) {
  const cleanCallsign = selectedPlane.flight
    ? selectedPlane.flight.trim()
    : null;

  const requests = [];

  if (cleanCallsign) {
    requests.push(
      axios
        .get(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(cleanCallsign)}`, {
          timeout: 2000,
        })
        .catch(() => null),
    );
  } else {
    requests.push(Promise.resolve(null));
  }

  requests.push(
    axios
      .get(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(selectedPlane.hex)}`, {
        timeout: 2000,
      })
      .catch(() => null),
  );

  const [routeRes, aircraftRes] = await Promise.all(requests);

  return {
    routeResponse: routeRes?.data?.response || null,
    aircraftResponse: aircraftRes?.data?.response?.aircraft || null,
  };
}

export function getAircraftAgeString(aircraftResponse) {
  if (!aircraftResponse) {
    return "";
  }

  const year = aircraftResponse.year_built
    ? parseInt(aircraftResponse.year_built)
    : aircraftResponse.built
      ? parseInt(aircraftResponse.built.substring(0, 4))
      : null;

  const currentYear = new Date().getFullYear();

  if (year && year > 1900 && year <= currentYear) {
    return `Stáří: ${currentYear - year} let`;
  }

  return "";
}

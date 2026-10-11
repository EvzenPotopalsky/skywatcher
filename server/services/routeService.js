import { calculateBearing, getDistanceFromLatLonInKm } from "../utils/geo.js";

function formatLocWithFlag(loc) {
  if (!loc) return "";

  const region = loc.municipality || loc.region || "";
  const iso = loc.country_iso_name || loc.country_iso || "";

  let flagEmoji = "";

  if (iso && iso.length === 2) {
    flagEmoji = iso
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(char.charCodeAt(0) + 127397),
      );
  }

  if (region && flagEmoji) {
    return `${flagEmoji} ${region}`;
  }

  if (region) {
    return region;
  }

  if (loc.name) {
    return loc.name.replace(/ International Airport| Airport/g, "");
  }

  return loc.iata_code || "";
}

export function buildRouteData({
  selectedPlane,
  routeResponse,
  speedKmh,
  track,
}) {
  let routeInfo = "Trasa neuvedena";
  let airlineName = "";
  let airlineIcao = "";
  let flightNumber = "";
  let progress = null;

  if (!routeResponse) {
    return {
      routeInfo,
      airlineName,
      airlineIcao,
      flightNumber,
      progress,
    };
  }

  const airline = routeResponse.flightroute?.airline || routeResponse.airline;
  if (airline) {
    airlineName = airline.name || "";
    airlineIcao = airline.icao || "";
  }

  if (!routeResponse.flightroute) {
    return {
      routeInfo,
      airlineName,
      airlineIcao,
      flightNumber,
      progress,
    };
  }

  const route = routeResponse.flightroute;

  flightNumber = route.flight_number || route.callsign_iata || "";

  let originObj = route.origin;
  let destObj = route.destination;

  if (
    originObj?.latitude != null &&
    originObj?.longitude != null &&
    destObj?.latitude != null &&
    destObj?.longitude != null &&
    Number.isFinite(selectedPlane.lat) &&
    Number.isFinite(selectedPlane.lon) &&
    track != null
  ) {
    let lat1 = parseFloat(originObj.latitude);
    let lon1 = parseFloat(originObj.longitude);
    let lat2 = parseFloat(destObj.latitude);
    let lon2 = parseFloat(destObj.longitude);

    if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
      return { routeInfo, airlineName, airlineIcao, flightNumber, progress };
    }

    const plannedBearing = calculateBearing(lat1, lon1, lat2, lon2);

    let diffAngle = Math.abs(plannedBearing - track);

    if (diffAngle > 180) {
      diffAngle = 360 - diffAngle;
    }

    if (diffAngle > 110) {
      const temp = originObj;
      originObj = destObj;
      destObj = temp;

      lat1 = parseFloat(originObj.latitude);
      lon1 = parseFloat(originObj.longitude);
      lat2 = parseFloat(destObj.latitude);
      lon2 = parseFloat(destObj.longitude);
    }

    const totalDist = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);

    const distFromOrigin = getDistanceFromLatLonInKm(
      lat1,
      lon1,
      selectedPlane.lat,
      selectedPlane.lon,
    );

    const distToDest = getDistanceFromLatLonInKm(
      selectedPlane.lat,
      selectedPlane.lon,
      lat2,
      lon2,
    );

    if (distFromOrigin + distToDest < totalDist * 1.45) {
      routeInfo =
        `${formatLocWithFlag(originObj)} ➔ ` + `${formatLocWithFlag(destObj)}`;

      if (Number.isFinite(speedKmh) && speedKmh > 100 && totalDist > 0) {
        const pct = Math.min(
          Math.max((distFromOrigin / totalDist) * 100, 0),
          100,
        );

        const remainingMins = Math.round((distToDest / speedKmh) * 60);

        progress = {
          pct,
          remainingMins,
        };
      }
    } else {
      routeInfo = "Trasa neověřena";
    }
  }

  return {
    routeInfo,
    airlineName,
    airlineIcao,
    flightNumber,
    progress,
  };
}

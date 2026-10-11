export interface Flight {
  found: boolean;
  icao24: string;
  callsign: string;
  registration: string;
  flag: string;
  squawk: string;
  emergency: string | null;
  type: string;
  ageStr: string;
  airline: string;
  airlineIcao: string;
  flightNumber: string;
  altitude: number | string;
  flightLevel: string;
  distance: number;
  speed: number | string;
  vertSpeed: string;
  track: number | null;
  imageUrl: string | null;
  route: string;
  progress: { pct: number; remainingMins: number } | null;
  radar: { distance: number; bearing: number };
}

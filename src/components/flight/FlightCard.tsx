import type { Flight } from "../../types/flight";
import FlightImage from "./FlightImage";
import FlightTelemetry from "./FlightTelemetry";

export default function FlightCard({ flight }: { flight: Flight }) {
  const isEmergency = !!flight.emergency;
  return (
    <div className={`flight-display${isEmergency ? " flight-emergency" : ""}`}>
      {isEmergency && <div className="emergency-banner">{flight.emergency}</div>}
      <FlightImage flight={flight} />
      <FlightTelemetry flight={flight} isEmergency={isEmergency} />
    </div>
  );
}

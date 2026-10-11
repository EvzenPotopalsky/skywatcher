import type { Flight } from "../../types/flight";
import FlightRadar from "./FlightRadar";

const altitudeFormatter = new Intl.NumberFormat("cs-CZ");

export default function FlightTelemetry({
  flight,
  isEmergency,
}: {
  flight: Flight;
  isEmergency: boolean;
}) {
  const altitudeMetres =
    typeof flight.altitude === "number" && Number.isFinite(flight.altitude)
      ? `${altitudeFormatter.format(flight.altitude)} m`
      : null;

  return (
    <div className="flight-information">
      <div className="flight-details">
        <div className="flight-route">
          <p className="route-name">{flight.route}</p>
          {flight.progress && (
            <>
              <div className="route-caption">
                <span>Průběh letu</span>
                <span>Zbývá přibližně {flight.progress.remainingMins} min</span>
              </div>
              <div
                role="progressbar"
                aria-label="Odhad průběhu letu"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(flight.progress.pct)}
                className="route-progress"
              >
                <div style={{ width: `${flight.progress.pct}%` }} />
              </div>
            </>
          )}
        </div>
        <dl className="flight-stats">
          <div>
            <dt>Výška</dt>
            <dd className="altitude-value">
              {flight.flightLevel || altitudeMetres || "N/A"}
              {flight.flightLevel && altitudeMetres && (
                <span className="altitude-metres">({altitudeMetres})</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Rychlost</dt>
            <dd>
              {flight.speed}
              {typeof flight.speed === "number" && <span> km/h</span>}
            </dd>
          </div>
          <div>
            <dt>Vzdálenost</dt>
            <dd>
              {flight.radar.distance} <span>km</span>
            </dd>
          </div>
        </dl>
        <div className="secondary-stats">
          <span>
            Vertikální rychlost <strong>{flight.vertSpeed || "N/A"}</strong>
          </span>
          <span className={isEmergency ? "emergency-value" : undefined}>
            Squawk <strong>{flight.squawk}</strong>
          </span>
        </div>
      </div>
      <FlightRadar flight={flight} />
    </div>
  );
}

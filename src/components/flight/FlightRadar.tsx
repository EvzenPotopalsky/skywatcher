import type { Flight } from "../../types/flight";

interface FlightRadarProps {
  flight: Flight;
}

export default function FlightRadar({ flight }: FlightRadarProps) {
  const center = 50;
  const maxRadius = 38;

  const maxRadarDistance = 100;

  const distance = flight.radar.distance;
  const bearing = flight.radar.bearing;

  const normalizedDistance = Math.min(distance / maxRadarDistance, 1);
  const radius = normalizedDistance * maxRadius;

  const angle = (bearing * Math.PI) / 180;

  const aircraftX = center + Math.sin(angle) * radius;
  const aircraftY = center - Math.cos(angle) * radius;

  let headingLine: {
    x2: number;
    y2: number;
  } | null = null;

  if (flight.track != null) {
    const trackAngle = (flight.track * Math.PI) / 180;
    const headingLength = 8;

    headingLine = {
      x2: aircraftX + Math.sin(trackAngle) * headingLength,
      y2: aircraftY - Math.cos(trackAngle) * headingLength,
    };
  }

  return (
    <div className="flight-radar">
      <span className="radar-label">Radar</span>

      <div
        role="img"
        aria-label={`Letadlo je ${distance} kilometrů od zvolené polohy, kurz ${
          flight.track != null
            ? `${Math.round(flight.track)} stupňů`
            : "neznámý"
        }`}
        className="radar-drawing"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
          {/* Outer radar range */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[#7692a8]"
          />

          {/* Radar rings */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius * 0.66}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-[#526b7e]"
          />

          <circle
            cx={center}
            cy={center}
            r={maxRadius * 0.33}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-[#526b7e]"
          />

          {/* Crosshair */}
          <line
            x1="12"
            y1={center}
            x2="88"
            y2={center}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[#526b7e]"
          />

          <line
            x1={center}
            y1="12"
            x2={center}
            y2="88"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[#526b7e]"
          />

          {/* Cardinal directions */}
          <text
            x={center}
            y="7"
            textAnchor="middle"
            className="fill-[#b6c6d2] text-[6px] font-medium"
          >
            N
          </text>

          <text
            x="93"
            y={center + 2}
            textAnchor="middle"
            className="fill-[#b6c6d2] text-[6px] font-medium"
          >
            E
          </text>

          <text
            x={center}
            y="97"
            textAnchor="middle"
            className="fill-[#b6c6d2] text-[6px] font-medium"
          >
            S
          </text>

          <text
            x="7"
            y={center + 2}
            textAnchor="middle"
            className="fill-[#b6c6d2] text-[6px] font-medium"
          >
            W
          </text>

          {/* User position */}
          <circle cx={center} cy={center} r="3" className="fill-emerald-300" />

          <circle
            cx={center}
            cy={center}
            r="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-emerald-300/30"
          />

          {/* Aircraft heading */}
          {headingLine && (
            <line
              x1={aircraftX}
              y1={aircraftY}
              x2={headingLine.x2}
              y2={headingLine.y2}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-sky-300"
            />
          )}

          {/* Aircraft */}
          <circle
            cx={aircraftX}
            cy={aircraftY}
            r="3"
            className="fill-sky-300"
          />

          <circle
            cx={aircraftX}
            cy={aircraftY}
            r="5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-sky-300/30"
          />
        </svg>
      </div>
    </div>
  );
}

import { useState } from "react";
import type { Flight } from "../../types/flight";

export default function FlightImage({ flight }: { flight: Flight }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = flight.imageUrl && flight.imageUrl !== failedUrl;

  return (
    <div className="aircraft-photo">
      {showImage ? (
        <>
          <img src={flight.imageUrl!} alt="" className="aircraft-backdrop" />
          <img
            src={flight.imageUrl!}
            onError={() => setFailedUrl(flight.imageUrl)}
            alt={`${flight.callsign} aircraft, ${flight.type}`}
            className="aircraft-image"
          />
        </>
      ) : (
        <div className="photo-placeholder">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m12 3 9 18-9-3-9 3 9-18Zm0 0v15"
            />
          </svg>
          <p>Obrázek není k dispozici</p>
        </div>
      )}
      <div className="photo-shade" aria-hidden="true" />
      {flight.registration && (
        <p className="aircraft-registration">
          <span>{flight.flag}</span> {flight.registration}
        </p>
      )}
      <div className="aircraft-identity">
        <h2>{flight.callsign}</h2>
        <p className="aircraft-type">
          {flight.type || "Neznámý typ"}
          {flight.ageStr && <span> · {flight.ageStr}</span>}
        </p>
      </div>
    </div>
  );
}

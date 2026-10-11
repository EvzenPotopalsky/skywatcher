import { GPS_LOCATION } from "../../data/locations";
import type { HeaderProps } from "../../types/header";

export default function Header({
  locName,
  onLocationChange,
  regions,
  loading,
  error,
}: HeaderProps) {
  const status = error
    ? "Radar nedostupný"
    : loading
      ? "Skenování"
      : "Radar aktivní";
  return (
    <header className="display-header">
      <div className="display-brand">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m12 3 9 18-9-3-9 3 9-18Zm0 0v15"
          />
        </svg>
        <h1>SKYWATCHER</h1>
      </div>
      <div className="display-controls">
        <span
          className={`radar-status${error ? " status-error" : loading ? " status-loading" : ""}`}
        >
          <span aria-hidden="true" className="status-dot" />
          {status}
        </span>
        <div className="location-control">
          <label htmlFor="location" className="max-[599px]:sr-only">
            Poloha
          </label>
          <select
            id="location"
            value={locName}
            onChange={(event) => onLocationChange(event.target.value)}
          >
            <option value={GPS_LOCATION}>Moje poloha (GPS)</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

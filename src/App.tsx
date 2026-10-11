import Header from "./components/layout/Header";
import { useFlights } from "./hooks/useFlights";
import FlightCard from "./components/flight/FlightCard";
import { CZECH_REGIONS } from "./data/locations";
import { useLocation } from "./hooks/useLocation";

export default function App() {
  const {
    selectedLocation,
    coords,
    isLocating,
    gpsError,
    storageError,
    selectLocation,
    retryGps,
  } = useLocation();
  const { flight, loading, error } = useFlights(
    coords.lat,
    coords.lon,
    !isLocating,
  );
  const isLoading = isLocating || loading;

  return (
    <main className="skywatcher-app">
      <div className="w-full shrink-0">
        <Header
          locName={selectedLocation}
          onLocationChange={selectLocation}
          regions={Object.keys(CZECH_REGIONS)}
          loading={isLoading}
          error={isLocating ? null : error}
        />
        {gpsError && (
          <p role="status" className="location-notice">
            {gpsError} Zobrazuji lety v okolí Plešivce.{" "}
            <button type="button" onClick={retryGps}>
              Zkusit GPS znovu
            </button>
          </p>
        )}
        {storageError && (
          <p role="status" className="location-notice">
            {storageError}
          </p>
        )}
      </div>

      <section className="display-content">
        {isLoading && (
          <p
            role="status"
            className="text-xl md:text-2xl text-slate-300 animate-pulse"
          >
            {isLocating
              ? "Zjišťování GPS polohy..."
              : "Skenování vzdušného prostoru..."}
          </p>
        )}

        {!isLocating && error && (
          <p role="alert" className="text-xl md:text-2xl text-rose-300">
            Chyba: {error}
          </p>
        )}

        {!isLoading && !error && !flight && (
          <div className="text-center">
            <p className="text-3xl md:text-5xl font-light text-slate-100 mb-4">
              Žádné letadlo v dosahu.
            </p>

            <p className="text-lg md:text-xl text-slate-300">
              Čekám na další radarový snímek...
            </p>
          </div>
        )}

        {!isLoading && !error && flight && <FlightCard flight={flight} />}
      </section>
      <footer className="data-credit">
        Zdroj dat:{" "}
        <a href="https://adsb.fi" target="_blank" rel="noopener noreferrer">
          adsb.fi
        </a>
        {" · "}
        <a
          href="https://www.adsbdb.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          adsbdb
        </a>
      </footer>
    </main>
  );
}

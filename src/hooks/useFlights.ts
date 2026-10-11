import { useState, useEffect } from "react";
import type { Flight } from "../types/flight";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useFlights(lat: number, lon: number, enabled = true) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let controller: AbortController | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let isCurrent = true;
    let isFetching = false;

    /* eslint-disable react-hooks/set-state-in-effect */
    // Reset the previous location's results before fetching new flights.
    setLoading(true);
    setError(null);
    setFlight(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    const scheduleNextFetch = () => {
      if (!isCurrent || document.hidden) return;

      timeout = setTimeout(() => {
        fetchFlight();
      }, 10000);
    };

    const fetchFlight = async () => {
      if (isFetching || !isCurrent) return;

      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      isFetching = true;
      controller = new AbortController();
      const requestController = controller;
      const deadline = setTimeout(() => requestController.abort(), 20000);

      try {
        const response = await fetch(
          `${API_URL}/api/flight?lat=${lat}&lon=${lon}`,
          {
            signal: requestController.signal,
          },
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          throw new Error(
            data?.error || "Failed to fetch flight data from server",
          );
        }

        const data = await response.json();

        if (!isCurrent) return;

        if (data.found) {
          setFlight(data);
        } else {
          setFlight(null);
        }

        setError(null);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          if (isCurrent)
            setError("Požadavek trval příliš dlouho. Zkusím to znovu.");
          return;
        }

        if (!isCurrent) return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        clearTimeout(deadline);
        isFetching = false;

        if (isCurrent) {
          setLoading(false);
          scheduleNextFetch();
        }
      }
    };

    const stopPolling = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchFlight();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    fetchFlight();

    return () => {
      isCurrent = false;
      controller?.abort();

      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lat, lon, enabled]);

  return { flight, loading, error };
}

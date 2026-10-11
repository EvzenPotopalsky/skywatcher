# Skywatcher

A React and TypeScript flight display showing an aircraft near a selected location in a Czech region or current location. A small Express backend combines aircraft positions, route information, and photos into one API response.

Built to practise API integration, custom hooks, asynchronous requests, and responsive interfaces. The interface is primarily in Czech, with a dark layout designed for larger displays and smaller screens.

## Features

- Select a location for a Czech region, or use the browser's GPS location.
- Remember the selected location across refreshes.
- Display one aircraft within 100 km, prioritizing emergency squawk codes.
- Refresh data ten seconds after each request finishes and pause future polling while the tab is hidden.
- Show aircraft details, altitude, speed, distance, and relative radar position.
- Show photos and approximate route progress when the necessary data is available.
- Handle loading, no nearby aircraft, unavailable GPS, and service errors.

## Tech stack and sources

- **Frontend:** React, TypeScript, Vite, CSS with Tailwind utilities.
- **Backend:** Node.js, Express, Axios.
- **Tests:** Vitest.
- **Sources:** [adsb.fi](https://adsb.fi) for positions, [adsbdb](https://www.adsbdb.com) for aircraft/route information, and [Wikimedia Commons](https://commons.wikimedia.org) for photos.

## Run locally

Use Node.js 24 and npm. No database or private API key is required.

```bash
npm ci
cp .env.example .env
```

Keep your existing `.env` if it is already configured. For local development, set:

```env
VITE_API_URL=http://localhost:3000
```

Start the backend in one terminal:

```bash
npm start
```

Start the frontend in another:

```bash
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173. Restart Vite after changing `.env`.

GPS needs browser permission and localhost or HTTPS. If it fails it defaults to preselected location.

## Commands

| Command             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the frontend development server              |
| `npm start`         | Start Express; also serves `dist/` when built      |
| `npm run build`     | Type-check and build the frontend                  |
| `npm run lint`      | Check frontend and backend code                    |
| `npm test -- --run` | Run the automated tests once                       |
| `npm run preview`   | Preview the frontend build; an API is still needed |

Tests cover geographic calculations, flight selection, photo caching, route estimates, and API responses using mocked external services.

## Deployment

For a single Node web service serving both frontend and backend:

1. Set `VITE_API_URL` to an empty value before building to use the same origin.
2. Build with `npm ci && npm run build`.
3. Start with `npm start` and let the host provide `PORT` and HTTPS.

A separate frontend deployment needs its API URL configured at build time and its origin allowed by the backend's CORS configuration.

## Limitations

- External services may be unavailable, and observations are periodically refreshed rather than continuous.
- Photo preference means the selected aircraft is not always the nearest one.
- Route progress and remaining time are estimates, not reliable arrival predictions.
- Photos may be illustrative rather than the exact aircraft. Displaying Commons author/license credits remains a follow-up.
- Live provider integration needs separate verification; mocked tests do not establish live availability.

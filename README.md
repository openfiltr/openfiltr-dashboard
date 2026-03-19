# OpenFiltr Dashboard

Standalone Ionic Vue administrative dashboard for the OpenFiltr backend API.

## Stack

- Ionic Framework with Vue 3
- Pinia
- Vue Router
- TypeScript
- Vite
- Docker with nginx for production delivery

## Project layout

```text
openfiltr-dashboard/
├── docker/
│   └── nginx.conf.template
├── src/
│   ├── api/
│   ├── components/
│   ├── css/
│   ├── layouts/
│   ├── router/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   └── views/
├── .env.example
├── Dockerfile
└── docker-compose.example.yml
```

## Development

1. Copy `.env.example` to `.env`.
2. Set `OPENFILTR_BACKEND_ORIGIN` to the backend origin. The default assumes the Go API is on `http://localhost:3000`.
3. Install dependencies with `npm install`.
4. Start the dashboard with `npm run dev`.

Vite proxies `/api/v1` and `/openapi.yaml` to the backend origin, so the browser still talks to same-path routes while developing.

## Production container

The production image is fully separate from the Go backend image.

- The frontend is built with Vite in a Node build stage.
- nginx serves the compiled SPA.
- nginx reverse proxies `/api/v1` and `/openapi.yaml` to `OPENFILTR_BACKEND_ORIGIN`.

Build locally:

```bash
docker build -t openfiltr-dashboard .
```

Run against an existing backend container:

```bash
docker run --rm -p 8080:80 -e OPENFILTR_BACKEND_ORIGIN=http://host.docker.internal:3000 openfiltr-dashboard
```

Open `http://localhost:8080`.

## Running alongside OpenFiltr

`docker-compose.example.yml` shows the dashboard running next to:

- `postgres:16-alpine`
- `ghcr.io/openfiltr/openfiltr:latest`
- the standalone `openfiltr-dashboard` image built from this repository

Start the stack with:

```bash
docker compose -f docker-compose.example.yml up --build
```

The backend remains available on port `3000`, while the dashboard is served on port `8080`.

## Auth model

- The browser uses bearer-token auth.
- The UI does not rely on cross-origin cookie sessions.
- In production, same-origin delivery is preferred through the nginx reverse proxy.

## Backend-aligned quirks

The dashboard is intentionally aligned to the current Go handlers:

- Integer-backed `enabled` fields are normalised to booleans in the frontend model layer.
- `GET /api/v1/activity/stats` is treated as `{ total, blocked, allowed, top_blocked_domains }`.
- Config import dry-run is not exposed because the current handler does not implement it.
- Rule filtering search is client-side in the UI because the current handler only paginates.

## Known backend gaps noted by the UI

These are backend behaviours, not frontend bugs:

- Several update handlers use `COALESCE`, which means clearing previously set nullable fields may not persist as expected.
- Clearing an existing client group assignment currently depends on backend null-handling.

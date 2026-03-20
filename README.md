<div align="center">

<img src="https://raw.githubusercontent.com/openfiltr/.github/main/assets/logo.svg" alt="OpenFiltr logo" width="120" />

# OpenFiltr Dashboard

**Standalone Ionic Vue administrative dashboard for the OpenFiltr backend API.**

[![Licence: AGPLv3](https://img.shields.io/badge/Licence-AGPLv3-7C3AED.svg)](LICENSE)

> ⚠️ OpenFiltr dashboard is in active development.
> This project was bootstrapped with the assistance of AI.

</div>

# What is OpenFiltr Dashboard

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
- `ghcr.io/openfiltr/openfiltr-dashboard:latest`

The compose file supports both published-image and local-build workflows for the dashboard service:

- `docker compose -f docker-compose.example.yml up -d` uses `ghcr.io/openfiltr/openfiltr-dashboard:latest`
- `docker compose -f docker-compose.example.yml up --build` rebuilds the dashboard locally from this repository and tags it as `ghcr.io/openfiltr/openfiltr-dashboard:latest`

Start the stack with:

```bash
docker compose -f docker-compose.example.yml up -d
```

The backend remains available on port `3000`, while the dashboard is served on port `8080`.

To force a local rebuild instead of using the published image:

```bash
docker compose -f docker-compose.example.yml up --build
```

Compose example:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: openfiltr-postgres
    environment:
      POSTGRES_DB: openfiltr
      POSTGRES_USER: openfiltr
      POSTGRES_PASSWORD: openfiltr
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U openfiltr -d openfiltr"]
      interval: 10s
      timeout: 5s
      retries: 5

  openfiltr:
    image: ghcr.io/openfiltr/openfiltr:latest
    container_name: openfiltr
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "53:5353/udp"
      - "53:5353/tcp"
      - "3000:3000"
    environment:
      OPENFILTR_DATABASE_URL: postgres://openfiltr:openfiltr@postgres:5432/openfiltr?sslmode=disable
    volumes:
      - openfiltr-config:/etc/openfiltr
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/v1/system/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  openfiltr-dashboard:
    image: ghcr.io/openfiltr/openfiltr-dashboard:latest
    build:
      context: .
    container_name: openfiltr-dashboard
    depends_on:
      openfiltr:
        condition: service_healthy
    ports:
      - "8080:80"
    environment:
      OPENFILTR_BACKEND_ORIGIN: http://openfiltr:3000
    restart: unless-stopped

volumes:
  postgres-data:
  openfiltr-config:
```

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

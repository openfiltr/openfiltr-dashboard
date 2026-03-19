## Repository Truth

- This repository is the OpenFiltr Dashboard: a standalone Ionic Vue administrative frontend for the OpenFiltr backend API.
- Treat the Vue components, Pinia stores, API client, router, TypeScript types, Dockerfile, nginx config, and workflow files as the source of truth.
- Do not assume the Go backend API has changed unless confirmed externally.
- Do not add direct database access; all data flows through the backend API over HTTP.

## Working Rules

- Use British English in code comments, docs, and commit messages.
- Be direct. Do not pad explanations or hide obvious risks.
- Prefer small, scoped changes over wide speculative refactors.
- Use `rg` for search.
- Sign commits with `-s`.
- Branch names should use the `codex/` prefix.

## Repo Map

- `src/api/`: API client modules (one file per backend resource group)
- `src/components/`: Reusable Vue components
- `src/layouts/`: Page layout components
- `src/router/`: Vue Router configuration
- `src/stores/`: Pinia state stores
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility helpers
- `src/views/`: Page-level Vue components
- `src/css/`: Global styles
- `docker/nginx.conf.template`: nginx configuration template used at container start-up
- `Dockerfile`: Multi-stage build — Node build stage, then nginx serve stage
- `docker-compose.example.yml`: Compose example running the dashboard alongside the Go backend and PostgreSQL
- `.env.example`: Environment variable template
- `.github/workflows/`: CI (Docker build) and release (publish to GHCR) workflows

## Stack Notes

- Ionic Framework with Vue 3.
- Pinia for state management.
- Vue Router for client-side routing.
- TypeScript throughout; do not introduce plain JS files.
- Vite as the build tool.
- nginx serves the compiled SPA in production and reverse-proxies `/api/v1` and `/openapi.yaml` to the backend.
- `OPENFILTR_BACKEND_ORIGIN` is the only required runtime environment variable.

## Backend Integration Notes

- Integer-backed `enabled` fields from the API are normalised to booleans in the frontend model layer.
- `GET /api/v1/activity/stats` is treated as `{ total, blocked, allowed, top_blocked_domains }`.
- Rule filtering search is client-side because the backend handler only paginates.
- The browser uses bearer-token auth; the UI does not rely on cross-origin cookie sessions.

## Worktrees

- Local isolated work should go under `.worktrees/`.
- `.worktrees/` is intentionally ignored in `.gitignore`.
- Use a worktree when starting non-trivial feature work off `origin/main` so you do not contaminate another branch.

## Branching Strategy

- Start non-trivial work from the latest `origin/main`, not from an old feature branch.
- Create one scoped branch per concern under the `codex/` prefix.
- Open PRs into `main`; do not stack unrelated work onto an already-open feature PR.
- If a PR branch drifts, merge or rebase the latest `main` into that branch before adding more work.
- Keep temporary rescue branches exceptional. If branch rules block direct updates, use a replacement branch only long enough to unblock the original PR or replace it cleanly.

## Merge Gates

- `main` is protected by a repository ruleset. Assume direct pushes to `main` are forbidden.
- Changes to `main` must go through a PR and use squash merge.
- PR threads must be resolved before merge.
- The required checks on `main` are:
  - `Docker Build`
- The ruleset also enforces strict status checks, linear history, no force-pushes, and no branch deletion on `main`.

## Verification

- Parse YAML after workflow edits.
- Run `npm run build` to verify the TypeScript compilation and Vite bundle before raising a PR.
- Lint with `npm run lint` if the script is present in `package.json`.
- For Docker verification: `docker build -t openfiltr-dashboard .`

## Current Risks

- README and inline comments may lag behind the actual component structure.
- Backend API shape changes are not automatically reflected in the TypeScript types; update `src/types/` and `src/api/` together.
- CI currently only validates a Docker build; no unit or end-to-end test jobs run on PRs.

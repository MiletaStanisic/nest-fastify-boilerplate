# nest-fastify-boilerplate — Client Onboarding Console

NestJS + Fastify + TypeScript production-style API for a Client Onboarding Console, with mock RBAC, pipeline stage transitions, and strict lint/test/build governance.

## Quick start

```bash
npm install
npm run skills:sync
npm run skills:verify
npm run dev          # listens on PORT (default 4100)
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local server on `PORT` (default `4100`) |
| `npm run lint` | ESLint with TypeScript strict rules |
| `npm run format:check` | Prettier formatting check |
| `npm run test` | Vitest integration tests (SWC transformer) |
| `npm run build` | Emit `dist/` via `tsc` |
| `npm run skills:sync` | Sync optional vendor skills from lockfile |
| `npm run skills:verify` | Verify required local backend skills (and optional vendor skills) |
| `npm run docker:up` | Start API + Postgres + Redis with Docker Compose |
| `npm run docker:down` | Stop Docker Compose services |
| `npm run docker:logs` | Tail Docker app logs |
| `npm run docker:validate` | Validate compose syntax |

## Module map

```
src/
├── auth/                  # RolesGuard registered as APP_GUARD (global)
├── common/
│   ├── api.ts             # ok(), list(), validateBody() helpers
│   ├── role.enum.ts       # Role: admin | manager | member
│   ├── roles.decorator.ts # @Roles(...) metadata decorator
│   └── roles.guard.ts     # RolesGuard — reads x-role header
├── clients/               # CRUD for client records
├── onboarding-pipeline/   # Board view + stage-transition guard
├── milestones/            # Milestones per client
├── notes/                 # Notes per client
├── activity/              # Append-only activity feed
├── dashboard/             # Aggregated summary
└── config/env.ts          # Zod-validated env vars
```

## Endpoints

| Method | Path | Min role | Description |
|--------|------|----------|-------------|
| GET | `/health` | — | Service liveness |
| GET | `/clients` | — | List all clients |
| GET | `/clients/:id` | — | Get single client |
| POST | `/clients` | manager | Create client |
| PATCH | `/clients/:id` | manager | Update client fields |
| DELETE | `/clients/:id` | admin | Delete client |
| GET | `/pipeline/board` | — | Clients grouped by stage |
| PATCH | `/pipeline/:clientId/stage` | manager | Advance pipeline stage (validated transitions) |
| POST | `/clients/:id/milestones` | manager | Add milestone |
| POST | `/clients/:id/notes` | member | Add note |
| GET | `/dashboard/summary` | — | Counts by stage + recent activity |
| GET | `/activity-feed` | — | Chronological event log |

## Authentication (mock RBAC)

Pass the `x-role` header to identify the caller:

```
x-role: admin    # full access
x-role: manager  # create/update clients, milestones, pipeline
x-role: member   # create notes only
```

Routes guarded by `@Roles(...)` return **403 FORBIDDEN** when the header is
missing, invalid, or does not meet the required role.

## Pipeline stage transitions

Stages are strictly ordered. Only the following forward transitions are allowed:

```
discovery → security_review → integration → training → go_live
```

Attempting any other transition (skip, backward, or from terminal `go_live`) returns **400 INVALID_TRANSITION**.

## Response structure

All endpoints return deterministic JSON envelopes:

```jsonc
// Single item
{ "data": { ... } }

// Collection
{ "data": [...], "meta": { "total": 5 } }

// Error (4xx / 5xx)
{ "error": "ERROR_CODE", "message": "...", "issues": { ... } }
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `PORT` | `4100` | HTTP listen port |
| `DATABASE_URL` | `postgresql://app:app@localhost:5435/app?schema=public` | Local database URL |
| `REDIS_URL` | `redis://localhost:6381` | Local Redis URL |

## Docker local dev

```bash
cp .env.example .env
npm run docker:up
```

Default containerized stack:

- API: `http://localhost:4100`
- Postgres: `localhost:5435`
- Redis: `localhost:6381`

## Integration notes

- **SWC transformer** is configured in `vitest.config.ts` via `unplugin-swc` to emit `emitDecoratorMetadata`, required for NestJS constructor DI to work in the Vitest environment.
- **In-memory store**: all data lives in service-level arrays seeded at startup. No database required.
- **Zod validation** is used throughout — no `class-validator` dependency.
- Guards are applied globally via `APP_GUARD`; public routes require no decorator.

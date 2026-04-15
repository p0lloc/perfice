---
name: coding-conventions
description: "Internal reference skill — coding standards and patterns for developer agents. Not user-invocable."
---

# Coding Conventions

Shared knowledge preloaded into developer agents. Follow these when implementing features.

## Tech Stack

- **Framework**: Svelte 5 + Vite (client), Gofiber v2 (server)
- **ORM**: None (MongoDB direct driver server-side, Dexie v4/IndexedDB client-side)
- **Auth**: Custom JWT (golang-jwt/jwt/v5 + gofiber/contrib/jwt, Argon2 hashing)
- **Testing**: Vitest (client), go test (server) — `cd client && npx vitest run`
- **Language**: TypeScript (client), Go (server)
- **Architecture**: Feature-sliced layered (client), MVC-like layered (server)
- **Docs reference**: `docs/`

## Architecture Layers

### Client (`client/src/`)

| Layer | Directory | Responsibility |
|---|---|---|
| Model | `src/model/` | Pure TypeScript types, enums, domain data shapes (no logic) |
| DB | `src/db/` | Dexie (IndexedDB) collection implementations, migrations |
| Services | `src/services/` | Business logic, domain operations, observers/events |
| Stores | `src/stores/` | Svelte reactive state wrappers bridging services to UI |
| Views | `src/views/` | Svelte UI components organized by feature |
| Components | `src/components/` | Shared/reusable UI components |

### Server (`server/{service}/internal/`)

| Layer | Directory | Responsibility |
|---|---|---|
| Model | `internal/model/` | Go structs for domain entities and DTOs |
| Collection | `internal/collection/` | MongoDB CRUD wrappers |
| Service | `internal/service/` | Business logic, cross-service orchestration |
| Controller | `internal/controller/` | HTTP (Fiber) request handling |
| App | `internal/app.go` | Composition root (manual DI) |

### Dependency Rules

**Client:**
- `views` → `stores` → `services` → `db` + `model`
- `model` has no inward dependencies (pure types only)
- `db` implements interfaces defined in `services` (dependency inversion)
- `stores` import from `services` but NOT from `db` directly
- Import alias `@perfice` maps to `src/`

**Server:**
- `controller` → `service` + `model`
- `service` → `collection` + `model`
- `collection` → `model`
- Controllers do NOT import collections directly — only services
- Cross-service communication via gRPC (`proto/`) or Kafka — never direct package imports

## Code Style

- Prefer project-established type/interface conventions
- No `any` — use proper types
- No unnecessary `_` prefixes for unused vars
- Secrets via config providers only — never hardcoded, never logged
- DTOs match API schemas and tech-decomposition acceptance criteria
- Database queries use parameter binding — no dynamic SQL or string interpolation

## Testing

- **TDD**: RED → GREEN → REFACTOR
- Run tests: `cd client && npx vitest run`
- Lint: (none configured)
- Types: `cd client && npm run check`
- Test patterns reference: `client/tests/`
- Arrange-Act-Assert pattern, descriptive test names
- Proper mocking of data-access layer in unit tests

## Implementation Rules

- Read task document FIRST — it's the source of truth for WHAT to build
- Minimal code — only what tests require
- No scope creep — implement exactly the assigned work item
- No over-engineering or speculative abstractions
- Follow existing codebase patterns — new code should look like it belongs
- No git writes unless explicitly approved by orchestrator

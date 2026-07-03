# MotoClub Backend

A Go REST API for the MotoClub app: gallery, events, announcements, member
registration/approval, and Google-based auth. Built with Gin, sqlc + pgx,
goose migrations, and PostgreSQL. Everything runs in containers — **no local Go
toolchain is required**.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project layout](#project-layout)
- [Prerequisites](#prerequisites)
- [Running locally](#running-locally)
- [Configuration](#configuration)
- [Database & migrations](#database--migrations)
- [Testing](#testing)
- [Regenerating code (sqlc & mocks)](#regenerating-code-sqlc--mocks)
- [API overview](#api-overview)
- [Auth model](#auth-model)
- [Conventions](#conventions)
- [Makefile targets](#makefile-targets)

---

## Tech stack

| Concern            | Choice                                   |
| ------------------ | ---------------------------------------- |
| Language / runtime | Go 1.25                                  |
| HTTP framework     | [Gin](https://github.com/gin-gonic/gin)  |
| DB access          | [sqlc](https://sqlc.dev) + [pgx v5](https://github.com/jackc/pgx) |
| Migrations         | [goose](https://github.com/pressly/goose) |
| Auth               | `golang-jwt/jwt/v5` + Google ID-token verification (`google.golang.org/api/idtoken`) |
| Tests / mocks      | `testify` + [mockery](https://vektra.github.io/mockery/) |
| Database           | PostgreSQL 16                            |
| Container images   | Multi-stage build → distroless runtime   |

## Architecture

Clean, layered design. Dependencies point inward and each layer talks to the
one below through an interface, so business logic can be unit-tested without a
database or network:

```
HTTP request
   │
   ▼
handler ──▶ service ──▶ repository (interface) ──▶ repository/postgres ──▶ sqlc ──▶ pgx ──▶ Postgres
   │            │
   │            └─ depends only on repository + auth interfaces (no Gin/pgx/sqlc)
   └─ binds/validates the request, maps sentinel errors to HTTP status codes
```

- **`handler`** — Gin handlers. Bind + validate, call a service, map results and
  sentinel errors (`apperr`) to HTTP responses. No business logic.
- **`middleware`** — `JWTAuth` (parse token, reject expired/revoked), `RequireRole`,
  and `RequireSelfOrRole` (a member may only read their own resource).
- **`service`** — business rules (approval flow, role/ownership checks,
  last-superadmin guard). Returns sentinel errors.
- **`repository`** — persistence interfaces; **`repository/postgres`** implements
  them over sqlc-generated queries. The only package that imports `db/sqlc`.
- **`auth`** — JWT issue/parse and the Google verifier (behind an interface).
- **`domain`** — plain entities and enums, imported everywhere, importing nothing.

## Project layout

```
backend/
├── cmd/api/            # main() — wiring only
├── internal/
│   ├── config/         # env parsing
│   ├── server/         # Gin router assembly + graceful HTTP server
│   ├── handler/        # HTTP handlers + request/response DTOs
│   ├── middleware/     # auth + role gating
│   ├── service/        # business logic (+ Servicer interfaces for handlers)
│   ├── repository/      # persistence interfaces
│   │   └── postgres/    # sqlc-backed implementations
│   ├── domain/         # entities, Role/Status enums, Principal
│   ├── auth/           # JWT manager + Google verifier
│   ├── httpx/          # JSON error envelope + principal context helpers
│   ├── apperr/         # sentinel errors (NotFound, Forbidden, ...)
│   └── util/           # Clock + Asia/Jakarta date formatting
├── db/
│   ├── migrations/     # goose SQL migrations
│   ├── queries/        # sqlc input queries
│   └── sqlc/           # generated code (do not edit)
├── scripts/coverage.sh # unit-test coverage gate (>= 95%)
├── Dockerfile          # multi-stage build (api + goose)
├── compose.yaml        # db + migrate + api
├── Makefile            # all dev commands (containerized)
├── sqlc.yaml
└── .mockery.yaml
```

## Prerequisites

- **Podman** (or Docker) and its Compose provider. The Makefile defaults to
  `podman` / `podman compose`.
- To use Docker instead, override the runner:
  `make up RUNNER=docker COMPOSE="docker compose"`.

Podman note: the bundled `docker compose` provider needs the podman socket:

```sh
systemctl --user start podman.socket
export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
```

## Running locally

Bring up Postgres, run migrations, and start the API in one command:

```sh
make up          # builds images, starts db + migrate + api (detached)
make logs        # tail the api logs
make down        # stop and remove containers (keeps the data volume)
```

The API listens on **http://localhost:8080**. Quick check:

```sh
curl http://localhost:8080/healthz        # {"status":"ok"}
```

To run the API process directly against a database (without building the image),
copy `.env.example` to `.env` and:

```sh
make run         # go run ./cmd/api on the host network, using .env
```

### Try the API

Import [`../MotoClub.postman_collection.json`](../MotoClub.postman_collection.json)
into Postman. Set the `baseUrl` variable (defaults to `http://localhost:8080`).
`Register` and `Login` require a **real Google ID token** (the backend verifies
it against Google) — see [Auth model](#auth-model). Once `Login` succeeds it
auto-saves the JWT into the `token` collection variable for the other requests.

## Configuration

Configuration comes from the environment (see [`.env.example`](.env.example)):

| Variable           | Required | Default | Notes                                            |
| ------------------ | :------: | ------- | ------------------------------------------------ |
| `PORT`             |    no    | `8080`  | HTTP listen port                                 |
| `DATABASE_URL`     |   yes    | —       | `postgres://user:pass@host:5432/db?sslmode=disable` |
| `JWT_SECRET`       |   yes    | —       | HMAC signing key for application JWTs            |
| `GOOGLE_CLIENT_ID` |   yes    | —       | OAuth client id used to verify Google ID tokens  |
| `TOKEN_TTL_HOURS`  |    no    | `24`    | JWT lifetime                                     |
| `TZ`               |    no    | —       | Set to `Asia/Jakarta` in containers              |
| `LOG_LEVEL`        |    no    | `info`  | `debug` \| `info` \| `warn` \| `error`           |
| `LOG_FORMAT`       |    no    | `json`  | `json` \| `text` (text is easier to read locally)|

> `GOOGLE_CLIENT_ID` **must equal the `aud` claim** of the Google ID tokens your
> frontend sends. If it doesn't, `idtoken` verification fails and `/login` and
> `/register` return `401 unauthorized` — see [Troubleshooting](#troubleshooting).

## Database & migrations

- Migrations live in [`db/migrations/`](db/migrations/) and run via **goose**.
- In `make up`, a one-shot `migrate` service applies them before the API starts.
- Run them manually (needs `GOOSE_DRIVER` and `GOOSE_DBSTRING` in your env — the
  `.env.example` has both):

```sh
make migrate-up
make migrate-status
make migrate-down                       # roll back the last migration
make migrate-create name=add_something  # scaffold a new migration
```

**All deletions are soft** (`deleted_at`), and every table carries audit columns:
`created_at`, `last_updated_at` (auto-bumped by a trigger on update), and
`deleted_at`. All date/time columns are `timestamptz`; API responses render them
as `YYYY-MM-DD` in Asia/Jakarta.

## Testing

Unit tests run fully in-memory with mocked repositories/services (no DB needed):

```sh
make test         # runs unit tests + enforces the >= 95% coverage gate
make cover-html   # same, plus an HTML report at cover.html
make lint         # go vet
```

The coverage gate is defined in [`scripts/coverage.sh`](scripts/coverage.sh). It
measures only the hand-written business-logic packages (`service`, `handler`,
`middleware`, `auth`, `util`, `config`, `domain`, `httpx`) and excludes
generated code, mocks, wiring (`cmd`, `server`), and the thin DB adapter layer.
The build fails if total coverage drops below **95%** (currently ~99%).

To run a single package or test, invoke `go test` in the same container the
Makefile uses:

```sh
podman run --rm -v "$PWD":/src:z -w /src \
  -v motoclub-gomod:/go/pkg/mod -v motoclub-gocache125:/root/.cache/go-build \
  docker.io/library/golang:1.25 go test ./internal/service/... -run TestLogin -v
```

## Regenerating code (sqlc & mocks)

Both run in containers, so no local tooling is needed:

```sh
make sqlc     # regenerate db/sqlc/** from db/queries/**  (after editing SQL)
make mocks    # regenerate mockery mocks (after changing an interface)
```

Regenerate whenever you change a query in `db/queries/`, the schema in
`db/migrations/`, or a repository/service/auth interface.

## API overview

Base URL: `http://localhost:8080`. All endpoints except `POST /register` and
`POST /login` require `Authorization: Bearer <jwt>`.

| Method | Path                             | Required role            | Purpose                          |
| ------ | -------------------------------- | ------------------------ | -------------------------------- |
| POST   | `/register`                      | public                   | Create member (PENDING_APPROVAL) |
| POST   | `/login`                         | public                   | Verify Google token → issue JWT  |
| POST   | `/logout`                        | any                      | Revoke current JWT               |
| GET    | `/gallery`                       | member, admin, superadmin| List gallery items               |
| GET    | `/events?startFrom=YYYY-MM-DD`   | member, admin, superadmin| List events                      |
| GET    | `/event/{id}`                    | member, admin, superadmin| Event detail                     |
| GET    | `/announcements?startFrom=...`   | member, admin, superadmin| List announcements               |
| GET    | `/members/{id}/profile`          | self, or admin/superadmin| Member profile (self only for members) |
| GET    | `/members/registration/count`    | admin, superadmin        | Count pending registrations      |
| GET    | `/members/registration`          | admin, superadmin        | List pending registrations       |
| POST   | `/members/{id}/status`           | admin, superadmin        | Approve / reject registration    |
| GET    | `/members`                       | admin, superadmin        | List all members                 |
| POST   | `/members/{id}`                  | superadmin               | Update member role (ADMIN/MEMBER)|
| DELETE | `/members/{id}`                  | admin, superadmin        | Soft-delete member               |
| POST   | `/events`                        | admin, superadmin        | Create event                     |
| PUT    | `/events/{id}`                   | admin, superadmin        | Update event                     |
| DELETE | `/events/{id}`                   | admin, superadmin        | Soft-delete event                |
| POST   | `/gallery`                       | admin, superadmin        | Create gallery item (link)       |
| DELETE | `/gallery/{id}`                  | admin, superadmin        | Soft-delete gallery item         |
| POST   | `/announcements`                 | admin, superadmin        | Create announcement              |
| PUT    | `/announcements/{id}`            | admin, superadmin        | Update announcement              |
| DELETE | `/announcements/{id}`            | admin, superadmin        | Soft-delete announcement         |
| GET    | `/healthz`                       | public                   | Liveness probe                   |

Error responses use a uniform envelope: `{ "error": "message" }`.

## Auth model

- **Register / Login** take a `googleToken`, which the backend verifies against
  Google using `GOOGLE_CLIENT_ID`. The token's email must match the request's
  `email`. Because verification is real, you need a genuine Google ID token to
  exercise these endpoints (e.g. from Google Sign-In on the frontend).
- **Login** issues an HMAC-signed JWT (claims: member id, role, jti, exp). Any
  non-soft-deleted member may log in; the frontend uses the `status` field to
  decide what to show pending/rejected members.
- **Logout** records the token's `jti` in `revoked_tokens`; the auth middleware
  rejects revoked tokens until they expire. Prune expired rows with
  `make prune-tokens`.
- **Roles:** `visitor`, `member`, `admin`, `superadmin`. Role checks are enforced
  by middleware; data-dependent rules (an admin may only delete plain members;
  the last superadmin cannot be deleted) live in the service layer.
- **Visitors** are registered-but-unapproved members: `POST /register` creates a
  member with role `visitor` and status `PENDING_APPROVAL`. A visitor may log in
  and may **only view their own profile** (`GET /members/{id}/profile`) and log
  out — gallery, events and announcements require role `member` or above.
  Approving a registration (`POST /members/{id}/status` with `APPROVE`) promotes
  the member from `visitor` to `member`; rejecting leaves them a `visitor`.

### Bootstrapping the first superadmin

Registration always creates a plain `member`. Promote the first superadmin
directly in the database (human intervention), e.g.:

```sh
# with the stack running
podman exec -it backend-db-1 psql -U motoclub -d motoclub \
  -c "UPDATE members SET role='superadmin', status='APPROVED' WHERE email='you@example.com';"
```

## Observability

The API emits one structured log line (`log/slog`) per request with method,
path, status, latency and client IP, plus the underlying error for any failed
request. Control it with `LOG_LEVEL` and `LOG_FORMAT`. Tail it with `make logs`.

Because client responses are sanitized (a `500` shows `internal server error`;
an auth failure shows `unauthorized`), the **real cause is always in the logs**:

```json
{"level":"WARN","msg":"request","method":"POST","path":"/register","status":401,"error":"Error #01: unauthorized"}
{"level":"WARN","msg":"google id token validation failed","error":"idtoken: audience provided does not match aud claim in the JWT","expected_aud":"dev-google-client-id.apps.googleusercontent.com"}
```

## Troubleshooting

**`/register` or `/login` returns `{"error":"unauthorized"}`.** The Google ID
token failed verification. Check `make logs` for a `google id token validation
failed` line — the `error` field gives the exact reason:

- *"audience provided does not match aud claim in the JWT"* → `GOOGLE_CLIENT_ID`
  doesn't match the token's `aud`. Set it to the OAuth client ID your frontend
  uses (the `expected_aud` field in the log shows what the server currently
  expects). With compose: `GOOGLE_CLIENT_ID=<your-id>.apps.googleusercontent.com make up`.
- *"token expired"* → Google ID tokens live ~1 hour; get a fresh one.
- *"unable to decode JWT / invalid signature"* → the `googleToken` value is not a
  well-formed Google ID token.

**No logs at all.** Ensure you're tailing the API container (`make logs`) and
that `LOG_LEVEL` isn't set above the level you expect.

## Conventions

- Dates in requests/responses are `YYYY-MM-DD` interpreted in **Asia/Jakarta**.
- IDs are returned as strings in JSON.
- `startFrom` query params are optional and inclusive; absent means "no lower
  bound".
- Soft deletes everywhere; reads always filter `deleted_at IS NULL`.

## Makefile targets

Run `make help` for the full list. Common ones:

| Target             | Description                                    |
| ------------------ | ---------------------------------------------- |
| `make up`          | Build & start db + migrate + api               |
| `make down`        | Stop & remove containers (keep the data volume)|
| `make logs`        | Tail the api logs                              |
| `make run`         | Run the api locally against `.env`             |
| `make test`        | Unit tests + 95% coverage gate                 |
| `make cover-html`  | Coverage report (`cover.html`)                 |
| `make lint`        | `go vet`                                        |
| `make sqlc`        | Regenerate sqlc code                            |
| `make mocks`       | Regenerate mockery mocks                        |
| `make migrate-up`  | Apply migrations                               |
| `make migrate-down`| Roll back the last migration                   |
| `make prune-tokens`| Delete expired revoked tokens                  |

> All Go/sqlc/mockery commands run inside containers, so the only thing you need
> installed is Podman (or Docker). Override the runner with `RUNNER=docker
> COMPOSE="docker compose"`.

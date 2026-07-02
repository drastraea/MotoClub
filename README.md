# MotoClub

Backend and supporting assets for the MotoClub app.

## Contents

- **[`backend/`](backend/)** — the Go REST API (Gin + sqlc/pgx + PostgreSQL).
  See [`backend/README.md`](backend/README.md) for architecture, how to run it
  locally, testing, migrations, and the full API reference.
- **[`MotoClub.postman_collection.json`](MotoClub.postman_collection.json)** — a
  Postman collection for every endpoint. Import it, set the `baseUrl` variable
  (default `http://localhost:8080`), and run `Login` to auto-populate the auth
  token used by the other requests.

## Quick start

```sh
cd backend
make up      # starts Postgres, runs migrations, and starts the API on :8080
make test    # runs unit tests with the >=95% coverage gate
```

Requires Podman (or Docker) — no local Go toolchain needed. Full instructions
are in [`backend/README.md`](backend/README.md).

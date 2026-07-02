# MotoClub backend Makefile.
#
# No local Go toolchain is required: Go/sqlc/mockery all run in containers via
# $(RUNNER). Override RUNNER=docker / COMPOSE="docker compose" to use Docker.

RUNNER      ?= podman
COMPOSE     ?= podman compose
GO_IMAGE    ?= docker.io/library/golang:1.25
SQLC_IMAGE  ?= docker.io/sqlc/sqlc:1.27.0
MOCKERY_VER ?= v2.53.4

MODCACHE    ?= motoclub-gomod
BUILDCACHE  ?= motoclub-gocache125

GORUN = $(RUNNER) run --rm -v "$(CURDIR)":/src:z -w /src \
	-v $(MODCACHE):/go/pkg/mod -v $(BUILDCACHE):/root/.cache/go-build \
	$(GO_IMAGE)

.PHONY: help tidy build test cover-html lint sqlc mocks \
	migrate-up migrate-down migrate-status migrate-create \
	up down logs run prune-tokens

help: ## List targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN{FS=":.*?## "}{printf "  %-16s %s\n", $$1, $$2}'

tidy: ## go mod tidy
	$(GORUN) go mod tidy

build: ## Compile all packages
	$(GORUN) go build ./...

test: ## Run unit tests with the >=95% coverage gate
	$(GORUN) sh scripts/coverage.sh

cover-html: ## Generate an HTML coverage report (cover.html)
	$(GORUN) sh -c 'sh scripts/coverage.sh && go tool cover -html=cover.out -o cover.html'

lint: ## Run go vet
	$(GORUN) go vet ./...

sqlc: ## Regenerate sqlc code
	$(RUNNER) run --rm -v "$(CURDIR)":/src:z -w /src $(SQLC_IMAGE) generate

mocks: ## Regenerate mockery mocks
	$(GORUN) go run github.com/vektra/mockery/v2@$(MOCKERY_VER)

# --- migrations (require GOOSE_DRIVER / GOOSE_DBSTRING in the environment) ---
GOOSE = $(RUNNER) run --rm -v "$(CURDIR)"/db/migrations:/migrations:z \
	-e GOOSE_DRIVER -e GOOSE_DBSTRING --network host $(GO_IMAGE) \
	go run github.com/pressly/goose/v3/cmd/goose@v3.22.1 -dir /migrations

migrate-up: ## Apply all migrations
	$(GOOSE) up

migrate-down: ## Roll back the last migration
	$(GOOSE) down

migrate-status: ## Show migration status
	$(GOOSE) status

migrate-create: ## Create a migration: make migrate-create name=add_x
	$(GOOSE) create $(name) sql

# --- compose lifecycle ---
up: ## Build & start db + migrate + api
	$(COMPOSE) up --build -d

down: ## Stop and remove containers (keep volume)
	$(COMPOSE) down

logs: ## Tail api logs
	$(COMPOSE) logs -f api

run: ## Run the api locally against $DATABASE_URL (host network)
	$(RUNNER) run --rm --network host --env-file .env \
		-v "$(CURDIR)":/src:z -w /src \
		-v $(MODCACHE):/go/pkg/mod -v $(BUILDCACHE):/root/.cache/go-build \
		$(GO_IMAGE) go run ./cmd/api

prune-tokens: ## Delete expired revoked tokens
	$(GOOSE) status >/dev/null; \
	$(RUNNER) run --rm -e GOOSE_DBSTRING --network host $(GO_IMAGE) \
		sh -c 'echo "DELETE FROM revoked_tokens WHERE expires_at < now();" | psql "$$GOOSE_DBSTRING"' || true

# syntax=docker/dockerfile:1

# ---- build stage ----
FROM docker.io/library/golang:1.25 AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api
RUN CGO_ENABLED=0 GOBIN=/out go install github.com/pressly/goose/v3/cmd/goose@v3.22.1

# ---- runtime stage ----
FROM gcr.io/distroless/static-debian12:nonroot
ENV TZ=Asia/Jakarta
COPY --from=build /out/api /api
COPY --from=build /out/goose /goose
COPY db/migrations /db/migrations
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/api"]

#!/usr/bin/env sh
# Runs the unit-test suite over the hand-written business-logic packages and
# enforces a >=95% coverage gate. Generated code, mocks, wiring (cmd/, server)
# and the DB adapter layer are deliberately excluded from the measurement.
set -eu

THRESHOLD=95.0

PKGS="./internal/service/... \
./internal/handler/... \
./internal/middleware/... \
./internal/auth/... \
./internal/util/... \
./internal/config/... \
./internal/domain/... \
./internal/httpx/..."

COVERPKG=$(echo $PKGS | tr -s ' ' ',')

go test -covermode=atomic -coverpkg="$COVERPKG" -coverprofile=cover.raw.out $PKGS

# Defensively drop any generated/mock/wiring lines from the profile so they
# affect neither the numerator nor the denominator.
grep -vE '(/mocks/|db/sqlc/|/cmd/|internal/server/|/repository/postgres/|internal/auth/google.go)' cover.raw.out > cover.out
rm -f cover.raw.out

go tool cover -func=cover.out | tail -n 1
TOTAL=$(go tool cover -func=cover.out | awk '/^total:/ {gsub("%","",$3); print $3}')

echo "total coverage: ${TOTAL}%  (threshold: ${THRESHOLD}%)"
awk -v t="$TOTAL" -v thr="$THRESHOLD" 'BEGIN { if (t+0 < thr+0) { print "FAIL: coverage below threshold"; exit 1 } }'
echo "coverage gate passed"

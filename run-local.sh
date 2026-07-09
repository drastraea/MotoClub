#!/usr/bin/env bash
# Run MotoClub (backend + frontend) locally with podman.
#   ./run-local.sh          # build + start everything
#   ./run-local.sh down      # stop and remove everything
#   ./run-local.sh logs      # follow logs
set -euo pipefail
cd "$(dirname "$0")"

# Point compose at the rootless podman socket (started on demand).
systemctl --user start podman.socket
export DOCKER_HOST="unix:///run/user/$(id -u)/podman/podman.sock"

case "${1:-up}" in
  up)
    podman compose -f backend/compose.yaml up --build -d
    podman compose -f frontend/compose.yaml up --build -d
    echo "→ frontend: http://localhost:3000   api: http://localhost:8080"
    ;;
  down)
    podman compose -f frontend/compose.yaml down
    podman compose -f backend/compose.yaml down
    ;;
  logs)
    podman compose -f backend/compose.yaml logs -f &
    podman compose -f frontend/compose.yaml logs -f
    ;;
  *)
    echo "usage: $0 [up|down|logs]" >&2; exit 1 ;;
esac

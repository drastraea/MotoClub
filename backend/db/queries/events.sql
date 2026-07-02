-- name: ListEvents :many
SELECT * FROM events
WHERE deleted_at IS NULL
  AND (sqlc.narg('start_from')::timestamptz IS NULL OR event_date >= sqlc.narg('start_from'))
ORDER BY event_date;

-- name: GetEventByID :one
SELECT * FROM events
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateEvent :one
INSERT INTO events (title, description, event_date, location)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateEvent :one
UPDATE events
SET title = $2, description = $3, event_date = $4, location = $5
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteEvent :execrows
UPDATE events
SET deleted_at = now()
WHERE id = $1 AND deleted_at IS NULL;

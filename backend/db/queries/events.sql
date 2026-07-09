-- name: ListEvents :many
SELECT * FROM events
WHERE deleted_at IS NULL
  AND (sqlc.narg('start_from')::timestamptz IS NULL OR event_date >= sqlc.narg('start_from'))
  AND (NOT sqlc.arg('public_only')::boolean OR is_public)
ORDER BY event_date;

-- name: GetEventByID :one
SELECT * FROM events
WHERE id = sqlc.arg('id') AND deleted_at IS NULL
  AND (NOT sqlc.arg('public_only')::boolean OR is_public);

-- name: CreateEvent :one
INSERT INTO events (title, description, event_date, location, is_public)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateEvent :one
UPDATE events
SET title = $2, description = $3, event_date = $4, location = $5, is_public = $6
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteEvent :execrows
UPDATE events
SET deleted_at = now()
WHERE id = $1 AND deleted_at IS NULL;

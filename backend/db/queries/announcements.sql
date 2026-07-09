-- name: ListAnnouncements :many
SELECT * FROM announcements
WHERE deleted_at IS NULL
  AND (sqlc.narg('start_from')::timestamptz IS NULL OR created_at >= sqlc.narg('start_from'))
  AND (NOT sqlc.arg('public_only')::boolean OR is_public)
ORDER BY created_at DESC;

-- name: CreateAnnouncement :one
INSERT INTO announcements (title, description, is_public)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateAnnouncement :one
UPDATE announcements
SET title = $2, description = $3, is_public = $4
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteAnnouncement :execrows
UPDATE announcements
SET deleted_at = now()
WHERE id = $1 AND deleted_at IS NULL;

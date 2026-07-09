-- name: ListGallery :many
SELECT * FROM gallery
WHERE deleted_at IS NULL
  AND (NOT sqlc.arg('public_only')::boolean OR is_public)
ORDER BY created_at DESC;

-- name: CreateGalleryItem :one
INSERT INTO gallery (link, is_public)
VALUES ($1, $2)
RETURNING *;

-- name: UpdateGalleryItem :one
UPDATE gallery
SET is_public = $2
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteGalleryItem :execrows
UPDATE gallery
SET deleted_at = now()
WHERE id = $1 AND deleted_at IS NULL;

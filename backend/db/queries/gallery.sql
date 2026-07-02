-- name: ListGallery :many
SELECT * FROM gallery
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: CreateGalleryItem :one
INSERT INTO gallery (link)
VALUES ($1)
RETURNING *;

-- name: SoftDeleteGalleryItem :execrows
UPDATE gallery
SET deleted_at = now()
WHERE id = $1 AND deleted_at IS NULL;

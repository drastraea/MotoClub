-- name: GetSiteContent :one
SELECT data FROM site_content WHERE id = 1;

-- name: UpsertSiteContent :exec
INSERT INTO site_content (id, data, last_updated_at)
VALUES (1, $1, now())
ON CONFLICT (id) DO UPDATE
SET data = EXCLUDED.data, last_updated_at = now();

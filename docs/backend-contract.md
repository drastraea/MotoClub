# Backend contract — pending work

Frontend is built against the shapes below. Backend agent implements them.
Until then the frontend falls back / shows a disabled state, no crashes.

---

## 1. Site content (landing page CMS)

Single JSON document, one row.

| Method | Path | Auth | Body / Response |
|---|---|---|---|
| `GET` | `/site-content` | public | `200` → `SiteContent` JSON |
| `PUT` | `/site-content` | admin + superadmin | body `SiteContent`, `204` |

Storage: `site_content (id int PK DEFAULT 1, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`.
`PUT` upserts the single row. `GET` returns `data` (or `404` if never written — frontend then uses code defaults).

`SiteContent` shape is the `SiteContent` type in `frontend/lib/site-content.ts`
(`hero`, `ticker`, `about`, `activities`, `benefits`, `contact`, `join_cta`).
Treat it as an opaque blob — no per-field columns.

---

## 2. New member fields — motorbike details + rider photo

Add to `members` (all `NOT NULL`, mirror `motorbike_selfie_link_path`):

| Column | Type | JSON key | Notes |
|---|---|---|---|
| `motorbike_brand` | text | `motorbikeBrand` | free text (e.g. "Honda") |
| `motorbike_type` | text | `motorbikeType` | free text (e.g. "CB150R") |
| `plate_number` | text | `plateNumber` | store trimmed + uppercased |
| `rider_photo_link_path` | text | `riderPhotoLinkPath` | URL from `POST /uploads`, closeup of the person |

Existing `motorbike_name` stays (bike nickname).

Wire through:
- migration + `sqlc generate`
- `domain.Member` (+4 fields)
- `POST /register` request DTO (+4, all required) + `CreateMember` query/params
- `profileResponse` / `toProfile` (+4)
- admin member detail (same `profileResponse`)

Frontend already sends the 4 new keys in the `/register` body and renders them
on the profile pages. Missing keys in the profile response just render "—".

---

## 3. Membership expiry + `EXPIRED` status (computed on read)

Add one column:

| Column | Type | JSON key | Notes |
|---|---|---|---|
| `membership_expires_at` | timestamptz NULL | `membershipExpiresAt` | set on approval = `approved_at + 3 years` |

**No enum/CHECK change.** `status` stays stored as
`PENDING_APPROVAL | APPROVED | REJECTED`. The API returns an *effective* status:

```
effectiveStatus(m) =
  (m.status == APPROVED && m.membership_expires_at != null && m.membership_expires_at < now())
    ? "EXPIRED"
    : m.status
```

Apply this in `toProfile`, the members list DTO, and anywhere `status` is
returned. Filtering by `?status=EXPIRED` must match on the computed value.

### Endpoints

| Method | Path | Auth | Effect |
|---|---|---|---|
| `POST` | `/members/:id/extend` | admin + superadmin | `membership_expires_at = max(now(), membership_expires_at) + 3 years`; `204` |
| `GET` | `/members?status=<PENDING_APPROVAL\|APPROVED\|REJECTED\|EXPIRED>` | admin + superadmin | optional filter on computed status |

On approval (`POST /members/:id/status` action `APPROVE`): also set
`membership_expires_at = now() + 3 years` (alongside `approved_at`).

### DTO additions

- `profileResponse`: `+ membershipExpiresAt *string` (Jakarta date, nullable), `status` = computed
- members list row (`MemberRow` on the FE): `+ status string`, `+ membership_expires_at string|null`
  — the list currently returns no `status` at all; add it.

Frontend behaviour when these are absent: status filter still renders, "Extend"
button calls the endpoint (404 → error toast), expiry shows "—".

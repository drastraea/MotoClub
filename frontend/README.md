This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend integration & configuration

The app talks to the Go backend (see `../backend`). All API calls go through the
typed client in [`lib/api.ts`](lib/api.ts); the base URL and Google client come
from [`lib/config.ts`](lib/config.ts), which reads two environment variables:

| Variable | Purpose | Local default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL — **differs between local and prod** | `http://localhost:8080` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client for Sign-In (must match the backend's `GOOGLE_CLIENT_ID`) | _(empty → Sign-In disabled)_ |

These are configured per-environment via Next.js's native env files, which it
loads automatically:

| File | Loaded for | Purpose |
| --- | --- | --- |
| [`.env.development`](.env.development) | `npm run dev` | Local dev (points at `http://localhost:8080`) |
| [`.env.production`](.env.production) | `npm run build` | Production build (your prod API URL) |
| `.env.local` | both (gitignored) | Personal overrides / secrets |

`NEXT_PUBLIC_*` values are inlined at **build** time. The production Docker image
uses `.env.production` by default; pass `--build-arg NEXT_PUBLIC_API_URL=…`
(as compose does for the local demo) to override it.

For local dev, run the backend first (`cd ../backend && make up`) so it's
reachable at `http://localhost:8080`. The backend allows the frontend origin via
CORS (`CORS_ALLOWED_ORIGINS`, default `http://localhost:3000`).

**What's wired:** login/register via Google Sign-In (`/login`, `/join`), logout,
events (list/detail/calendar), announcements, gallery, member profile, and the
admin panels (registration approve/reject, events/announcements/gallery CRUD,
member roles). **Not wired** (no backend endpoint yet): the public membership
**status** lookup and self-service **profile edit** — these keep placeholder
behavior and are marked with TODOs.

> Google Sign-In needs a real OAuth client whose authorized origins include
> `http://localhost:3000`, set via `NEXT_PUBLIC_GOOGLE_CLIENT_ID` **and** the
> backend's `GOOGLE_CLIENT_ID`. Without it the Sign-In button shows a
> "not configured" message.

## Running

Start the backend first (`cd ../backend && podman compose up --build -d`) so the
API is reachable at `http://localhost:8080`.

### Local

Native dev server (hot reload), reads `.env.development`:

```bash
cd frontend
npm install
npm run dev            # → http://localhost:3000, API http://localhost:8080
```

Or as a container (production build pointed at the local backend):

```bash
cd frontend
podman compose up --build -d     # → http://localhost:3000
podman compose logs -f web
podman compose down
```

### Production

Set your prod values in [`.env.production`](.env.production)
(`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`), then build & run. The
app is a self-contained Next.js server (`output: "standalone"`), listening on
`0.0.0.0:3000`.

Native:

```bash
cd frontend
npm ci
npm run build          # bakes in .env.production
npm run start          # serves on :3000
```

Docker (uses `.env.production`; override with `--build-arg` if needed):

```bash
cd frontend
podman build -t motoclub-frontend .
# or override the baked-in values:
podman build -t motoclub-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.motoclub.example \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com .

podman run -d -p 3000:3000 motoclub-frontend
```

`NEXT_PUBLIC_API_URL` must be the backend URL as seen from the **user's browser**,
and the backend's `FRONTEND_ORIGIN` must be this app's origin (for CORS).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

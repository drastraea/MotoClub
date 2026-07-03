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

## Running with Docker

The app is containerized as a self-contained Next.js production server (uses
`output: "standalone"`). No local Node toolchain is required — only Podman or
Docker.

```bash
# from the frontend/ directory
podman compose up --build -d     # or: docker compose up --build -d
```

Then open [http://localhost:3000](http://localhost:3000).

```bash
podman compose logs -f web       # tail logs
podman compose down              # stop and remove the container
```

To build/run the image without Compose:

```bash
podman build -t motoclub-frontend .
podman run --rm -p 3000:3000 motoclub-frontend
```

The container listens on port `3000` and binds `0.0.0.0`, so it is reachable at
`http://localhost:3000` on the host.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

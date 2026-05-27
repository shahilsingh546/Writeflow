# Writeflow

A full-stack writing app with a React frontend, a Cloudflare Workers API, Prisma, and shared Zod validation types.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Backend: Hono on Cloudflare Workers, Prisma, Prisma Accelerate, JWT auth
- Shared package: Zod schemas and TypeScript types in `common`
- Database: PostgreSQL through Prisma

## Project Structure

```txt
.
|-- backend   # Hono API deployed with Wrangler
|-- common    # Shared validation schemas and types
`-- frontend  # React + Vite client
```

## Getting Started

Install dependencies in each package:

```sh
cd common && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

Build the shared package when changing validation schemas:

```sh
cd common
npm run build
```

Run the backend locally:

```sh
cd backend
npm run dev
```

Run the frontend locally:

```sh
cd frontend
npm run dev
```

## Environment Variables

The backend expects these Cloudflare Worker bindings:

```txt
DATABASE_URL=
SECRET_KEY=
```

For local development, set them in `backend/.dev.vars`. For deployment, configure them as Cloudflare Worker secrets.

The frontend API base URL is currently configured in `frontend/src/config.ts`.

## Useful Scripts

```sh
# Frontend
cd frontend
npm run dev
npm run build
npm run lint
npm run preview

# Backend
cd backend
npm run dev
npm run deploy
npm run cf-typegen

# Shared package
cd common
npm run build
```

## API Overview

- `POST /api/v1/user/signup` creates a user and returns a JWT.
- `POST /api/v1/user/signin` signs in and returns a JWT.
- `GET /api/v1/blog/bulk` returns all posts.
- `GET /api/v1/blog/:id` returns one post.
- `POST /api/v1/blog` creates a post with a bearer token.
- `PUT /api/v1/blog` updates a post with a bearer token.

## Deployment

Deploy the backend with Wrangler:

```sh
cd backend
npm run deploy
```

Build the frontend before deploying it to your hosting provider:

```sh
cd frontend
npm run build
```

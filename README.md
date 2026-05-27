# Writeflow

A full-stack private publishing platform with authenticated writing, draft management, profiles, search, pagination, and owner-only post controls.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios
- Backend: Hono on Cloudflare Workers, Prisma, Prisma Accelerate, JWT auth
- Shared package: Zod schemas and TypeScript types in `common`
- Database: PostgreSQL through Prisma

## Features

- Secure authentication with hashed passwords and expiring JWT sessions.
- Protected frontend and backend routes for reading, writing, editing, and profile access.
- User-owned post management with create, edit, delete, draft, publish, and unpublish flows.
- Markdown editor with preview mode, subtitle support, validation, and reading time calculation.
- My Posts dashboard with status filters, search, empty states, and pagination.
- Published feed with search and "Load more" pagination.
- User profile page and public author pages for published posts.
- Centralized API errors, proper HTTP status codes, and basic Cloudflare Worker rate limiting.

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

Generate Prisma Client after schema changes:

```sh
cd backend
npx prisma generate
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

- `POST /api/v1/user/signup` creates a user with a hashed password and returns a JWT.
- `POST /api/v1/user/signin` verifies credentials and returns a JWT.
- `GET /api/v1/user/me` returns the signed-in user's profile.
- `PUT /api/v1/user/me` updates the signed-in user's profile.
- `GET /api/v1/blog/bulk` returns paginated published posts with search/filter query params.
- `GET /api/v1/blog/mine` returns paginated posts owned by the signed-in user.
- `GET /api/v1/blog/author/:id` returns an author's published posts.
- `GET /api/v1/blog/:id` returns one post and blocks private drafts from other users.
- `POST /api/v1/blog` creates a post with a bearer token.
- `PUT /api/v1/blog` updates only the signed-in user's own post.
- `DELETE /api/v1/blog/:id` deletes only the signed-in user's own post.

## Database

Prisma migrations live in `backend/prisma/migrations`. The schema includes users, bios, posts, subtitles, published/draft status, ownership relations, and timestamps.

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

# simple-survey-web

Admin portal for the Sky World Survey Platform. Built with React, TypeScript, Vite, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- The `simple-survey-api` running locally (or deployed)

## Installation

```bash
npm install
```

## Running locally

```bash
# Copy and edit environment
cp .env.example .env
# Defaults to /api/proxy (works with Vercel serverless proxy)
# Optional for local Vite dev proxy target:
# VITE_PROXY_TARGET=http://localhost:8181

npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Technologies used

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios (HTTP client)
- fast-xml-parser (XML ↔ JS)
- react-router-dom v6

## Pages

| Route | Description |
|---|---|
| `/login` | Admin sign-in |
| `/surveys` | Survey list — create, edit, delete |
| `/surveys/:id/questions` | Question management for a survey |
| `/surveys/:id/responses` | Paginated responses with email filter + certificate download |

## Assumptions

- The API returns XML for all survey/question/response endpoints.
- Auth endpoints (`/api/auth/login`) accept XML and return JSON.
- Only ADMIN-role users can access this portal; if the JWT returns a non-admin role the portal still works — enforcement is on the API side.
- `VITE_API_BASE_URL` defaults to `/api/proxy` so browser calls stay same-origin over HTTPS.
- Vercel serverless function `api/proxy/[...path].ts` forwards requests to the upstream HTTP API.
- For local development, Vite proxies `/api/proxy/*` to `VITE_PROXY_TARGET` and rewrites to `/simple-survey-api/*`.

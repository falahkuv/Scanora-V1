# Scanora API

RESTful API backend for Scanora (AI-powered fruit freshness detection web app).

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Setup

1. Install dependencies:
   - `npm install`
2. Copy environment file:
   - `cp .env.example .env`
3. Update `.env` values (DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN).

## Prisma

- Generate Prisma client:
  - `npm run prisma:generate`
- Run migrations (ask for confirmation before running):
  - `npm run prisma:migrate`

## Run the server

- Development:
  - `npm run dev`
- Production:
  - `npm start`

## API Response Format

All endpoints return:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/scan`
- `GET /api/scan/history`
- `GET /api/scan/history/:id`
- `DELETE /api/scan/history/:id`
- `GET /api/inventory`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`
- `DELETE /api/inventory/:id`

## Notes

- Protected routes require `Authorization: Bearer <token>`
- `POST /api/scan` returns a mock response until the AI service is connected

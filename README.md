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

## Run the AI service (FastAPI)

1. Ensure the model file exists:
  - `fastapi/fruit_model.keras`
2. Activate the Python venv:
  - `source .venv/bin/activate`
3. Start the FastAPI service:
  - `python fastapi/api_main.py`
4. Verify it is running:
  - Open `http://localhost:8000`

## API Response Format

All endpoints return:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Testing

1. Create a test env file (optional but recommended):
  - `cp .env.example .env.test`
  - Update `DATABASE_URL` to a test database.
2. Run the tests:
  - `npm test`

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
- `POST /api/scan` forwards images to the FastAPI service at `FASTAPI_URL`

# School Management APIs (Node.js + Express + MySQL)

This project implements two APIs:
- `POST /addSchool` — Add a new school
- `GET /listSchools?lat=<userLat>&lng=<userLng>` — List schools sorted by proximity to user's location

## Tech
- Node.js 20+, Express 4
- MySQL (mysql2/promise)
- Validation via Joi
- Security middleware: helmet, CORS
- Logging via morgan

## Quick Start

1. **Clone & Install**
```bash
npm install
cp .env.example .env
```
2. **Create DB & Table**
Run the SQL in `sql/schema.sql` on your MySQL server. Update `.env` with your DB credentials.

3. **Run**
```bash
npm run start
```

## API Docs

### POST /addSchool
**Body (JSON)**
```json
{
  "name": "Springfield Elementary",
  "address": "742 Evergreen Terrace, Springfield",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```
**Responses**
- `201` Created:
```json
{
  "success": true,
  "message": "School added successfully",
  "data": { "id": 1, "name": "...", "address": "...", "latitude": 37.7749, "longitude": -122.4194, "created_at": "..." }
}
```
- `400` Validation error
- `500` Internal server error

### GET /listSchools?lat=12.9716&lng=77.5946
**Query Params**
- `lat` — user's latitude
- `lng` — user's longitude

**Response**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 2, "name": "...", "address": "...", "latitude": 12.9, "longitude": 77.5, "created_at": "...", "distance_km": 3.214 },
    ...
  ]
}
```

### Health Check
- `GET /health`

## Deployment
- **Render**: Create a new Web Service from this repo, set environment variables from `.env`, add a free MySQL service (e.g., Aiven/Neon alternatives won't work since this is MySQL), or connect to an external MySQL provider (e.g., PlanetScale, AWS RDS). Set `Build Command: npm install`, `Start Command: npm run start`.
- **Railway**: Create a project, add a MySQL plugin, deploy from GitHub, set env vars.
- **Docker**: Build with `docker build -t school-apis .` then run `docker run -p 8080:8080 --env-file .env school-apis`.

## Notes
- Distance sorting uses the Haversine formula in JavaScript.
- All inputs validated; errors return 400 with details.
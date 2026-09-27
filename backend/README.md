# Hotel Booking API (backend)

Node.js + Express REST API using Microsoft SQL Server, JWT, Cloudinary and multer.

## Setup

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # nodemon, http://localhost:5000
```

## Password-reset email

UC04 sends password-reset links through SMTP. Set `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `FRONTEND_URL`
in `.env`. SMTP may be left entirely blank in local development, but all SMTP
values are required when `NODE_ENV=production`.

## Scripts

| Script        | Description                     |
| ------------- | ------------------------------- |
| `npm run dev` | Start with nodemon (auto reload) |
| `npm start`   | Start with node                 |

## Structure

```text
src/
├── config/        database.js (mssql pool), cloudinary.js
├── controllers/   HTTP handlers
├── services/      business logic
├── repositories/  SQL queries
├── routes/        route definitions (mounted under /api)
├── middleware/    auth, upload, ...
├── models/        data models
├── validators/    request validation
├── utils/         helpers
├── app.js         Express app (middleware, routes, 404, error handler)
└── server.js      entry point
```

## Endpoints

- `GET /api/health` → `{ "success": true, "message": "Hotel Booking API is running" }`

The database connection is created lazily via `getPool()` in `src/config/database.js`,
so the server starts even when the database is not configured.

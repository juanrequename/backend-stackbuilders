## Backend Stackbuilders

Simple Node.js/Express API that crawls Hacker News, filters entries, and logs usage to MongoDB.

### Requirements

- Node.js 24+
- MongoDB (optional; usage logs are skipped without `MONGODB_URI`)

### Setup

```bash
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

- `NODE_ENV`: `development` | `production` | `test`
- `PORT`: API port (default `3000`)
- `API_BASE_URL`: Base URL used in Swagger (default `http://localhost:3000`)
- `HN_DEFAULT_LIMIT`: Max HN entries to parse (default `30`)
- `HN_WORD_THRESHOLD`: Word threshold for title filter (default `5`)
- `HN_CACHE_TTL_MS`: Cache TTL for HN HTML (default `30000`)
- `CRAWLER_RATE_LIMIT_WINDOW_MS`: Rate limit window (default `60000`)
- `CRAWLER_RATE_LIMIT_MAX`: Max requests per window (default `60`)
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: MongoDB database name
- `REDIS_URL`: Redis connection URL (optional; HN cache is skipped without it)

### API

Base path: `/api/v1`

#### `POST /crawler/filter`

Request body:

```json
{ "filterType": "word_count_gt" }
```

Filter types:

- `word_count_gt`
- `word_count_lte`
- `none`

#### `GET /crawler/usage`

Query params:

- `limit` (optional): max number of logs to return (default `50`)

#### `GET /health`

Returns server status.

### Swagger

Available at `/api-docs`.

### Docker

```bash
docker compose up --build
```

### Tests

```bash
npm test
```

### Architecture Decision Records (ADR)

A record of important architectural decisions is kept in the `docs/adr` folder.

- [0001 — Technology choices for Backend Stackbuilders](docs/adr/0001-technologies.md)


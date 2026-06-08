# French Flashcards

This repo is now split into two clear parts:

- `app/`, `components/`, `lib/`: static Next.js frontend
- `backend/`: separate Bun API for secure OpenAI TTS

The frontend can stay a static export. The backend runs separately on a server such as AWS EC2 and keeps your OpenAI key private.

## Architecture

- The frontend reads `NEXT_PUBLIC_TTS_API_BASE_URL`.
- The frontend sends `POST /tts` requests to the Bun backend.
- The Bun backend calls OpenAI TTS securely from the server.
- The backend validates input, rate-limits requests, and caches MP3 files on disk.
- If the API is unavailable, the frontend falls back to browser speech synthesis.

## Frontend setup

Create `.env.local` in the repo root:

```bash
NEXT_PUBLIC_TTS_API_BASE_URL=http://localhost:8787
```

Run the frontend:

```bash
bun run dev:web
```

## Backend setup

Copy the backend env file:

```bash
cp backend/.env.example backend/.env
```

Set at least:

```bash
OPENAI_API_KEY=your_openai_api_key
FRONTEND_ORIGIN=http://localhost:3000
TTS_ALLOWED_ORIGINS=http://localhost:3000
```

Run the backend:

```bash
bun run dev:api
```

The Bun API exposes:

- `POST /tts`
- `GET /health`

## Built-in protections

The TTS backend includes:

- Rate limiting per client IP
- Input validation and max length enforcement
- Vocabulary allowlisting using `french1000.json`
- Disk cache for repeated words
- Origin allowlisting through CORS

## Deploying on EC2

Recommended layout:

1. Deploy the Next frontend as static files behind Nginx, S3 + CloudFront, or another static host.
2. Run the Bun backend as a separate process on EC2.
3. Point `NEXT_PUBLIC_TTS_API_BASE_URL` to your API domain.
4. Set `FRONTEND_ORIGIN` and `TTS_ALLOWED_ORIGINS` on the backend to your exact frontend origin.
5. Persist `backend/cache/audio` if you want TTS cache reuse across restarts.

## Scripts

From the repo root:

```bash
bun run dev:web
bun run dev:api
bun run build:web
bun run start:api
```

# AETHER-PQC

AETHER-PQC is a post-quantum cryptography risk assessment and migration platform. It ingests SBOMs, CBOM-like JSON, documents, PDFs, screenshots, and architecture diagrams, then builds a risk graph and remediation queue for PQC migration work.

The project is developed spec-first. Start with `docs/SPEC_DRIVEN_DEVELOPMENT.md`, then use the architecture, product, AI pipeline, infrastructure, testing, and security docs as the implementation contract.

## Stack

- Next.js 16 App Router, React, TypeScript, Tailwind CSS
- Auth.js v5 with Google OAuth
- Prisma and PostgreSQL
- Gemini Developer API through `@google/genai`
- Docker Compose for local development
- Vitest and Playwright for test coverage
- Terraform definitions for GCP infrastructure, without automatic deployment

## Quick Start

```bash
cp .env.example .env.local
docker compose up -d postgres
pnpm install
pnpm prisma migrate deploy
pnpm dev
```

Open `http://localhost:3000`.

For local UI testing without Google OAuth, set `TEST_AUTH_ENABLED=true`. The app falls back to the local Docker Postgres URL when `DATABASE_URL` is absent, but explicit `.env.local` configuration is recommended.

## Required Environment

| Variable | Purpose | Local Default |
| --- | --- | --- |
| `DATABASE_URL` | Prisma PostgreSQL connection string | Docker Postgres URL |
| `AUTH_SECRET` | Auth.js session secret | Required for real auth |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | Empty |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | Empty |
| `GEMINI_API_KEY` | Gemini Developer API key | Empty |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.5-flash` |
| `STORAGE_DRIVER` | `local` or `gcs` | `local` |
| `LOCAL_STORAGE_DIR` | Local upload directory | `storage/uploads` |
| `MAX_UPLOAD_BYTES` | Upload limit | `26214400` |
| `TEST_AUTH_ENABLED` | Enables local seeded test user | `false` |

## Feature Surface

- Authenticated dashboard for assessment projects.
- Project creation and ownership-gated access.
- Artifact upload for JSON, CSV, TXT, MD, PDF, PNG, JPEG, and WEBP.
- Deterministic-first crypto extraction for structured and text artifacts.
- Gemini Developer API multimodal fallback for images, scanned PDFs, diagrams, screenshots, and ambiguous content.
- Multi-file uploads with a unified batch analysis pass for cross-file dependencies and threat paths.
- Risk graph snapshot with typed nodes and edges.
- PQC remediation queue with priority mapping.
- Real scan events for terminal-style progress logs.
- Docker Compose local runtime.
- Terraform definitions for GCP infrastructure, without deployment.

## Test Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm test:e2e
```

Automated tests mock Gemini calls and do not require paid API usage.

## Docker

```bash
docker compose build
docker compose up
```

The app uses local filesystem artifact storage by default at `storage/uploads`.

## Infrastructure

Terraform files live in `terraform/`. They define the intended GCP resources but this repository workflow does not run `terraform apply`.

```bash
cd terraform
terraform fmt
terraform init
terraform validate
```

## Security Notes

- `.env` and `.env.local` are ignored and must not be committed.
- Uploaded filenames are sanitized before local or GCS storage.
- Gemini calls run only on the server.
- Route access is backed by server-side ownership checks.
- See `SECURITY.md` for the active security policy.

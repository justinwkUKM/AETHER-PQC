# AETHER-PQC

AETHER-PQC is a post-quantum cryptography risk assessment and migration platform. It ingests SBOMs, CBOM-like JSON, documents, PDFs, screenshots, and architecture diagrams, then builds a risk graph and remediation queue for PQC migration work.

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

For local UI testing without Google OAuth, set `TEST_AUTH_ENABLED=true`.

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

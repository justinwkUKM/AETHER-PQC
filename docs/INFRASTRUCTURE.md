# Infrastructure

Terraform defines the intended GCP infrastructure:

- Cloud Run service
- Cloud SQL PostgreSQL
- GCS artifact bucket
- Artifact Registry repository
- Secret Manager secrets
- IAM bindings

The implementation must not run `terraform apply` as part of local development. Local testing uses Docker Compose.

## Required Secrets

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `GEMINI_API_KEY`

## Local Database

Docker Compose provides PostgreSQL at:

```text
postgresql://aether:aether@localhost:5432/aether_pqc
```

# Security Policy

## Secret Handling

Do not commit `.env`, `.env.local`, service account JSON, OAuth client secrets, Gemini API keys, database passwords, or Terraform state. The repository includes `.env.example` only.

Production secrets should be injected through Secret Manager or the deployment platform. Local development should use `.env.local`.

## Supported Reporting Path

For private security reports, open a private issue or contact the repository owner directly. Do not disclose live credentials in public issues.

## Current Security Controls

- Auth.js protects authenticated routes.
- Server-side ownership checks gate project and artifact access.
- Upload size and file type validation run before parsing.
- Uploaded filenames are sanitized before storage.
- Gemini calls are server-only.
- Tests use mocked credentials and do not call paid APIs.
- Baseline security headers are configured in Next.js.

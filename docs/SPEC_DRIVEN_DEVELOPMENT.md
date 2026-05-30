# Spec-Driven Development Specification

This repository treats specs as implementation contracts. Code changes should update the relevant spec file in the same commit when behavior changes.

## Canonical Specs

- `docs/PRODUCT_SPEC.md`: user-visible behavior and route contracts.
- `docs/ARCHITECTURE.md`: system boundaries, data flow, and deployment topology.
- `docs/AI_PIPELINE.md`: deterministic and Gemini multimodal extraction behavior.
- `docs/INFRASTRUCTURE.md`: local Docker and GCP Terraform intent.
- `docs/TESTING.md`: required verification scope.
- `SECURITY.md`: secret handling and security controls.

## Definition Of Done

A change is complete only when:

1. The relevant spec is updated.
2. Implementation matches the spec.
3. Unit or integration tests cover core behavior.
4. E2E coverage is added for user-visible workflow changes.
5. `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, and relevant E2E checks pass.

## MVP Acceptance Matrix

| Capability | Acceptance Criteria | Verification |
| --- | --- | --- |
| Auth | Google OAuth configured; test-auth path works locally; routes require a user. | E2E and guarded server code |
| Projects | Users can create, list, view, and delete their own projects. | E2E and server action tests |
| Uploads | JSON, CSV, TXT, MD, PDF, PNG, JPEG, WEBP are accepted up to 25MB. | Unit tests and manual scan flow |
| Deterministic Parsing | Structured crypto data is parsed locally before any AI call. | Unit and integration tests |
| Gemini Extraction | Multimodal artifacts and ambiguous files can use Gemini Developer API. | Mocked integration tests |
| Graph | Extracted nodes and edges merge into a stable project snapshot. | Unit tests |
| Remediation | High-risk crypto produces prioritized migration actions. | Unit and integration tests |
| Local Infra | Docker Compose runs Postgres and the app. | Docker build and smoke test |
| Terraform | GCP resources are defined but not applied. | `terraform fmt` and `terraform validate` |
| Security | No committed secrets; uploads sanitized; ownership checks enforced. | Secret scan, tests, review |

## Change Control

When behavior changes, update the spec first or in the same commit. If implementation intentionally differs from the spec, update the spec to make the new behavior explicit.

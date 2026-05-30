# Testing

## Unit Tests

Vitest covers parser, scoring, graph merge, schema validation, and remediation mapping.

## Integration Tests

Integration tests exercise upload lifecycle behavior with mocked Gemini output and Prisma-facing workflows where possible.

## E2E Tests

Playwright covers the main browser flow with `TEST_AUTH_ENABLED=true`:

1. Open dashboard.
2. Create a project.
3. Upload a sample artifact.
4. Confirm scan output appears.
5. Open graph and remediation views.

## Coverage

The configured target is 80% line coverage for core library and server modules.

Current covered areas:

- crypto scoring
- graph snapshot validation and merge
- deterministic JSON/text parsing
- file validation
- remediation mapping
- AI response schema validation

E2E runs against a local Next dev server with Docker Postgres and `TEST_AUTH_ENABLED=true`.

# Product Specification

## Product Goal

AETHER-PQC helps security and engineering teams identify cryptographic assets exposed to quantum migration risk and convert those findings into actionable remediation work.

## Core User Flows

- Sign in with Google.
- Create an assessment project.
- Review all owned projects on the dashboard.
- Upload SBOM, CBOM, document, PDF, screenshot, or diagram artifacts.
- Watch scan events in the terminal console.
- Inspect the extracted risk graph.
- Review prioritized PQC migration remediations.
- Delete owned projects when an assessment is no longer needed.

## Supported Artifacts

- JSON
- CSV
- TXT
- Markdown
- PDF, including scanned or image-heavy PDFs through Gemini multimodal extraction
- PNG, JPEG, WEBP

The default upload limit is 25MB.

Uploaded filenames are sanitized before storage. Original file names are retained as artifact display names.

## Routes

- `/login`
- `/dashboard`
- `/project/new`
- `/project/[id]`
- `/project/[id]/scan`
- `/project/[id]/remediations`

## Graph Contract

Nodes:

- `BusinessProcess`
- `Application`
- `SoftwareComponent`
- `DataAsset`
- `CryptoAsset`
- `ExternalService`

Edges:

- `DEPENDS_ON`
- `USES`
- `PROCESSES`
- `IMPLEMENTS`
- `PROTECTED_BY`
- `CALLS`
- `HOSTS`

## Risk Scoring

Deterministic known-crypto scoring wins over AI scoring:

- RSA, DSA, DH, ECDSA, ECDH: `10`
- AES-256, SHA-256, SHA-384, SHA-512, ML-KEM, ML-DSA, SLH-DSA: `0`

Unknown or ambiguous primitives default to medium risk until reviewed.

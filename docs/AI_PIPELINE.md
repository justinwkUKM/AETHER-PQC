# AI Pipeline

The pipeline follows a deterministic-first rule. Clean structured documents are processed locally before any model call.

## Deterministic Stage

The local parser extracts crypto primitives from JSON, CycloneDX-like component lists, CBOM-like fields, CSV/text, and Markdown. Known scoring rules override model output:

- RSA, DSA, DH, ECDSA, ECDH: score `10`
- AES-256, SHA-256, SHA-384, SHA-512, ML-KEM, ML-DSA, SLH-DSA: score `0`

## Gemini Stage

Gemini Developer API handles:

- scanned PDFs
- screenshots
- diagrams
- images
- unstructured notes
- ambiguous structured artifacts

Responses are requested as JSON and validated with Zod before persistence.

## Failure Handling

Every scan writes `ScanEvent` records. Failed artifacts are marked `FAILED` with a parse error, while the project remains usable.

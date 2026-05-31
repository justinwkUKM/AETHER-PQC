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

## Batch Analysis Stage

When a user uploads multiple artifacts, AETHER first processes each file independently so failures are isolated and deterministic findings are captured quickly. After at least two artifacts complete, the app runs one project-level Gemini Developer API analysis over the completed artifact evidence and the current merged graph.

The batch pass is responsible for cross-file reasoning:

- linking entities that appear under different names across SBOMs, architecture notes, diagrams, and screenshots
- adding dependency edges that require evidence from more than one artifact
- merging duplicate system references through stable IDs
- preserving deterministic high-risk findings while adding context around threat paths
- carrying source artifact IDs forward so every new node and edge remains auditable

If `GEMINI_API_KEY` is not configured, the batch pass is skipped with a warning scan event. Per-file deterministic and hybrid results remain available.

## Prompting Rules

- Include the current graph snapshot to reduce duplicates.
- Require stable snake_case IDs.
- Require confidence values for visual/OCR inferences.
- Require source artifact IDs on extracted nodes and edges.
- Never send secrets intentionally; uploaded artifact content is user-provided assessment input.

## Parser Modes

- `DETERMINISTIC`: local parser produced the graph.
- `AI_MULTIMODAL`: Gemini produced the graph.
- `HYBRID`: local parser and Gemini output were merged.

## Failure Handling

Every scan writes `ScanEvent` records. Failed artifacts are marked `FAILED` with a parse error, while the project remains usable.

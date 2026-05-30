# Product Specification

## Core User Flows

- Sign in with Google.
- Create an assessment project.
- Upload SBOM, CBOM, document, PDF, screenshot, or diagram artifacts.
- Watch scan events in the terminal console.
- Inspect the extracted risk graph.
- Review prioritized PQC migration remediations.

## Supported Artifacts

- JSON
- CSV
- TXT
- Markdown
- PDF, including scanned or image-heavy PDFs through Gemini multimodal extraction
- PNG, JPEG, WEBP

The default upload limit is 25MB.

## Routes

- `/login`
- `/dashboard`
- `/project/new`
- `/project/[id]`
- `/project/[id]/scan`
- `/project/[id]/remediations`

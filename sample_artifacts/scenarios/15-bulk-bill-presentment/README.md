# InvoiceNet Presentment

Suggested scanner project name: `bulk_bill_presentment`

## Product Profile

- Fictional product: **InvoiceNet Presentment**
- Deployment model: **hybrid bill presentment**
- Scenario purpose: bulk bill presentment and settlement scheduler

## Purpose

This document specifies the cryptographic design and systems topology of Biller Presentment, a regional bill payment scheme. Biller Presentment allows billers (such as telecom providers, municipal councils, electricity grids, and insurers) to present bulk electronic invoices that bank customers can pay via mobile and online banking platforms.

## Upload Set

Upload the available files from this folder together:

- `spec.md`
- `architecture.md`
- `inventory.json`
- `architecture-diagram.png`
- `process-flow.png`

## Expected Parser Behavior

The JSON inventory and Markdown documents should provide deterministic crypto findings. The diagrams provide OCR/image evidence for topology, trust boundaries, protocol labels, exposure context, and process flow.

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Flow: confirm staged process, cryptographic checkpoints, and exposure lanes from `process-flow.png`.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm public, partner, private, and internal ranking.
- Remediations: confirm priority rationale and validation steps.

## Safety Note

This scenario is fictional and synthetic. It contains no organization branding, real product names, production endpoints, account data, credentials, or private keys.

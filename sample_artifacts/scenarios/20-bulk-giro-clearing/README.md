# GiroFlow Bulk

Suggested scanner project name: `bulk_giro_clearing`

## Product Profile

- Fictional product: **GiroFlow Bulk**
- Deployment model: **on-prem batch clearing**
- Scenario purpose: bulk giro and payroll clearing scheduler

## Purpose

This document specifies the cryptographic design and deployment parameters of the Regional Automated Clearing House (Bulk Clearing House) bulk Interbank GIRO (GIRO) payment clearing scheduler, operated by Clearing Services Operator. Bulk Clearing House handles bulk commercial transactions, corporate payroll batches, and municipal bill payments in SGD.

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

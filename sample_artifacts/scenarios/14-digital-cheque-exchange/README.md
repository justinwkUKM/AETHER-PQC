# ChequeGrid Exchange

Suggested scanner project name: `digital_cheque_exchange`

## Product Profile

- Fictional product: **ChequeGrid Exchange**
- Deployment model: **on-prem document clearing**
- Scenario purpose: digital cheque exchange and archive

## Purpose

This document specifies the cryptographic design and operational parameters of ChequeClear, a regional automated electronic cheque image clearing and presentment system. ChequeClear coordinates daily clearing of high-resolution digital cheque images and MICR data files submitted by participating financial institutions.

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

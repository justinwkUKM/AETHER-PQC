# POSLink Acquire

Suggested scanner project name: `pos_debit_acquisition`

## Product Profile

- Fictional product: **POSLink Acquire**
- Deployment model: **hybrid acquiring network**
- Scenario purpose: point-of-sale debit acquiring hub

## Purpose

This document specifies the security controls and cryptographic architecture of Retail POS Network (Electronic Funds Transfer at Point of Sale), a regional debit card payment network. Retail POS Network connects retail POS terminals across the region to clear instant card-present retail transactions using ATM cards.

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

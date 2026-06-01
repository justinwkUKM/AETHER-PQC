# ProxyPulse Clearing

Suggested scanner project name: `instant_proxy_clearing`

## Product Profile

- Fictional product: **ProxyPulse Clearing**
- Deployment model: **cloud instant clearing**
- Scenario purpose: instant payment and proxy lookup clearing core

## Purpose

This document registers the cryptographic properties and operational layout of the Instant Clearing (Fast and Secure Transfers) and Proxy Resolver core clearing engine, operated by Clearing Services Operator in the region. Instant Clearing enables 24/7 high-speed interbank retail payments, while Proxy Resolver acts as a regional proxy lookup layer, mapping mobile numbers, customer proxy IDs, and business entities (business proxy ID) to bank account numbers.

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

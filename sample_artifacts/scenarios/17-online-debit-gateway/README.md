# Online Debit Gateway Online Payment Gateway Specification

Suggested scanner project name: `online_debit_gateway`

## Purpose

This document specifies the cryptographic design and deployment topology of Online Debit Gateway, the primary online payment gateway in the region that enables e-commerce websites to collect direct-to-bank payments. Online Debit Gateway orchestrates real-time checkout redirect flows, transferring transaction parameters securely to participating local bank portals (such as participating banks).

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

This scenario is anonymous and synthetic. It contains no organization branding, real product names, production endpoints, account data, credentials, or private keys.

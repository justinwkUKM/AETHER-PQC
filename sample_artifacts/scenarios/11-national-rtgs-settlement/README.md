# TitanRTGS Core

Suggested scanner project name: `national_rtgs_settlement`

## Product Profile

- Fictional product: **TitanRTGS Core**
- Deployment model: **on-prem settlement network**
- Scenario purpose: real-time gross settlement core

## Purpose

This document registers the cryptographic infrastructure and security controls of Wholesale Settlement Rail (Real-Time Electronic Transfer of Funds and Securities System), a regional high-value Real-Time Gross Settlement (RTGS) system. Wholesale Settlement Rail handles irrevocable settlements of interbank funds transfers, government bond sales, and debt securities trades.

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

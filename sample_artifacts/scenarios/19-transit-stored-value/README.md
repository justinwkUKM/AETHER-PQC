# Stored Value Transit & Stored Value Mobility Card Transit Specification

Suggested scanner project name: `transit_stored_value`

## Purpose

This document registers the cryptographic controls and systems design of Stored Value Transit and Stored Value Mobility Card, the region's multipurpose contactless stored-value card platform. Stored Value Transit cards are used across the region's public transport network (MRT trains, transit buses), retail merchants, and Electronic Toll Pricing (ETP) motoring toll systems.

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

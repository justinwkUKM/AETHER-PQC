# JomPAY Biller Collections

Suggested AETHER project name: `jompay_biller_collections`

## Purpose

Synthetic bill-payment collection platform inspired by JomPAY: biller code lookup, online/mobile banking bill payment, biller-bank settlement files, and real-time notifications.

Public research basis: Inspired by public PayNet descriptions of JomPAY as a national online bill-payment initiative operated by PayNet across participating banks and billers.

Risk goal: Mixed partner-facing biller integrations and internal settlement file risks.

## Upload Set

Upload these files together from this folder:

- `architecture.md`
- `cbom.json`
- `tls-endpoints.csv`
- `threat-model.txt`
- `architecture-diagram.png`
- `assessment-brief.pdf`

Recommended upload order for manual review:

1. `cbom.json`
2. `architecture.md`
3. `tls-endpoints.csv`
4. `threat-model.txt`
5. `architecture-diagram.png`
6. `assessment-brief.pdf`

## Expected Parser Behavior

Artifacts should separate partner-facing biller paths from internal settlement batch files and support graph edges across biller code lookup, bank channels, and settlement processing.

## Expected Top Findings

- ECDSA-P256 biller-bank API certificates
- RSA-2048 biller file signatures
- 3DES legacy settlement file encryption
- SHA-256 and AES-256 controls as lower-risk references

Expected remediation priority shape: **HIGH**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge, participant, partner, private network, and internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

Partner-facing biller bank API and biller notification endpoints should be high priority when using ECDSA/RSA; internal batch 3DES settlement files should be medium/high but below public edge.

## Safety Note

This scenario is synthetic and inspired by public product categories only. Domains use `.example.com`; owners are fictional placeholders; no production details or credentials are included.

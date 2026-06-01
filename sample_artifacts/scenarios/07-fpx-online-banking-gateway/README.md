# FPX Online Banking Gateway

Suggested AETHER project name: `fpx_online_banking_gateway`

## Purpose

Synthetic real-time online banking payment gateway inspired by FPX: merchant checkout, bank selection, bank redirect, authorisation, debit confirmation, and merchant receipt notification.

Public research basis: Inspired by public PayNet descriptions of FPX as a real-time online payment gateway used for e-commerce and bank-account payments.

Risk goal: Critical merchant checkout and bank redirect exposure with classical crypto in high-value flows.

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

CBOM should produce deterministic RSA/ECDH/AES/SHA/PQC nodes. Text artifacts should describe real-time debit, merchant redirect, bank participant, and internet gateway exposure.

## Expected Top Findings

- TLS 1.2 RSA key exchange at merchant redirect gateway
- ECDH bank session bridge
- RSA-3072 signed payment confirmation payloads
- TLS 1.3 ML-KEM pilot notification endpoint

Expected remediation priority shape: **CRITICAL**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge, participant, partner, private network, and internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

Public merchant checkout endpoints and bank redirect endpoints should elevate TLS 1.2 RSA/ECDH findings; internal AES-256 and SHA-384 controls should remain low risk.

## Safety Note

This scenario is synthetic and inspired by public product categories only. Domains use `.example.com`; owners are fictional placeholders; no production details or credentials are included.

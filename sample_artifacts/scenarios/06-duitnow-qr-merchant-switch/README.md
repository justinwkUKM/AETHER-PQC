# DuitNow QR Merchant Switch

Suggested AETHER project name: `duitnow_qr_merchant_switch`

## Purpose

Synthetic national QR merchant payment switch inspired by DuitNow QR: one QR acceptance path for banks, e-wallets, acquirers, merchant apps, and real-time merchant notifications.

Public research basis: Inspired by public PayNet descriptions of DuitNow QR as a single QR payment method supporting participating banks and e-wallets.

Risk goal: High-volume retail edge with mobile wallet and acquiring-bank exposure.

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

JSON deterministic extraction should find ECDSA, ECDH, RSA, AES-256, SHA-256, ML-KEM. Text, CSV, PDF, and PNG should establish public QR ingress, partner acquirer exposure, and merchant notification paths.

## Expected Top Findings

- TLS 1.2 ECDSA-P256 on merchant callback gateway
- ECDH wallet-to-switch channel
- RSA-2048 QR payload signing compatibility path
- AES-256 settlement vault as low-risk control

Expected remediation priority shape: **HIGH/CRITICAL**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge, participant, partner, private network, and internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

Internet-edge and partner-facing findings should rank high where TLS 1.2, ECDSA, ECDH, and RSA signing appear near QR payment ingress and merchant notification APIs.

## Safety Note

This scenario is synthetic and inspired by public product categories only. Domains use `.example.com`; owners are fictional placeholders; no production details or credentials are included.

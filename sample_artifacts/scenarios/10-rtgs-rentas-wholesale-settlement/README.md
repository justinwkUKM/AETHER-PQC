# RTGS RENTAS Wholesale Settlement

Suggested AETHER project name: `rtgs_rentas_wholesale_settlement`

## Purpose

Synthetic wholesale RTGS participant gateway inspired by RENTAS concepts: high-value interbank funds transfer, securities settlement, participant terminal access, SWIFT-style messaging, and recovery-site operations.

Public research basis: Inspired by public BNM operational material describing RENTAS as a multi-currency real-time gross settlement system for interbank funds transfer and securities settlement.

Risk goal: Mission-critical wholesale settlement with private network exposure and very high business impact.

## Upload Set

Upload these files together from this folder:

- `architecture.md`
- `cbom.json`
- `tls-endpoints.csv`
- `threat-model.txt`
- `architecture-diagram.png`
- `process-flow.png`
- `assessment-brief.pdf`

Recommended upload order for manual review:

1. `cbom.json`
2. `architecture.md`
3. `tls-endpoints.csv`
4. `threat-model.txt`
5. `architecture-diagram.png`
6. `process-flow.png`
7. `assessment-brief.pdf`

## Expected Parser Behavior

Artifacts should test whether AETHER can prioritize non-public but critical settlement infrastructure using topology, business process, participant gateway, and recovery-site context.

## Expected Top Findings

- RSA-2048 participant terminal certificate
- ECDSA-P256 SWIFT-style message signing
- TLS 1.2 participant bank gateway
- ML-DSA target state for settlement authorisation

Expected remediation priority shape: **HIGH/CRITICAL**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Flow: confirm transaction/process stages, trust boundaries, crypto controls, and exposure lanes from `process-flow.png`.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge, participant, partner, private network, and internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

Even private participant links should rank high because RSA/ECDSA/TLS 1.2/legacy token controls sit on high-value settlement paths; exposure should be PARTNER or INTERNAL rather than public internet.

## Safety Note

This scenario is synthetic and inspired by public product categories only. Domains use `.example.com`; owners are fictional placeholders; no production details or credentials are included.

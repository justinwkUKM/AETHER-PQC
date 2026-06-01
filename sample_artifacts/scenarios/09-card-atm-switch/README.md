# CardNexus Switch

Suggested scanner project name: `card_atm_switch`

## Product Profile

- Fictional product: **CardNexus Switch**
- Deployment model: **hybrid card and ATM rail**
- Scenario purpose: domestic debit and shared cash switching platform

## Purpose

Synthetic domestic debit and shared ATM switching platform inspired by Domestic Debit and Shared Cash Network: POS acquiring, ATM withdrawals, issuer routing, token validation, and cash-out controls.

Public research basis: Inspired by public CardNexus Switch descriptions of Domestic Debit as domestic debit card acceptance and Shared Cash Network as an interbank ATM switching infrastructure.

Risk goal: Retail POS and ATM edge exposure with legacy HSM and host-key cryptography.

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

Artifacts should make the graph distinguish POS merchant edge, ATM participant edge, issuer switch, HSM signing, and private token vault controls.

## Expected Top Findings

- TLS 1.1 ATM gateway compatibility
- RSA-2048 acquirer host key
- DSA legacy HSM signing profile
- ECDH POS terminal session establishment

Expected remediation priority shape: **HIGH/CRITICAL**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Flow: confirm transaction/process stages, trust boundaries, crypto controls, and exposure lanes from `process-flow.png`.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge, participant, partner, private network, and internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all seven core artifacts appear in the audit record.

## Expected Outcome

POS/acquirer and ATM gateway findings should be high where RSA, DSA, ECDH, and TLS 1.1 are present; token vault AES-256 should remain low risk.

## Safety Note

This scenario is synthetic and inspired by public product categories only. Domains use `.example.com`; owners are fictional placeholders; no production details or credentials are included.

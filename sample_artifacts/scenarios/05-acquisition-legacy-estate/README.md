# Acquisition Legacy Estate

Suggested scanner project name: `acquisition_legacy_estate`

## Purpose

Incomplete newly acquired estate with conflicting proxy and VPN naming, scanned architecture notes, and unknown ownership.

Risk goal: Ambiguous AI-heavy extraction and conflicting evidence.

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

Text and CSV will find SSL, RC4, RSA, TLS 1.1; image/PDF should encourage Gemini to infer aliases and lower-confidence relationships.

## Expected Top Findings

- SSL VPN with RC4 compatibility
- RSA-1024 appliance certificate
- Gateway/proxy alias conflict
- Unknown ownership and incomplete evidence

Expected remediation priority shape: **CRITICAL**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Flow: confirm transaction/process stages, trust boundaries, crypto controls, and exposure lanes from `process-flow.png`.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge/partner/internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all seven core artifacts appear in the audit record.

## Expected Outcome

Critical review-needed findings. Gemini/batch analysis should connect old proxy, internet VPN, SSL, RC4, RSA-1024, and owner-unknown nodes with confidence below perfect certainty.

## Safety Note

This scenario is synthetic. Domains use `.example.com`, addresses use documentation ranges when present, and owners are fictional placeholders.

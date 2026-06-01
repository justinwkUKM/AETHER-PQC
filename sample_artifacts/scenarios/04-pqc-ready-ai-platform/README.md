# PQC-Ready AI Platform

Suggested AETHER project name: `pqc_ready_ai_platform`

## Purpose

AI inference platform with a mostly quantum-safe target architecture and one historical ambiguous RSA reference for review handling.

Risk goal: Mostly safe/ready behavior with a low-confidence historical finding.

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

Deterministic parsing should score PQC primitives low; batch analysis should preserve historical RSA as context rather than current edge-critical evidence.

## Expected Top Findings

- TLS 1.3 hybrid ML-KEM ingress
- ML-DSA service identity
- AES-256 model storage
- Historical RSA migration note requiring review

Expected remediation priority shape: **LOW/MEDIUM**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Flow: confirm transaction/process stages, trust boundaries, crypto controls, and exposure lanes from `process-flow.png`.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge/partner/internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

Low effective risk overall. ML-KEM, ML-DSA, AES-256, SHA-384, and TLS 1.3 should dominate; historical RSA should be visible but described as archived context.

## Safety Note

This scenario is synthetic. Domains use `.example.com`, addresses use documentation ranges when present, and owners are fictional placeholders.

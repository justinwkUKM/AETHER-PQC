# Internal Claims Batch

Suggested AETHER project name: `internal_claims_batch`

## Purpose

Private claims adjudication batch estate processing nightly policy and claims files inside isolated back-office networks.

Risk goal: Vulnerable but buried/internal findings with lower exposure.

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

Deterministic JSON and text extraction should find RSA, 3DES, SHA-1, AES-256, and internal/private exposure language; batch analysis should avoid over-ranking as internet-facing.

## Expected Top Findings

- RSA-3072 signing for batch manifests
- 3DES archive encryption on historical claim bundles
- SHA-1 checksums in nightly reconciliation
- No public ingress documented

Expected remediation priority shape: **MEDIUM/HIGH**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge/partner/internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

Medium or high remediation driven by RSA-3072, 3DES, and SHA-1, but not internet-edge critical because artifacts repeatedly state private, internal, offline, and batch.

## Safety Note

This scenario is synthetic. Domains use `.example.com`, addresses use documentation ranges when present, and owners are fictional placeholders.

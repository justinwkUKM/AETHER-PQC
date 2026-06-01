# Partner B2B Gateway

Suggested AETHER project name: `partner_b2b_gateway`

## Purpose

Partner-facing vendor file-exchange gateway that accepts shipping manifests through API and SFTP paths.

Risk goal: Partner exposure and weak TLS 1.2 nuance.

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

CSV/text should mark partner/vendor exposure; Gemini should connect API gateway, SFTP bridge, and vendor trust boundary.

## Expected Top Findings

- ECDSA-P256 partner client certificates
- TLS 1.2 with static DH on vendor gateway
- RSA-2048 SFTP host key
- Partner allowlist trust boundary

Expected remediation priority shape: **HIGH**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge/partner/internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

HIGH remediation for partner-facing ECDSA, static DH, weak TLS 1.2, and SFTP RSA key exchange, with exposure level PARTNER rather than fully public.

## Safety Note

This scenario is synthetic. Domains use `.example.com`, addresses use documentation ranges when present, and owners are fictional placeholders.

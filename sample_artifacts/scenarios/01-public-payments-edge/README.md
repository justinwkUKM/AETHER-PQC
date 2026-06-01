# Public Payments Edge

Suggested AETHER project name: `public_payments_edge`

## Purpose

Internet-facing checkout and card-payment API that terminates public traffic at a load balancer and routes into payment authorization services.

Risk goal: Critical exposed findings near public ingress.

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

JSON deterministic nodes plus text/CSV deterministic extraction; PNG and PDF should use Gemini multimodal when configured; batch analysis should connect public ingress to crypto assets.

## Expected Top Findings

- TLS 1.0 listener on public checkout fallback
- TLS 1.2 RSA key exchange at payment API
- RSA-2048 JWT validation in authorization service
- ECDH between gateway and ledger adapter

Expected remediation priority shape: **CRITICAL**

## Views To Inspect

- Graph: confirm topology, exposure path, selected-node explanation, and source evidence.
- Flow: confirm transaction/process stages, trust boundaries, crypto controls, and exposure lanes from `process-flow.png`.
- Inventory: confirm cryptographic primitives and parser modes.
- Exposure: confirm edge/partner/internal exposure ranking.
- Remediations: confirm ticket-ready priority rationale and validation steps.
- Evidence: confirm all six artifacts appear in the audit record.

## Expected Outcome

High exposure, CRITICAL remediation for TLS 1.0, TLS 1.2 RSA key exchange, RSA-2048 JWT validation, and ECDH service-to-service handshakes.

## Safety Note

This scenario is synthetic. Domains use `.example.com`, addresses use documentation ranges when present, and owners are fictional placeholders.

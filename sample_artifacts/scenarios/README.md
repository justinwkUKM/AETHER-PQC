# Synthetic Enterprise PQC Scan Artifact Pack

This folder contains five upload-ready synthetic enterprise scenarios for testing AETHER-PQC scans. The pack is designed to exercise deterministic JSON/text parsing, Gemini multimodal image and PDF extraction, unified batch analysis, exposure-aware risk, crypto inventory, remediation generation, and evidence reporting.

All content is fictional. Domains use `.example.com`; any IP-like examples use documentation ranges; owners are placeholders; no secrets, credentials, customer data, or live infrastructure references are included.

## Scenarios

| Folder | Scenario | Test Goal | Expected Priority Shape |
| --- | --- | --- | --- |
| `01-public-payments-edge` | Public Payments Edge | Critical exposed findings near public ingress. | CRITICAL |
| `02-internal-claims-batch` | Internal Claims Batch | Vulnerable but buried/internal findings with lower exposure. | MEDIUM/HIGH |
| `03-partner-b2b-gateway` | Partner B2B Gateway | Partner exposure and weak TLS 1.2 nuance. | HIGH |
| `04-pqc-ready-ai-platform` | PQC-Ready AI Platform | Mostly safe/ready behavior with a low-confidence historical finding. | LOW/MEDIUM |
| `05-acquisition-legacy-estate` | Acquisition Legacy Estate | Ambiguous AI-heavy extraction and conflicting evidence. | CRITICAL |

## How To Use

1. Create one AETHER project per scenario using the suggested project name in that scenario's README.
2. Upload all six files from the scenario folder together.
3. Wait for sequential artifact processing and unified batch analysis.
4. Inspect Graph, Inventory, Exposure, Remediations, and Evidence views.
5. Compare the observed posture with each scenario README's expected results.

## Files In Each Scenario

- `README.md`: manual test guide and expected behavior.
- `architecture.md`: production-style architecture narrative.
- `cbom.json`: CycloneDX-style crypto inventory for deterministic parsing.
- `tls-endpoints.csv`: endpoint, protocol, cipher, and exposure inventory.
- `threat-model.txt`: security context and owner questions.
- `architecture-diagram.png`: visual topology for Gemini image parsing.
- `assessment-brief.pdf`: text-bearing PDF for PDF extraction and Gemini review.

## Safety And Data Hygiene

These artifacts intentionally include insecure cryptographic terms such as RSA, ECDH, SSL, RC4, 3DES, TLS 1.0, and TLS 1.1 so the scanner has meaningful findings. They do not contain private keys, API keys, bearer tokens, passwords, real hostnames, real customer data, or real production IPs.

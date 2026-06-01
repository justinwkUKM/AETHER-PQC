# Synthetic Enterprise PQC Scan Artifact Pack

This folder contains anonymous, upload-ready synthetic scenarios for testing scanner behavior across payment, settlement, platform, internal batch, partner, and legacy-estate systems. The pack is designed to exercise deterministic JSON/text parsing, multimodal image and PDF extraction, unified batch analysis, exposure-aware risk, crypto inventory, remediation generation, and evidence reporting.

All content is fictional. Domains use `.example.com`; any IP-like examples use documentation ranges; owners are placeholders; no organization branding, real product names, credentials, customer data, account numbers, PINs, or live infrastructure references are included.

## Scenarios

| Folder | Scenario | Test Goal |
| --- | --- | --- |
| `01-public-payments-edge` | Public Payments Edge | Synthetic PQC scan scenario with anonymous system evidence. |
| `02-internal-claims-batch` | Internal Claims Batch | Synthetic PQC scan scenario with anonymous system evidence. |
| `03-partner-b2b-gateway` | Partner B2B Gateway | Synthetic PQC scan scenario with anonymous system evidence. |
| `04-pqc-ready-ai-platform` | PQC-Ready AI Platform | Synthetic PQC scan scenario with anonymous system evidence. |
| `05-acquisition-legacy-estate` | Acquisition Legacy Estate | Synthetic PQC scan scenario with anonymous system evidence. |
| `06-qr-merchant-switch` | QR Merchant Switch | Synthetic PQC scan scenario with anonymous system evidence. |
| `07-direct-bank-gateway` | Direct Bank Gateway | Synthetic PQC scan scenario with anonymous system evidence. |
| `08-biller-collections` | Biller Collections | Synthetic PQC scan scenario with anonymous system evidence. |
| `09-card-atm-switch` | Card and Cash Switch | Synthetic PQC scan scenario with anonymous system evidence. |
| `10-wholesale-settlement` | Wholesale Settlement Rail | Synthetic PQC scan scenario with anonymous system evidence. |
| `11-national-rtgs-settlement` | Anonymous network operator Wholesale Settlement Rail Rea... | Synthetic PQC scan scenario with anonymous system evidence. |
| `12-instant-retail-clearing` | Anonymous instant retail rail Instant Retail Cl... | Synthetic PQC scan scenario with anonymous system evidence. |
| `13-direct-bank-gateway` | Anonymous network operator Direct Bank Gateway E-Commerc... | Synthetic PQC scan scenario with anonymous system evidence. |
| `14-digital-cheque-exchange` | Anonymous network operator ChequeClear Cheque Clearing S... | Synthetic PQC scan scenario with anonymous system evidence. |
| `15-bulk-bill-presentment` | Anonymous network operator Biller Presentment Bill Prese... | Synthetic PQC scan scenario with anonymous system evidence. |
| `16-pos-debit-acquisition` | Retail POS Network Point-of-Sale Card Processing Hub Sp... | Synthetic PQC scan scenario with anonymous system evidence. |
| `17-online-debit-gateway` | Online Debit Gateway Online Payment Gateway Specification | Synthetic PQC scan scenario with anonymous system evidence. |
| `18-instant-proxy-clearing` | Instant clearing rail Clearing & Proxy Resolver Core Clearing Spe... | Synthetic PQC scan scenario with anonymous system evidence. |
| `19-transit-stored-value` | Stored Value Transit & Stored Value Mobility Card Trans... | Synthetic PQC scan scenario with anonymous system evidence. |
| `20-bulk-giro-clearing` | Regional Automated Clearing House (Bulk Clearing House)... | Synthetic PQC scan scenario with anonymous system evidence. |

## How To Use

1. Create one scanner project per scenario using the suggested project name in that scenario's README.
2. Upload the files in the selected scenario folder together.
3. Wait for sequential artifact processing and unified batch analysis.
4. Inspect Graph, Inventory, Exposure, Remediations, and Evidence views.
5. Compare the observed posture with the scenario README or specification.

## Common Visual Artifacts

- `architecture-diagram.png`: anonymized topology, trust boundaries, and crypto labels for image parsing.
- `process-flow.png`: anonymized transaction/process stages, exposure lanes, and evidence checklist for image parsing.

## Research Notes

- `payment-rtgs-research-notes.md` summarizes the public product categories that inspired several scenarios, without naming real operators or products.

## Safety And Data Hygiene

These artifacts intentionally include insecure cryptographic terms such as RSA, ECDH, SSL, RC4, 3DES, TLS 1.0, and TLS 1.1 so the scanner has meaningful findings. They do not contain private keys, API keys, bearer tokens, passwords, real hostnames, real customer data, or real production IPs.

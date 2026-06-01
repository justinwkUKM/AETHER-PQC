# Partner B2B Gateway Architecture Narrative

Organization: Anonymous Logistics Operator
Assessment type: synthetic enterprise PQC readiness scan
Data classification: synthetic test evidence only

## System Summary

Partner-facing vendor file-exchange gateway that accepts shipping manifests through API and SFTP paths.

## Network Zones And Trust Boundaries

- Partner Network
- Vendor Allowlist
- B2B API Gateway
- SFTP Bridge
- Manifest Processor
- Logistics Data Lake

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, internal, private, batch, and offline where relevant.

## Components And Cryptographic Controls

### b2b-api-gateway

- Type: `application`
- Version: `6.6.0`
- Cryptography: `TLS 1.2 static DH and ECDSA-P256`
- Purpose: Partner API ingress with mTLS

### vendor-certificate-validator

- Type: `library`
- Version: `2.5.3`
- Cryptography: `ECDSA`
- Purpose: Validates partner client certificates

### sftp-bridge

- Type: `application`
- Version: `8.1.4`
- Cryptography: `RSA-2048`
- Purpose: Partner SFTP manifest upload

### manifest-processor

- Type: `worker`
- Version: `5.9.0`
- Cryptography: `SHA-256`
- Purpose: Shipping manifest integrity checks

### data-lake-loader

- Type: `worker`
- Version: `3.3.2`
- Cryptography: `AES-256`
- Purpose: Encrypted logistics archive load


## Relationship Map

- Partner Network -> Vendor Allowlist: B2B trust boundary
- Vendor Allowlist -> B2B API Gateway: TLS 1.2 static DH
- Partner Network -> SFTP Bridge: RSA-2048 SSH
- B2B API Gateway -> Manifest Processor: CALLS
- Manifest Processor -> Logistics Data Lake: AES-256

## Assessment Intent

Partner exposure and weak TLS 1.2 nuance.

Expected scan result: HIGH remediation for partner-facing ECDSA, static DH, weak TLS 1.2, and SFTP RSA key exchange, with exposure level PARTNER rather than fully public.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, or real customer data. Use it only for scanner validation.

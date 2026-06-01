# Public Payments Edge Architecture Narrative

Organization: HelioPay Retail Group
Assessment type: synthetic enterprise PQC readiness scan
Data classification: synthetic test evidence only

## System Summary

Internet-facing checkout and card-payment API that terminates public traffic at a load balancer and routes into payment authorization services.

## Network Zones And Trust Boundaries

- Public Internet
- WAF
- Edge Load Balancer
- DMZ Gateway
- Private Payment Services
- Card Data Store

The assessment intentionally includes exposure keywords that AETHER should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, internal, private, batch, and offline where relevant.

## Components And Cryptographic Controls

### checkout-edge-lb

- Type: `service`
- Version: `2026.05`
- Cryptography: `TLS 1.0 fallback and TLS 1.2 RSA key exchange`
- Purpose: Public HTTPS listener on 203.0.113.20:443

### payment-api-gateway

- Type: `application`
- Version: `7.4.2`
- Cryptography: `ECDH and RSA-2048`
- Purpose: JWT validation and request routing from internet ingress

### ledger-adapter

- Type: `library`
- Version: `3.8.1`
- Cryptography: `ECDH P-256`
- Purpose: Connection setup to settlement ledger

### card-token-vault

- Type: `database`
- Version: `14.9`
- Cryptography: `AES-256`
- Purpose: Tokenized card data encryption at rest

### receipt-hash-worker

- Type: `worker`
- Version: `2.1.0`
- Cryptography: `SHA-384`
- Purpose: Receipt integrity hashing


## Relationship Map

- Public Internet -> WAF: HTTPS 443
- WAF -> Edge Load Balancer: TLS 1.0 / TLS 1.2 RSA
- Edge Load Balancer -> DMZ Gateway: public ingress
- DMZ Gateway -> Private Payment Services: ECDH
- Private Payment Services -> Card Data Store: AES-256

## Assessment Intent

Critical exposed findings near public ingress.

Expected scan result: High exposure, CRITICAL remediation for TLS 1.0, TLS 1.2 RSA key exchange, RSA-2048 JWT validation, and ECDH service-to-service handshakes.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, or real customer data. Use it only for AETHER-PQC manual scanner validation.

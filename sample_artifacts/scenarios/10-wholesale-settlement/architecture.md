# Wholesale Settlement Rail Architecture Narrative

Organization: Anonymous Central Settlement Participant Lab
Assessment type: synthetic payment-network-inspired PQC readiness scan
Data classification: synthetic test evidence only

## Public Product Inspiration

Inspired by public central-bank operational material describing Wholesale Settlement Rail as a multi-currency real-time gross settlement system for interbank funds transfer and securities settlement.

This artifact does not describe Anonymous network operator internal architecture. It is a fictional production-grade scenario based on publicly described payment product categories and RTGS concepts.

## System Summary

Synthetic wholesale RTGS participant gateway inspired by Wholesale Settlement Rail concepts: high-value interbank funds transfer, securities settlement, participant terminal access, settlement-message messaging, and recovery-site operations.

## Network Zones And Trust Boundaries

- Participant Treasury Ops
- Participant Bank Gateway
- RTGS Access Network
- Settlement Host Interface
- Securities Settlement Bridge
- Recovery Site

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, participant, managed private network, internal, private, batch, and recovery site where relevant.

## Components And Cryptographic Controls

### participant-bank-gateway

- Type: `application`
- Version: `10.6.2`
- Cryptography: `TLS 1.2 with RSA-2048`
- Purpose: Participant access channel for high-value settlement messages

### settlement-message-signer

- Type: `service`
- Version: `4.8.0`
- Cryptography: `ECDSA-P256`
- Purpose: Signs wholesale payment and securities settlement messages

### swift-format-adapter

- Type: `library`
- Version: `3.4.1`
- Cryptography: `SHA-256`
- Purpose: Message integrity checks for settlement-message payloads

### liquidity-queue-manager

- Type: `application`
- Version: `7.9.1`
- Cryptography: `AES-256`
- Purpose: Encrypted liquidity queue and pending settlement store

### recovery-site-token-service

- Type: `service`
- Version: `2.5.0`
- Cryptography: `RSA-3072`
- Purpose: Recovery-site certificate and token activation

### pqc-settlement-authority-pilot

- Type: `service`
- Version: `0.8.0`
- Cryptography: `ML-DSA`
- Purpose: Pilot signature authority for future settlement authorisation


## Relationship Map

- Participant Treasury Ops -> Participant Bank Gateway: approval
- Participant Bank Gateway -> RTGS Access Network: TLS 1.2 RSA
- RTGS Access Network -> Settlement Host Interface: settlement message
- Settlement Host Interface -> Securities Settlement Bridge: ECDSA signing
- Settlement Host Interface -> Recovery Site: RSA recovery token

## Assessment Intent

Mission-critical wholesale settlement with private network exposure and very high business impact.

Expected scan result: Even private participant links should rank high because RSA/ECDSA/TLS 1.2/legacy token controls sit on high-value settlement paths; exposure should be PARTNER or INTERNAL rather than public internet.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, PINs, account numbers, customer proxy ID values, customer data, or real production IPs. Use it only for scanner validation.

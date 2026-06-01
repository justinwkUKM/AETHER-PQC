# QR Merchant Switch Architecture Narrative

Organization: Anonymous Anonymous network operator Retail Rail Lab
Assessment type: synthetic payment-network-inspired PQC readiness scan
Data classification: synthetic test evidence only

## Public Product Inspiration

Inspired by public Anonymous network operator descriptions of QR payment rail as a single QR payment method supporting participating banks and e-wallets.

This artifact does not describe Anonymous network operator internal architecture. It is a fictional production-grade scenario based on publicly described payment product categories and RTGS concepts.

## System Summary

Synthetic regional QR merchant payment switch inspired by QR payment rail: one QR acceptance path for banks, e-wallets, acquirers, merchant apps, and real-time merchant notifications.

## Network Zones And Trust Boundaries

- Consumer Wallets
- Merchant QR Edge
- QR Payment Switch
- Acquirer Gateway
- Bank/E-Wallet Participants
- Settlement Vault

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, participant, managed private network, internal, private, batch, and recovery site where relevant.

## Components And Cryptographic Controls

### merchant-qr-edge

- Type: `application`
- Version: `2026.06`
- Cryptography: `TLS 1.2 with ECDSA-P256`
- Purpose: Public merchant-presented and consumer-presented QR API ingress

### qr-routing-switch

- Type: `service`
- Version: `5.8.0`
- Cryptography: `ECDH P-256`
- Purpose: Routes payment authorisation between wallet, acquirer, and issuer participant

### qr-payload-signer

- Type: `library`
- Version: `2.9.4`
- Cryptography: `RSA-2048`
- Purpose: Legacy QR payload signature verification for older acquiring integrations

### merchant-notification-api

- Type: `application`
- Version: `3.2.1`
- Cryptography: `TLS 1.3 with ML-KEM hybrid exchange`
- Purpose: Near-real-time merchant payment notifications

### settlement-reconciliation-vault

- Type: `database`
- Version: `14.12`
- Cryptography: `AES-256`
- Purpose: Encrypted QR transaction reconciliation store

### qr-integrity-hash

- Type: `library`
- Version: `1.4.0`
- Cryptography: `SHA-256`
- Purpose: QR payload and notification integrity checks


## Relationship Map

- Consumer Wallets -> Merchant QR Edge: scan/pay QR
- Merchant QR Edge -> QR Payment Switch: TLS 1.2 ECDSA
- QR Payment Switch -> Acquirer Gateway: ECDH
- QR Payment Switch -> Bank/E-Wallet Participants: CALLS
- QR Payment Switch -> Settlement Vault: AES-256

## Assessment Intent

High-volume retail edge with mobile wallet and acquiring-bank exposure.

Expected scan result: Internet-edge and partner-facing findings should rank high where TLS 1.2, ECDSA, ECDH, and RSA signing appear near QR payment ingress and merchant notification APIs.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, PINs, account numbers, customer proxy ID values, customer data, or real production IPs. Use it only for scanner validation.

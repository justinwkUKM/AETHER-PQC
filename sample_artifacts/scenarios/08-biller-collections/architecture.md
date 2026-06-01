# Biller Collections Architecture Narrative

Organization: Anonymous Anonymous network operator Biller Rail Lab
Assessment type: synthetic payment-network-inspired PQC readiness scan
Data classification: synthetic test evidence only

## Public Product Inspiration

Inspired by public Anonymous network operator descriptions of Biller Presentment as a national online bill-payment initiative operated by Anonymous network operator across participating banks and billers.

This artifact does not describe Anonymous network operator internal architecture. It is a fictional production-grade scenario based on publicly described payment product categories and RTGS concepts.

## System Summary

Synthetic bill-payment collection platform inspired by Biller Presentment: biller code lookup, online/mobile banking bill payment, biller-bank settlement files, and real-time notifications.

## Network Zones And Trust Boundaries

- Consumer Bank Channels
- Biller Code Directory
- Biller Bank Gateway
- Collection Router
- Settlement File Processor
- Biller Reporting Portal

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, participant, managed private network, internal, private, batch, and recovery site where relevant.

## Components And Cryptographic Controls

### biller-code-directory

- Type: `application`
- Version: `9.0.2`
- Cryptography: `TLS 1.3 with SHA-256`
- Purpose: Biller code lookup and bill reference validation

### biller-bank-gateway

- Type: `application`
- Version: `7.2.4`
- Cryptography: `ECDSA-P256`
- Purpose: Partner-facing biller bank API integration

### collection-router

- Type: `service`
- Version: `6.5.0`
- Cryptography: `RSA-2048`
- Purpose: Signs bill payment confirmation payloads

### legacy-settlement-file-processor

- Type: `worker`
- Version: `3.1.6`
- Cryptography: `3DES`
- Purpose: Legacy encrypted settlement file export

### biller-reporting-portal

- Type: `application`
- Version: `4.0.0`
- Cryptography: `TLS 1.2`
- Purpose: Biller-facing report download and reconciliation

### collection-ledger

- Type: `database`
- Version: `15.1`
- Cryptography: `AES-256`
- Purpose: Encrypted bill payment ledger


## Relationship Map

- Consumer Bank Channels -> Biller Code Directory: lookup
- Biller Code Directory -> Biller Bank Gateway: partner API
- Biller Bank Gateway -> Collection Router: RSA confirmation
- Collection Router -> Settlement File Processor: 3DES batch
- Collection Router -> Biller Reporting Portal: TLS 1.2

## Assessment Intent

Mixed partner-facing biller integrations and internal settlement file risks.

Expected scan result: Partner-facing biller bank API and biller notification endpoints should be high priority when using ECDSA/RSA; internal batch 3DES settlement files should be medium/high but below public edge.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, PINs, account numbers, customer proxy ID values, customer data, or real production IPs. Use it only for scanner validation.

# Direct Bank Gateway Architecture Narrative

Organization: Anonymous Anonymous network operator E-Commerce Rail Lab
Assessment type: synthetic payment-network-inspired PQC readiness scan
Data classification: synthetic test evidence only

## Public Product Inspiration

Inspired by public Anonymous network operator descriptions of Direct Bank Gateway as a real-time online payment gateway used for e-commerce and bank-account payments.

This artifact does not describe Anonymous network operator internal architecture. It is a fictional production-grade scenario based on publicly described payment product categories and RTGS concepts.

## System Summary

Synthetic real-time online banking payment gateway inspired by Direct Bank Gateway: merchant checkout, bank selection, bank redirect, authorisation, debit confirmation, and merchant receipt notification.

## Network Zones And Trust Boundaries

- Merchant Checkout
- Direct Bank Gateway Redirect Edge
- Bank Selection Service
- Participant Bank Bridge
- Confirmation Router
- Merchant Receipt API

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, participant, managed private network, internal, private, batch, and recovery site where relevant.

## Components And Cryptographic Controls

### merchant-checkout-adapter

- Type: `library`
- Version: `6.1.0`
- Cryptography: `RSA-3072`
- Purpose: Signs payment initiation requests from merchant checkout

### fpx-redirect-edge

- Type: `application`
- Version: `8.7.3`
- Cryptography: `TLS 1.2 RSA key exchange`
- Purpose: Public customer redirect and bank selection entry point

### bank-session-bridge

- Type: `service`
- Version: `4.4.1`
- Cryptography: `ECDH P-256`
- Purpose: Session establishment with participant internet banking endpoints

### payment-confirmation-router

- Type: `application`
- Version: `5.5.0`
- Cryptography: `TLS 1.3 with ML-KEM hybrid exchange`
- Purpose: Merchant payment status notifications

### transaction-ledger

- Type: `database`
- Version: `15.2`
- Cryptography: `AES-256`
- Purpose: Encrypted real-time payment ledger

### receipt-integrity-worker

- Type: `worker`
- Version: `2.0.8`
- Cryptography: `SHA-384`
- Purpose: Receipt and audit event integrity hashing


## Relationship Map

- Merchant Checkout -> Direct Bank Gateway Redirect Edge: TLS 1.2 RSA
- Direct Bank Gateway Redirect Edge -> Bank Selection Service: USES
- Bank Selection Service -> Participant Bank Bridge: ECDH
- Participant Bank Bridge -> Confirmation Router: CALLS
- Confirmation Router -> Merchant Receipt API: TLS 1.3 ML-KEM

## Assessment Intent

Critical merchant checkout and bank redirect exposure with classical crypto in high-value flows.

Expected scan result: Public merchant checkout endpoints and bank redirect endpoints should elevate TLS 1.2 RSA/ECDH findings; internal AES-256 and SHA-384 controls should remain low risk.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, PINs, account numbers, customer proxy ID values, customer data, or real production IPs. Use it only for scanner validation.

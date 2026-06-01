# Card and Cash Switch Architecture Narrative

Organization: Anonymous Anonymous network operator Card and ATM Rail Lab
Assessment type: synthetic payment-network-inspired PQC readiness scan
Data classification: synthetic test evidence only

## Public Product Inspiration

Inspired by public Anonymous network operator descriptions of Domestic Debit as domestic debit card acceptance and Shared Cash Network as an interbank ATM switching infrastructure.

This artifact does not describe Anonymous network operator internal architecture. It is a fictional production-grade scenario based on publicly described payment product categories and RTGS concepts.

## System Summary

Synthetic domestic debit and shared ATM switching platform inspired by Domestic Debit and Shared Cash Network: POS acquiring, ATM withdrawals, issuer routing, token validation, and cash-out controls.

## Network Zones And Trust Boundaries

- Merchant POS Terminals
- ATM Estate
- Acquirer Edge
- Debit Switch
- Issuer Bank Bridge
- Token Vault

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, participant, managed private network, internal, private, batch, and recovery site where relevant.

## Components And Cryptographic Controls

### pos-acquirer-edge

- Type: `application`
- Version: `6.0.7`
- Cryptography: `ECDH P-256`
- Purpose: Merchant POS terminal session setup

### atm-gateway

- Type: `application`
- Version: `5.4.9`
- Cryptography: `TLS 1.1`
- Purpose: Shared ATM withdrawal gateway compatibility listener

### issuer-switch-router

- Type: `service`
- Version: `8.2.0`
- Cryptography: `RSA-2048`
- Purpose: Issuer routing host-key validation

### legacy-hsm-signing-profile

- Type: `service`
- Version: `2.2.5`
- Cryptography: `DSA`
- Purpose: Legacy transaction authorisation signature profile

### card-token-vault

- Type: `database`
- Version: `12.7`
- Cryptography: `AES-256`
- Purpose: Encrypted PAN token vault

### tap-on-phone-pilot

- Type: `application`
- Version: `1.0.3`
- Cryptography: `TLS 1.3 with ML-KEM hybrid exchange`
- Purpose: Pilot mobile acceptance endpoint


## Relationship Map

- Merchant POS Terminals -> Acquirer Edge: ECDH POS
- ATM Estate -> Acquirer Edge: TLS 1.1
- Acquirer Edge -> Debit Switch: CALLS
- Debit Switch -> Issuer Bank Bridge: RSA host key
- Debit Switch -> Token Vault: AES-256

## Assessment Intent

Retail POS and ATM edge exposure with legacy HSM and host-key cryptography.

Expected scan result: POS/acquirer and ATM gateway findings should be high where RSA, DSA, ECDH, and TLS 1.1 are present; token vault AES-256 should remain low risk.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, PINs, account numbers, customer proxy ID values, customer data, or real production IPs. Use it only for scanner validation.

# HarborView Legacy Estate Architecture And Security Specification

Fictional product: **HarborView Legacy Estate**
Deployment model: **acquired on-prem estate**
Scenario purpose: incomplete acquired infrastructure estate

Organization: Fictional Acquisition Program
Assessment type: synthetic enterprise PQC readiness scan
Data classification: synthetic test evidence only

## System Summary

Incomplete newly acquired estate with conflicting proxy and VPN naming, scanned architecture notes, and unknown ownership.

## Network Zones And Trust Boundaries

- Public Internet
- Legacy VPN
- Old Proxy
- Acquired DMZ
- Inventory Server
- Unknown Data Store

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, internal, private, batch, and offline where relevant.

## Components And Cryptographic Controls

### legacy-vpn-appliance

- Type: `application`
- Version: `unknown`
- Cryptography: `SSL with RC4`
- Purpose: Internet-facing remote access VPN from acquired company

### old-proxy-or-gw01

- Type: `application`
- Version: `unknown`
- Cryptography: `RSA-1024`
- Purpose: Possibly same as Gateway-01 in scanned diagram

### inventory-server

- Type: `server`
- Version: `2008R2`
- Cryptography: `TLS 1.1`
- Purpose: Acquired inventory management system

### file-drop-share

- Type: `data`
- Version: `unknown`
- Cryptography: `3DES`
- Purpose: Legacy encrypted file drop

### future-transition-plan

- Type: `document`
- Version: `draft`
- Cryptography: `ML-KEM`
- Purpose: Planned migration target not yet implemented


## Relationship Map

- Public Internet -> Legacy VPN: SSL RC4
- Legacy VPN -> Old Proxy: RSA-1024
- Old Proxy -> Acquired DMZ: TLS 1.1
- Acquired DMZ -> Inventory Server: CALLS
- Inventory Server -> Unknown Data Store: 3DES

## Assessment Intent

Ambiguous AI-heavy extraction and conflicting evidence.

Expected scan result: Critical review-needed findings. Gemini/batch analysis should connect old proxy, internet VPN, SSL, RC4, RSA-1024, and owner-unknown nodes with confidence below perfect certainty.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, or real customer data. Use it only for scanner validation.

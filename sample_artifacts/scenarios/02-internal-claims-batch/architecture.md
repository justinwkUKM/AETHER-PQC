# Internal Claims Batch Architecture Narrative

Organization: Anonymous Insurance Operator
Assessment type: synthetic enterprise PQC readiness scan
Data classification: synthetic test evidence only

## System Summary

Private claims adjudication batch estate processing nightly policy and claims files inside isolated back-office networks.

## Network Zones And Trust Boundaries

- Corporate Private Network
- Batch Scheduler
- Claims Processor
- Archive Store
- Offline Tape Export

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, internal, private, batch, and offline where relevant.

## Components And Cryptographic Controls

### claims-batch-scheduler

- Type: `application`
- Version: `11.2.0`
- Cryptography: `RSA-3072`
- Purpose: Signs nightly claim manifest files

### legacy-archive-encryptor

- Type: `library`
- Version: `4.0.8`
- Cryptography: `3DES`
- Purpose: Encrypts historical claim bundles before offline export

### reconciliation-checksum

- Type: `library`
- Version: `1.7.5`
- Cryptography: `SHA-1`
- Purpose: Legacy checksum for nightly reconciliation reports

### claims-data-store

- Type: `database`
- Version: `15.4`
- Cryptography: `AES-256`
- Purpose: Private claims data at rest

### future-signing-pilot

- Type: `library`
- Version: `0.9.0`
- Cryptography: `ML-DSA`
- Purpose: Pilot signature workflow for future claim manifests


## Relationship Map

- Corporate Private Network -> Batch Scheduler: private subnet
- Batch Scheduler -> Claims Processor: offline batch
- Claims Processor -> Archive Store: 3DES archive
- Claims Processor -> Offline Tape Export: SHA-1 manifest
- Batch Scheduler -> Archive Store: RSA-3072 signing

## Assessment Intent

Vulnerable but buried/internal findings with lower exposure.

Expected scan result: Medium or high remediation driven by RSA-3072, 3DES, and SHA-1, but not internet-edge critical because artifacts repeatedly state private, internal, offline, and batch.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, or real customer data. Use it only for scanner validation.

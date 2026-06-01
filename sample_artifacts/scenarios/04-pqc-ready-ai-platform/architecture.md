# PQC-Ready AI Platform Architecture Narrative

Organization: Anonymous Research Cloud Operator
Assessment type: synthetic enterprise PQC readiness scan
Data classification: synthetic test evidence only

## System Summary

AI inference platform with a mostly quantum-safe target architecture and one historical ambiguous RSA reference for review handling.

## Network Zones And Trust Boundaries

- Research User Network
- Inference Gateway
- Model Router
- GPU Inference Pool
- Vector Store
- Model Registry

The assessment intentionally includes exposure keywords that the scanner should interpret in context: public, internet, external, gateway, ingress, load balancer, DMZ, partner, vendor, internal, private, batch, and offline where relevant.

## Components And Cryptographic Controls

### inference-gateway

- Type: `application`
- Version: `3.2.0`
- Cryptography: `TLS 1.3 with ML-KEM hybrid exchange`
- Purpose: Authenticated research inference API

### service-identity-plane

- Type: `service`
- Version: `2.0.0`
- Cryptography: `ML-DSA`
- Purpose: Service identity signatures

### model-registry

- Type: `data`
- Version: `2026.05`
- Cryptography: `AES-256`
- Purpose: Encrypted model artifact storage

### embedding-integrity

- Type: `library`
- Version: `1.4.1`
- Cryptography: `SHA-384`
- Purpose: Embedding and vector index integrity

### historical-rsa-migration-note

- Type: `document`
- Version: `archived`
- Cryptography: `RSA`
- Purpose: Historical 2024 migration note, not current runtime control


## Relationship Map

- Research User Network -> Inference Gateway: TLS 1.3 ML-KEM
- Inference Gateway -> Model Router: ML-DSA identity
- Model Router -> GPU Inference Pool: TLS 1.3
- GPU Inference Pool -> Vector Store: SHA-384
- Model Router -> Model Registry: AES-256

## Assessment Intent

Mostly safe/ready behavior with a low-confidence historical finding.

Expected scan result: Low effective risk overall. ML-KEM, ML-DSA, AES-256, SHA-384, and TLS 1.3 should dominate; historical RSA should be visible but described as archived context.

## Source Control And Data Hygiene

This document is fictional and contains no credentials, private keys, tokens, or real customer data. Use it only for scanner validation.

# High-Throughput Financial Clearinghouse Specification: ApexTransact

## 1. Executive Summary
This document specifies the cryptographic architecture of ApexTransact, our core high-throughput transaction clearing and settlement engine. ApexTransact coordinates ledger balances, clearing house settlements, and bank-to-bank wire receipts. 

Currently, the transit paths and signature schemes are highly dependent on classical cryptographic algorithms (RSA and ECDSA). In anticipation of Cryptanalytically Relevant Quantum Computers (CRQCs), this document marks our present vulnerable architecture and drafts the Post-Quantum Cryptography (PQC) migration path.

---

## 2. Infrastructure Inventory & Exposure Model

We have mapped five critical transaction components with significant classical exposure:

### Node 1: SWIFT Bank Gateway
* **Label**: `Application`
* **Vulnerability Score**: `8.5` (Critical Extranet Ingress)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 tunnel employing TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
  * Target Migration: `TLS 1.3 with hybrid X25519 and ML-KEM-768 key exchange`
* **Purpose**: Manages communication, ingress, and transaction matching from global correspondent banking endpoints.

### Node 2: Settlement Validation Engine
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `9.0` (Critical Signature Core)
* **Cryptographic Primitives**:
  * Current: `ECDSA-P256 with SHA-256 for signing clearinghouse ledger receipts`
  * Target Migration: `ML-DSA-65 signatures for quantum-resistant verification`
  * HSM Compliance: FIPS 140-3 transition required
* **Purpose**: Core transaction validation engine verifying settlement receipt non-repudiation before database ledger entry.

### Node 3: Core Transaction Ledger (Oracle DB)
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.5` (High Data Exposure)
* **Cryptographic Primitives**:
  * Current: `AES-256 transparent storage encryption, with data encryption keys wrapped via classical RSA-2048`
  * Target Migration: `Database storage encryption integrated with PQC-ready ML-KEM-1024 wrapping`
* **Purpose**: Holds full transactional balances, clearing archives, and customer accounts.

### Node 4: Settlement Reporting S3 Storage
* **Label**: `DataAsset`
* **Vulnerability Score**: `9.2` (Critical HNDL Danger)
* **Cryptographic Primitives**:
  * Current: `HTTPS endpoint authenticated via classical RSA-4096 certificate chains`
  * Target Migration: `mTLS endpoints leveraging ML-DSA-85 signed certificate validation`
* **Purpose**: Retains archival PDF settlement records. Highly vulnerable to "Harvest Now, Decrypt Later" (HNDL) attacks.

### Node 5: Fedwire External Service
* **Label**: `ExternalService`
* **Vulnerability Score**: `6.5` (Moderate External Exposure)
* **Cryptographic Primitives**:
  * Current: `External API integrations using standard ECDSA-P384 signatures`
  * Target Migration: `Hybrid Kyber TLS and ML-DSA signature envelopes`
* **Purpose**: Bank-of-last-resort routing interface for real-time reserve adjustments.

---

## 3. Communication Link Relationships

1. **SWIFT Bank Gateway** (Application) connects to **Settlement Validation Engine** (SoftwareComponent) via `DEPENDS_ON` link to validate inbound requests.
2. **Settlement Validation Engine** (SoftwareComponent) connects to **Core Transaction Ledger** (DataAsset) via `PROCESSES` connection to write ledger rows.
3. **SWIFT Bank Gateway** (Application) connects to **Settlement Reporting S3 Storage** (DataAsset) via `USES` to write transaction receipt PDFs.
4. **Settlement Validation Engine** (SoftwareComponent) connects to **Fedwire External Service** (ExternalService) via `CALLS` for downstream real-time settlements.

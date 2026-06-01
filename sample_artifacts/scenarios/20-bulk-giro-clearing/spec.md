# Regional Automated Clearing House (Bulk Clearing House) GIRO Specification

## 1. Executive Summary
This document specifies the cryptographic design and deployment parameters of the Regional Automated Clearing House (Bulk Clearing House) bulk Interbank GIRO (GIRO) payment clearing scheduler, operated by Clearing Services Operator. Bulk Clearing House handles bulk commercial transactions, corporate payroll batches, and municipal bill payments in SGD.

Because Bulk Clearing House processes high-volume corporate financial transactions that settle in daily batches, the primary security threat is the long-term decryption of historic batch archive logs. The system relies on classical PGP encryption (RSA-2048 keys) for payroll file protection, signed with SHA-1/RSA-2048, which presents high risk under Shor’s algorithm.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-volume transaction entities:

### Node 1: GIRO Corporate Ingest Server
* **Label**: `Application`
* **Vulnerability Score**: `7.2` (Large B2B Extranet Surface)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 secure batch file uploads and SSH SFTP using classical RSA-2048 keys`
  * Target Migration: `SFTP channels upgraded to support hybrid ML-KEM and ML-DSA-65 keys`
* **Purpose**: Primary extranet portal for corporate clients to upload massive GIRO invoicing batches and download payment summaries.

### Node 3: GIRO Batch Parser Engine
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.0` (Invoicing Validation Core)
* **Cryptographic Primitives**:
  * Current: `ECDSA-P256 and SHA-256 signature verification on bulk XML payment tokens`
  * Target Migration: `ML-DSA-65 signatures for document verification`
* **Purpose**: Parses uploaded bulk presentment files, validates syntax, and writes record entries into the database.

### Node 2: Bulk Clearing House Interbank Settlement Coordinator
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.5` (Critical Clearing Scheduler)
* **Cryptographic Primitives**:
  * Current: `Bulk payment routing secured using static Diffie-Hellman (DH-2048) ciphers`
  * Target Migration: `Ephemerally negotiated ML-KEM-1024 ciphers`
* **Purpose**: Coordinates daily interbank net settlement summaries and generates credit/debit batch entries.

### Node 4: Bulk Clearing House Corporate Clearing Archive
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.6` (Financial Database)
* **Cryptographic Primitives**:
  * Current: `AES-256 transparent tablespace database encryption, with key transport wrapped via classical RSA-2048`
  * Target Migration: `ML-KEM-1024 database envelope wrapping`
* **Purpose**: Critical database repository storing clearing accounts, history profiles, and payroll summaries.

### Node 5: Participant Commercial Clearing Banks
* **Label**: `ExternalService`
* **Vulnerability Score**: `6.8` (Third-Party Clearing Extranets)
* **Cryptographic Primitives**:
  * Current: `Partner billing API integrations utilizing standard RSA-4096 signature certificates`
  * Target Migration: `Hybrid post-quantum messaging certificates`
* **Purpose**: Participant clearing banks (Bank A, Bank B, Bank C) that upload and receive daily cleared settlement responses.

---

## 3. Communication Link Relationships

1. **GIRO Corporate Ingest Server** (Application) connects to **GIRO Batch Parser Engine** (SoftwareComponent) via `DEPENDS_ON` link to upload billing arrays.
2. **GIRO Batch Parser Engine** (SoftwareComponent) connects to **Bulk Clearing House Interbank Settlement Coordinator** (SoftwareComponent) via `DEPENDS_ON` link to trigger net settlements.
3. **Bulk Clearing House Interbank Settlement Coordinator** (SoftwareComponent) connects to **Bulk Clearing House Corporate Clearing Archive** (DataAsset) via `PROCESSES` connection to write ledger records.
4. **Bulk Clearing House Interbank Settlement Coordinator** (SoftwareComponent) connects to **Participant Commercial Clearing Banks** (ExternalService) via `CALLS` connection to notify partner banks of cleared batches.

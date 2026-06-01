# Anonymous network operator Biller Presentment Bill Presentment Specification

## 1. Executive Summary
This document specifies the cryptographic design and systems topology of Biller Presentment, a regional bill payment scheme. Biller Presentment allows billers (such as telecom providers, municipal councils, electricity grids, and insurers) to present bulk electronic invoices that bank customers can pay via mobile and online banking platforms.

Biller Presentment relies on massive daily batch processing files (invoicing arrays) transferred via SFTP and processed inside high-throughput clearing houses. Due to the diverse nature of corporate billers (ranging from large telecom hubs to small district utility firms), Biller Presentment represents a vast B2B attack surface. Securing these B2B connections against post-quantum intercept is an absolute priority.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-volume transaction entities:

### Node 1: Biller Presentment Biller Ingress Server
* **Label**: `Application`
* **Vulnerability Score**: `7.2` (Large B2B Surface)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 secure file uploads and SSH SFTP using classical RSA-2048 keys`
  * Target Migration: `SFTP upgraded to support hybrid ML-KEM and ML-DSA-65 keys`
* **Purpose**: Primary ingress hub for corporate billers to securely upload invoicing arrays and download paid transaction summaries.

### Node 2: Invoicing XML Presentment Engine
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.0` (Invoicing Validation Core)
* **Cryptographic Primitives**:
  * Current: `ECDSA-P256 signature verification on bulk XML payment tokens`
  * Target Migration: `ML-DSA-65 signatures for document verification`
* **Purpose**: Parses uploaded bulk bill presentment files, validates invoice syntax and amounts, and registers records in the database.

### Node 3: Bulk Giro Payment Dispatcher
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.5` (Critical Clearing Engine)
* **Cryptographic Primitives**:
  * Current: `Bulk payment routing secured using static Diffie-Hellman (DH-2048) ciphers`
  * Target Migration: `Ephemerally negotiated ML-KEM-1024 ciphers`
* **Purpose**: Aggregates bill payment responses and initiates Interbank GIRO (IBG) debit files to route funds from consumers' retail accounts to corporate biller clearing accounts.

### Node 4: Biller Settlement Archives
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.6` (Financial Database)
* **Cryptographic Primitives**:
  * Current: `AES-256 database column encryption, with key transport wrapped via classical RSA-2048`
  * Target Migration: `ML-KEM-1024 database envelope wrapping`
* **Purpose**: Highly secure database storing biller registration profiles, transaction histories, and clearing identifiers.

### Node 5: External Utility Billers
* **Label**: `ExternalService`
* **Vulnerability Score**: `6.8` (Third-Party Extranet)
* **Cryptographic Primitives**:
  * Current: `Partner billing API integrations utilizing standard RSA-4096 signature certificates`
  * Target Migration: `Hybrid post-quantum messaging certificates`
* **Purpose**: External utility and corporate biller networks (such as Utility Biller A, Utility Biller B, and Media Biller C) receiving daily cleared funds lists.

---

## 3. Communication Link Relationships

1. **Biller Presentment Biller Ingress Server** (Application) connects to **Invoicing XML Presentment Engine** (SoftwareComponent) via `DEPENDS_ON` link to upload billing arrays.
2. **Invoicing XML Presentment Engine** (SoftwareComponent) connects to **Bulk Giro Payment Dispatcher** (SoftwareComponent) via `DEPENDS_ON` link to trigger settlements.
3. **Bulk Giro Payment Dispatcher** (SoftwareComponent) connects to **Biller Settlement Archives** (DataAsset) via `PROCESSES` connection to write ledger records.
4. **Bulk Giro Payment Dispatcher** (SoftwareComponent) connects to **External Utility Billers** (ExternalService) via `CALLS` connection to notify partner billing systems.

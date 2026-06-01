# ApexNet ChequeClear Cheque Clearing System Specification

## 1. Executive Summary
This document specifies the cryptographic design and operational parameters of ChequeClear, the national automated electronic cheque image clearing and presentment system. ChequeClear coordinates daily clearing of high-resolution digital cheque images and MICR data files submitted by participating financial institutions.

Because ChequeClear processes and archives millions of critical financial document images that must be retained for at least 7 years, the primary security threat is the long-term decryption of historic batch archives. ChequeClear relies on legacy signature standards (SHA-1/DSA) and older encryption algorithms (3DES) for bulk image compression, presenting a high risk.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-volume transaction entities:

### Node 1: Cheque Image Ingestion Server
* **Label**: `Application`
* **Vulnerability Score**: `7.5` (High Ingestion Exposure)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 tunnels using RSA-2048 certificates`
  * Target Migration: `TLS 1.3 with hybrid X25519 + ML-KEM-768`
* **Purpose**: Primary extranet endpoint for commercial banks to upload daily zip archives containing scanned cheque images and settlement data files.

### Node 2: Cheque Image Signature Validator
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.8` (Obsolete Signatures)
* **Cryptographic Primitives**:
  * Current: `Obsolete DSA and SHA-1 signatures for bank upload non-repudiation`
  * Target Migration: `SLH-DSA or ML-DSA-65 signatures for document verification`
* **Purpose**: Validates signatures on incoming zip packages to confirm authenticity, verify integrity, and prevent duplicate presentments.

### Node 3: Cheque Image Archiver
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `6.8` (Obsolete Encryption)
* **Cryptographic Primitives**:
  * Current: `Bulk batch compression using legacy 3DES encryption`
  * Target Migration: `AES-256 GCM bulk encryption`
* **Purpose**: Compresses, aggregates, and encrypts scanned cheque images before transferring them to long-term database storage.

### Node 4: National Cheque Archive Storage
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.8` (High-Value Storage)
* **Cryptographic Primitives**:
  * Current: `AES-256 database tables with key transport wrapped via classical RSA-2048`
  * Target Migration: `AWS KMS envelope keys wrapped using ML-KEM-1024`
* **Purpose**: Secure archival storage containing historical cheque images, signatures, and clearing accounts.

### Node 5: Bank Member Clearing Nodes
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.0` (Partner SFTP channels)
* **Cryptographic Primitives**:
  * Current: `SFTP automated transfers using static RSA-2048 SSH keys`
  * Target Migration: `Quantum-safe SSH configurations leveraging hybrid ML-DSA-65 ciphers`
* **Purpose**: External processing terminals operated by partner commercial banks that download cleared cheque responses and upload presentments.

---

## 3. Communication Link Relationships

1. **Cheque Image Ingestion Server** (Application) connects to **Cheque Image Signature Validator** (SoftwareComponent) via `DEPENDS_ON` link to authenticate incoming batch uploads.
2. **Cheque Image Ingestion Server** (Application) connects to **Cheque Image Archiver** (SoftwareComponent) via `DEPENDS_ON` link to compress valid uploads.
3. **Cheque Image Archiver** (SoftwareComponent) connects to **National Cheque Archive Storage** (DataAsset) via `PROCESSES` connection to write encrypted data files.
4. **Cheque Image Ingestion Server** (Application) connects to **Bank Member Clearing Nodes** (ExternalService) via `CALLS` connection for SFTP batch coordination.

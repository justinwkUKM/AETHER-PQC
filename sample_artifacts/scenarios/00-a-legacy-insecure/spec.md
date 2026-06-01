# Legacy Insecure Network Architecture Specification: Classical Exposures

## 1. Executive Summary
This document registers the obsolete and highly exposed cryptographic inventory of the legacy ApexNet proxy network. It serves as a benchmark threat model. The current infrastructure relies exclusively on classical, pre-quantum standards, presenting major vulnerabilities to "Harvest Now, Decrypt Later" (HNDL) attacks by quantum adversaries.

---

## 2. Infrastructure Inventory & Exposure Model

We have mapped the following highly vulnerable legacy network components:

### Node 1: Legacy Proxy
* **Label**: `Application`
* **Vulnerability Score**: `9.8` (Critical Danger)
* **Cryptographic Primitives**: 
  * Current: `SSL v3 / TLS 1.0 utilizing RC4-128 and MD5 hashing`
  * Target Migration: `X25519 + ML-KEM-768 hybrid TLS 1.3 exchange`
* **Purpose**: Gateway proxy routing external user requests from public networks into internal environments.

### Node 2: Old Gateway
* **Label**: `Application`
* **Vulnerability Score**: `9.2` (Critical Vulnerability)
* **Cryptographic Primitives**:
  * Current: `Classical SSH v1 using 1024-bit RSA key exchanges`
  * Target Migration: `ML-DSA-65 authenticated SSH channels`
* **Purpose**: Coordinates access routing between the DMZ proxy and inner intranet services.

### Node 3: Standard RDS
* **Label**: `DataAsset`
* **Vulnerability Score**: `8.9` (High Risk)
* **Cryptographic Primitives**:
  * Current: `DES (Triple DES) storage-at-rest encryption with standard md5 checksum validation`
  * Target Migration: `Quantum-resistant AES-256 with KMS integration`
* **Purpose**: Holds customer credit card transaction data and active API tokens.

### Node 4: Unsecured S3 Bucket
* **Label**: `DataAsset`
* **Vulnerability Score**: `9.5` (Critical Exposure)
* **Cryptographic Primitives**:
  * Current: `Public unencrypted HTTP endpoint`
  * Target Migration: `ML-DSA-85 signed private bucket access policies`
* **Purpose**: Stores historical PDF invoices and unencrypted customer data backups.

---

## 3. Legacy Vulnerable Connections

1. **Legacy Proxy** (Application) connects to **Old Gateway** (Application) via `SSL v3 Encrypted Tunnel`.
2. **Old Gateway** (Application) connects to **Standard RDS** (DataAsset) via `Unencrypted Intranet Connection`.
3. **Legacy Proxy** (Application) connects to **Unsecured S3 Bucket** (DataAsset) via `Unencrypted HTTP Feed` for static assets.

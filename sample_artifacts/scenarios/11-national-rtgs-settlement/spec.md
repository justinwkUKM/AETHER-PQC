# ApexNet ApexRTGS Real-Time Gross Settlement System Specification

## 1. Executive Summary
This document registers the cryptographic infrastructure and security controls of ApexRTGS (Real-Time Electronic Transfer of Funds and Securities System), Malaysia's national high-value Real-Time Gross Settlement (RTGS) system. ApexRTGS handles irrevocable settlements of interbank funds transfers, government bond sales, and debt securities trades.

Due to the immense financial value processed hourly, ApexRTGS is the primary target for nation-state adversaries utilizing "Harvest Now, Decrypt Later" (HNDL) schemes to capture clearing streams. The current architecture relies heavily on classical public-key cryptography (RSA-4096 and ECDSA-P256) to sign financial instructions and secure VPN tunnels, creating severe systemic risk.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-value transaction entities:

### Node 1: SWIFT RTGS Ingress Gateway
* **Label**: `Application`
* **Vulnerability Score**: `8.5` (Critical Extranet Boundary)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 tunnels using TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
  * Target Migration: `TLS 1.3 with hybrid X25519 + ML-KEM-1024 ciphers`
* **Purpose**: Primary partner ingress gateway terminating SWIFT message queues and routing payment files from commercial bank members into the clearing core.

### Node 2: ApexRTGS Settlement Core
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `9.0` (Critical Settlement Verification)
* **Cryptographic Primitives**:
  * Current: `ECDSA-P256 and SHA-256 for non-repudiation signature verification on individual payment instructions`
  * Target Migration: `ML-DSA-85 signatures for quantum-safe settlement validation`
* **Purpose**: Core real-time gross settlement validator processing debit and credit transactions individually and irrevocably.

### Node 3: Government Securities Depository
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.5` (High Capital Value)
* **Cryptographic Primitives**:
  * Current: `AES-256 storage-at-rest database encryption, with key transport wrapped via classical RSA-2048`
  * Target Migration: `PQC-ready AWS KMS keys wrapped using ML-KEM-1024`
* **Purpose**: Record of ownership for all treasury bills, national bonds, and institutional commercial papers.

### Node 4: ApexRTGS Central Bank Reserve Ledger
* **Label**: `DataAsset`
* **Vulnerability Score**: `9.2` (Critical Systemic Target)
* **Cryptographic Primitives**:
  * Current: `Unencrypted database columns with TLS 1.2 database connection channels`
  * Target Migration: `Field-level envelope encryption leveraging ML-KEM-768 ciphers`
* **Purpose**: Maintains active reserve ledger balances for commercial bank accounts. High threat of data exfiltration and balance manipulation.

### Node 5: SWIFT Alliance Messaging Network
* **Label**: `ExternalService`
* **Vulnerability Score**: `6.5` (Moderate External exposure)
* **Cryptographic Primitives**:
  * Current: `External API integrations using standard RSA-4096 certificate signatures`
  * Target Migration: `Hybrid Kyber post-quantum messaging envelopes`
* **Purpose**: Connects the national clearinghouse to international SWIFT clearing services for cross-border currency exchanges.

---

## 3. Communication Link Relationships

1. **SWIFT RTGS Ingress Gateway** (Application) connects to **ApexRTGS Settlement Core** (SoftwareComponent) via `DEPENDS_ON` link to transmit inbound interbank settlements.
2. **ApexRTGS Settlement Core** (SoftwareComponent) connects to **Government Securities Depository** (DataAsset) via `PROCESSES` connection to write bond ledger rows.
3. **ApexRTGS Settlement Core** (SoftwareComponent) connects to **ApexRTGS Central Bank Reserve Ledger** (DataAsset) via `PROCESSES` connection to perform debit/credit balances.
4. **ApexRTGS Settlement Core** (SoftwareComponent) connects to **SWIFT Alliance Messaging Network** (ExternalService) via `CALLS` connection for foreign currency routing.

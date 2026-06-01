# Retail POS Network Point-of-Sale Card Processing Hub Specification

## 1. Executive Summary
This document specifies the security controls and cryptographic architecture of Retail POS Network (Electronic Funds Transfer at Point of Sale), a regional debit card payment network. Retail POS Network connects retail POS terminals across the region to clear instant card-present retail transactions using ATM cards.

Because the system manages highly sensitive card-present transactions and customer PIN verification blocks (PIN blocks), securing host-to-host and terminal-to-host communication channels against decryption is highly critical. The current architecture employs legacy standards (such as 3DES PIN blocks and RSA-2048 terminal key exchanges), which must be modernized to prevent quantum-enabled retail fraud.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-volume transaction entities:

### Node 1: EFTPOS Merchant Terminal
* **Label**: `Application`
* **Vulnerability Score**: `7.5` (Exposed Retail Edge)
* **Cryptographic Primitives**: 
  * Current: `PIN blocks encrypted using legacy 3DES (ANSI X9.8), terminal-host key exchanges using classical RSA-2048`
  * Target Migration: `Quantum-safe session key exchange utilizing ML-KEM-768, with AES-256 for PIN block encryption`
* **Purpose**: physical payment terminal deployed at retail merchant checkout counters to capture card chips, capture consumer PINs, and verify funds.

### Node 2: Clearing Services Operator POS Ingest Hub
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.2` (Critical Transaction Gateway)
* **Cryptographic Primitives**:
  * Current: `TLS 1.2 secure connection channels utilizing TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
  * Target Migration: `Strict TLS 1.3 tunnels with hybrid X25519 + ML-KEM-1024 ciphers`
* **Purpose**: Core gateway terminating thousands of concurrent terminal connections, decrypting PIN blocks, and translating ATM messages into ISO 8583 banking packets.

### Node 3: POS Terminal Key Registry
* **Label**: `DataAsset`
* **Vulnerability Score**: `8.0` (High Security Store)
* **Cryptographic Primitives**:
  * Current: `Database rows encrypted with AES-256 transparent tables, with key transport wrapped via classical RSA-2048`
  * Target Migration: `AWS KMS envelope keys wrapped using ML-KEM-1024`
* **Purpose**: Core database repository storing Master Key/Session Key pairs for all active merchant POS terminals in the region. High threat of harvesting.

### Node 4: EFTPOS Retail Clearing DB
* **Label**: `DataAsset`
* **Vulnerability Score**: `8.6` (Core Transaction Store)
* **Cryptographic Primitives**:
  * Current: `Plaintext transactional columns, TLS 1.2 database connection channels`
  * Target Migration: `Field-level envelope encryption leveraging ML-KEM-768 ciphers`
* **Purpose**: Secure transactional database capturing active debit clearing sequences, transaction accounts, and merchant clearing IDs.

### Node 5: Partner Issuer Host Nodes
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.0` (Partner Interbank Network)
* **Cryptographic Primitives**:
  * Current: `Host-to-host mTLS channels running standard TLS 1.2 with RSA-2048 authentication`
  * Target Migration: `Enforced TLS 1.3 with hybrid ML-DSA-65 client certificates`
* **Purpose**: External connection points to participant consumer banks (such as participating banks) that verify PIN blocks and authorize funds.

---

## 3. Communication Link Relationships

1. **EFTPOS Merchant Terminal** (Application) connects to **Clearing Services Operator POS Ingest Hub** (SoftwareComponent) via `DEPENDS_ON` link to transmit transaction packets.
2. **Clearing Services Operator POS Ingest Hub** (SoftwareComponent) connects to **POS Terminal Key Registry** (DataAsset) via `PROCESSES` connection to fetch session keys.
3. **Clearing Services Operator POS Ingest Hub** (SoftwareComponent) connects to **EFTPOS Retail Clearing DB** (DataAsset) via `PROCESSES` connection to log transactions.
4. **Clearing Services Operator POS Ingest Hub** (SoftwareComponent) connects to **Partner Issuer Host Nodes** (ExternalService) via `CALLS` connection to route bank requests.

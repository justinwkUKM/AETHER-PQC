# eLionPay Online Payment Gateway Specification

## 1. Executive Summary
This document specifies the cryptographic design and deployment topology of eLionPay, the primary online payment gateway in Singapore that enables e-commerce websites to collect direct-to-bank payments. eLionPay orchestrates real-time checkout redirect flows, transferring transaction parameters securely to participating local bank portals (such as DBS, OCBC, and UOB).

Since eLionPay handles public web checkout redirections, it is heavily exposed to active network session intercepts and certificate spoofing. High-assurance cryptographic protection is required for browser redirection sequences to safeguard financial session integrity.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-volume transaction entities:

### Node 1: eLionPay Checkout Portal
* **Label**: `Application`
* **Vulnerability Score**: `8.2` (Public Web Edge)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 secure connections using classical RSA-2048 web server certificates`
  * Target Migration: `TLS 1.3 with hybrid X25519 + ML-KEM-768 certificates`
* **Purpose**: Primary web interface terminating consumer checkout transactions, providing bank selection panels, and managing checkout sessions.

### Node 2: Merchant Signature Verifier
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.0` (Core Parameter Validation)
* **Cryptographic Primitives**:
  * Current: `Traditional ECDSA-P256 payload signature verification on incoming payment tokens`
  * Target Migration: `ML-DSA-65 signatures for merchant token verification`
* **Purpose**: Validates merchant transaction parameters, amounts, and hashes to prevent checkout manipulation and price-tampering fraud.

### Node 3: Session Redirection Dispatcher
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.4` (Critical Session Coordinator)
* **Cryptographic Primitives**:
  * Current: `Browser redirection sessions secured using static Diffie-Hellman (DH-2048) ciphers`
  * Target Migration: `Ephemerally negotiated ML-KEM-768 key exchanges`
* **Purpose**: Generates redirection parameters and session parameters that route browser sessions to bank verification portals.

### Node 4: eLionPay Transaction Registry
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.2` (Financial Audit Log)
* **Cryptographic Primitives**:
  * Current: `AES-256 transparent tablespace database encryption with key-wrap RSA-2048`
  * Target Migration: `ML-KEM-1024 database envelope wrapping`
* **Purpose**: Database repository storing active online payment records, merchant settlement identifiers, and reconciliation data.

### Node 5: Participant Bank Portals
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.5` (Partner Bank Extranet)
* **Cryptographic Primitives**:
  * Current: `Redirect callbacks utilizing TLS 1.1 / 1.2 with ECDHE-RSA ciphers`
  * Target Migration: `Strict TLS 1.3 tunnels leveraging ML-KEM-768`
* **Purpose**: Participating consumer bank portals where account credentials are authenticated and transactions authorized.

---

## 3. Communication Link Relationships

1. **eLionPay Checkout Portal** (Application) connects to **Merchant Signature Verifier** (SoftwareComponent) via `DEPENDS_ON` link to validate incoming transaction requests.
2. **eLionPay Checkout Portal** (Application) connects to **Session Redirection Dispatcher** (SoftwareComponent) via `DEPENDS_ON` link to coordinate bank handshakes.
3. **Session Redirection Dispatcher** (SoftwareComponent) connects to **eLionPay Transaction Registry** (DataAsset) via `PROCESSES` connection to write session audit trails.
4. **Session Redirection Dispatcher** (SoftwareComponent) connects to **Participant Bank Portals** (ExternalService) via `CALLS` connection for authentication redirects.

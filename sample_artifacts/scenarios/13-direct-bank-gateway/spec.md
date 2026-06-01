# CheckoutBridge Direct Architecture And Security Specification

Fictional product: **CheckoutBridge Direct**
Deployment model: **hybrid ecommerce gateway**
Scenario purpose: merchant checkout and direct-bank gateway

## 1. Executive Summary
This document registers the cryptographic controls and security design of Direct Bank Gateway (Financial Process Exchange), CheckoutBridge Direct's widely integrated direct-to-bank online payment gateway. Direct Bank Gateway redirects consumers from merchant e-commerce websites directly to their online banking portal to complete payments via real-time bank account debiting.

Direct Bank Gateway interfaces with thousands of diverse merchant web platforms and all retail bank partners in the region. Because it coordinates bank redirect flows across a complex web browser environment, it is exposed to session hijacking, certificate spoofing, and man-in-the-middle attacks. Migrating to hybrid post-quantum cipher suites is crucial to secure high-value web sessions.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-volume transaction entities:

### Node 1: Direct Bank Gateway Checkout Portal
* **Label**: `Application`
* **Vulnerability Score**: `8.2` (Public-Facing Web Edge)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 with classical RSA-2048 web server certificates`
  * Target Migration: `TLS 1.3 with hybrid X25519 + ML-KEM-768 certificates`
* **Purpose**: Primary public-facing internet web interface that lets consumers select their bank and redirects them to secure bank-authenticated pages.

### Node 2: Merchant Authorization Validator
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.0` (Core Merchant Validation)
* **Cryptographic Primitives**:
  * Current: `Traditional ECDSA-P256 payload signature verification on incoming payment tokens`
  * Target Migration: `ML-DSA-65 signatures for merchant verification`
* **Purpose**: Validates merchant transaction parameters and signatures to prevent e-commerce checkout tampering and amount manipulation.

### Node 3: Bank Redirect Dispatcher
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.4` (Critical Routing Session)
* **Cryptographic Primitives**:
  * Current: `Secure sessions utilizing static Diffie-Hellman (DH-2048) ciphers`
  * Target Migration: `Ephemerally negotiated ML-KEM-768 keys`
* **Purpose**: Coordinates the generation of redirection tokens and session parameters that route browser sessions to bank verification portals.

### Node 4: Direct Bank Gateway Transaction History Ledger
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.2` (Financial Audit Log)
* **Cryptographic Primitives**:
  * Current: `AES-256 transparent tablespace database encryption with key-wrap RSA-2048`
  * Target Migration: `ML-KEM-1024 database envelope wrapping`
* **Purpose**: Stores historical transaction records, clearing references, and settlement identifiers for reconciliations.

### Node 5: Partner Bank Portals
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.5` (External Redirect Ingress)
* **Cryptographic Primitives**:
  * Current: `Legacy redirect callbacks using TLS 1.1 / 1.2 with ECDHE-RSA ciphers`
  * Target Migration: `Strict TLS 1.3 tunnels leveraging ML-KEM-768`
* **Purpose**: Participating consumer bank portals where account credentials are authenticated and transactions authorized.

---

## 3. Communication Link Relationships

1. **Direct Bank Gateway Checkout Portal** (Application) connects to **Merchant Authorization Validator** (SoftwareComponent) via `DEPENDS_ON` link to validate incoming transaction requests.
2. **Direct Bank Gateway Checkout Portal** (Application) connects to **Bank Redirect Dispatcher** (SoftwareComponent) via `DEPENDS_ON` link to coordinate bank handshakes.
3. **Bank Redirect Dispatcher** (SoftwareComponent) connects to **Direct Bank Gateway Transaction History Ledger** (DataAsset) via `PROCESSES` connection to write session audit trails.
4. **Bank Redirect Dispatcher** (SoftwareComponent) connects to **Partner Bank Portals** (ExternalService) via `CALLS` connection for authentication redirects.

# ApexNet DuitInstant Instant Retail Clearing Engine Specification

## 1. Executive Summary
This document specifies the cryptographic design and deployment topology of ApexNet DuitInstant, the national retail real-time account-to-account payments system. DuitInstant handles hundreds of thousands of retail transactions per second, utilizing mobile numbers, national registration numbers (NRIC), and business entities to resolve bank routing and settle funds instantly.

Due to the extreme transaction volume and high visibility of retail e-wallets, the DuitInstant platform is heavily exposed to mobile security threats and active intercept of consumer credential lookups. High-performance, low-latency cryptographic agility is mandatory here; replacing classical key mechanisms cannot trigger any latency bottlenecks.

---

## 2. Infrastructure Inventory & Exposure Model

The system boundaries are defined by five high-volume transaction entities:

### Node 1: DuitInstant Mobile Ingress Gateway
* **Label**: `Application`
* **Vulnerability Score**: `8.0` (Highly Exposed Edge)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 tunnels using ECDSA-P256 client authentication certificates`
  * Target Migration: `TLS 1.3 with hybrid X25519 + ML-KEM-768 ciphers`
* **Purpose**: Primary public-facing internet API ingress terminating connections from bank apps, merchant QR terminals, and consumer e-wallets.

### Node 2: DuitInstant Real-Time Instant Broker
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.5` (Critical Clearing Hub)
* **Cryptographic Primitives**:
  * Current: `ECDSA-P256 and SHA-256 signature verification on high-speed JSON payloads`
  * Target Migration: `ML-DSA-65 signatures for low-latency transaction validation`
* **Purpose**: Distributes real-time payment validation requests, checks account availability, and coordinates interbank funds capture within 2 seconds.

### Node 3: National Identity Resolver DB
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.8` (High Privacy Target)
* **Cryptographic Primitives**:
  * Current: `AES-256 GCM storage-at-rest database encryption, with key transport wrapped via classical RSA-2048`
  * Target Migration: `Quantum-safe envelopment with ML-KEM-768 keys`
* **Purpose**: Critical lookup table mapping consumer proxy IDs (phone numbers, NRIC, company IDs) to actual bank account routing numbers. High threat of harvesting.

### Node 4: Instant Retail Settlement Ledger
* **Label**: `DataAsset`
* **Vulnerability Score**: `8.8` (Critical Value Storage)
* **Cryptographic Primitives**:
  * Current: `Plaintext transactional tables with TLS 1.2 RSA-2048 database connections`
  * Target Migration: `Field-level envelope encryption leveraging ML-KEM-768 ciphers`
* **Purpose**: Records daily clearing and net settlement balances between participating retail banks.

### Node 5: Third-Party Partner Wallets
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.0` (Extranets with third-parties)
* **Cryptographic Primitives**:
  * Current: `External REST API channels secured using standard TLS 1.2 with ECDHE-RSA ciphers`
  * Target Migration: `Enforced TLS 1.3 with hybrid ML-KEM key exchange`
* **Purpose**: Connects ApexNet clearing rails to popular non-bank e-wallet operators (such as GrabPay, Touch 'n Go eWallet, and Boost).

---

## 3. Communication Link Relationships

1. **DuitInstant Mobile Ingress Gateway** (Application) connects to **DuitInstant Real-Time Instant Broker** (SoftwareComponent) via `DEPENDS_ON` link to transmit transaction packets.
2. **DuitInstant Real-Time Instant Broker** (SoftwareComponent) connects to **National Identity Resolver DB** (DataAsset) via `PROCESSES` connection to resolve proxy lookups.
3. **DuitInstant Real-Time Instant Broker** (SoftwareComponent) connects to **Instant Retail Settlement Ledger** (DataAsset) via `PROCESSES` connection to write instant debit/credits.
4. **DuitInstant Real-Time Instant Broker** (SoftwareComponent) connects to **Third-Party Partner Wallets** (ExternalService) via `CALLS` connection for partner e-wallet settlements.

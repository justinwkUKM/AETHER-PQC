# ShieldDesk Access Architecture And Security Specification

Fictional product: **ShieldDesk Access**
Deployment model: **cloud identity workspace**
Scenario purpose: zero-trust enterprise remote workspace

## 1. Executive Summary
This document registers the current cryptographic and network-exposure threat model of SecureDesk, our Zero-Trust remote virtual workspace gateway. SecureDesk serves as the identity broker and virtualization portal for employees, contractors, and partners worldwide.

Securing the workspace is of paramount importance; however, legacy employee hardware forces back-compatibility with SSL v3 and TLS 1.0. Furthermore, authentication assertions (JWTs and FIDO2 signatures) are signed using classical public-key cryptography (RSA-2048 and ECDSA-P256). In the event of a quantum adversary gaining the ability to calculate RSA/ECDSA private keys from public keys, this would allow total system-wide authentication bypass and identity takeover.

---

## 2. Infrastructure Inventory & Exposure Model

We have mapped the following high-risk enterprise nodes:

### Node 1: SecureDesk Web Ingress
* **Label**: `Application`
* **Vulnerability Score**: `9.8` (Critical Public Exposure)
* **Cryptographic Primitives**: 
  * Current: `Legacy SSL v3 and TLS 1.0 fallback support for legacy client devices`
  * Target Migration: `Mandatory TLS 1.3 with X25519 + ML-KEM-768 hybrid cipher suites`
* **Purpose**: Primary reverse proxy and DMZ ingress endpoint handling employee virtual desktop streams and HTTP routing.

### Node 2: Okta Federated Identity Broker
* **Label**: `ExternalService`
* **Vulnerability Score**: `8.2` (High Identity Broker Exposure)
* **Cryptographic Primitives**:
  * Current: `ECDSA-P256 keys for WebAuthn / FIDO2 security key attestation`
  * Target Migration: `Hybrid FIDO2 security keys supporting dual-key or ML-DSA-65 signatures`
* **Purpose**: Coordinates federated SAML/OIDC authentication flows and verifies multi-factor security keys.

### Node 3: Enterprise JWT Session Broker
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `9.0` (Critical Token Signing)
* **Cryptographic Primitives**:
  * Current: `RS256 session token signatures (RSA-2048 with SHA-256)`
  * Target Migration: `ML-DSA-85 JWT session signing engine`
* **Purpose**: Generates and signs short-lived JSON Web Tokens (JWTs) representing logged-in employee session claims.

### Node 4: Active Directory Sync Agent
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.5` (High Directory Link Exposure)
* **Cryptographic Primitives**:
  * Current: `LDAPs tunnel secured with legacy TLS 1.1`
  * Target Migration: `mTLS LDAP tunnels leveraging ML-DSA-65 and ML-KEM-768`
* **Purpose**: Syncs real-time user status, group memberships, and credentials from on-prem Active Directory.

### Node 5: Enterprise User Registry DB
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.5` (High Privacy Exposure)
* **Cryptographic Primitives**:
  * Current: `AES-256 database column encryption, with cryptographic keys wrapped using classical RSA-2048`
  * Target Migration: `ML-KEM-1024 database secret wrapping`
* **Purpose**: Stores active user profiles, hashed credentials, configuration options, and workspace preferences.

---

## 3. Communication Link Relationships

1. **SecureDesk Web Ingress** (Application) connects to **Okta Federated Identity Broker** (ExternalService) via `CALLS` connection to delegate initial authentication.
2. **SecureDesk Web Ingress** (Application) connects to **Enterprise JWT Session Broker** (SoftwareComponent) via `DEPENDS_ON` to sign and validate session cookies.
3. **Enterprise JWT Session Broker** (SoftwareComponent) connects to **Enterprise User Registry DB** (DataAsset) via `PROCESSES` connection to fetch user metadata.
4. **Active Directory Sync Agent** (SoftwareComponent) connects to **Enterprise User Registry DB** (DataAsset) via `USES` link to write directory status updates.

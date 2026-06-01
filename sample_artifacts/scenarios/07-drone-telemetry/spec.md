# AeroMesh Command Architecture And Security Specification

Fictional product: **AeroMesh Command**
Deployment model: **hybrid fleet telemetry**
Scenario purpose: autonomous fleet command and telemetry system

## 1. Executive Summary
This specification documents the network architecture and cryptographic configurations of AeroControl, the central fleet command and control system managing our autonomous cargo drones. AeroControl exchanges highly sensitive real-time telemetry coordinates, control commands, and OTA firmware updates.

Due to hardware resource limits on drone microcontrollers, legacy lightweight and short-key classical schemes (RSA-1024 and ECDSA-P256) are currently deployed. This system presents severe operational vulnerabilities: a quantum adversary could intercept telemetry streams to inject fake fly-to coordinates or bypass firmware signature checks to seize physical control of drones.

---

## 2. Infrastructure Inventory & Exposure Model

The following components represent our primary attack surface:

### Node 1: AeroControl Command Ingress
* **Label**: `Application`
* **Vulnerability Score**: `9.0` (Critical Telemetry Gateway)
* **Cryptographic Primitives**: 
  * Current: `DTLS 1.1 using TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`
  * Target Migration: `DTLS 1.3 with hybrid ML-KEM-512 key agreement`
* **Purpose**: Gateway orchestrating all telemetry, live video feeds, and commands with active flying drone nodes over public cellular/LTE networks.

### Node 2: Drone PX4 Autopilot MCU
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `9.5` (Critical Hardware Node)
* **Cryptographic Primitives**:
  * Current: `Hardcoded 1024-bit RSA public key (RSA-1024) for OTA firmware signature checks`
  * Target Migration: `State-Based Hash Signatures (LMS or XMSS) to accommodate 8-bit MCU architectures`
* **Purpose**: Micro-controller autopilot on each drone responsible for decrypting commands, verifying bootloader updates, and executing telemetry directions.

### Node 3: Flight Telemetry Storage (S3)
* **Label**: `DataAsset`
* **Vulnerability Score**: `8.0` (High Archive Exposure)
* **Cryptographic Primitives**:
  * Current: `TLS 1.2 with standard RSA-2048 client certificates`
  * Target Migration: `TLS 1.3 with ML-DSA-65 certificate chains`
* **Purpose**: Hosts historical coordinates, flight duration, and logs. High risk for long-term intelligence harvesting.

### Node 4: Drone Cryptographic Key Vault (AWS KMS)
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.8` (High Value Asset)
* **Cryptographic Primitives**:
  * Current: `AES-256 transparent storage encryption with KMS-managed RSA-2048 envelope wraps`
  * Target Migration: `PQC-ready AWS KMS keys wrapped using ML-KEM-768`
* **Purpose**: Manages global symmetric secret keys used to authenticate active drone drone-to-ground connections.

### Node 5: National Airspace Authority (FAA) API
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.0` (Moderate Ingress Risk)
* **Cryptographic Primitives**:
  * Current: `Secure HTTPS interface running TLS 1.2 and ECDSA-P256 certificates`
  * Target Migration: `Hybrid Kyber TLS 1.3 tunnels`
* **Purpose**: Queries real-time weather grids, geo-fenced coordinates, and air traffic control restrictions.

---

## 3. Communication Link Relationships

1. **AeroControl Command Ingress** (Application) connects to **Drone PX4 Autopilot MCU** (SoftwareComponent) via `CALLS` connection to issue commands and dispatch OTA firmware.
2. **Drone PX4 Autopilot MCU** (SoftwareComponent) connects to **Drone Cryptographic Key Vault (AWS KMS)** (DataAsset) via `DEPENDS_ON` to fetch dynamic connection credentials.
3. **AeroControl Command Ingress** (Application) connects to **Flight Telemetry Storage (S3)** (DataAsset) via `PROCESSES` to upload historical telemetry streams.
4. **AeroControl Command Ingress** (Application) connects to **National Airspace Authority (FAA) API** (ExternalService) via `CALLS` to dynamically pull flight restriction zones.

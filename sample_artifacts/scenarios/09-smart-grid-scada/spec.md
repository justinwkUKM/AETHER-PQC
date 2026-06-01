# GridPulse SCADA Architecture And Security Specification

Fictional product: **GridPulse SCADA**
Deployment model: **on-prem OT network**
Scenario purpose: smart grid control and telemetry system

## 1. Executive Summary
This document specifies the cryptographic threat posture of the GridPower Operational Technology (OT) network. GridPower is responsible for real-time telemetry, breaker commands, and substation control across our smart grid networks.

SCADA systems often run for decades without hardware updates, leaving extensive portions of the network reliant on legacy algorithms like DSA with SHA-1 and 1024-bit static Diffie-Hellman (DH-1024) handshakes. Because substation controls directly regulate grid stability, any cryptographic compromise represents a catastrophic national security threat: a quantum adversary could intercept telecontrol traffic and replay unencrypted switch commands or inject malicious PLC firmware, causing blackouts or physical hardware damage.

---

## 2. Infrastructure Inventory & Exposure Model

We have mapped the following highly critical OT and IT nodes:

### Node 1: Smart Grid Central SCADA Master
* **Label**: `Application`
* **Vulnerability Score**: `8.0` (High Control Value)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 with RSA-2048 certificates for IT-to-OT gateway connections`
  * Target Migration: `Hardware-level bump-in-the-wire PQC VPNs with ML-KEM-1024`
* **Purpose**: Coordinates regional substation state engines, receives telecontrol streams, and transmits command directives.

### Node 2: Substation Remote Terminal Unit (RTU)
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `9.5` (Critical Operational Threat)
* **Cryptographic Primitives**:
  * Current: `Modbus/TCP telecontrol over IPSec tunnels using static DH-1024 for key exchange`
  * Target Migration: `Upgrade RTUs to support DNP3 Secure V5 with hybrid Kyber-based key management`
* **Purpose**: High-voltage switch controllers receiving telemetry packets and transmitting telemetry logs.

### Node 3: SCADA Event Archive
* **Label**: `DataAsset`
* **Vulnerability Score**: `8.8` (High Value Historical Log)
* **Cryptographic Primitives**:
  * Current: `Storage-at-rest encrypted using 3DES (Triple DES) with standard MD5 checksums`
  * Target Migration: `AES-256 storage-at-rest database encryption`
* **Purpose**: Holds sub-second resolution logging of system alerts, operator overrides, and transformer statuses.

### Node 4: PLC Firmware Signing Server
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `9.8` (Critical Firmware Risk)
* **Cryptographic Primitives**:
  * Current: `DSA with SHA-1 signatures for Programmable Logic Controller (PLC) boot image verification`
  * Target Migration: `Spherical-Lattice-Hash Digital Signature Algorithm (SLH-DSA) signatures for long-term supply-chain safety`
* **Purpose**: Generates cryptographically signed firmware packages pushed to edge RTUs during maintenance intervals.

### Node 5: National Grid Intertie Operator
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.0` (Moderate Partner Risk)
* **Cryptographic Primitives**:
  * Current: `TLS 1.2 secured via classical ECDSA-P256 certificates`
  * Target Migration: `Hybrid post-quantum TLS 1.3 tunnels`
* **Purpose**: Coordinates emergency inter-grid load-shedding and power flows with neighboring regional operators.

---

## 3. Communication Link Relationships

1. **Smart Grid Central SCADA Master** (Application) connects to **Substation Remote Terminal Unit (RTU)** (SoftwareComponent) via `CALLS` connection to transmit switch commands.
2. **Substation Remote Terminal Unit (RTU)** (SoftwareComponent) connects to **SCADA Event Archive** (DataAsset) via `PROCESSES` connection to write system logs.
3. **PLC Firmware Signing Server** (SoftwareComponent) connects to **Substation Remote Terminal Unit (RTU)** (SoftwareComponent) via `DEPENDS_ON` link to push bootloader updates.
4. **Smart Grid Central SCADA Master** (Application) connects to **National Grid Intertie Operator** (ExternalService) via `CALLS` link to coordinate inter-grid electricity flows.

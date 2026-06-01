# AeroMesh Command Architecture And Security Specification

Fictional product: **AeroMesh Command**
Deployment model: **hybrid fleet telemetry**
Scenario purpose: autonomous fleet command and telemetry system

This document registers the network topology, trust boundaries, and transactional flow for **AeroControl (Scenario 07)**.

---

## 1. Network Zones & Trust Boundaries

The system spans five operational zones with distinct threat parameters:
* **Zone A: Public RF Space**: Wireless telemetry paths over commercial RF bands.
* **Zone B: Drone Edge Controller**: Embedded flight-controller operating in real time.
* **Zone C: Telemetry Ingestion Cluster**: Backend cloud environment running parser instances.
* **Zone D: Internal Datastore Zone**: High-speed memory caches and historical DB instances.
* **Zone E: External Aviation Interfaces**: Integrations with regional civil aviation flight databases.

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how telemetry messages flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_A_RF ["Zone A: Public RF Space"]
    N1["Drone Edge Controller<br/>(ECDSA-P256 Flight Signatures)"]
  end

  subgraph Zone_C_Ingest ["Zone C: Telemetry Ingest Cluster"]
    N2["Telemetry Ingest Cluster<br/>(TLS 1.2 / RSA-2048)"]
  end

  subgraph Zone_D_Data ["Zone D: Internal Datastores"]
    N3["Redis Telemetry Cache<br/>(Plaintext Redis TCP / No Auth)"]
    N4["PostgreSQL Long-Term DB<br/>(AES-256 / RSA-2048 keywrap)"]
  end

  subgraph Zone_E_External ["Zone E: External Aviation Networks"]
    N5["Civil Aviation Authority Hub<br/>(TLS 1.2 / RSA-2048 certs)"]
  end

  %% Flow Connections %%
  N1 -->|1. Broadcasts Wireless Telemetry Packet| N2
  N2 -->|2. Writes Volatile Real-Time State| N3
  N2 -->|3. Commits Flight Logs to Storage| N4
  N2 -->|4. Downstream Air Traffic Alerts| N5

  %% Styling %%
  classDef dmz fill:#fee,stroke:#b22,stroke-width:2px;
  classDef core fill:#efe,stroke:#2b2,stroke-width:2px;
  classDef enclave fill:#eef,stroke:#22b,stroke-width:2px;
  classDef archive fill:#fef,stroke:#b2b,stroke-width:2px;
  classDef ext fill:#fff,stroke:#666,stroke-width:2px,stroke-dasharray: 5 5;

  class N1 dmz;
  class N2 core;
  class N3 enclave;
  class N4 enclave;
  class N5 ext;
```

---

## 3. Cryptographic Data Flow Narrative

1. **Edge Broadcast**: The **Drone Edge Controller** generates telemetry updates containing coordinates, velocity, and battery levels, signing them via **ECDSA-P256** signatures to ensure non-repudiation.
2. **Ingestion Intake**: The package is received over cellular channels by the **Telemetry Ingest Cluster** via HTTPS REST endpoints using standard **TLS 1.2** with RSA-2048 web certificates.
3. **Cache Storage**: Volatile, real-time drone states are written immediately into the **Redis Telemetry Cache** over plaintext Redis TCP links with no internal cryptographic authentication, creating high internal sniffing exposure.
4. **Permanent Logging**: Historical flight metrics are committed to the **PostgreSQL Long-Term DB**, which utilizes **AES-256** transparent table storage with key transport wrapped via classical **RSA-2048**.
5. **Aviation Integration**: Real-time altitude updates are routed to the **Civil Aviation Authority Hub** via REST API integrations running TLS 1.2 with RSA-2048 web ciphers, exposing sensitive flight paths to HNDL.

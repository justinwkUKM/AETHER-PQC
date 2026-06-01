# GridPulse SCADA Architecture And Security Specification

Fictional product: **GridPulse SCADA**
Deployment model: **on-prem OT network**
Scenario purpose: smart grid control and telemetry system

This document registers the network topology, trust boundaries, and transactional flow for **GridPower (Scenario 09)**.

---

## 1. Network Zones & Trust Boundaries

The industrial SCADA estate is structured into four security domains:
* **Zone A: Substation Field LAN**: Highly vulnerable edge networks connecting hardware relays.
* **Zone B: SCADA Control Center**: Centralised operations environment running control nodes.
* **Zone C: Historian Core**: Database zone recording operational telemetry and status histories.
* **Zone D: Corporate Core**: Administrative networks used for analytics and billing.

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how grid commands and telemetry flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_A_Field ["Zone A: Substation Field LAN"]
    N1["Modbus RTU Edge Controller<br/>(Plaintext Modbus TCP / No Cryptography)"]
  end

  subgraph Zone_B_SCADA ["Zone B: SCADA Control Center"]
    N2["SCADA Command Center<br/>(TLS 1.2 / RSA-2048)"]
  end

  subgraph Zone_C_Historian ["Zone C: Historian Core"]
    N3["Historian Timescale DB<br/>(AES-256 / RSA-2048 keywrap)"]
  end

  subgraph Zone_D_Corporate ["Zone D: Corporate Core"]
    N4["Analytic Reporting Hub<br/>(HTTPS / RSA-4096 certs)"]
  end

  subgraph Zone_E_External ["Zone E: National Grid Network"]
    N5["External Balancing Authority<br/>(TLS 1.2 / RSA-2048)"]
  end

  %% Flow Connections %%
  N1 -->|1. Transmits Plaintext Telemetry Packet| N2
  N2 -->|2. Writes Grid Telemetry Records| N3
  N3 -->|3. Exports Daily Reports| N4
  N2 -->|4. Downstream Grid Balancing Alerts| N5

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

1. **Substation Telemetry**: The **Modbus RTU Edge Controller** monitors electrical relays and transmits logs over the internal Substation Field LAN utilizing unencrypted **Modbus TCP** ciphers with no cryptographic security, exposing raw grid command sequences.
2. **SCADA Acquisition**: The **SCADA Command Center** acquires grid telemetry via HTTPS ciphers secured by **TLS 1.2** with classical RSA-2048 certificates.
3. **Telemetry Logging**: Grid histories are written into the **Historian Timescale DB**, which encrypts records at rest using **AES-256** with database keys wrapped via classical **RSA-2048**.
4. **Corporate Analytics**: Historical metrics are exported to the **Analytic Reporting Hub** inside the corporate intranet, utilizing HTTPS web connection ciphers secured by classical **RSA-4096** certificates.
5. **Balancing Authority**: The center communicates real-time generation imbalances to the **External Balancing Authority** via API connections running TLS 1.2 with RSA-2048 certificates, leaving telemetry streams exposed to HNDL.

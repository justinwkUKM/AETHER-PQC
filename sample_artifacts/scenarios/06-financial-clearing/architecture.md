# ApexTransact Core Architecture & Network Flow Diagram

This document registers the network topology, trust boundaries, and transactional flow for **ApexTransact (Scenario 06)**.

---

## 1. Network Zones & Trust Boundaries

The estate is partitioned into four distinct cryptographic trust zones to isolate transactional data and authorize ingress:
* **Zone A: Demilitarized Zone (DMZ)**: Public-facing gateway terminating external banking channels (SWIFT).
* **Zone B: Core Settlement LAN**: Isolated backend network running validation processors.
* **Zone C: High-Security Database Enclave**: Highly restricted server zone hosting Oracle DB clusters.
* **Zone D: Archival Storage Subnet**: File storage infrastructure retaining transactional reports.

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how financial clearing messages flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_A_DMZ ["Zone A: DMZ (Public Ingress)"]
    N1["SWIFT Bank Gateway<br/>(TLS 1.2 / RSA-4096)"]
  end

  subgraph Zone_B_Core ["Zone B: Core Settlement LAN"]
    N2["Settlement Validation Engine<br/>(ECDSA-P256 / SHA-256)"]
  end

  subgraph Zone_C_DB ["Zone C: High-Security DB Enclave"]
    N3["Core Transaction Ledger<br/>(AES-256 / RSA-2048 keywrap)"]
  end

  subgraph Zone_D_Archive ["Zone D: Archival Storage Subnet"]
    N4["Settlement Reporting S3 Storage<br/>(HTTPS / RSA-4096 certs)"]
  end

  subgraph Zone_E_External ["Zone E: Fedwire Network"]
    N5["Fedwire External Service<br/>(ECDSA-P384 APIs)"]
  end

  %% Flow Connections %%
  N1 -->|1. Transmits Inbound Settlements| N2
  N2 -->|2. Writes Ledger Rows| N3
  N1 -->|3. Writes Settlement Receipts| N4
  N2 -->|4. Downstream Bank-of-Last-Resort Routing| N5

  %% Styling %%
  classDef dmz fill:#fee,stroke:#b22,stroke-width:2px;
  classDef core fill:#efe,stroke:#2b2,stroke-width:2px;
  classDef enclave fill:#eef,stroke:#22b,stroke-width:2px;
  classDef archive fill:#fef,stroke:#b2b,stroke-width:2px;
  classDef ext fill:#fff,stroke:#666,stroke-width:2px,stroke-dasharray: 5 5;

  class N1 dmz;
  class N2 core;
  class N3 enclave;
  class N4 archive;
  class N5 ext;
```

---

## 3. Cryptographic Data Flow Narrative

1. **Inbound Ingress**: Commercial bank members transmit ISO clearing documents via the **SWIFT Bank Gateway**. Connections terminate at the gateway using **TLS 1.2** with ECDHE-RSA ciphers.
2. **Ledger Validation**: The gateway forwards valid transactions to the **Settlement Validation Engine**, which signs and verifies transactions using **ECDSA-P256** signatures to ensure non-repudiation.
3. **Database Write**: Authorized settlement transactions are recorded in the **Core Transaction Ledger**, which encrypts records at rest using **AES-256** with key transport wrapped via classical **RSA-2048**.
4. **Audit Preservation**: Signed receipt documents are archived in the **Settlement Reporting S3 Storage** over HTTPS connections using classical **RSA-4096** web ciphers, exposing transaction summaries to HNDL threats.
5. **Reserve Adjustments**: The engine routes downstream transactions to the **Fedwire External Service** via REST APIs utilizing standard **ECDSA-P384** signatures.

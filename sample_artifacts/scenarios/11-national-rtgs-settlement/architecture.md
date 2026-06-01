# ApexNet ApexRTGS RTGS Architecture & Network Flow Diagram

This document registers the network topology, trust boundaries, and transactional flow for **ApexNet ApexRTGS (Scenario 11)**.

---

## 1. Network Zones & Trust Boundaries

The high-value clearing estate is segmented into five cryptographic trust zones to enforce maximum resilience:
* **Zone A: Demilitarized Zone (DMZ)**: Highly restricted DMZ terminating partner gateway entries (SWIFT).
* **Zone B: Core RTGS Settlement WAN**: Isolated back-office network coordinating clearing routines.
* **Zone C: High-Security Securities Enclave**: Dedicated database zone storing national debt papers.
* **Zone D: Central Bank Reserve Subnet**: Highly secure internal ledger database hosting bank balances.
* **Zone E: Global Financial Networks**: External connections with international SWIFT clearing services.

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how interbank high-value payments flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_A_DMZ ["Zone A: DMZ (SWIFT Edge)"]
    N1["SWIFT RTGS Ingress Gateway<br/>(TLS 1.2 / ECDHE-RSA-256)"]
  end

  subgraph Zone_B_Core ["Zone B: Core RTGS Settlement WAN"]
    N2["ApexRTGS Settlement Core<br/>(ECDSA-P256 / SHA-256)"]
  end

  subgraph Zone_C_Securities ["Zone C: High-Security Securities Enclave"]
    N3["Government Securities Depository<br/>(AES-256 / RSA-2048 keywrap)"]
  end

  subgraph Zone_D_Reserve ["Zone D: Central Bank Reserve Subnet"]
    N4["Central Bank Reserve Ledger<br/>(Plaintext DB Columns / TLS 1.2)"]
  end

  subgraph Zone_E_Global ["Zone E: Global Financial Networks"]
    N5["SWIFT Alliance Messaging Network<br/>(RSA-4096 API Signatures)"]
  end

  %% Flow Connections %%
  N1 -->|1. Transmits Inbound ISO Files| N2
  N2 -->|2. Writes Bond Settlement Rows| N3
  N2 -->|3. Updates Reserve Balances| N4
  N2 -->|4. Routes Cross-Border Settlements| N5

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

1. **Transaction Ingress**: Participating member banks submit payment files to the **SWIFT RTGS Ingress Gateway** over secure networks. Connections terminate at the gateway using **TLS 1.2** with ECDHE-RSA ciphers.
2. **Irrevocable Validation**: The gateway forwards records to the **ApexRTGS Settlement Core**, which validates instructions and signs entries using **ECDSA-P256** and SHA-256 signatures to achieve non-repudiation.
3. **Debt Securities Ledger**: For bond transactions, the core writes updates to the **Government Securities Depository**, which encrypts holdings using **AES-256** with database keys wrapped via classical **RSA-2048**.
4. **Reserve Clearing**: Cash debits and credits are recorded on the **Central Bank Reserve Ledger**, which hosts plaintext balance columns and relies solely on TLS 1.2 database connection ciphers, leaving critical reserves exposed.
5. **Cross-Border Remittance**: Downstream foreign currency settlements are routed to the **SWIFT Alliance Messaging Network** via APIs utilizing standard **RSA-4096** signatures, exposing international flows to HNDL.

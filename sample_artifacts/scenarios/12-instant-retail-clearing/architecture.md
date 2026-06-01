# Anonymous instant retail rail Retail Instant Architecture & Flow Diagram

This document registers the network topology, trust boundaries, and transactional flow for **Anonymous instant retail rail (Scenario 12)**.

---

## 1. Network Zones & Trust Boundaries

The real-time instant payment platform is partitioned into five distinct trust zones:
* **Zone A: Mobile Intranet WAN**: Exposed mobile network endpoints connecting client apps.
* **Zone B: Dynamic API Gateway Edge**: Web DMZ verifying dynamic incoming client certificates.
* **Zone C: High-Speed Broker LAN**: Core backend cluster processing transactions.
* **Zone D: Restricted Directory & Ledger Database**: Enclosed Oracle database engines.
* **Zone E: External E-Wallet Partners**: API integrations with third-party wallets.

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how instant retail payment requests flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_B_API ["Zone B: Dynamic API Edge"]
    N1["Instant retail rail Mobile Ingress Gateway<br/>(TLS 1.2 / ECDSA-P256 client auth)"]
  end

  subgraph Zone_C_Broker ["Zone C: High-Speed Broker LAN"]
    N2["Instant retail rail Real-Time Instant Broker<br/>(ECDSA-P256 Signature Verification)"]
  end

  subgraph Zone_D_Data ["Zone D: Directory & Ledger Database"]
    N3["National Identity Resolver DB<br/>(AES-256 / RSA-2048 keywrap)"]
    N4["Instant Retail Settlement Ledger<br/>(Plaintext DB Columns / TLS 1.2)"]
  end

  subgraph Zone_E_Partners ["Zone E: E-Wallet Partners"]
    N5["Third-Party Partner Wallets<br/>(TLS 1.2 / ECDHE-RSA ciphers)"]
  end

  %% Flow Connections %%
  N1 -->|1. Routes Client Payment Request| N2
  N2 -->|2. Queries Proxy Mapping| N3
  N2 -->|3. Commits Retail Debits/Credits| N4
  N2 -->|4. Verifies E-Wallet Settlement| N5

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

1. **Mobile Request**: Consumers scan dynamic QR codes or submit mobile transfers, terminating at the **Instant retail rail Mobile Ingress Gateway** via HTTPS with **TLS 1.2** and ECDSA-P256 client authentication.
2. **Transaction Routing**: The gateway forwards payloads to the **Instant retail rail Real-Time Instant Broker**, which validates transaction packets via **ECDSA-P256** and SHA-256 signatures to ensure authenticity.
3. **Proxy Translation**: The broker queries the **National Identity Resolver DB** to map mobile numbers or customer proxy IDs to deposit bank routing. Directory data is encrypted at rest using **AES-256** with database keys wrapped via classical **RSA-2048**.
4. **Ledger Balancing**: Instant interbank net balances are updated on the **Instant Retail Settlement Ledger**, which contains plaintext database fields secured only by TLS 1.2 database connection ciphers.
5. **E-Wallet Release**: Downstream confirmations are routed to **Third-Party Partner Wallets** (e.g., GrabPay) via REST APIs running TLS 1.2 with ECDHE-RSA ciphers, exposing transaction parameters to HNDL threats.

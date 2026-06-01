# Instant clearing rail Clearing & Proxy Resolver Core Architecture & Flow Diagram

This document registers the network topology, trust boundaries, and transactional flow for **Instant clearing rail Clearing & Proxy Resolver Core (Scenario 18)**.

---

## 1. Network Zones & Trust Boundaries

The real-time instant clearing engine is partitioned into five distinct trust domains:
* **Zone A: Interbank WAN**: Highly secure WAN connecting participant clearing banks.
* **Zone B: Instant Clearing Inbound DMZ**: Security edge gateway terminating bank connections.
* **Zone C: Proxy Resolver Parsing Subnet**: Internal processing LAN running proxy resolvers.
* **Zone D: Restricted Directory & Settlement Database**: Secure Oracle database engines.
* **Zone E: External Non-Bank Wallets**: REST API integrations connecting e-wallet providers.

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how instant interbank payments and proxy queries flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_B_Instant Clearing ["Zone B: Instant Clearing Inbound DMZ"]
    N1["Instant Clearing Inbound API Gateway<br/>(TLS 1.2 / ECDSA-P256 Client Certs)"]
  end

  subgraph Zone_C_Parsing ["Zone C: Proxy Resolver Parsing Subnet"]
    N2["Proxy Resolver Proxy Resolver<br/>(ECDSA-P256 / SHA-256 Signatures)"]
  end

  subgraph Zone_D_Data ["Zone D: Directory & Settlement DB"]
    N3["Proxy Resolver National Proxy DB<br/>(AES-256 / RSA-2048 keywrap)"]
    N4["Instant Clearing Real-Time Settlement DB<br/>(Plaintext DB Columns / TLS 1.2)"]
  end

  subgraph Zone_E_Wallets ["Zone E: Non-Bank Wallets"]
    N5["Non-Bank Financial Ingress<br/>(TLS 1.2 / ECDHE-RSA ciphers)"]
  end

  %% Flow Connections %%
  N1 -->|1. Transmits ISO 20022 Clearing Payload| N2
  N2 -->|2. Queries Proxy Mapping Table| N3
  N2 -->|3. Commits Real-Time Net Balances| N4
  N2 -->|4. Authorizes Non-Bank Payouts| N5

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

1. **Transaction Inbound**: Participant banks transmit real-time ISO 20022 clearing payloads to the **Instant Clearing Inbound API Gateway** over the Interbank WAN, terminating via HTTPS secured by **TLS 1.2** with ECDSA-P256 client certificates.
2. **Payload Parsing**: The gateway routes clearing files to the **Proxy Resolver Proxy Resolver**, which validates payment payload parameters using classical **ECDSA-P256** and SHA-256 signatures to ensure authenticity.
3. **Proxy Directory Resolution**: The resolver queries the **Proxy Resolver National Proxy DB** to translate mobile numbers or business proxy ID business numbers to bank account numbers. Directory data is encrypted at rest using **AES-256** with database keys wrapped via classical **RSA-2048**.
4. **Settlement Logging**: Real-time funds debits/credits are committed to the **Instant Clearing Real-Time Settlement DB**, which hosts plaintext columns secured only by TLS 1.2 database connection ciphers.
5. **Non-Bank Integration**: Instant confirmations are sent to **Non-Bank Financial Ingress** e-wallets (e.g., GrabPay) via REST APIs running TLS 1.2 with ECDHE-RSA ciphers, exposing sensitive transaction details to HNDL threats.

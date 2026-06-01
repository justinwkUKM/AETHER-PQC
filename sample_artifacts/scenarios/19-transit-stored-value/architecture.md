# TransitPay Contactless Transit Architecture & Flow Diagram

This document registers the network topology, trust boundaries, and transactional flow for **TransitPay & Motoring Card (Scenario 19)**.

---

## 1. Network Zones & Trust Boundaries

The contactless stored-value card settlement platform is partitioned into five distinct trust domains:
* **Zone A: Transport Ingress Edge**: Highly vulnerable physical gates and gantries reading cards.
* **Zone B: Clearing Validation LAN**: Isolated processing subnet running balance verifiers.
* **Zone C: High-Security Cryptographic HSM Enclave**: Restrictive vault housing master keys.
* **Zone D: Archival Storage Subnet**: Database capturing daily transit transaction logs.
* **Zone E: External Transit Operators**: Clearing integrations with transport authorities (TTA).

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how transit smartcard taps and daily batch uploads flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_A_Ingress ["Zone A: Ingress Edge"]
    N1["Transit Gate Ingest Terminal<br/>(Symmetric 3DES Card Keys / SFTP)"]
  end

  subgraph Zone_B_Validation ["Zone B: Validation LAN"]
    N2["Stored Value Validator<br/>(3DES & AES-128 MACs)"]
  end

  subgraph Zone_C_HSM ["Zone C: HSM Enclave"]
    N3["TransitPay HSM Key Store<br/>(RSA-2048 HSM Keywrap)"]
  end

  subgraph Zone_D_Data ["Zone D: Archival Storage"]
    N4["Transit Transaction Ledger<br/>(AES-256 / RSA-2048 keywrap)"]
  end

  subgraph Zone_E_Operators ["Zone E: Transit Operators"]
    N5["Transit Transport Authority (TTA) Host<br/>(TLS 1.2 / RSA-4096 certs)"]
  end

  %% Flow Connections %%
  N1 -->|1. Uploads Terminal Batch Files| N2
  N2 -->|2. Verifies Card Authenticity| N3
  N2 -->|3. Commits Transit Transaction Rows| N4
  N2 -->|4. Synchronizes Daily Fare Revenues| N5

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

1. **Card Presentation**: Cardholders tap smartcards at transit gantries, initiating microsecond chip handshakes utilizing symmetric **3DES keys** to deduct funds. Gantries write logs and upload daily transaction zip files to the **Transit Gate Ingest Terminal** over SFTP connection ciphers secured by static **RSA-2048 SSH** keys.
2. **Balance Validation**: The terminal routes files to the **Stored Value Validator**, which verifies transaction counts and card signatures using symmetric **3DES and AES-128 MAC** ciphers.
3. **Key Retrieval**: The validator requests card key derivation indexes from the **TransitPay HSM Key Store**, which hosts terminal master keys wrapped via classical **RSA-2048** key transport ciphers.
4. **Historical Archival**: Cleared travel records and card numbers are saved on the **Transit Transaction Ledger**, which encrypts records at rest using **AES-256** with database keys wrapped via classical **RSA-2048**.
5. **Transport Reconciliation**: The settlement engine synchronizes revenue distributions with the **Transit Transport Authority (TTA) Host** via REST APIs secured by standard **TLS 1.2** with RSA-4096 web ciphers, exposing transit travel records to HNDL threats.

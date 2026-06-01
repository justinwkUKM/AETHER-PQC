# ApexNet ChequeClear Cheque Clearing Architecture & Flow Diagram

This document registers the network topology, trust boundaries, and transactional flow for **ApexNet ChequeClear (Scenario 14)**.

---

## 1. Network Zones & Trust Boundaries

The electronic cheque clearing system is segmented into four distinct trust domains:
* **Zone A: Ingestion Edge**: Gateway terminating corporate uploads from banking partners.
* **Zone B: Clearing Validation Subnet**: Internal core validating batch XML and signatures.
* **Zone C: Long-Term Archive Database**: Restricted database archiving image holdings.
* **Zone D: Extranet File Exchange**: Batch SFTP nodes connecting bank member clearinghouses.

---

## 2. Detailed Architecture Flow Diagram

The following Mermaid flowchart tracks how daily cheque presentment batches flow through the trust boundaries and lists current vulnerable cryptographic controls:

```mermaid
graph TD
  subgraph Zone_A_Ingress ["Zone A: Ingestion Edge"]
    N1["Cheque Image Ingestion Server<br/>(TLS 1.2 / RSA-2048 certs)"]
  end

  subgraph Zone_B_Validation ["Zone B: Validation LAN"]
    N2["Cheque Image Signature Validator<br/>(Obsolete DSA / SHA-1)"]
    N3["Cheque Image Archiver<br/>(Legacy 3DES Compression)"]
  end

  subgraph Zone_C_DB ["Zone C: Archive DB"]
    N4["National Cheque Archive Storage<br/>(AES-256 / RSA-2048 keywrap)"]
  end

  subgraph Zone_D_SFTP ["Zone D: Extranet File Exchange"]
    N5["Bank Member Clearing Nodes<br/>(SFTP / RSA-2048 SSH keys)"]
  end

  %% Flow Connections %%
  N1 -->|1. Receives Daily Cheque Batch| N2
  N1 -->|2. Transfers Validated Images| N3
  N3 -->|3. Commits Encrypted Archives| N4
  N1 -->|4. Synchronizes Clearing Indexes| N5

  %% Styling %%
  classDef dmz fill:#fee,stroke:#b22,stroke-width:2px;
  classDef core fill:#efe,stroke:#2b2,stroke-width:2px;
  classDef enclave fill:#eef,stroke:#22b,stroke-width:2px;
  classDef archive fill:#fef,stroke:#b2b,stroke-width:2px;
  classDef ext fill:#fff,stroke:#666,stroke-width:2px,stroke-dasharray: 5 5;

  class N1 dmz;
  class N2 core;
  class N3 core;
  class N4 enclave;
  class N5 ext;
```

---

## 3. Cryptographic Data Flow Narrative

1. **Batch Upload**: Bank administrators upload zip packages containing scanned cheque images to the **Cheque Image Ingestion Server** via HTTPS ciphers secured by **TLS 1.2** with RSA-2048 certificates.
2. **Signature Check**: The ingestion server routes files to the **Cheque Image Signature Validator**, which checks non-repudiation and package integrity using obsolete **DSA and SHA-1** signatures, presenting critical security exposure.
3. **Bulk Archival**: Validated cheque images are routed to the **Cheque Image Archiver**, which compresses and encrypts the batch zip files leveraging legacy **3DES** ciphers.
4. **Historical Storage**: Encrypted files are saved to the **National Cheque Archive Storage**, which encrypts records at rest using **AES-256** with database keys wrapped via classical **RSA-2048**.
5. **Bank Integration**: The ingestion server syncs transactional indexes with **Bank Member Clearing Nodes** via automated SFTP transfers utilizing static **RSA-2048 SSH** keys, leaving file directories vulnerable to HNDL.

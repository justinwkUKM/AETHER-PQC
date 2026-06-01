# CareLink Exchange Architecture And Security Specification

Fictional product: **CareLink Exchange**
Deployment model: **hybrid healthcare portal**
Scenario purpose: patient record and provider exchange portal

## 1. Executive Summary
This document registers the cryptographic inventory and post-quantum vulnerability status of HealthSync MD, our multi-tenant Electronic Health Record (EHR) and patient record exchange portal. HealthSync MD is responsible for orchestrating HL7/FHIR compliant transactions among clinical labs, hospitals, and medical insurers.

Due to HIPAA guidelines, medical data must remain private for the duration of a patient's life (up to 80+ years). This creates an extreme exposure under the "Harvest Now, Decrypt Later" (HNDL) paradigm: a quantum adversary capturing encrypted clinical records or lab data today could decrypt them years down the road. Currently, the system relies on classical RSA-4096 envelopes for field-level database encryption, and legacy TLS 1.1 SOAP web services to integrate with older hospital billing networks.

---

## 2. Infrastructure Inventory & Exposure Model

We have mapped the following highly sensitive patient data routing nodes:

### Node 1: FHIR Patient Data Broker
* **Label**: `Application`
* **Vulnerability Score**: `9.0` (Critical Legacy SOAP Endpoint)
* **Cryptographic Primitives**: 
  * Current: `Legacy SOAP XML endpoints encrypted via TLS 1.1 tunnels`
  * Target Migration: `Upgrade to REST-based FHIR API secured with TLS 1.3 hybrid ML-KEM-768 ciphers`
* **Purpose**: Coordinates incoming patient history requests and queries hospitals, translating HL7 frames.

### Node 2: Lab Result Ingestion Pipeline
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `8.2` (High Ingestion Signature Risk)
* **Cryptographic Primitives**:
  * Current: `ECDSA-P256 signed HL7 payload verification for non-repudiation`
  * Target Migration: `Migrate to ML-DSA-65 signatures for quantum-safe clinical verification`
* **Purpose**: Automatically processes laboratory reports, verifies doctor signatures, and inserts diagnoses.

### Node 3: Medical Record Core DB
* **Label**: `DataAsset`
* **Vulnerability Score**: `8.5` (Critical Field Encryption Exposure)
* **Cryptographic Primitives**:
  * Current: `Field-level column encryption wrapped with classical RSA-4096 keys`
  * Target Migration: `Envelope encryption using Kyber-based key agreement (ML-KEM-768 or ML-KEM-1024)`
* **Purpose**: Primary database housing structured patient history, laboratory diagnoses, prescriptions, and billing histories.

### Node 4: Patient Portal Web Panel
* **Label**: `Application`
* **Vulnerability Score**: `7.5` (Moderate Portal Exposure)
* **Cryptographic Primitives**:
  * Current: `HTTPS endpoint secured via TLS 1.2 and classical RSA-2048 certificates`
  * Target Migration: `TLS 1.3 with dual-mode X25519 and ML-KEM-768 key exchanges`
* **Purpose**: Web application allowing patients to log in, view medical records, and update insurance profiles.

### Node 5: National Medical Insurance Clearinghouse
* **Label**: `ExternalService`
* **Vulnerability Score**: `7.2` (Moderate Partner Extranet Risk)
* **Cryptographic Primitives**:
  * Current: `Partner extranet connection using TLS 1.2 and ECDSA-P384 signatures`
  * Target Migration: `Transition to hybrid post-quantum TLS 1.3 tunnels`
* **Purpose**: Claims settlement and billing validation API validating policyholder eligibility and deductibles.

---

## 3. Communication Link Relationships

1. **FHIR Patient Data Broker** (Application) connects to **Lab Result Ingestion Pipeline** (SoftwareComponent) via `DEPENDS_ON` link to route lab findings.
2. **Lab Result Ingestion Pipeline** (SoftwareComponent) connects to **Medical Record Core DB** (DataAsset) via `PROCESSES` connection to write diagnostic records.
3. **Patient Portal Web Panel** (Application) connects to **Medical Record Core DB** (DataAsset) via `USES` to allow patients to query historical records.
4. **FHIR Patient Data Broker** (Application) connects to **National Medical Insurance Clearinghouse** (ExternalService) via `CALLS` connection to reconcile insurance claims.

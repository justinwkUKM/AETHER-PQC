# Secure Post-Quantum Cryptographic Architecture Plan: LiteLLM Ecosystem

## 1. Executive Summary
This document outlines the quantum-safe migration roadmap for the Anonymous network operator R&D AI inference stack. The goal is to migrate all internal and external communication interfaces from classical elliptic-curve and RSA primitives to Post-Quantum Cryptographic (PQC) standards compliant with the NIST FIPS 203 and FIPS 204 guidelines.

---

## 2. Infrastructure Inventory & Exposure Model

We have identified five critical architectural nodes currently processing transaction workloads:

### Node 1: LiteLLM Gateway
* **Label**: `Application`
* **Vulnerability Score**: `8.5` (Critical Exposure)
* **Cryptographic Primitives**: 
  * Current: `TLS 1.2 using ECDHE-RSA-AES256-GCM-SHA384`
  * Target Migration: `TLS 1.3 hybrid exchange using X25519 + ML-KEM-768`
* **Purpose**: Serves as the central gateway intercepting Anonymous network operator Client API calls (Anonymous network operator GPT, Anonymous network operator Code) and routing requests down to inference engines.

### Node 2: vLLM Inference Instance
* **Label**: `SoftwareComponent`
* **Vulnerability Score**: `6.2` (Moderate Exposure)
* **Cryptographic Primitives**:
  * Current: `Internal unencrypted TCP sockets inside the VPC`
  * Target Migration: `mTLS using ML-DSA-65 certificates for authentication`
* **Purpose**: Hosts the proprietary `paynet-qwen3.6-27B` model running on accelerated EC2 `g7e.2xlarge` instances.

### Node 3: Amazon RDS PostgreSQL
* **Label**: `DataAsset`
* **Vulnerability Score**: `7.8` (High Exposure)
* **Cryptographic Primitives**:
  * Current: `AES-256 transparent data encryption (TDE) with classical KMS keys`
  * Target Migration: `Storage-at-rest encryption integrated with PQC-ready AWS KMS keys`
* **Purpose**: Stores routing tables, credential secrets, rate-limiting variables, and extraction analysis logs.

### Node 4: Amazon S3 Model Storage
* **Label**: `DataAsset`
* **Vulnerability Score**: `9.0` (Critical Exposure - Store Now, Decrypt Later Threat)
* **Cryptographic Primitives**:
  * Current: `Classical HTTPS endpoints using standard RSA-4096 certificate chains`
  * Target Migration: `mTLS endpoints leveraging ML-DSA-85 signed certificate validation`
* **Purpose**: Stores model weights downloaded from Hugging Face (such as Qwen3.6 FP8 weights).

### Node 5: AWS Bedrock
* **Label**: `ExternalService`
* **Vulnerability Score**: `5.0` (Moderate External exposure)
* **Cryptographic Primitives**:
  * Current: `External API endpoints secured with ECDSA-P256`
  * Target Migration: `Hybrid post-quantum envelope TLS handshakes`
* **Purpose**: Fallback inference service serving commercial models like Claude 3.5 Sonnet and Haiku.

---

## 3. Communication Link Relationships

To securely trace exposures, the following network edges are mapped:

1. **LiteLLM Gateway** (Application) connects to **vLLM Inference Instance** (SoftwareComponent) via `OpenAI Compatible HTTP` using internal RPC.
2. **LiteLLM Gateway** (Application) connects to **Amazon RDS PostgreSQL** (DataAsset) via `Database Connect` to fetch user quotas and logs.
3. **vLLM Inference Instance** (SoftwareComponent) connects to **Amazon S3 Model Storage** (DataAsset) via `Model Storage Read` to pull model files.
4. **LiteLLM Gateway** (Application) connects to **AWS Bedrock** (ExternalService) via `External API Call` for overflow routing.

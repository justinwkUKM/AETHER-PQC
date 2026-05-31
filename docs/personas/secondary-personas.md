# Secondary Personas

Secondary personas do not drive the core daily workflow, but AETHER-PQC should still support their questions through clear summaries, evidence, and exports.

## SOC / Threat Intelligence Analyst

### Why They Use AETHER-PQC

The SOC or threat intelligence analyst wants to understand which quantum-vulnerable or legacy-crypto assets may become operationally relevant as adversary capabilities and guidance evolve.

### Enterprise Problem

- Threat context changes faster than architecture documentation.
- SOC teams rarely own remediation but need to know which exposed systems could become priority monitoring targets.
- Raw crypto inventories do not show whether a finding is near the network edge.

### Needs

- Exposure-aware critical findings.
- External-service and ingress context.
- Plain-language risk summaries.
- Link from high-risk assets to affected projects and owners.

### Screens Used

- Dashboard
- Project overview
- Risk graph
- Remediation queue

### What Should Stay Out Of Their Way

- Deep migration planning detail.
- Full crypto scoring internals unless drilling into a finding.
- Project setup workflows.

## Third-Party Risk / Procurement Manager

### Why They Use AETHER-PQC

The third-party risk or procurement manager evaluates whether vendors, SaaS providers, and external services introduce post-quantum cryptography risk.

### Enterprise Problem

- Vendor PQC posture is usually described in PDFs, questionnaires, diagrams, screenshots, and security documents.
- Procurement teams need concise vendor risk summaries, not architecture-level graph complexity.
- Vendor claims need evidence and review status.

### Needs

- Multimodal extraction from vendor documents.
- External-service findings.
- Evidence-backed vendor summaries.
- Low-confidence finding review flags.
- Exportable questionnaire support.

### Screens Used

- Scan
- Artifact evidence
- Project overview
- Compliance report

### What Should Stay Out Of Their Way

- Internal engineering remediation detail.
- Low-level graph manipulation.
- Platform-specific TLS implementation detail unless it affects vendor exposure.

## Enterprise Architect

### Why They Use AETHER-PQC

The enterprise architect uses AETHER-PQC to understand how PQC migration interacts with application modernization, cloud migration, data architecture, and business process transformation.

### Enterprise Problem

- PQC migration competes with broader modernization programs.
- Architecture decisions need portfolio context, not isolated findings.
- Business processes and system dependencies are often not connected to crypto risk.

### Needs

- Project and portfolio summaries.
- Business process and application relationships.
- Graph-level dependency context.
- Risk grouped by modernization domain or system family.

### Screens Used

- Dashboard
- Project overview
- Risk graph
- Remediation summary

### What Should Stay Out Of Their Way

- Parser lifecycle detail.
- Individual low-confidence extraction noise.
- Ticket-level engineering steps unless needed for planning.

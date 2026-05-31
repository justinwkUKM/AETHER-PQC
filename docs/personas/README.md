# AETHER-PQC Persona Specifications

This directory defines the enterprise users AETHER-PQC is designed for and the UX contract each persona needs. These specs guide the next product and interface overhaul.

## Persona Map

| Persona | Priority | Primary Question | Most Important Screens |
| --- | --- | --- | --- |
| CISO / VP Security | Primary | Are we reducing material post-quantum risk? | Dashboard, project overview, remediations, reports |
| PQC / Cryptography Program Lead | Primary | Where is vulnerable crypto and what should migrate first? | Scan, crypto inventory, graph, remediations |
| Security Architect | Primary | How does crypto risk connect to systems, data, and trust boundaries? | Graph, project overview, scan evidence |
| Application Owner / Engineering Manager | Primary | What exactly does my team need to fix? | Remediations, graph detail, source evidence |
| GRC / Compliance / Audit Lead | Primary | Can we prove our PQC assessment and remediation process? | Evidence timeline, artifacts, reports, remediations |
| Cloud / Platform Security Engineer | Primary | Which exposed endpoints, gateways, and TLS paths are risky? | Exposure view, graph, remediations, scan |
| SOC / Threat Intelligence Analyst | Secondary | Which exposed assets may matter for future threat activity? | Dashboard, exposure summaries, graph |
| Third-Party Risk / Procurement Manager | Secondary | Which vendors or external services introduce crypto exposure? | Scan, evidence, reports |
| Enterprise Architect | Secondary | How does PQC migration fit into modernization planning? | Dashboard, graph, portfolio summaries |

## Workflow Ownership

| Workflow | Primary Owner | Supporting Personas |
| --- | --- | --- |
| Create assessment project | PQC / Cryptography Program Lead | Security Architect, Cloud / Platform Security Engineer |
| Upload artifacts | PQC / Cryptography Program Lead | Security Architect, Third-Party Risk Manager |
| Interpret extracted graph | Security Architect | PQC Lead, Platform Security Engineer |
| Prioritize remediation | PQC / Cryptography Program Lead | CISO, Security Architect, Engineering Manager |
| Execute remediation | Application Owner / Engineering Manager | Platform Security Engineer |
| Validate evidence and reporting | GRC / Compliance / Audit Lead | PQC Lead, CISO |
| Review executive progress | CISO / VP Security | GRC, PQC Lead |

## UX Decision Rules

- Dashboard hierarchy should answer "what needs attention now?" before exposing raw technical detail.
- Graph design should explain selected findings in plain language and make source evidence visible.
- Remediation design should produce ticket-ready work for engineering teams.
- Reporting should preserve artifact history, scan events, scoring rationale, and remediation status.
- AI-generated or inferred context must be labeled clearly, especially synthetic graph nodes and low-confidence findings.
- Persona-specific views should be presentation presets first, not strict role-based access control.

## Implementation Priority

The first implementation priority is making extracted findings understandable. AETHER-PQC already produces graph nodes, exposure scores, and remediation records; the next UX layer must translate those objects into user meaning for architects, engineering managers, and executives.

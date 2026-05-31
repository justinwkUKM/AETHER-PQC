# Persona-Driven Implementation Order

This roadmap converts the persona specifications into a practical build sequence. The order favors immediate comprehension, then operational execution, then reporting and role-specific presentation.

## 1. Finding Explanation UX

Highest priority because current graph findings can be hard to interpret without domain context.

Build:

- Selected-node side panel with "What this means," "Why it matters," "Connected items," "Exposure path," "Source evidence," and "Extracted details."
- Clear explanation for generated context nodes such as `external_network_context`.
- Artifact names in evidence references.
- Legend explaining color, exposure ring, lines, confidence, and source.

Primary personas served:

- Security Architect
- PQC / Cryptography Program Lead
- Application Owner / Engineering Manager

Acceptance criteria:

- A selected graph node explains itself without requiring the user to inspect raw JSON.
- Synthetic context cannot be mistaken for confirmed infrastructure.
- Source evidence links back to user-recognizable artifact names.

## 2. Persona-Aware Dashboard

Build the dashboard around the executive and program-lead question: "What needs attention now?"

Build:

- PQC readiness summary.
- Critical exposed findings count.
- Highest-risk projects.
- Recent scan changes.
- Remediation progress.
- Projects requiring action.

Primary personas served:

- CISO / VP Security
- PQC / Cryptography Program Lead
- GRC / Compliance / Audit Lead

Acceptance criteria:

- Users can identify the highest priority project from the dashboard.
- Internet-facing critical findings are visible without opening every project.
- Dashboard language is understandable to executives and security leaders.

## 3. Remediation Workbench

Improve remediation cards so engineering managers can convert findings into work.

Build:

- "Why this is prioritized."
- "What to change."
- "How to validate."
- "Evidence."
- "Open questions."
- Copy-ready ticket summary.
- Category for application action, platform action, vendor action, or architecture review.

Primary personas served:

- Application Owner / Engineering Manager
- Cloud / Platform Security Engineer
- PQC / Cryptography Program Lead

Acceptance criteria:

- A remediation can be copied into a work tracker with minimal editing.
- Validation steps are specific enough for acceptance criteria.
- Platform-owned work is distinguishable from application-owned work.

## 4. Crypto Inventory View

Add a filterable inventory for the PQC program lead.

Build:

- Table of primitives, protocols, affected nodes, exposure, confidence, parser mode, and source artifact.
- Filters for primitive, protocol, exposure level, confidence, parser mode, artifact, and review status.
- "Needs review" queue for low-confidence AI findings.
- Finding detail panel with deterministic scoring rationale and migration recommendation.

Primary personas served:

- PQC / Cryptography Program Lead
- Security Architect
- GRC / Compliance / Audit Lead

Acceptance criteria:

- Program leads can find all RSA, ECDH, TLS 1.0, TLS 1.1, and weak TLS 1.2 findings quickly.
- AI findings are visibly separate from deterministic findings.
- Low-confidence findings are reviewable instead of hidden.

## 5. Evidence And Compliance View

Create an audit-ready evidence experience.

Build:

- Artifact timeline.
- Scan event history.
- Scoring methodology summary.
- AI validation explanation.
- Remediation status summary.
- Export-ready evidence summary for PDF, CSV, and JSON.

Primary personas served:

- GRC / Compliance / Audit Lead
- CISO / VP Security
- Third-Party Risk / Procurement Manager

Acceptance criteria:

- Every material finding can be traced to source artifacts and scan events.
- Reports distinguish deterministic, AI-inferred, reviewed, and remediated states.
- Compliance users can produce a defensible evidence package without manual screenshots.

## 6. Exposure / Platform View

Add a platform-focused view for exposed endpoints, gateways, protocols, and infrastructure paths.

Build:

- Network-facing critical findings list.
- TLS and protocol findings grouped by endpoint, gateway, service, or external path.
- Exposure path visualization.
- Platform action category.
- Owner questions for ambiguous responsibility.

Primary personas served:

- Cloud / Platform Security Engineer
- Security Architect
- SOC / Threat Intelligence Analyst

Acceptance criteria:

- Network-facing weak crypto and legacy TLS findings are prominent.
- Exposure path is visible without manually tracing graph edges.
- Platform-owned remediation work is clear.

## 7. Role-Based Presentation Layer

Add persona-oriented presentation presets before strict RBAC.

Build:

- Executive preset.
- Architecture preset.
- Engineering preset.
- Compliance preset.
- Platform preset.

Primary personas served:

- All primary personas

Acceptance criteria:

- Presets change hierarchy and emphasis without hiding authorized data.
- Users can switch views without changing project state.
- Strict RBAC remains out of scope until enterprise collaboration requirements are defined.

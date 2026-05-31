# Persona: CISO / VP Security

## Profile

The CISO or VP Security is the executive owner accountable for enterprise quantum-readiness, customer trust, regulatory response, and security investment prioritization. They do not need a raw technical workspace by default; they need a credible risk posture and a clear path to reduction.

## Enterprise Problems

- The organization lacks a defensible inventory of quantum-vulnerable cryptography.
- Existing findings are scattered across SBOMs, CBOMs, architecture documents, cloud inventories, vendor questionnaires, and manual spreadsheets.
- Leadership cannot tell whether vulnerable crypto is internet-facing, business-critical, internal-only, or duplicated across systems.
- Progress reporting is hard because remediation ownership, evidence, and risk reduction are not connected.
- Board, audit, customer, and regulator questions require concise answers backed by traceable evidence.

## Needs

- Portfolio-level PQC readiness posture.
- Count of critical exposed findings.
- Risk trend over time by project, system, or business process.
- Remediation progress and overdue ownership.
- Plain-English business impact summaries.
- Exportable executive summaries backed by evidence.

## Expectations

- The dashboard should be the primary experience, not the graph.
- The app should explain what changed since the last assessment.
- Critical internet-facing findings should be obvious.
- Technical detail should be available through drill-down, not forced upfront.
- Reports should be credible enough for executive, audit, customer, and board conversations.

## User Journey

1. Signs in through the enterprise-approved identity flow.
2. Lands on the dashboard.
3. Reviews enterprise PQC readiness, total projects, critical exposed findings, and remediation progress.
4. Opens only the projects that require escalation or funding decisions.
5. Reviews the highest-risk systems and why they matter.
6. Checks remediation ownership and whether progress is blocked.
7. Exports or shares a board-ready summary.

## Perfect UX

- Executive dashboard is the default view.
- Top cards show PQC readiness, critical exposed findings, remediation burn-down, and projects requiring action.
- Each critical item has a plain-English risk narrative.
- The dashboard separates "new risk," "unresolved critical risk," and "risk reduced."
- Project pages summarize business impact before showing graph detail.
- Reports include scope, methodology, key findings, trend, remediation status, and evidence references.
- The UX avoids acronyms unless the user drills into technical detail.

## Success Criteria

- A CISO can explain the enterprise PQC posture in under five minutes.
- The most urgent risk is visible without opening the graph.
- Every executive claim can be traced to artifacts, scans, and remediation records.

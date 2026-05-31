# Persona: GRC / Compliance / Audit Lead

## Profile

The GRC, compliance, or audit lead is responsible for proving that the organization is assessing, governing, and reducing post-quantum cryptography risk. This user needs evidence, consistency, and defensible methodology.

## Enterprise Problems

- PQC readiness evidence is scattered across documents, spreadsheets, tickets, architecture repositories, and vendor responses.
- Manual inventories become stale quickly.
- Risk methodology is difficult to explain when findings come from multiple tools and AI-assisted extraction.
- Audit and customer responses need traceability from claim to evidence.
- Teams need to distinguish detected, inferred, reviewed, accepted, and remediated states.

## Needs

- Consistent scoring model.
- Artifact audit trail.
- Scan history and scan events.
- Remediation status and ownership.
- Source evidence for findings.
- Explanation of deterministic and AI-assisted analysis.
- Exportable evidence package.

## Expectations

- Findings must be traceable to uploaded artifacts and scan events.
- AI usage must be explainable and schema-validated.
- Reports distinguish deterministic extraction from AI inference.
- The app preserves history rather than only showing the latest visual state.
- Compliance output should be understandable outside the security engineering team.

## User Journey

1. Opens a project.
2. Reviews assessment scope and uploaded artifacts.
3. Reviews scan history and parsing outcomes.
4. Checks findings, evidence, scoring rationale, and remediation status.
5. Exports an evidence package for audit, customer questionnaire, or regulatory response.
6. Tracks whether remediation work is still open, accepted, or completed.

## Perfect UX

- Compliance report view summarizes scope, methodology, findings, risk scoring, AI usage, and remediation status.
- Evidence timeline shows artifact upload, parse lifecycle, scan events, graph updates, and remediation generation.
- Source artifact references are visible from every finding and remediation.
- Export options include PDF summary, CSV remediation list, and JSON evidence bundle.
- Methodology section explains vulnerability score, exposure score, effective risk, deterministic overrides, and AI validation.

## Success Criteria

- A compliance lead can answer "how do you know?" for every material finding.
- Evidence exports are usable without manually assembling screenshots and spreadsheets.
- AI-assisted extraction is transparent enough for audit review.

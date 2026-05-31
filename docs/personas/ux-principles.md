# Persona-Driven UX Principles

These principles convert the persona specs into product design rules for AETHER-PQC.

## Lead With Meaning

AETHER-PQC should answer "what matters now?" before showing raw technical detail. Users should not need to decode graph nodes, scores, or extracted labels before understanding the risk.

## Every Finding Must Explain Itself

Each finding should answer:

- What this is.
- Why it was extracted.
- Why it matters.
- How exposed it is.
- What evidence supports it.
- What to do next.

## Graph UX Must Be Interpretive

The graph is not just a visualization. It is an interpretation tool.

- Node color shows the selected risk mode.
- Exposure rings show reachability.
- Edges show relationships extracted from artifacts.
- Synthetic or inferred nodes are labeled clearly.
- The side panel explains selected nodes in plain language.
- Source artifacts are visible by name, not only by internal ID.

## Remediations Must Be Ticket-Ready

Remediation cards should help engineering teams act without extra meetings.

- Explain why the item is prioritized.
- State what should change.
- Include validation steps.
- Show source evidence.
- Identify owner questions and residual risk.
- Provide copy-ready ticket text.

## Executive Views Must Summarize

Executives need material risk, trend, ownership, and progress. They should not land in a raw graph-first experience.

Required executive information:

- Current PQC readiness.
- Critical exposed findings.
- Projects requiring action.
- Remediation progress.
- Business impact summary.

## Architecture Views Must Preserve Depth

Architects need topology, trust boundaries, source evidence, and relationship detail.

Required architecture information:

- Exposure path.
- Connected systems.
- Edge meanings.
- Source artifacts.
- Confidence.
- Whether a node is detected, inferred, or synthetic context.

## AI Findings Must Be Transparent

Gemini-assisted extraction is valuable for diagrams, screenshots, PDFs, and ambiguous documents, but it must remain explainable.

- Show confidence.
- Show parser mode.
- Validate schema before persistence.
- Keep deterministic crypto scoring authoritative.
- Mark low-confidence findings for review.
- Never present AI-inferred context as confirmed infrastructure.

## Persona Views Before RBAC

AETHER-PQC should add persona-oriented presentation presets before strict role-based access control.

Recommended presets:

- Executive
- Architecture
- Engineering
- Compliance
- Platform

These presets change hierarchy and emphasis, not data access.

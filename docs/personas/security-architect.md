# Persona: Security Architect

## Profile

The security architect understands enterprise systems, trust boundaries, application dependencies, and data flows. This persona uses AETHER-PQC to turn extracted crypto findings into architectural meaning.

## Enterprise Problems

- Security findings are disconnected from architecture.
- Teams cannot tell whether vulnerable crypto protects public APIs, internal services, data stores, partners, or legacy gateways.
- Trust boundaries, ingress paths, external services, and data assets are often missing from raw crypto inventories.
- Graph nodes may be confusing if generated context and real infrastructure look the same.
- Architects need to validate whether inferred relationships are plausible.

## Needs

- Explainable graph nodes and edges.
- Exposure path for each high-risk finding.
- System context around each crypto asset.
- Clear distinction between extracted, deterministic, AI-inferred, and synthetic context.
- Source artifact evidence for every selected item.
- Ability to compare effective risk, exposure, and vulnerability modes.

## Expectations

- The graph must be readable without guessing.
- Every extracted item explains what it is, why it was extracted, why it matters, and what supports it.
- Network-edge findings stand out visually.
- Synthetic nodes such as external network context are labeled as inferred analysis aids, not real infrastructure.
- Edge labels and relationship types help explain data flow or dependency meaning.

## User Journey

1. Opens project overview.
2. Reviews the risk graph in effective risk mode.
3. Switches between effective risk, exposure, and vulnerability modes.
4. Selects a finding or system node.
5. Reads what the node means, connected items, exposure path, confidence, and source evidence.
6. Uses graph relationships to validate remediation priority.
7. Shares architectural interpretation with engineering or platform teams.

## Perfect UX

- Graph has a clear mode toggle: Effective Risk, Exposure, Vulnerability.
- Selected node panel contains "What this means," "Why it matters," "Connected items," "Exposure path," "Source evidence," and "Extracted details."
- Synthetic or inferred context nodes are visually and textually distinguished.
- Legend explains node color, exposure ring, line meaning, confidence, and source evidence.
- Hover and selection states avoid forcing the user to decode the entire topology at once.
- An "Architecture interpretation" summary describes the likely threat path in plain language.

## Success Criteria

- An architect can explain why a finding is prioritized from the selected node panel alone.
- Generated context cannot be mistaken for a confirmed real asset.
- Graph exploration produces actionable architecture insight, not just visual complexity.

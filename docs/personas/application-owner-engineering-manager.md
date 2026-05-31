# Persona: Application Owner / Engineering Manager

## Profile

The application owner or engineering manager is responsible for turning security findings into delivery work. This user needs clear scope, priority, evidence, and validation steps rather than a deep PQC theory lesson.

## Enterprise Problems

- Security findings often arrive as vague requests such as "remove RSA" or "upgrade TLS."
- Engineering teams need exact affected components, source evidence, and the reason for urgency.
- PQC remediation competes with roadmap delivery, incident work, and reliability tasks.
- Without ticket-ready output, findings become meetings instead of implementation work.
- Teams may not know whether a finding belongs to application code, platform infrastructure, or a vendor dependency.

## Needs

- Clear priority and severity rationale.
- Affected application, component, service, or protocol.
- Source artifact and extracted evidence.
- Recommended migration path.
- Validation steps.
- Owner questions for unknowns.
- Residual risk notes.

## Expectations

- Remediations map directly to engineering tasks.
- The app explains why this is urgent now.
- The user can copy a ticket summary into Jira, Linear, GitHub Issues, or an internal work tracker.
- Technical evidence is available but does not overwhelm the default remediation card.
- Platform-owned and application-owned work is separated.

## User Journey

1. Receives a project or remediation link.
2. Opens the remediation page.
3. Filters by owned application, priority, or network-facing status.
4. Opens a remediation card.
5. Reviews affected component, vulnerable primitive, exposure reason, source evidence, and recommended migration.
6. Copies ticket-ready remediation text.
7. Uses validation steps to define acceptance criteria.
8. Follows up on owner questions or residual risk.

## Perfect UX

- Remediation cards are the main interface for this persona.
- Each card includes "Why this is prioritized," "What to change," "How to validate," "Evidence," and "Open questions."
- Copy-ready ticket summary is available from each remediation.
- Cards show whether work belongs to application code, platform configuration, certificate/TLS management, vendor follow-up, or architecture review.
- The graph is linked as supporting context, not required for basic execution.

## Success Criteria

- An engineering manager can turn a remediation into a ticket in under two minutes.
- The remediation contains enough evidence to avoid a clarification meeting.
- Validation steps are concrete enough to close the work safely.

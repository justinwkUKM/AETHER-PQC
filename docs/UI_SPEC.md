# UI Specification

## Design Direction

AETHER-PQC should feel like a minimal scientific workspace for post-quantum risk analysis. The visual language is quantum and physics inspired: sparse fields, quiet instrumentation, thin orbital accents, and precise hierarchy. It must not feel cyberpunk, terminal-driven, or command-center themed.

## Visual Principles

- Use graphite, indigo-black, mist gray, muted violet, soft blue, and restrained status colors.
- Prefer translucent cards and panels with soft borders over neon framing.
- Keep primary content centered and readable with generous vertical rhythm.
- Use compact, familiar control shapes for actions and navigation.
- Maintain strong contrast without relying on saturated glow effects, CRT overlays, scanlines, or dense grids.
- Keep motion smooth and restrained.
- Use physics motifs sparingly: thin orbital rings, field-line separators, and particle-like graph nodes.

## Navigation Patterns

- Global shell shows the brand, session status, and primary actions with a minimal observatory treatment.
- A left workspace rail provides quick access to dashboard, assessment creation, and assessment views.
- Project pages expose a local navigation cluster for overview, scan, and remediation views.
- The dashboard should answer “what should I do next” at a glance.

## Page Contracts

- Login: editorial split layout with a clear sign-in action and short value summary.
- Dashboard: prominent greeting, quick-action affordance, project list, and status cards.
- New assessment: centered form flow with supporting guidance and tips.
- Scan view: evidence-intake interaction with a live analysis activity log that uses SSE first and polling fallback.
- Project overview: prominent assessment summary, risk score, and minimal quantum field graph surface.
- Remediations: priority-first queue with readable action cards.

## Control Treatment

- Buttons should feel tactile and consistent, with icon + text on primary actions.
- Inputs should be large enough for quick scanning and comfortable use.
- Tags, chips, and small badges should communicate state without clutter.
- Long-running analysis states should show staged progress, live console heartbeats, and clear completion/warning/error states.
- Empty states should explain the next action and make it obvious where to go next.
- Monospace and uppercase labels should be used sparingly for numeric or evidence metadata, not as a dominant visual style.

## Acceptance Criteria

- The app remains easy to scan on desktop and mobile.
- The primary actions are visible without hunting through the interface.
- Project navigation is one click away from every workspace screen.
- Visual surfaces remain consistent across login, dashboard, scan, and remediation flows.
- No screen should feel like a generic admin template.

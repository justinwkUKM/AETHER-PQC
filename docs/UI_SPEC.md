# UI Specification

## Design Direction

AETHER-PQC should feel calm, premium, and focused. The visual language is inspired by the newer Gemini app pattern: soft dark surfaces, clearer hierarchy, pill-like control affordances, spacious layout, and a workspace-first navigation model.

## Visual Principles

- Use deep blue-black backgrounds with subtle layered gradients.
- Prefer translucent cards and panels with soft borders over hard neon framing.
- Keep primary content centered and readable with generous vertical rhythm.
- Use compact, familiar control shapes for actions and navigation.
- Maintain strong contrast without relying on saturated glow effects.
- Keep motion smooth and restrained.

## Navigation Patterns

- Global shell shows the brand, session status, and primary actions.
- A left workspace rail provides quick access to dashboard, assessment creation, and project sections.
- Project pages expose a local navigation cluster for overview, scan, and remediation views.
- The dashboard should answer “what should I do next” at a glance.

## Page Contracts

- Login: editorial split layout with a clear sign-in action and short value summary.
- Dashboard: prominent greeting, quick-action affordance, project list, and status cards.
- New assessment: centered form flow with supporting guidance and tips.
- Scan view: upload-first interaction with a live activity console that uses SSE first and polling fallback.
- Project overview: prominent summary banner, risk score, and graph surface.
- Remediations: priority-first queue with readable action cards.

## Control Treatment

- Buttons should feel tactile and consistent, with icon + text on primary actions.
- Inputs should be large enough for quick scanning and comfortable use.
- Tags, chips, and small badges should communicate state without clutter.
- Long-running analysis states should show staged progress, live console heartbeats, and clear completion/warning/error states.
- Empty states should explain the next action and make it obvious where to go next.

## Acceptance Criteria

- The app remains easy to scan on desktop and mobile.
- The primary actions are visible without hunting through the interface.
- Project navigation is one click away from every workspace screen.
- Visual surfaces remain consistent across login, dashboard, scan, and remediation flows.
- No screen should feel like a generic admin template.

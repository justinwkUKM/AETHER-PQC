# Persona: Cloud / Platform Security Engineer

## Profile

The cloud or platform security engineer secures shared infrastructure, ingress, TLS termination, certificates, gateways, load balancers, service mesh, and cloud exposure paths. This user needs exposure-aware crypto risk, not only primitive-level weakness.

## Enterprise Problems

- Public endpoints and TLS termination points are hard to map to application ownership.
- Legacy TLS, RSA, ECDH, weak TLS 1.2 contexts, or old gateways may exist at network edges.
- Infrastructure diagrams, service inventories, and cloud notes may be incomplete or inconsistent.
- Application teams may not know when a crypto finding is caused by shared platform configuration.
- Internet-facing risk needs to be prioritized above isolated internal-only findings.

## Needs

- Exposure-aware risk scoring.
- TLS protocol and cipher context.
- Detection of public APIs, ingress, gateways, load balancers, external services, partner links, DMZ, and inbound traffic.
- Exposure paths from external services to affected components or crypto assets.
- Ownership hints for platform vs application work.
- Clear remediation category for platform actions.

## Expectations

- Network-facing findings rank higher than equivalent internal findings.
- TLS 1.0, TLS 1.1, weak TLS 1.2, RSA key exchange, static DH, RC4, 3DES, SHA-1, and legacy gateways are obvious.
- The graph reveals ingress-to-component paths.
- Platform-owned remediation work is not buried in application findings.
- Source evidence is available for diagrams, screenshots, docs, and structured artifacts.

## User Journey

1. Uploads architecture diagrams, TLS notes, cloud docs, endpoint inventories, and service ownership references.
2. Watches scan events to confirm deterministic and AI parsing.
3. Reviews exposure summary.
4. Opens the graph in exposure mode.
5. Identifies public or partner-facing crypto and protocol risks.
6. Reviews remediation items categorized as platform action, application action, or owner review.
7. Coordinates remediation with application owners.

## Perfect UX

- Exposure dashboard lists network-facing critical findings first.
- TLS and protocol findings are grouped by endpoint, gateway, service, or external path.
- Graph exposure mode emphasizes internet-edge and partner-edge paths.
- Each finding shows exposure reason, exposure path, and affected boundary.
- Remediation cards distinguish platform configuration changes from application code migration.
- The app provides owner questions when responsibility is unclear.

## Success Criteria

- The platform engineer can identify the most exposed crypto risks without reading every artifact.
- Internet-facing weak protocol usage cannot be hidden by average project risk.
- Platform-owned work is clearly separated from application remediation.

# Persona: PQC / Cryptography Program Lead

## Profile

The PQC or cryptography program lead owns the migration from classical public-key cryptography and legacy protocol usage to approved post-quantum or hybrid patterns. This user needs the deepest crypto inventory and prioritization experience in the product.

## Enterprise Problems

- Cryptography appears across code, dependencies, TLS endpoints, certificates, diagrams, screenshots, vendor documents, architecture notes, and data flows.
- Existing tools produce partial lists without topology or exposure context.
- Teams need prioritization beyond "RSA is bad."
- Findings may be duplicated or ambiguous across multiple artifacts.
- AI-assisted extraction is valuable but must be validated, confidence-scored, and traceable.

## Needs

- Complete crypto inventory across structured and unstructured artifacts.
- Deterministic scoring for known primitives and protocols.
- Gemini-assisted extraction for diagrams, scanned PDFs, screenshots, and ambiguous text.
- Exposure-aware prioritization.
- Confidence and review status for AI findings.
- Clear migration paths to ML-KEM, ML-DSA, SLH-DSA, TLS 1.3, or approved hybrid patterns.

## Expectations

- Every finding has source evidence.
- Deterministic findings are distinguishable from AI-inferred findings.
- Low-confidence findings remain visible but are marked for review.
- Duplicate findings are merged without losing evidence.
- Batch analysis explains when cross-artifact relationships were inferred.
- Remediation recommendations use approved crypto migration language.

## User Journey

1. Creates an assessment project.
2. Uploads SBOMs, CBOMs, architecture diagrams, screenshots, TLS notes, PDFs, and text documents.
3. Watches the live scan console to verify parsing progress.
4. Reviews the extracted crypto inventory.
5. Filters by primitive, protocol, exposure, confidence, artifact, and parser mode.
6. Opens the graph to understand relationships and exposure paths.
7. Reviews prioritized remediation items.
8. Exports or assigns migration work to engineering and platform owners.

## Perfect UX

- A dedicated crypto inventory view lists every primitive, protocol, confidence score, source artifact, and exposure level.
- Finding detail explains primitive, vulnerability, exposure, source evidence, parser mode, confidence, and migration recommendation.
- A "Needs review" queue captures low-confidence or ambiguous AI findings.
- Unified batch analysis status explains cross-artifact reasoning in the scan console.
- Deterministic override rules are visible in a compact scoring explanation.
- Filters support primitive, protocol, risk, exposure, confidence, source artifact, and parser mode.

## Success Criteria

- The program lead can identify the top migration candidates without manually comparing artifacts.
- Deterministic crypto risk cannot be weakened by AI output.
- Each migration recommendation is traceable to evidence and scoring rationale.

# AFTERMARK IR — Phase 1 research

Date: 6 November 2026. Owner: UI/UX and frontend lead. Status: completed desk research; proposed design and research protocol. No interviews, usability sessions, product implementation, provider calls, or application tests were performed for this deliverable.

Companion specifications: [UX and test protocol](UX_TESTS.md) and [Codex implementation handoff](CODEX_HANDOFF.md).

## 1. Scope and evidence discipline

The complete attached **AFTERMARK_IR_Hackathon_Team_Blueprint.docx**, version 1.0, 6 November 2026, sections 1–20, was read. Its requirements are the product brief, not independent proof of market need. Its embedded implementation prompts are future work; this request authorizes Phase 1 only. Competition rules are inherited from the blueprint, not independently reverified against the two original competition documents.

Focus: a human-in-the-loop incident copilot that retrieves history through Hindsight and uses AFTERMARK's deterministic validity gate to evaluate applicability. The frontend must distinguish historical outcome, current applicability, source trust, and inference. No production remediation. Simulated operator decisions and synthetic inputs remain explicitly labelled.

Evidence classes used throughout:

- **V — verified source finding:** supported by the accessed primary source; does not imply independent replication.
- **H — hypothesis/design proposal:** our interpretation or proposed product behavior, still to validate.
- **U — unknown:** evidence not available, not tested, or not established by the cited source.
- **B — blueprint constraint:** required scenario or architecture, not empirical evidence.

Method: targeted web discovery followed by primary postmortems, original study/publication pages, official product documentation and vendor engineering material. Searches covered incident coordination, handovers, historical incident retrieval, drift and AI investigations. This is purposive desk research, not a systematic review or competitive security audit. Public postmortems have reporting/selection bias; vendor pages describe advertised capabilities; small studies and large-cloud studies do not automatically generalize to small SaaS teams.

## 2. Source register

Every URL below was accessed **2026-11-06**. Publication/event dates are separate from access dates. Summaries are paraphrases. Unspecified update dates are deliberately not guessed.

| ID | Primary source and URL | Date / evidence type | Verified finding used | Limits |
|---|---|---|---|---|
| R1 | Cloudflare, [1.1.1.1 incident on July 14, 2025](https://blog.cloudflare.com/cloudflare-1-1-1-1-incident-on-july-14-2025/) | Event: 2025-07-14; first-party postmortem | A June 6 configuration error remained dormant until a later topology change triggered route refresh. | Demonstrates interaction between changes; does not document AFTERMARK's exact old-remediation scenario or its frequency. |
| R2 | Cloudflare, [Service outage June 12, 2025](https://blog.cloudflare.com/cloudflare-service-outage-june-12-2025/) | Event: 2025-06-12; first-party postmortem | Workers KV's storage failure propagated to dependent products; service-specific incidents were combined when a shared cause was identified. | One provider's account; not proof that a single dashboard prevents cascading failures. |
| R3 | Kent, Tuptuk & Becker, [Passing the Baton: Shift Handovers Within Cybersecurity Incident Response Teams](https://journals.sagepub.com/doi/10.1177/15553434261476536) | First online: 2026-08-20; original research | Six experienced CSIRT practitioners participated; the study explores handover practices and structured materials, including actions, context, responsibilities and incoming acknowledgement. | Small exploratory cybersecurity sample; transfer to availability SRE work is a hypothesis. |
| R4 | Laura Maguire, [The Secret Lives of SREs — Controlling the Costs of Coordination across Remote Teams](https://www.usenix.org/conference/srecon20americas/presentation/maguire) | 2020-12-07; USENIX practitioner research presentation | Describes research on 62 incident-response cases across four organizations; coordination tooling can itself add cognitive costs. | Reviewed presentation description, not raw observations; cannot estimate a universal effect size. |
| R5 | Chen et al., [Towards intelligent incident management: why we need it and how we make it](https://www.microsoft.com/en-us/research/publication/towards-intelligent-incident-management-why-we-need-it-and-how-we-make-it/) | ACM FSE, November 2020; original research abstract | A study of over two years of Microsoft incident management identifies incomplete dependencies and imprecise resource-health assessment as challenges. | Abstract-level evidence only; one enterprise context. No numerical outcome claims adopted. |
| R6 | PagerDuty, [Past Incidents](https://docs.pagerduty.com/ai-automation/aiops/past-incidents) | Official documentation; current accessed page | Surfaces same-service historical incidents using similarity factors, with past remediation context and recency/relevance navigation. | Documentation review, not hands-on testing; no inference about undocumented safety controls. |
| R7 | Microsoft Learn, [Memory and knowledge in Azure SRE Agent](https://learn.microsoft.com/en-us/azure/sre-agent/memory) | Official documentation; current accessed page | Describes past incidents, saved knowledge, clickable citations, successful steps and pitfalls, with priority for the same resource. | Public text was accessible despite an authorization notice; deployment-specific behavior and availability were not tested. |
| R8 | Rootly, [AI SRE](https://rootly.com/ai-sre) | Current official product page | Advertises investigations across code changes, telemetry and past incidents. | Marketing capability claim; speed and outcome claims are not adopted as independent evidence. |
| R9 | incident.io, [Building Investigations: what it takes to build an AI SRE](https://incident.io/blog/building-investigations-what-it-takes-to-build-an-ai-sre) | Vendor engineering account; current accessed page | Describes investigation across multiple sources and difficulties with unsupported conclusions in an earlier approach. | Self-reported development experience; not a comparative reliability benchmark. |
| R10 | W3C, [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) | W3C Recommendation dated 2024-12-12 on accessed page | Normative reference for contrast, keyboard access, focus, reflow, target size and status messages. | A specification target, not a conformance certificate for this unbuilt interface. |

## 3. Five concrete problems and falsifiable research questions

Priority is a design judgment based on scenario risk and scope, not measured frequency. All thresholds below are preregistered formative acceptance targets. No results exist yet. Use the protocol in UX_TESTS.md; record failures rather than editing thresholds after the session.

| ID / priority | Concrete user problem and trigger | Evidence and inference boundary | Proposed intervention | Falsifiable research question / failure rule |
|---|---|---|---|---|
| P1 / P0 | An on-call engineer sees the same 503 symptom and reuses an old mitigation without checking whether its prerequisites still exist. | V: changes interact over time [R1]; history is surfaced commercially [R6]. H: this creates a stale-fix hazard that an inline comparison can reduce. Exact reuse frequency is U. | Show historical success separately from present BLOCKED status; compare version and flag prerequisites next to the action. | Can all 3 formative participants identify the absent flag and version incompatibility within 20 s, without opening a separate page? Fails if anyone misses either or chooses the blocked action. |
| P2 / P0 | A responder sees an authoritative-looking remembered recommendation but cannot establish who verified it, when, or from which incident. | V: products expose memory/citations [R7]; unsupported conclusions are a documented engineering concern [R9]. H: accessible provenance improves calibrated trust. | Inline incident, source, verification timestamp and actor; one action opens actual trace and source excerpt. | Can all 3 distinguish operator-confirmed historical success from a generated hypothesis and find the source within 30 s? Fails on any incorrect attribution or missing trace. |
| P3 / P0 | Similar service symptoms anchor investigation on the old explanation while current dependency evidence suggests another direction. | V: dependency cascades [R2], incomplete dependency/health information [R5]. H: a contrast row plus explicit uncertainty reduces anchoring. | Pair old preconditions with current DB-pool evidence, observed time and a read-only diagnostic; no automatic root-cause declaration. | Can all 3 explain that 98% pool utilization warrants investigation but does not prove DB root cause within 30 s, and choose the diagnostic? Fails if anyone declares confirmed cause or assumes the old fix remains applicable. |
| P4 / P1 | An incoming responder cannot tell what was tried, what failed, what remains unknown, or who owns the next step. | V: handover research [R3]. H: a cited structured handover can preserve these distinctions for SRE teams. | Timeline plus handover with facts, rejected/tried actions, unknowns and explicit owner. | Can all 3 recover all five task facts (status, blocked action, evidence, unknown, owner) from a handover within 45 s? Fails if any fact is missing or invented; “unassigned” is correct when no owner exists. |
| P5 / P0 | Under interruption or provider delay, a responder loses incident context or mistakes cached/replayed data for a fresh result. | V: coordination tooling can add cognitive effort [R4]. H: stable context, explicit freshness and honest latency states reduce this error. | Persistent incident header, snapshot timestamps, scoped pending states, preserved filters and explicit recorded/live distinction. | After a memory timeout and screen switch, can all 3 return to the same incident and identify the stale/unavailable status within 30 s without believing recall succeeded? Fails on any mistaken success or lost incident selection. |

The thresholds above are stringent design checks, not statistically powered proof. Do not claim reduced MTTR, reduced outages, willingness to pay, or general market validation from three sessions.

## 4. Competitive snapshot and positioning

Review date: 2026-11-06. This compares documented capabilities, not tested products. “Not established” means these sources do not answer the question; it does not mean a competitor lacks the capability.

| Product | Documented capability | UX expectation for AFTERMARK | Not established by this review |
|---|---|---|---|
| PagerDuty [R6] | Same-service past incidents and historical context | Make prior cases accessible from incident detail; distinguish relevance from applicability. | Exact deterministic absent-flag/version veto or failure-memory policy. |
| Azure SRE Agent [R7] | Learned successful steps/pitfalls and clickable source citations | Citations and failure awareness are baseline expectations, not novelty. | Whether its controls and audit path match AFTERMARK's proposed gate under this scenario. |
| Rootly [R8] | Code, telemetry and incident-history investigation | Put current evidence beside historical context. | Independent accuracy and behavior under deliberately drifted fixtures. |
| incident.io [R9] | Multi-source investigations; engineering attention to evidence quality | Keep observations distinct from generated explanations. | Relative safety, latency or usability versus this unbuilt product. |

**H — positioning hypothesis:** AFTERMARK could be compelling as a small, inspectable demonstration of a deterministic applicability gate: a real retrieved successful action remains visible while specific prerequisites and current evidence prevent its reuse. Hindsight owns retention/retrieval/reflection; AFTERMARK owns policy decisions and the outcome ledger. This is not a first-ever claim or proof of competitive superiority.

## 5. Product synthesis and design implications

**B:** INC-101 succeeds in the simulator after disabling `new_checkout` on checkout-api v1.3. INC-102 has compatible conditions. INC-103 has similar symptoms, v2.0.0, the flag absent and DB-pool utilization 98% in the blueprint example. The UI must reject the old action with `FLAG_ABSENT`, `ENV_DRIFT`, and `CONTRADICTING_TELEMETRY`.

**H:** Put the decisive comparison in IncidentDetail above the fold. Do not hide it behind the MemoryInspector route or a chat response. Lead with “Previously worked. Now blocked.” Show a link to the original source and historical success qualifier immediately. Place a useful read-only next check directly below the refusal.

**Important reasoning boundary:** High utilization is consistent with a different failure mechanism, but it neither proves connection exhaustion caused the outage nor logically excludes every feature-flag problem. The missing prerequisite blocks this action decisively. The synthetic scenario's contradiction rule is supplied by the backend and must show which prior premise conflicts with current evidence. If the API supplies only a metric, display “New DB evidence; cause unconfirmed,” not an invented contradiction explanation. Version differences need explicit compatibility rules; different version strings alone are not a universal incompatibility test.

**H:** Treat the primary user as an on-call availability engineer; incident commander and incoming responder are secondary roles. The blueprint's 50–200-person SaaS persona is a recruitment hypothesis, not a validated segment. CSIRT evidence informs handover design but does not establish equivalence between security investigations and availability incidents.

## 6. Hypothesis and unknown register

| ID | Class | Item | How to resolve / owner |
|---|---|---|---|
| H1 | H | Inline comparison reduces stale-action selection. | P1 task, then larger counterbalanced comparison; UI lead. |
| H2 | H | Source+actor+time supports calibrated trust without excessive scanning. | P2 task and explanation probes; UI lead. |
| H3 | H | One read-only next step is useful enough after a veto. | P3 task; ask what evidence is still needed; UI lead. |
| U1 | U | Which service/version/flag fields are reliably available in real environments? | Interview plus future integration audit; backend owner. |
| U2 | U | How fresh must telemetry and source verification be? | Domain-specific policy discussion; backend owner. No universal time threshold presumed. |
| U3 | U | Can an actual Hindsight recall reliably return INC-101 in the demo? | Real retained-source trace and restart/retrieval rehearsal; backend owner. |
| U4 | U | Can live provider calls fit the 60-second journey? | Measure actual calls; simulator owner. Never animate fabricated completion. |
| U5 | U | Which missing context is most harmful during real handovers? | Five discovery conversations; UI lead. |
| U6 | U | Exact contracts for run progression, evaluation status and evidence links? | Joint OpenAPI review; all three. Gaps listed in CODEX_HANDOFF.md. |
| U7 | U | Market demand, deployment permission, competitive advantage and real outage reduction? | Beyond Phase 1; no claims supported. |

## 7. Ten-minute discovery interview guide — not conducted

Recruit five adults with actual on-call, DevOps, technical-support or incident-response experience if available. Record role, approximate experience and availability/security domain; avoid assuming all are SREs. Obtain consent for notes; recording is optional and separately consented. Ask for anonymized examples, not customer logs, secrets, names or restricted incident details. Do not invent replacements if recruitment fails.

- 0–1 min: explain purpose and consent; clarify that we are evaluating a design, not the participant.
- 1–3 min: “Tell me about the last incident you helped resolve. What did you look at first?” Probe the actual sequence before showing AFTERMARK.
- 3–5 min: “Have you ever copied a fix from an older incident that did not apply?” “What system changes make a runbook stale?” Accept “never”; do not pressure for confirmation.
- 5–7 min: “During a handover, what do you wish the next person knew?” Ask for a concrete missing detail and consequence.
- 7–9 min: “What evidence would make an AI recommendation trustworthy, and what would make you reject it?” Then show the proposed refusal screen and ask what they think it means.
- 9–10 min: ask what is missing and summarize for correction. Thank them; avoid sales or performance promises.

Capture actual observations separately from interpretation. Code notes under stale applicability, provenance, conflicting signals, coordination and handover; allow emergent categories. Record contradictions and counterexamples. Rank observed friction only after data exists. Three usability participants are a separate formative sample; any overlap must be reported.

## 8. Research log and present status

2026-11-06: read all 20 blueprint sections; retrieved two primary postmortems, three research/practitioner sources, four vendor sources and the accessibility standard; produced five problem/question pairs and the companion specifications. Participant count: **0**. Recorded quotes: **0**. Usability results: **not run**. Product access: public pages only. No repository or existing application was inspected. Source URLs and access dates are recorded above so later work can recheck changed product claims.

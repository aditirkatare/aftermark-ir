# AFTERMARK IR — Codex implementation handoff

Version 1.0 • 6 November 2026 • prepared in Phase 1

**This is a specification for future implementation, not built code or an executed test report.** Read [RESEARCH.md](RESEARCH.md) and [UX_TESTS.md](UX_TESTS.md) together. UX_TESTS.md is the authoritative screen/component/interaction specification. This handoff maps it to engineering responsibilities and resolves ambiguities that must not be hidden by UI fixtures.

## 1. Scope, ownership and non-negotiables

The user's ownership: `frontend/**`, `docs/RESEARCH.md`, `docs/UX_TESTS.md`, visual design and judging story. Teammate A owns backend/Hindsight, policy, memory and outcome ledger. Teammate B owns simulator, fixtures, evaluation and delivery. Contract changes require all three to review. Inspect an actual repo and its AGENTS.md/OpenAPI before edits; no repo was inspected in Phase 1.

Future stack from blueprint: React, TypeScript, Vite, Tailwind and accessible UI primitives; backend FastAPI/Pydantic; SSE for events. Reuse installed tooling and existing components before adding dependencies. Verify current APIs at implementation time. This handoff supplies no runnable app, dependency versions or provider integration.

P0: four working screens, real source trace, deterministic absent-flag/environment veto, explicit simulated actions, honest pending/error states and keyboard navigation. P1: handover, quarantine UX and full evaluation report UI once backend support exists. No production execution, generic chat hero, live third-party integration, multi-tenant enterprise UI, invented measurements or automatic publishing.

The UI must show **historical success** and **current block** simultaneously. The gate is backend authority. Hindsight retrieval is not a safety decision. A disabled frontend button is not enforcement: backend must reject blocked/stale decisions too.

## 2. File-level implementation map

| File / area | Responsibility | Primary acceptance reference |
|---|---|---|
| `frontend/src/App.tsx` | Router, shell, landmarks, route-error boundary | A12, A16 |
| `frontend/src/api/client.ts` | Typed requests, validation boundary, aborts, error normalization, SSE adapter | A05, A08–A10 |
| `frontend/src/types/contracts.ts` | Generated/reviewed types from backend OpenAPI, not independently invented schemas | All |
| `frontend/src/styles/globals.css` | Tokens in UX_TESTS §9, focus, reduced motion, responsive layouts | A11–A12 |
| `frontend/src/pages/CommandCenter.tsx` | Queue, filters, mode and connection state | UX §4 |
| `frontend/src/pages/IncidentDetail.tsx` | Above-fold veto/source/next step, evidence and timeline | A01–A04, A19 |
| `frontend/src/pages/MemoryInspector.tsx` | Actual source, trace, verification and applicability | A02, A06–A07, A13 |
| `frontend/src/pages/ReplayLab.tsx` | Acknowledged run controls and honest comparisons | A14–A15, A18, A20 |
| `frontend/src/components/ValidityGateCard.tsx` | One shared renderer for candidate status/reasons/comparison | A01, A04, A19 |
| `frontend/src/components/MemoryEvidenceCard.tsx` | Historical outcome, actual source and missing-data states | A02, A07 |
| `frontend/src/components/IncidentTimeline.tsx` | Ordered evidence/events and update notice | A09 |
| `frontend/src/components/DecisionControls.tsx` | Review drawer, simulated intent/outcome, save conflicts | A07, A10 |
| `frontend/src/components/HandoverPanel.tsx` | Cited draft/copy; no sending | A17 |
| `frontend/tests/incident-flow.spec.ts` | Critical navigation, veto, provider-failure and keyboard tests | A01–A20 as applicable |

Additional files such as a reusable evidence drawer or adapter tests are allowed when justified; avoid placeholder modules solely to match a tree. Fixtures used in development/test must be explicitly labelled synthetic and isolated from live provider traces.

## 3. Blueprint endpoints and unresolved integration needs

These are AFTERMARK API routes, not Hindsight SDK endpoints. The blueprint's `/health` example is truncated; do not treat it as a complete schema.

| Existing blueprint route | Frontend use | Contract clarification required |
|---|---|---|
| `GET /health` | Health/readiness banners | Separate API, memory, simulator and bank status; checked_at and actionable nonsecret error; health alone does not prove persistence. |
| `POST /incidents` | Ingest synthetic alert | Normalized ID/fingerprint, source kind, revision; not a freeform production uploader for P0. |
| `GET /incidents/{id}` | Detail/evidence/timeline | Stable evidence IDs, timestamps, actor/source and lifecycle; provenance must be retrievable. |
| `POST /incidents/{id}/analyze` | Real recall/reflect/gate | Mode, analysis ID, input revision, gate detail, source links and operation status. |
| `POST /incidents/{id}/decisions` | Simulated decision/outcome | Action/analysis/revision, idempotency, server actor, valid state transitions, acknowledgement and separate retain status. |
| `GET /incidents/{id}/handover` | HandoverPanel | Snapshot revision, cited claims, unknowns and next owner; no fabricated completion. |
| `GET /memory/trace/{id}` | MemoryInspector | Define `{id}` explicitly as trace ID; support associated source records and multiple operations without guessed lookup. |
| `POST /demo/reset` | Reset isolated demo | Acknowledged run/bank scope, generation and complete/error result; backend demo guard. |
| `POST /demo/seed` | Optional pre-seeded history | Distinguish cold run from seeded run; actual retain/index completion. |
| `GET /demo/events` | Live replay stream | Run scope, resumable event IDs, ordering, snapshot reconciliation. |
| `POST /evaluation/run` | Optional evaluation launch | Async run/report ID; needs status/report retrieval to show results. |

**Proposed additions, not agreed or implemented:**

1. `GET /incidents` for the queue, with filters, bounded pagination/cursor, total/unresolved count and snapshot revision. Alternative: a documented bounded incident list in a replay snapshot, explicitly demo-only. Frontend must not invent incidents or counts.
2. `POST /demo/runs` with `{seed, profile}` to start (`profile: cold_learning | seeded_history`); `GET /demo/runs/{run_id}` for current state; `POST /demo/runs/{run_id}/control` with `{command: pause | resume | step, expected_revision}`. These names are proposals; teammate B may provide equivalent documented behavior. Do not implement local timers masquerading as backend replay controls.
3. `GET /evaluation/runs/{run_id}` for status and completed report, or a documented equivalent event/report URL returned by the launch endpoint.
4. `GET /evidence/{evidence_id}` if full authorized evidence is not embedded in incident/trace response. Backend must scope it; frontend must not concatenate arbitrary provider URLs.

Until agreed, use disabled controls with precise “Backend support pending” messaging in a development build. Do not ship a falsely functional demo. Shared review must decide cold-start retain sequencing, how a run advances, source reference retrieval, compatibility rule representation, and the current-evidence contradiction premise.

## 4. Required response fields (proposed extensions to blueprint)

Notation below defines contract requirements for team review, not executable TypeScript. Backend may rename fields if it publishes a consistent equivalent and updates this specification.

| Object | Required meaning / fields |
|---|---|
| Incident | `incident_id`, `service`, `environment`, `version`, `severity` or explicit null, `lifecycle`, `observed_at`, `received_at`, `source_kind`, `revision`, fingerprint, evidence and timeline IDs. |
| Fingerprint | Explicit known/unknown status per service/version/dependency field; flag values `on`, `off`, `absent`, `unknown`. Empty field/map is unknown, never absent. Include captured_at and source IDs. |
| Analysis | `analysis_id`, `incident_id`, `mode`, `input_revision`, `generated_at`, `memory_status`, `memory_hits`, hypothesis with evidence refs, gate per candidate, recommended diagnostic and `executed:false`. |
| Historical memory hit | Actual `memory_ref`, source incident, candidate action ID/text, historical outcome, ledger reference, source kind, trust status, verification actor/time or null, trace ID and redacted excerpt. Preserve original source label. |
| Gate | `status: proposed | blocked | needs_review`; reason codes; policy version; check list with `pass | fail | unknown`; historical requirements/current values and evidence refs; evaluated input revision. |
| Contradiction check | Historical premise reference, current evidence reference, rule ID and explanation. A bare metric cannot justify invented historical context. |
| Evidence | Stable ID, type (metric/log/config/operator confirmation), value/text, unit, observed_at, source kind, source reference, scope, trust/redaction status. No arbitrary executable payload. |
| Trace | Trace ID, operation (retain/recall/reflect), provider, scoped bank label, run/incident association, started/completed time, pending/succeeded/failed/cancelled, measured duration or null, returned source IDs and redacted error. |
| Decision response | Ledger entry ID, action/analysis/input revision, recorded actor/time, decision, simulated flag, outcome succeeded/failed/unknown, evidence refs, separate retain state/trace. |
| Event | Unique event ID, run ID, run generation, sequence, incident ID, occurred_at, event type, payload/schema version. |
| Error | Stable code, user-safe message, retryable flag, request ID, relevant conflict revision; no secrets/provider credentials. |
| Evaluation report | Run ID, dataset/split hash, modes, model/settings, seed/order, counts/denominators, failures, raw-result references, timings and completion state. |

Source excerpt, ledger outcome and generated reflection are distinct fields. Never parse prose to decide that something was verified. Null values render as “Not recorded” or “Unknown”; zero is valid data and must not be treated as missing. Outcome vocabulary: normalize the blueprint's illustrative `success` to agreed `succeeded` in one adapter after contract review, not ad hoc throughout the UI.

### Gate and feedback invariants

- Any known hard veto → blocked, even with other unknown checks. Otherwise missing verification/source/check → needs review. Proposed requires verified prerequisites under backend policy.
- Known failed history blocks according to matching conditions and backend supersession policy; a newer success must have explicit supporting references, not just a later text timestamp.
- `CONTRADICTING_TELEMETRY` may be review/block under policy; for golden INC-103 the overall state is blocked, with all three blueprint reasons, supported by explicit fixture premises.
- Approval does not mean outcome; outcome does not mean retention; retention does not mean next-call retrieval succeeded. Render each separately.
- A blocked action has no approval/override affordance. A separate safe diagnostic can be reviewed. Backend rejects tampered requests, stale analyses and unauthorized outcome changes.
- No optimistic success for decision writes, retain or replay reset. Use idempotency keys for safe retries; do not blindly repeat a write whose outcome is unknown.

## 5. Golden scenario acceptance contract

All data synthetic. Values below come from the blueprint except field normalization and proposed validation details, which need teammate review. Never hard-code provider-returned memory IDs or operation completion.

| Field | INC-101 | INC-102 | INC-103 |
|---|---|---|---|
| Service | checkout-api | Same | Same |
| Version | v1.3 (normalize exact string in fixtures) | Same compatible version | v2.0.0 |
| Symptom | HTTP 503 / checkout errors | Similar | Similar |
| `new_checkout` | Exists, on before simulated action | Exists, compatible state | Explicitly absent |
| DB metric | Not supplied by brief; do not invent | Not supplied | Utilization 98%, blueprint example |
| Historical action | Disable flag, operator-confirmed simulator success | Real recall may propose compatible historical action | Same real recalled action must be blocked |
| Provider behavior | Actual retain after confirmation | Actual recall with source | Actual recall; absence of hit must remain honest failure of storyline |
| Gate | No claim of historical validation before outcome | Proposed only after checks | Blocked: flag absent, incompatible environment, conflicting current evidence |
| Next step | Current-evidence workflow | Review simulated proposal | Read-only DB-pool/config investigation; cause unconfirmed |

Teammate B must supply source IDs, observation/verification timestamps, explicit compatibility preconditions, and the old premise used for the contradiction. Do not add an invented INC-101 DB measurement to make the comparison look complete. Optional INC-104, poisoned notes and held-out evaluations are separate scenarios, not evidence that the three-case journey already passed.

## 6. Async behavior and data integrity

Cache keys include run generation, incident ID, mode and input revision. An analysis response for a different key cannot overwrite the active screen. Abort requests where supported; otherwise ignore superseded results. Maintain server timestamps separately from client receipt time. UI display uses an explicit timezone (UTC for shared incident chronology by default); a user-local toggle may be added, but do not silently mix zones. Durations use measured data or a clearly labelled client waiting timer.

SSE must deduplicate by event ID, order by server sequence and reconcile missing/out-of-order data with a snapshot. Reconnect has capped backoff and a visible disconnected status. Reset rotates run generation so late old-run events are ignored. No generic progress bar with invented percent. A long operation shows elapsed waiting and retry/cancel options only when supported.

Sanitize untrusted text via normal text rendering; avoid raw HTML. Allowlist safe link schemes and use scoped internal links for evidence. No provider API keys or secrets in VITE variables, DOM, screenshots or exports. Frontend forwards requests to AFTERMARK; it never calls Hindsight with embedded credentials. Synthetic data labels persist on all screens and exports.

## 7. Dependency-ordered implementation slices for later authorization

1. Inspect repository and contracts; report existing state, file ownership and actual gaps. Obtain the shared contract decisions in §3–4 from teammates; do independent shell/token work while waiting.
2. Build shared layout/navigation plus honest loading/empty/error states. Develop labelled test fixtures behind a dedicated development/test path; never fall back to them on live API failure.
3. Implement IncidentDetail first: actual evidence → shared gate card → source link → read-only diagnostic review. Wire real API before polishing replay animation.
4. Implement MemoryInspector and separate ledger/retain/recall/reflect states. Confirm the three rejection reasons remain visible on the incident page.
5. Implement queue and replay controls against agreed APIs; preserve run/mode/revision state. Add P1 handover/evaluation when real contracts exist.
6. Run targeted frontend checks and integration with teammates; execute the honest 60-second rehearsal, record actual timings and failures. Address observed usability issues, preserving before/after evidence.

No exact npm script is asserted to exist. Inspect package.json, then run its actual typecheck/build/test commands; add appropriate scripts only if needed. Playwright checks should cover behavior in UX_TESTS.md, not duplicate implementation internals. Use controlled response fixtures for frontend failure states; use a separate real-provider integration test to establish actual Hindsight behavior. Mocked tests cannot prove memory integration.

## 8. Verification and completion report requirements

Report exact commands executed, exit status, relevant output and artifact paths. Distinguish “not run”, “blocked”, “failed” and “passed”. Verify critical path at 1366×768, keyboard traversal, reflow, source absence, provider outage, duplicate events and stale revision conflicts. Measure actual provider timings before promising a 60-second live demo. Tests owned by other teammates may be referenced only with actual logs and revision identifiers.

Done means: all four routes connected to real backend responses; genuine provenance displayed; hard veto never weakened by frontend; no false verified/learned/resolved state; clean navigation and targeted checks pass; limitations documented. If backend is unavailable, frontend may be complete against a reviewed contract, but integration must be reported incomplete. Phase 1 itself has no build/test success to report.

## 9. Copy-paste brief for the next Codex implementation session

> Implement only the AFTERMARK IR frontend scope after reading the repository instructions, current OpenAPI, docs/RESEARCH.md, docs/UX_TESTS.md and docs/CODEX_HANDOFF.md. Respect teammate ownership; do not rewrite backend, simulator or fixtures without coordination. Prioritize IncidentDetail's INC-103 state: historical INC-101 success and actual Hindsight provenance alongside a current block for absent flag, incompatible environment and explicitly supported conflicting DB evidence. The three reasons and source summary must be visible before any expansion. Treat DB cause as unconfirmed. Implement CommandCenter, IncidentDetail, MemoryInspector and ReplayLab using shared components and honest asynchronous states. Resolve the listed API gaps with teammates; never fake live memory or local replay completion. Do not execute production actions. Run appropriate real checks, report exact results, and clearly distinguish mock frontend tests from actual Hindsight integration. Do not claim usability validation without real sessions. If a dependency is unavailable, finish independent frontend work and report precisely what remains unverified.

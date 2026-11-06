# Provisional API integration / teammate review

Inspected the complete RESEARCH.md, UX_TESTS.md, CODEX_HANDOFF.md and AFTERMARK_Blueprint.md before implementation. The initial repository contained these documents, README, LICENSE and .gitignore only. No AGENTS.md, existing frontend, backend, simulator, OpenAPI or Swagger contract was present. Work is confined to `frontend/` on `feat/ui-aftermark`.

## Conflict resolutions

1. Blueprint §11 says mobile is optional; the newer authoritative UX specification requires it. Implemented responsive layouts and tested 320–1920 px widths.
2. The specifications require genuine Hindsight traces, while the current user request authorizes a simulation adapter if backend is unavailable. Default preview is clearly labeled synthetic; fixture refs start with `fixture-`, actor is explicitly synthetic, provider trace IDs are null, and the trace view states no calls occurred. This does not satisfy real-provider integration acceptance.
3. Earlier documents say Phase 1 only and require provider proof before cosmetic work; the current request expressly authorizes implementation and the fallback adapter. Implemented frontend only, preserving integration gaps.
4. Required replay controls lack an agreed run contract. Per handoff §3, they remain disabled. Scenario selection is explicitly a fixture preview, never a simulated acknowledgement or cold-learning run.
5. Blueprint rule ordering could imply missing verification overrides a hard veto. The newer handoff requires hard veto dominance. Missing metadata never weakens a block; contradictory proposed/fail API fields reject the analysis and disable decisions.
6. The older blueprint uses `success`; the handoff uses `succeeded`. The provisional adapter emits `succeeded`. Live responses using another vocabulary fail validation until an agreed conversion is added.
7. The blueprint supplies no INC-101 DB metric, actor, verification timestamps or compatibility expression. No DB baseline is invented. Extra fixture metadata is explicitly synthetic and isolated in `src/api/simulation.ts`. Fixture rule C1 supplies an explicit old flag-path premise; it is not a discovered historical fact or production policy. Memory OFF says “new evidence” without asserting a historical contradiction.

## Adapter surface and endpoint status

All endpoints below are unconnected to a real backend in this delivery.

| Endpoint | Frontend status / provisional expectation |
|---|---|
| `GET /incidents` | HTTP adapter implemented. Expects a complete bounded `Incident[]`; no pagination assumption. Required future agreement: counts, cursor and snapshot envelope. |
| `GET /incidents/{id}` | Not wired independently yet. Detail uses the complete bounded queue snapshot, then makes a scoped analysis request. Replace with scoped detail fetching for paginated/production APIs. |
| `POST /incidents/{id}/analyze` | Implemented: `{mode,input_revision}` → validated Analysis. Requires matching incident, mode and revision; gates must use the same input revision. |
| `POST /incidents/{id}/decisions` | Implemented: `{analysis_id,input_revision,action_id,decision,simulated:true}`, with `Idempotency-Key`. Only the provisional `read-only-diagnostic` action ID is accepted. Response must match request and has separate outcome and retain status. Server must enforce auth, idempotency and stale/blocked rejection. |
| `GET /memory/trace/{trace_id}` | Implemented only when a response supplies a trace ID. Expects `Trace[]` with operation, status, incident association, timestamps, source IDs and nullable measured duration. Fixture adapter always returns `[]`. |
| `GET /health` | Not wired; readiness is “Not checked,” not inferred from an analysis. Need API/memory/bank/simulator status and checked_at. |
| `POST /incidents` | No ingestion UI; no external write or production upload. |
| `GET /incidents/{id}/handover` | Not wired. Frontend draft explicitly labeled; needs snapshot revisions, cited facts and server owner/decision ledger. |
| `GET /evidence/{evidence_id}` | Not wired. Drawer renders embedded scoped evidence; never follows arbitrary source URLs. |
| `POST /demo/reset`, `/demo/seed` | Disabled pending backend scope, authorization, safe-state acknowledgement and retention sequencing. No false “clean bank” state. |
| `POST /demo/runs`, `GET /demo/runs/{run_id}`, `POST /demo/runs/{run_id}/control` | Proposals only. Controls disabled. Need acknowledged run generation/revision and cold-learning profile. |
| `GET /demo/events` | No connection. UI labels stream disconnected. Tested pure event helper deduplicates, orders by sequence and discards old generations; reconnect/backoff/gap snapshot reconciliation require the agreed stream/snapshot contract. |
| `POST /evaluation/run`, `GET /evaluation/runs/{run_id}` | Not wired. “No evaluation run” and metric definitions only. No generated percentages, report IDs or performance claims. |

Runtime schemas live in `src/types/contracts.ts`. HTTP requests have abort support and a 15-second timeout, validate unknown JSON, preserve 409 conflict semantics, and never use fixture fallback. Responses from superseded analysis keys cannot update the active display. Source text is rendered by React as text, without `dangerouslySetInnerHTML`. No provider key is read in the frontend.

## Remaining integration work

Publish and jointly review OpenAPI; replace provisional types with generated/reviewed types. Add scoped detail/health/handover calls, run generation and cache invalidation, resumable SSE with snapshot reconciliation, server ledger/outcome authorization and current analysis refresh after changed evidence. Failed analyses preserve a labeled read-only cached snapshot for the same incident/mode/revision and remove decision controls. Run-generation cache invalidation and dynamic handover expiry await the run/event integration. Add backend-supported retain retry only once idempotency is defined. Connect real providers and prove retain → restart → recall independently of frontend mocks. Complete real timed demo and human usability/accessibility checks before calling integration release-ready.

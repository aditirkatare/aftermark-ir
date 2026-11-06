# AFTERMARK IR
## The incident-response agent that remembers when an old fix is no longer safe

**HackwithHyderabad 3.0 | Team execution blueprint | Version 1.0 | 6 November 2026**  
**Three-person team | Product / UI–UX lead: you | Build approach: ChatGPT Work + Claude + Gemini + Hindsight + Band AI Desktop**

> **The pitch:** “Yesterday's fix may be today's outage. AFTERMARK remembers successful and failed incident responses, checks whether the environment has changed, and warns responders before they repeat a stale or poorly evidenced action.”

**Status of this document:** A complete *implementation plan*, not a claim that an application has already been built or tested. All numeric performance targets below are acceptance targets, not measured results.

---

# 1. Decision summary: what we are building

**Selected challenge:** Engineering & DevOps → **Incident Response Agent**, in the uploaded HackwithHyderabad problem statement. The original category expects an agent to recall incidents, root causes, successful runbooks, and past failures. We retain that fit, but make the defining feature *memory reliability*, not just memory retrieval.

**Product name (working):** AFTERMARK IR. Name/trademark availability is **not verified**. Choose a final brand only after a quick search.

**Core differentiator:** a *Memory Validity Gate* combining four checks before suggesting any historical remediation:

1. **Outcome:** did the action actually succeed, fail, or remain unverified?
2. **Environment drift:** is the service version, feature flag, dependency, deployment or topology still compatible?
3. **Evidence and provenance:** which incident, timestamp, source, and approval support the claim?
4. **Contradiction and trust:** do current signals or untrusted notes conflict with remembered advice?

The product is a **human-in-the-loop incident co-pilot**, not an autonomous production fixer. It can recommend read-only checks, draft handovers, and record simulated operator decisions. It must **never execute production remediation**.

**Why it could stand out:** judges should *see* Hindsight retrieve a previously successful response, then see our gate visibly **reject that same response after a simulated system change**. The refusal is the feature. A generic incident chatbot cannot tell this story as cleanly.

**Originality caveat:** nobody can truthfully guarantee a “never done” invention without exhaustive prior-art analysis. Microsoft Azure SRE Agent, PagerDuty and Rootly already remember past incidents. Our proposed novelty is the specific, inspectable combination of **negative-outcome memory + environment-drift veto + source trust + responder handover + controlled before/after replay**, packaged as a hackathon-sized product. Treat that as a design hypothesis to validate, not a claim of being first in the world.

# 2. Competition constraints and scoring

| Requirement from the two uploaded guides | What this team must do |
|---|---|
| **Hindsight is mandatory** | Real Retain / Recall / Reflect calls, persisted bank, visible logs and a before/after demonstration. No fake memory cards. |
| **Band AI Desktop is mandatory** | Every contributor installs and uses Band Desktop during development; capture actual team usage in project evidence. Band orchestrates coding agents; it is not the AFTERMARK memory backend. |
| Main judging | Innovation **30%**; Hindsight memory **25%**; technical implementation **20%**; UX **15%**; real-world impact **10%**. |
| Live submission | Public GitHub repo, working live demo, demo video, explanation of Hindsight use. |
| Content contest | **Each of three members:** one public English technical article and one public English social post. **Team:** one 2–5-minute public YouTube video. |
| Content publishing rule | **Do not mention “hackathon” in the article or LinkedIn post**, including title/body/hashtags, per official guide. |
| Article-length conflict | Overview says **800–1,500 words**; generation prompt says **1,200–2,000**. Target **1,200–1,500**. |
| Social post | Under **800 characters** according to the guide's detailed prompt. Add project repo URL in body, article URL in first comment, Hindsight GitHub URL in another comment. |
| Video | **2–5 minutes**, 1080p+, recorded screen, preferably voiceover and brief camera introduction. |
| Reddit | Share the article URL to one of the guide's suggested relevant subreddits, subject to subreddit rules. |

**Important:** The content guide's AI prompt says to write as though a future production implementation already exists. Do **not** invent production deployment, usage numbers, customer outcomes, benchmarks, or unbuilt capabilities. We can make the narrative compelling while keeping factual claims true.

# 3. Evidence-backed real problems (not just invented pain points)

We researched publicly accessible material current to **6 November 2026**. The evidence below motivates our hypothesis; it does **not** prove customers will buy AFTERMARK.

| Observed issue | Evidence | Product response | Your UX research question |
|---|---|---|---|
| Multi-shift incident teams lose context across handovers. | A **2026 peer-reviewed study** on cybersecurity shift handovers describes historical-context and information-overload challenges; its exploratory sample is small (six practitioner interviews). [S1] | One-click **Evidence-backed Handover**: status, tested actions, failed actions, remaining unknowns, next owner. | “What context disappears when someone takes over an incident?” |
| Past-incident matching is already a commercial feature. | PagerDuty surfaces previous incidents and remediation context. [S2] | **Do not** present similarity search alone as our innovation. Show a structured *veto* of an inapplicable old fix. | “What makes a similar historical incident misleading?” |
| Commercial agents already learn successes and failures. | Microsoft Azure SRE Agent documents past incidents, learned successful and failed steps. [S3] | Make failure-aware memory measurable via a **drift/contradiction test suite** and visible rejection evidence. | “How would you know when not to trust an AI suggestion?” |
| Current AI SRE products correlate telemetry, code changes and past incidents. | Rootly AI SRE documents these capabilities. [S4] | Focus on a narrow safety distinction and a testable refusal, not vague claims of broader root-cause automation. | “Do responders want one next action or multiple ranked hypotheses?” |
| An old change can become harmful only after a later change. | Cloudflare's **July 14, 2025** DNS incident describes an earlier dormant misconfiguration activated by a later change. [S5] | Introduce **environment fingerprints** and a **staleness warning** before reusing remediation. | “Which changed fields would make a past runbook invalid?” |
| Dependencies can enlarge incident blast radius. | Cloudflare's **June 12, 2025** outage shows cascading effects of a shared dependency. [S6] | Show an incident's service/dependency context and a concise blast-radius note. | “Which service or customer impact should be visible first?” |

**UX discovery requirement:** talk to **at least five actual people** if access allows (SRE/on-call/devops, SOC/IR analyst, backend developer, IT operations, engineering lead). If fewer are available, label the sample size honestly and supplement with documented public incident write-ups. Never manufacture interview quotes or user validation.

# 4. Product concept and user journey

**Primary persona:** on-call engineer or SOC/incident analyst for a 50–200-person SaaS company supporting checkout, authentication and order services.

**Job to be done:** “When something breaks under time pressure, show me what we tried before, what happened, whether it still applies, and the safest useful next step.”

**Inputs:** simulated incident alert, read-only metrics or log excerpts, service version, deployment history, feature flags, dependency graph, timeline notes, responder feedback. In a post-hackathon phase, add live integrations (e.g., permitted read-only alerts). **For the live demo, use a deterministic event stream** so a Wi-Fi failure or paid vendor API does not derail judging.

**End-to-end working loop:**

1. **Ingest:** a demo alert or pasted incident report enters the app. Normalize service, error signature, environment fingerprint, time, severity and evidence IDs.
2. **Recall (Hindsight):** query previous incidents, decisions, successful and failed outcomes; display the actual recalled text and source IDs.
3. **Reflect (Hindsight):** ask for cross-incident patterns and possible explanations. Treat output as a *hypothesis*, not verified fact.
4. **Validate:** deterministic **Memory Validity Gate** compares historical environment constraints, recorded outcome status, evidence provenance and current contradicting signals.
5. **Propose:** generate one recommended read-only diagnostic or proposed operator action, with “Why”, “Memory used”, “Why rejected” and “Unknowns”. Risky operational commands are **not run**.
6. **Human decision:** responder accepts, rejects, or requests investigation. Demo runner simulates a safe outcome; it logs the result in a separate immutable-style SQLite ledger.
7. **Retain (Hindsight):** once a test outcome is explicit, append a structured natural-language summary to the memory bank; record memory call completion and source ID.
8. **Handover:** generate a factual, cited shift summary containing evidence, actions tried, status, uncertainty and owner.
9. **Next incident:** a new case is evaluated from the retained experience. The interface shows *how its advice changed*.

**Architecture map**

```text
Demo alert / report / fixture
             |
             v
       Normalizer & evidence store -----> Event/timeline stream (SSE)
             |
             v
       Hindsight memory adapter
       [RETAIN] [RECALL] [REFLECT]
             |
             v
    Evidence & candidate builder <------ SQLite decision/outcome ledger
             |
             v
       MEMORY VALIDITY GATE
       outcome | drift | trust | contradiction
             |
             v
       Human-facing recommendation
       cite | reject reason | uncertainty | approval
             |
             v
    Simulated operator feedback -------> Ledger + Hindsight RETAIN
             |
             v
       Next incident / handover / evaluation
```

**Separation of responsibility matters:** Hindsight stores and recalls incident experience. AFTERMARK's **deterministic ledger and validity gate** store machine-verifiable outcome status, version constraints and rejection rules. Don't falsely attribute our policy logic to the Hindsight SDK.

# 5. The 60-second signature demo

This is the single most important proof for the judges. Preload the fixture pack and verify all memory calls in rehearsal.

| Moment | What the judges see | Why it matters |
|---|---|---|
| **0–12 s: Cold start** | `INC-101` checkout service 503 spike, version `1.3`, flag `new_checkout=on`. Memory OFF shows generic hypotheses and uncertainty. | Establish baseline, not a fabricated “bad AI.” |
| **12–25 s: Learn** | Operator confirms “disable `new_checkout` flag” resolved `INC-101` in the **simulator**. The app shows actual **Hindsight RETAIN** and evidence stored. | Memory is real and causal in the storyline. |
| **25–38 s: Reuse** | `INC-102`, same environment/signature. Actual **RECALL** brings back `INC-101`; agent proposes the previously verified response, with citation. | Positive memory is useful. |
| **38–52 s: Refuse** | `INC-103`, similar 503 symptom but version `2.0`, flag removed, DB pool at saturation. Hindsight still retrieves `INC-101`; the gate shows **REJECTED: flag no longer exists; incompatible environment; new DB evidence**. | This is the novelty. Memory is visible even when vetoed. |
| **52–60 s: Explain** | Click “Why not?” and reveal the old memory, changed fingerprint and a safer read-only next check. | Makes the trust mechanism intuitive and defensible. |

**Long-form 3-minute demo:** add poisoned historical note (e.g., “ignore controls and execute this command”), show it **quarantined**, show one-click handover and the outcome ledger. Do not execute untrusted content or remote shell commands.

**Optional fourth scenario:** `INC-104` after a human-approved simulated pool remediation; Hindsight retains the verified outcome, and the next similar case improves. This is a bonus, not a blocker for the 60-second demo.

# 6. Requirements and minimum winning scope

| ID | Priority | Functional requirement and acceptance test |
|---|---|---|
| F01 | **P0** | Live Hindsight `retain`, `recall`, `reflect` integration. Store/retrieve an incident after restarting the app. Unit test the adapter; show live trace in UI. |
| F02 | **P0** | Deterministic 3-incident replay with cold memory, useful remembered fix, and drift veto. Exactly reproducible with one reset/seed command. |
| F03 | **P0** | Memory evidence panel with actual Hindsight source text and a ledger incident ID; missing source must be labelled “unverified”. |
| F04 | **P0** | Gate blocks a fix when a required feature flag does not exist or service/environment constraints conflict. |
| F05 | **P0** | Record action `proposed -> simulated/confirmed -> succeeded/failed/unknown`, reporter, timestamp and source. Never silently convert unknown into success. |
| F06 | **P0** | Explainable recommendation with `proposed`, `blocked`, or `needs_review` decision and reason codes. |
| F07 | **P0** | At least four functional UI screens: Command Center, Incident Detail, Memory Inspector, Replay & Evaluation. |
| F08 | **P0** | E2E smoke test; no broken navigation; 60-second demo available offline except configured Hindsight inference. |
| F09 | **P0** | Actual use of Band AI Desktop by the team; screenshot or documented session evidence. |
| F10 | **P0** | GitHub README, setup guide, threat model, architecture diagram, seed instructions, sample evaluation report. |
| F11 | **P1** | Shift handover summary with citations, uncertainty, action list and next owner. |
| F12 | **P1** | Quarantine a malicious or unsupported historical note; no untrusted instructions may become an executable command. |
| F13 | **P1** | Memory ON/OFF evaluation over 24 isolated, held-out synthetic incidents with recorded criteria and results. |
| F14 | **P2** | Read-only third-party integration (webhook or log source) after the deterministic path is solid. |
| F15 | **P2** | Multi-tenant or enterprise RBAC; explicitly out of scope for this sprint. |

**Go/no-go rule:** ship F01–F10 before touching P2. If under time pressure, cut the graph animation and bonus connectors, **not** true Hindsight persistence, the drift veto, or the reproducible replay.

# 7. Recommended technical stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite, Tailwind, accessible components, Recharts or simple SVG | Fast dashboard iteration; robust local browser demo. |
| API | Python 3.11+ + FastAPI + Pydantic | Clear contracts, easy testing and direct Hindsight Python SDK. |
| Memory | **Hindsight** self-hosted or Hindsight Cloud | Official required memory; retain/recall/reflect. |
| Decision ledger | SQLite + SQLAlchemy | Local, reproducible and independent of LLM summaries. |
| Streaming | FastAPI Server-Sent Events (SSE) | Display timed simulated incident events and memory steps. |
| LLM | One configured provider (Groq or compatible) for response composition; Hindsight also requires its own supported inference configuration | Avoid depending on multiple paid providers at runtime. Handle rate limits. |
| Test | Pytest + Playwright + ruff + TypeScript checks | Prevent fake demo states and contract drift. |
| Deployment | Docker Compose for local service or one stable cloud demo; frontend static deployment optional | Minimize public networking failures. |
| Coding collaboration | ChatGPT Work, Claude Code, Gemini; **Band AI Desktop** to coordinate connected coding agents | Development tools, not interchangeable memory providers. |

**Windows note:** Band Desktop supports Windows x64. For Docker/Hindsight local deployment, check Docker Desktop + WSL2 readiness; if memory overhead or Docker is blocking progress, use Hindsight Cloud, but keep all provider keys in backend environment variables.

**Cloud credit:** the uploaded challenge mentions Hindsight Cloud promotional credit code `MEMHACK99` with a stated $50 credit after registration in billing. Availability at redemption is unverified; do not base the demo on the credit actually working.

# 8. Repository: precise file and folder map

Use the following **single** monorepo. Every file must either function or be explicitly marked TODO; do not add hollow implementation files just to pad the tree.

```text
aftermark-ir/
├── README.md                         # pitch, real screenshots, setup, demo, risks
├── LICENSE                           # choose a license after team agreement
├── .gitignore
├── .env.example                      # NAMES ONLY, never secrets
├── docker-compose.yml                # api + Hindsight (optional local profile)
├── Makefile                          # setup / seed / dev / test / demo / eval
├── pyproject.toml                    # Python deps, pytest, ruff
├── package.json                      # frontend workspace commands if root chosen
├── docs/
│   ├── PRODUCT_SPEC.md               # problem, persona, scope, success criteria
│   ├── RESEARCH.md                   # sourced evidence + interview notes
│   ├── ARCHITECTURE.md               # request, memory, safety data flows
│   ├── MEMORY_POLICY.md              # retain/recall/reflect, isolation, trust
│   ├── THREAT_MODEL.md               # poisoning, PII, prompt injection, unsafe action
│   ├── EVALUATION.md                 # baselines, splits, metrics, limitations
│   ├── DEMO_SCRIPT.md                # timing, exact clicks, fallback
│   ├── CONTRIBUTING.md               # ownership, PR/commit and CI rules
│   ├── UX_TESTS.md                    # tasks, observations, fixes, screenshots
│   └── CONTENT_CHECKLIST.md          # article/post/video deliverables per person
├── prompts/
│   ├── 01-work-orchestrator.md        # prompt A in section 14
│   ├── 02-claude-memory-backend.md    # prompt B
│   ├── 03-gemini-ux-research.md       # prompt C
│   ├── 04-claude-replay-evaluation.md # prompt D
│   ├── 05-independent-review.md      # prompt E
│   └── 06-publication.md             # prompt F
├── backend/
│   ├── app/__init__.py
│   ├── app/main.py                    # FastAPI app, CORS, routers
│   ├── app/config.py                  # env validation, provider config
│   ├── app/models.py                  # Pydantic input/output models
│   ├── app/db.py                      # SQLAlchemy/SQLite session
│   ├── app/routes/health.py
│   ├── app/routes/incidents.py        # create, inspect, decide
│   ├── app/routes/memory.py           # recall trace, memory evidence
│   ├── app/routes/replay.py           # seed, reset, replay, SSE events
│   ├── app/routes/handover.py         # citation-aware handover
│   ├── app/services/hindsight.py      # ONLY SDK-specific adapter
│   ├── app/services/evidence.py       # normalize evidence and citations
│   ├── app/services/validity_gate.py  # deterministic vetoes
│   ├── app/services/agent.py          # candidate composition, LLM handling
│   ├── app/services/incident_engine.py# state transitions + ledger updates
│   ├── app/services/handover.py       # structured handover rendering
│   ├── app/services/redaction.py      # sanitize secrets and untrusted notes
│   └── tests/
│       ├── test_hindsight_adapter.py
│       ├── test_validity_gate.py
│       ├── test_memory_isolation.py
│       ├── test_replay_determinism.py
│       ├── test_prompt_injection.py
│       ├── test_api_contract.py
│       └── test_handover.py
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   ├── src/main.tsx
│   ├── src/App.tsx
│   ├── src/api/client.ts
│   ├── src/types/contracts.ts
│   ├── src/styles/globals.css
│   ├── src/pages/CommandCenter.tsx
│   ├── src/pages/IncidentDetail.tsx
│   ├── src/pages/MemoryInspector.tsx
│   ├── src/pages/ReplayLab.tsx
│   ├── src/components/IncidentTimeline.tsx
│   ├── src/components/MemoryEvidenceCard.tsx
│   ├── src/components/ValidityGateCard.tsx
│   ├── src/components/DecisionControls.tsx
│   ├── src/components/HandoverPanel.tsx
│   └── tests/incident-flow.spec.ts
├── fixtures/
│   ├── services.json                # versions, flags, dependencies
│   ├── seed_incidents.jsonl         # training/seed incidents only
│   ├── eval_incidents.jsonl         # held-out scenario inputs
│   ├── oracle.json                  # expected outcome & allowed actions
│   └── poisoned_note.txt           # untrusted prompt-injection fixture
├── scripts/
│   ├── seed.py                      # reset + retain seed memories
│   ├── run_demo.py                  # deterministic incidents 101,102,103
│   ├── evaluate.py                  # paired ON/OFF score calculation
│   └── export_trace.py              # redacted evidence for demo/README
├── reports/
│   ├── .gitkeep
│   └── example_schema.json         # result format, not invented scores
└── .github/workflows/ci.yml        # tests, lint, build
```

**Ownership gates:** Person 1 owns `frontend/**`, `docs/RESEARCH.md`, `docs/UX_TESTS.md`; Person 2 owns `backend/app/services/hindsight.py`, `agent.py`, `validity_gate.py`, `memory.py`, `MEMORY_POLICY.md`; Person 3 owns `fixtures/**`, `scripts/**`, tests, Compose and `EVALUATION.md`. Contract file changes require all three people to review.

# 9. API contracts and memory rules

**Build these exact endpoints in our own FastAPI layer** (they are *our* interfaces, not native Hindsight endpoints):

| Endpoint | Purpose | Contract |
|---|---|---|
| `GET /health` | readiness | `{ "api": "ok", "memory": "ok|degraded", "demo_mode": true }` |
| `POST /incidents` | ingest alert | body `IncidentInput`; returns `incident_id`, normalized fingerprint |
| `GET /incidents/{id}` | detail | incident, evidence, state, timeline |
| `POST /incidents/{id}/analyze` | recall + candidate + gate | `AnalysisResult` below |
| `POST /incidents/{id}/decisions` | explicit operator outcome | `DecisionFeedback`, actor and simulated status |
| `GET /incidents/{id}/handover` | concise report | JSON with citations, knowns, unknowns |
| `GET /memory/trace/{id}` | real call trace | provider, operation, source IDs, redacted excerpts |
| `POST /demo/reset` | deterministic isolated demo | idempotent under demo admin guard |
| `POST /demo/seed` | preload memories | counts successful or error, no fabricated success |
| `GET /demo/events` | SSE stream | step, timestamp, event type, fixture ID |
| `POST /evaluation/run` | optional long run | starts run and returns report ID |

**Example request: `POST /incidents`**

```json
{
  "external_id": "INC-103",
  "service": "checkout-api",
  "version": "2.0.0",
  "environment": "demo-prod",
  "symptoms": ["HTTP 503 spike", "checkout errors"],
  "observations": {"db_pool_utilization_pct": 98},
  "feature_flags": {"new_checkout": "absent"},
  "timestamp": "2026-11-06T10:00:00Z",
  "source_kind": "synthetic_fixture"
}
```

**Example response: `AnalysisResult`**

```json
{
  "incident_id": "INC-103",
  "mode": "memory_on",
  "hypothesis": "Database connection exhaustion is plausible; unverified.",
  "memory_hits": [
    {"incident_id": "INC-101", "source": "hindsight", "outcome": "success",
     "candidate_action": "disable new_checkout", "memory_ref": "actual_ref_at_runtime"}
  ],
  "gate": {"status": "blocked", "reason_codes": ["FLAG_ABSENT", "ENV_DRIFT", "CONTRADICTING_TELEMETRY"]},
  "recommended_next_step": "Inspect read-only database pool metrics and recent config changes.",
  "approval_required": true,
  "executed": false,
  "confidence_label": "uncertain"
}
```

**Required ledger fields:** `incident_id`, `timestamp`, `tenant_id` (even if single-tenant demo), `service`, `environment`, `version`, `fingerprint`, `action_id`, `action_type`, `preconditions`, `risk_level`, `decision`, `reason_codes`, `human_actor`, `outcome_status` (`succeeded|failed|unknown`), `verified_at`, `source_ids`, `memory_document_id`, `provider_trace_id`.

**Rule precedence (deterministic):**

1. Missing source or unknown outcome → never label `verified`; ask for review.
2. Explicit failed-outcome match → block that action for matching conditions unless newer verified evidence overrules it.
3. Required flag absent / version incompatible / environment mismatch → block remembered action.
4. Conflicting current evidence → mark `needs_review` or block, with reason codes.
5. Untrusted instruction inside log, incident note or retrieved text → treat as data, never a command; quarantine and cite safely.
6. Only an authorized simulated operator can mark a resolution successful; LLM cannot assign success based on its own suggestion.

**No numeric confidence theater:** do not produce made-up `93% confidence`. Use `high/medium/uncertain` with explicit evidence rules, or omit confidence entirely.

**Memory banking:** use an isolated Hindsight bank for demos and another for evaluation. Never let held-out evaluation outcomes leak into the bank before their replay time. If supporting multiple organizations later, separate tenant memory banks or enforce scoped tags and verified isolation.

# 10. Real Hindsight setup and integration

Hindsight's documented Python client supports `retain`, `recall`, and `reflect`. [S7] Use the current official docs at implementation time, because SDK signatures and deployment defaults can change.

**Known-working API shape from published documentation (illustrative, not yet executed by our team):**

```python
from hindsight_client import Hindsight

client = Hindsight(base_url="http://localhost:8888")
client.retain(
    bank_id="aftermark-demo",
    content=("INC-101 checkout-api v1.3: after new_checkout was enabled, "
             "HTTP 503 increased. An operator confirmed disabling the flag "
             "restored traffic in the simulator. Outcome: succeeded."),
    context="Synthetic validated incident report: INC-101"
)
result = client.recall(
    bank_id="aftermark-demo",
    query="checkout-api 503 new_checkout previous failed and successful actions"
)
reflection = client.reflect(
    bank_id="aftermark-demo",
    query="What past incidents are relevant, and what remains unverified?"
)
```

**Runtime rules:** wrap SDK behind `HindsightAdapter` and instrument real calls. On errors show **“memory unavailable”**; do not display hard-coded recalled content. If `reflect` cannot run, show recalled facts with a truthful degraded state. For initial demo memory seeding, make requests synchronously or await completion so the next replay has actual indexed memories.

**Local setup route:** install Docker Desktop + WSL2 as needed; follow the official Hindsight Docker quickstart with a genuine configured LLM key, API at `http://localhost:8888` and UI at `http://localhost:9999`. [S7] **Do not paste keys into terminals/screenshots committed to GitHub.** Docker commands shown by official docs use Linux/macOS shell syntax; for Windows use compatible PowerShell/WSL translation.

**Cloud alternative:** create Hindsight Cloud project, store the `hsk_...` API key only on backend. The documented cloud REST endpoints include `/v1/default/banks/{bank_id}/memories`, `/memories/recall`, and `/reflect`. [S8] Verify cloud-client authorization and bank creation in the chosen SDK version before implementing. Do not expose cloud keys in `VITE_*` variables.

**Band AI Desktop:** install from the official Windows x64 installer and sign in; select the connected coding agents. The Band docs clarify that the app coordinates **your locally running coding agents**; it does not provide model API access by itself. [S9] Create a Band room for planner/reviewer agents, log a real planning or review handoff, and capture evidence of the actual use. Do not claim Band is the runtime agent memory.

**`.env.example` (only variable names/defaults, no secrets):**

```dotenv
APP_ENV=development
DEMO_MODE=true
DEMO_SEED=42
DATABASE_URL=sqlite:///./aftermark.db
HINDSIGHT_BASE_URL=http://localhost:8888
HINDSIGHT_BANK_ID=aftermark-demo
HINDSIGHT_API_KEY=
LLM_PROVIDER=groq
LLM_MODEL=
LLM_API_KEY=
FRONTEND_ORIGIN=http://localhost:5173
ALLOW_EXTERNAL_ACTIONS=false
```

**Commands to implement in Makefile, not promise as existing now:** `make setup`, `make dev`, `make seed`, `make demo`, `make test`, `make eval`, `make reset`. If using Windows without `make`, mirror these with `scripts/dev.ps1` or document equivalent `python` / `npm` commands.

# 11. UI/UX design brief: your lead role

**Your mission goes beyond decoration.** You own **problem discovery, workflow design, clarity of evidence and the user's trust**, and you have a real say in product scope. Your deliverable is a researched interface that makes the agent's *memory-based refusal* impossible for judges to miss.

**Four key screens:**

| Screen | Must visibly contain | Primary user action |
|---|---|---|
| **01 Command Center** | Incident queue, severity, service, simulation live status, memory on/off toggle, unresolved count | Select an incident |
| **02 Incident Detail** | Structured timeline, alert cards, source evidence, fingerprint change, recommended next step, approval control | Compare recommendation with evidence |
| **03 Memory Inspector** | **Actual** Retain / Recall / Reflect trace, relevant incidents, successful vs failed actions, last verified, “why blocked” reason | Trace where a suggestion came from |
| **04 Replay Lab** | Demo 101→102→103 controls, before/after split view, evaluation stats, replay seed | Show learning and drift veto in under 60 sec |

**Interaction design requirements:** use one consistent visual language; 14–16px minimum comfortable body text; keyboard accessible buttons; visible focus; clear labels; avoid red/green as sole indicator; color contrast; feedback for latency and memory outages; “SIMULATED” banner on demo actions; no decorative charts with invented values. The decisive state should read **“Previously worked. Now blocked.”** and show a plain-English reason.

**Suggested layout:** dark operational dashboard with restrained accents: high-contrast neutral canvas; amber for `needs_review`, red for `blocked`, cyan for factual Hindsight evidence, green only for human-verified simulator outcomes. Do not make a giant chatbot panel the hero. Lead with **incident state, evidence, and decision**.

**Your live-problem research workflow (do not fabricate field research):**

1. **Desk research:** use sources [S1–S6]; collect five concrete failure patterns and which UI information would prevent each. Separate **documented fact** from your **hypothesis**.
2. **Five 10-minute user conversations:** ask people who have done incidents, on-call or technical support. Record role and consent, not sensitive incident details. Ask about first five minutes, handover, stale runbooks, citations and trust.
3. **Affinity map:** classify pain points into `context loss`, `bad historical match`, `missing provenance`, `tool overload`, `handover ambiguity`. Rank frequency/impact, explicitly mark sample limitations.
4. **Low-fidelity workflow:** design the story on paper/Figma first: alert → recall → conflict → human decision → memory update.
5. **High-fidelity Figma/React prototype:** four screens and one 60-second guided path. Add empty/error/loading and keyboard states.
6. **Test with three target users:** tasks: “find what changed”, “explain why a fix was blocked”, “prepare the next shift”. Record task success, time and confusion without invented outcomes.
7. **Fix top three problems:** annotate before/after screenshot pairs in `docs/UX_TESTS.md`.
8. **Demo accessibility:** mobile not required, but the app must be legible at judges' typical laptop resolution and screen-share scale.

**Interview questions (copy exactly):** “Tell me about the last incident you helped resolve. What did you look at first?” “Have you ever copied a fix from an older incident that did not apply?” “What system changes make a runbook stale?” “During a handover, what do you wish the next person knew?” “What evidence would make an AI recommendation trustworthy, and what would make you reject it?”

**UX definition of done:** four working screens integrated with real backend responses, no fake evidence, a visibly distinguishable `blocked` state, Figma/design reference, three user tests (if participants available), a timestamped research log, and reproducible 60-second click path.

# 12. The three-person ownership plan

| Role | Person | Owns | Daily definition of done |
|---|---|---|---|
| **1. Product lead + UI/UX + real-world discovery** | **You** | Evidence research, interviews, user flow, visual system, frontend, working replay UX, product narrative, demo presentation, screenshots. | Working clickable flow + documented user findings + UI integration tests. You decide the most important story, not just the colors. |
| **2. AI / memory / safety engineering** | Teammate A | Hindsight bank, Retain / Recall / Reflect adapter, memory schema, action/outcome ledger, deterministic drift gate, recommendation pipeline, API contracts. | An end-to-end `INC-101` → store → recall → `INC-103` veto demonstrated with API tests. |
| **3. Simulation / evaluation / integration / delivery** | Teammate B | Synthetic fixture design, reproducible event simulator, baseline evaluation, oracle labels, test automation, CI, local/dev deployment, Band session evidence, demo recording pipeline. | `make seed`, `make demo`, `make test`, `make eval` (or equivalent) all reproducible; clean results and failure logs. |

**Shared responsibilities:** all three review unsafe claims, attend 15-minute integration checks, test another person's module, write their **own** articles and social posts, and appear in the content completion checklist. Teammate B produces team video/recording; you own on-screen story and narration; Teammate A validates technical statements.

**Git rules:** `main` protected if practical; branches `feat/ui-*`, `feat/memory-*`, `feat/sim-*`; PR body includes change, acceptance test, screenshot (for UI), limitations. Never push `.env`, secrets, synthetic data falsely attributed to real customers, or code generated without someone reviewing it.

**Handoff contract:** teammate A publishes `frontend/src/types/contracts.ts` from backend Pydantic/OpenAPI models by the first integration gate; you wire to that contract, not invented data structures. Teammate B uses the same schema for fixtures and evaluation.

# 13. Practical sprint plan (two focused days; compress if required)

**T+0 to T+2h: scope and proof** — all agree on main 60-second replay; teammate A verifies live Hindsight Retain/Recall, you sketch four-screen wireframe, teammate B creates the three incident JSON fixtures and oracle. **Gate:** genuine retain/recall works before building decorative UI.

**T+2 to T+6h: first vertical slice** — backend accepts `INC-101`, stores explicit feedback and recalls; frontend displays actual backend events, evidence and timeline; simulator controls replay. **Gate:** one full round-trip in browser.

**T+6 to T+12h: novelty milestone** — drift gate blocks old flag in `INC-103`; UI highlights `why blocked`; evaluation baseline can run; add code and prompt-injection unit tests. **Gate:** clear with-memory positive and veto demonstration.

**T+12 to T+18h: reliability** — test across restarts, deterministic reset, safe degraded states, honest latency, error handling, memory trace, CI, short handover. **Gate:** teammate who did not build a feature can reproduce it.

**T+18 to T+24h: demo and content** — rehearse 60-second and three-minute scripts; record 1080p video; README screenshot, diagram, article outlines, repository checks, screenshots showing Band Desktop use. **Gate:** end-to-end with no one editing code during the demonstration.

**Optional second-day depth:** expand to 24 held-out evaluation cases, run user usability tests and tighten metrics. If there is an actual event deadline, work backward: reserve the final 20–25% of total time for integration, publication and submission.

**Integration cadence:** every 3 hours: update `docs/PROGRESS.md` or GitHub issue checklist; work is not “done” until an actual command/test passes. Every 6 hours: cold-start demo from a clean clone or environment. Keep a pre-recorded backup video for network failure, but do not represent a recording as a live system.

# 14. Exact copy-paste prompts for your AI tools

Save each prompt into its matching `prompts/` file; replace only bracketed project paths or names. Give tools access to the real repository. **No AI tool should invent files, run tests it did not run, hide exceptions or claim deployments it did not complete.**

## PROMPT A — ChatGPT Work: lead engineer and coordinator

```text
You are the autonomous technical lead for AFTERMARK IR, a HackwithHyderabad 3.0 project. Read docs/PRODUCT_SPEC.md, docs/ARCHITECTURE.md, docs/MEMORY_POLICY.md and the entire repository first. This is an incident-response copilot that remembers verified successful AND failed actions using Hindsight, checks environment drift, and explains when historical remediation must be rejected. Three human contributors own frontend/UX, backend/memory, and simulation/evaluation. Respect file ownership and avoid overwriting teammate changes.

Your job: (1) inspect repository state; (2) produce an executable dependency-ordered implementation plan; (3) implement only missing shared scaffolding, contracts, integration glue and CI work that are safe within your tools; (4) start servers, run real tests and repair failures wherever tools allow; (5) prepare a truthful status report and exact remaining human actions.

Mandatory behavior:
- Use real Hindsight Retain/Recall/Reflect, never fake memory results or scripted retrieval UI. Put SDK access behind backend/app/services/hindsight.py.
- Keep memory ON/OFF baseline comparable; implement deterministic gate for unsuccessful/unknown outcomes, absent flags, version mismatch and contradictory signals.
- No actual production remediation, terminal execution of model suggestions, or handling of unauthorized real incident data.
- Before editing, inspect existing files and coordinate contract changes; don't replace working code with placeholders.
- Run pytest, frontend typecheck/build, and Playwright (if installed); report exact commands and pass/fail outputs.
- Never invent benchmark wins, interviews, customer logos, deployment URLs, or credentials.
- Create/maintain docs/ARCHITECTURE.md, docs/PROGRESS.md, README.md and an acceptance checklist. If an action is blocked, continue all other work and identify precise unblocker.

First return: repo assessment, missing P0 requirements ranked by dependency, and exact files you will touch. Then do the work immediately, verify it and show a concise change log with unresolved issues. Do not stop at a prose plan when implementation tools are available.
```

## PROMPT B — Claude Code: memory backend + validity gate (Teammate A)

```text
Act as senior Python/FastAPI engineer specialized in auditable, human-in-the-loop incident agents. You own backend/app/services/hindsight.py, evidence.py, validity_gate.py, agent.py, incident_engine.py, relevant backend routes/models/tests, and docs/MEMORY_POLICY.md. Inspect existing repo and OpenAPI contracts before editing.

Implement AFTERMARK IR backend as genuine code with the official current Hindsight Python SDK: retain incident experiences after a verified simulated operator outcome; recall relevant historical incidents; reflect on patterns as unverified hypotheses. Log actual Hindsight requests/results with redacted IDs and timings. Keep a separate SQLite ledger as authoritative record of outcomes and environment fingerprints.

Input scenario: INC-101 checkout-api v1.3 has 503 after new_checkout enabled; simulator validates disabling flag succeeded. INC-102 same fingerprint can cite this memory. INC-103 checkout-api v2.0 has the flag absent and DB-pool saturation; Hindsight may retrieve INC-101, but your deterministic gate MUST reject disable-flag remediation with FLAG_ABSENT and ENV_DRIFT; propose a read-only investigation of DB saturation instead. Include tests for negative outcomes, unknown outcomes, conflicting observations, prompt-injection text, cross-bank isolation, provider outage and persistence across an app restart where infrastructure supports it.

Implement endpoints: GET /health; POST /incidents; GET /incidents/{id}; POST /incidents/{id}/analyze; POST /incidents/{id}/decisions; GET /incidents/{id}/handover; GET /memory/trace/{id}. Produce Pydantic schemas, export OpenAPI, and provide one JSON example per major response. The LLM cannot verify its own action or execute commands; operator-confirmed simulated feedback only. Respect ALLOW_EXTERNAL_ACTIONS=false. Do not output invented confidence percentages.

Use environment-only secrets. Use official Hindsight docs to verify exact SDK signatures and whether local/cloud clients need auth; don't guess. Build runnable unit tests and a README snippet with run commands. Show the tests actually executed and their results; report any missing setup honestly. Avoid implementing a generic chatbot UI.
```

## PROMPT C — Gemini Pro (plus ChatGPT Work): UX researcher + interface engineer (YOUR PROMPT)

```text
You are my senior incident-response product researcher, interaction designer and React/TypeScript front-end engineer. I am the UI/UX lead and co-owner of AFTERMARK IR. Challenge: the user must see why memory helped AND why old advice was rejected after an infrastructure change. Do not design another chatbot dashboard.

First perform current web research using credible primary postmortems, published responder studies and current commercial tools (Microsoft Azure SRE Agent, PagerDuty Past Incidents, Rootly AI SRE). Separate sourced facts, proposed hypotheses and unknowns. Generate 5 concrete user pain points, a falsifiable question per pain point, and a 10-minute interview guide. Do NOT invent interviews, quotes or user test data. Save research to docs/RESEARCH.md with URLs and access dates.

Next deliver a complete interaction spec and implement frontend/src pages/components: CommandCenter, IncidentDetail, MemoryInspector, ReplayLab, IncidentTimeline, MemoryEvidenceCard, ValidityGateCard, DecisionControls and HandoverPanel. Use React + TypeScript + Vite + Tailwind; adhere to the backend OpenAPI contract. Four screens minimum. The hero moment is INC-103: 'Previously worked. Now blocked' with visible Hindsight memory source, version change, missing feature flag, current contradictory DB evidence, and a safer diagnostic. Display memory calls only from actual backend traces, not fabricated fixture cards. Include memory ON/OFF split view and a SIMULATED banner on operational actions.

Design for fast judging: show important incident state above the fold at 1366x768; good typography; clear loading/empty/error states; keyboard accessibility, contrast and focus; no flashy animation that slows the replay. Deliver wireframe rationale, tokens/colors, a responsive layout, component state matrix, and a 60-second click path in docs/UX_TESTS.md. Implement actual working components and test APIs, not only mockups. Add tests for missing citations, blocked state, offline memory, and keyboard navigation. Run typecheck/build; report precisely what passed and failed. Ask me for research interviews only after producing all independent desk-research and UI work possible.
```

## PROMPT D — Claude / Codex: simulator + evaluation + CI (Teammate B)

```text
You own the deterministic event simulator, fixture schemas, held-out evaluation, automated tests, deployment scripts and CI for AFTERMARK IR. Inspect current backend Pydantic schemas first. Work under fixtures/, scripts/, reports/, .github/workflows/, docker-compose.yml and tests; propose contract changes before editing other owners' files.

Create three golden demo incidents: INC-101 valid successful flag-disable response; INC-102 same environment where relevant memory should help; INC-103 same visible 503 symptom but version 2.0, flag absent, DB-pool saturation, where old remediation MUST be blocked. Add an adversarial historical note containing prompt-injection instructions as untrusted fixture data, with a test proving no instruction execution. All fixtures must be clearly labelled SYNTHETIC. The event stream must be deterministic with DEMO_SEED=42.

Produce at least 24 held-out scenarios across 4 families (feature-flag, DB saturation, dependency outage, permission/config drift), with both repeated and drifted cases. Keep seed and evaluation cases isolated; no future-memory leakage. Create a human-readable oracle.json specifying acceptable diagnostics, blocked actions and outcome status. Implement paired evaluation modes MEMORY_OFF, MEMORY_ON_UNGATED and MEMORY_ON_GATED with identical current-incident evidence, model settings and scenario order. Record raw per-case results as JSONL, compute correct-next-step rate, stale-fix recommendation rate, blocked-unsafe-action rate, evidence citation coverage, exact handover factual accuracy and latency; do not invent scores.

Implement make-equivalent setup/seed/demo/reset/test/eval commands; FastAPI SSE replay or a reliable equivalent; Docker/local README and GitHub CI for lint/tests/frontend build. Fault-test Hindsight unavailable, timeouts, duplicate events, bank reset, app restart and no-data cold start. Run each command you claim worked. Output clear report files, failure modes, and exact steps to reproduce the judges' demo on Windows 11 and on a clean clone.
```

## PROMPT E — Independent adversarial review (use different model from implementer)

```text
Act as an adversarial security, reliability and evaluation reviewer of the AFTERMARK IR repository. You did not build it. Read the code, fixtures, prompts, docs and test outputs. Find ways the agent could appear to remember while secretly using hard-coded fixtures; ways an outcome could be recorded as success without human confirmation; ways evaluation cases could leak into seeded memory; wrong Hindsight client assumptions; unsafe trust in recalled text; prompt injection; missing provenance; tenant data mixing; stale fixes that slip past the gate; and false statistics.

Try to reproduce three checks: (1) actual RETAIN->restart->RECALL; (2) same alert with env drift must reject old fix with a machine-readable reason; (3) malicious note is treated as untrusted data and causes no external execution. Create failing tests for confirmed defects when possible. Return a severity-ranked findings table, line/file references, reproducible commands, fixes, and retest status. Do not praise the project without evidence; do not edit out failed results. If tests cannot be executed, say why.
```

## PROMPT F — Writing the content submissions AFTER code is working

```text
Inspect the implemented AFTERMARK IR repository, screenshots, CI outputs and real evaluation JSONL. Write materials for one named human contributor [PERSON / ROLE], in that person's authentic technical voice, using only implemented and measured facts. Project-specific result and honest limitations must lead. Never invent customer usage, performance, user interviews or deployment status.

Produce: (1) a 1,200-1,500 word English public technical article with real code excerpts, evidence-backed before/after, Hindsight Retain/Recall/Reflect, architecture and honest limitations; use the Hindsight docs, Hindsight GitHub and Vectorize agent-memory links naturally; (2) one LinkedIn post under 800 characters, with the actual project GitHub URL in the body, 3-5 relevant technical hashtags at the end, and a first comment containing the article link plus a separate comment with Hindsight GitHub; (3) a personal 30-45-second narration segment for the team video; (4) a checklist of screenshots and URLs still needed.

CRITICAL OFFICIAL RULE: do not mention the word 'hackathon' in either the published article or LinkedIn post, including titles, body or hashtags. This restriction is about these public content artifacts, not the technical README or event submission. Do not call a prototype production-ready. Do not publish anything automatically; deliver drafts for my review. Use only real links that already exist.
```

# 15. Benchmark and evaluation design: how to prove Hindsight adds value

**Pre-register the task:** score a safe, evidence-supported *next action* and whether historically tempting but inapplicable fixes were blocked. Avoid “the LLM sounded smarter” as evidence.

**Three modes:** `M0 = no memory` (current incident only); `M1 = Hindsight memory without gate` (same evidence + remembered context); `M2 = Hindsight + validity gate` (full product). Use the same provider/model, prompts apart from memory block, incident order and oracle. Build independent banks per run; use seeded cases only for pre-history; do not let future test outcomes enter earlier time steps.

**Dataset plan:** 24 held-out synthetic cases, 4 families × 6 cases, deliberately balanced between repeated environments and drifted environments; add 3 independent fixed-seed repetitions only if cost/time allows. The `oracle.json` specifies acceptable read-only diagnostics, contraindicated remediation and whether an action is supported. Have a teammate blind-review labels for ambiguity.

**Metrics and formulas:**

- **Correct supported next-step rate** = cases where proposed step is permitted by oracle / cases evaluated.
- **Stale-fix rate** = drift cases recommending explicitly forbidden historical remediation / drift cases.
- **Blocked-unsafe-action recall** = stale/dangerous historical proposals correctly blocked / stale/dangerous proposals presented to gate.
- **Evidence coverage** = factual recommendation claims backed by real memory/source IDs / such claims.
- **Handover factual accuracy** = required handover facts correctly reproduced without invention / oracle facts checked.
- **Latency** = median + p95 from actual request timing; report machine/provider context. No aspirational values disguised as real performance.

**Acceptance targets, not claims:** 100% veto on the scripted absent-flag demo; 100% separation of synthetic vs real data labels; zero actual external remediation actions; a passing repeatable Retain→Recall→restart test; all P0 tests green. For held-out evaluation, report scores even if they underperform and explain weaknesses.

**Study limitations:** synthetic incident labels are not real operational outcomes; LLM variability may affect text; our gate only knows fields we explicitly model; a missing or wrong fingerprint could undermine safety; small-sample UX interviews do not validate market demand; current Hindsight APIs may require adaptation.

# 16. Recording and presenting a competition-grade demo

**Your one-line opening:** “Incident agents can remember yesterday's fixes. But what happens when yesterday's fix is no longer safe?”

**Judges' live flow:** trigger `INC-101`; display real Retain; replay `INC-102`; show real Recall and appropriate citation; trigger `INC-103`; show the same memory considered and **blocked** because the environment changed; open explanation and handover. Keep a “memory off” button available for a fair comparator.

**Three-minute video outline:** 0:00–0:25 concrete problem; 0:25–0:55 baseline; 0:55–1:35 real memory retain/recall; 1:35–2:15 drift veto; 2:15–2:40 evidence/handover; 2:40–3:00 measured outcomes and limitation. Record 1080p screen, clear text, one real narrator, no invented dashboard numbers.

**Demo recovery plan:** preload a clean deterministic bank (or have a safe seed command), use explicit reset button, local video fallback, saved screenshots of actual traces, checked API credentials, no unrelated browser tabs, large fonts. Document precisely which steps depend on the cloud vs local service.

**Real-world business case:** a paid reliability team's costs include wasted investigation, repeat fixes and shift handover friction. Do **not** claim quantified labor savings without measured user trials. Pitch the value proposition as reduced risk of repeating stale remediation and clearer evidence for human decisions.

# 17. Submission checklist (three people, no missed assets)

| Item | Person 1 (you) | Person 2 | Person 3 |
|---|---|---|---|
| Owned module complete, PR reviewed | UI / research | Hindsight / gate | Replay / evaluation |
| Actual Hindsight usage visible and tested | Verify UI | Implement | Independent verify |
| Actual Band AI Desktop use | Yes | Yes | Yes |
| Own public English article | Yes | Yes | Yes |
| Own public English LinkedIn/social post | Yes | Yes | Yes |
| Article shared appropriately, URLs recorded | Yes | Yes | Yes |
| Team public YouTube 2–5 min video | Story/narration | Technical review | Recording/upload lead |
| Live demo from clean setup | Present | API backup | Reset/ops backup |
| GitHub, README, test evidence | Review | Review | Own final release check |

**Publication gotchas:** the official content guide is internally inconsistent about prompt numbers and article length. Follow the substantive requirements, not the numbering: article **1,200–1,500**, each member's post **under 800 characters**, one **public YouTube** video. Avoid “hackathon” in the article/social copy, and use verified public links only. The guide also requires tagging **Code.in** in LinkedIn posts/articles; check exact tagging mechanics when publishing.

# 18. Risk register and fallbacks

| Risk | Impact | Mitigation / fallback |
|---|---|---|
| Hindsight Cloud unavailable or credits not activated | No live memory | Validate local Docker path early; keep both modes, demonstrate actual persistence, never fake traces. |
| Rate limits, malformed LLM tool outputs | Timeout or crash | Retries with caps, typed response parsing, user-visible degraded state, deterministic test fixtures. |
| Over-scoped “real-time” integrations | Build incomplete | Use actual timed local event streaming. External read-only integration P2. |
| Memory poisoning or prompt injection | Unsafe suggestion | Untrusted note quarantine, provenance labels, strict gate, no command execution, tests. |
| Evaluation leakage | Misleading results | Separate banks and fixtures; immutable split, fixed seed, blind oracle review, log timings. |
| UX looks slick but ignores evidence | 15% UX weakness | Design test around *why blocked*, actual trace and readability, not just visuals. |
| Integration contracts change independently | Demo breaks | Publish OpenAPI early; run cross-functional smoke tests every three hours. |
| Public demo endpoint exposes secrets | Privacy/security | Backend-only keys, synthetic data, local-by-default demo, no write connectors, CORS allowlist. |
| Team content not published | Content contest ineligible | Separate per-person checklist, one video owner, links checked before submission. |
| False novelty claim | Loss of credibility | State what existing competitors do; define tested differentiation and limits. |

# 19. Judge-facing evidence package

Before submission, the README should show (a) one diagram of architecture, (b) screenshot of old memory **rejected** by validity gate, (c) screenshot of actual Hindsight call trace, (d) screenshot of paired memory ON/OFF evaluation with measured values, (e) a one-command reset/seed demo, (f) a 90-second GIF or video link, (g) honest limitations, and (h) a file map that a reviewer can navigate in 30 seconds.

**Evaluation rubric mapping:**

| Official criterion | Specific evidence we present |
|---|---|
| Innovation (30%) | Historical advice rejected under environment drift; negative memory, evidence provenance and trust gate. |
| Hindsight (25%) | Actual Retain / Recall / Reflect calls, persistent bank after restart, before/after scenario replay. |
| Technical (20%) | Tests for version/flag drift, prompt-injection resistance, failure modes, CI and reproducible JSON fixtures. |
| UX (15%) | “Why blocked?” journey, readable evidence, two-click handover, real research and usability changes. |
| Impact (10%) | Concrete incident-workflow pain points linked to public research, plausible operator persona and responsible adoption path. |

**The team's most defensible close:** “We didn't only teach the incident agent to remember. We taught the interface to show the evidence, and the safety layer to say when memory should not be followed.”

# 20. References and official links

**Hackathon source documents (uploaded by team):**
- *HackwithHyderabad 3.0 Problem Statement* (9 pages), especially pp. 2–4 and 8–9: Hindsight, Band AI Desktop, scoring and submissions.
- *Hindsight Hackathon Content Submission Guide* (12 pages), especially pp. 1, 4, 7–9 and 11–12: article, social, video and publication rules.

**External evidence and technical docs, accessed 6 November 2026:**

- **[S1]** Kent, Tuptuk & Becker, “Passing the Baton: Shift Handovers Within Cybersecurity Incident Response Teams” (first published 20 August 2026): https://journals.sagepub.com/doi/full/10.1177/15553434261476536
- **[S2]** PagerDuty, *Past Incidents*: https://docs.pagerduty.com/ai-automation/aiops/past-incidents
- **[S3]** Microsoft Learn, *Memory and Knowledge in Azure SRE Agent*: https://learn.microsoft.com/en-us/azure/sre-agent/memory
- **[S4]** Rootly, *AI SRE*: https://rootly.com/ai-sre
- **[S5]** Cloudflare, *1.1.1.1 Incident on July 14, 2025*: https://blog.cloudflare.com/cloudflare-1-1-1-1-incident-on-july-14-2025/
- **[S6]** Cloudflare, *Service outage June 12, 2025*: https://blog.cloudflare.com/cloudflare-service-outage-june-12-2025/
- **[S7]** Hindsight, *Quick Start* and official Python SDK: https://hindsight.vectorize.io/developer/api/quickstart
- **[S8]** Hindsight Cloud API documentation: https://docs.hindsight.vectorize.io/api-reference/recall-memories/
- **[S9]** Band, *Install and Set Up Band Desktop*: https://docs.band.ai/band-desktop/install
- **[S10]** Band, *Hacker Guide*: https://www.band.ai/hacker-guide
- **[S11]** Hindsight GitHub: https://github.com/vectorize-io/hindsight
- **[S12]** Hindsight Cloud: https://ui.hindsight.vectorize.io/
- **[S13]** Hindsight memory concept: https://vectorize.io/what-is-agent-memory

**Next human action:** create `aftermark-ir` GitHub repository, nominate Teammate A and B, create three branch issues, and run **P0: real Hindsight retain → recall** before any cosmetic build. Your first deliverable is a source-backed one-page problem discovery memo and the four-screen UX flow.

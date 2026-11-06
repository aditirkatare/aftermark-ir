# AFTERMARK IR — four-screen UX specification and validation protocol

Version 1.0 • 6 November 2026 • Phase 1 only

**Status:** specification complete; UI not built; tests and interviews not executed. All timings and success criteria are targets. All example incident values are synthetic blueprint data or explicitly proposed fixture requirements. This document is both the design reference and future test worksheet; it is not a test-results report.

Related: [research and source register](RESEARCH.md), [implementation contracts and handoff](CODEX_HANDOFF.md).

## 1. Design contract

Primary job: understand what happened before, whether it applies now, and the safest useful next investigation. Main user: on-call engineer; secondary users: incoming responder and demo judge. Lead with evidence and decisions, not chat. Maintain four distinct concepts:

| Concept | Example label | Authority |
|---|---|---|
| Historical outcome | “Succeeded in INC-101 · operator-confirmed · simulated” | Outcome ledger with actor, timestamp and evidence |
| Applicability now | “Blocked for INC-103” | Backend deterministic gate, with policy version and input revision |
| Source / retrieval | “Recalled by Hindsight · view source” | Actual successful provider trace and source reference |
| Explanation | “DB connection exhaustion is plausible; unverified” | Generated hypothesis, never promoted into fact |

No action executes production remediation. A successful simulated decision does not resolve another incident. A recalled note saying “success” does not establish a verified outcome without its ledger evidence. Never label an unsafe old recommendation “recommended” just because it was retrieved.

## 2. Information architecture and shared shell

| Navigation name | Component / proposed route | Primary job | Exit |
|---|---|---|---|
| Command Center | CommandCenter `/incidents` | Choose a current incident | IncidentDetail |
| Incident Detail | IncidentDetail `/incidents/:incidentId` | Inspect gate and choose next investigation | MemoryInspector, handover, back to queue |
| Memory Inspector | MemoryInspector `/memory?incident=:id&trace=:traceId` | Audit source, outcome and call chain | Return to originating incident and scroll position |
| Replay Lab | ReplayLab `/replay?run=:runId` | Present controlled 101→102→103 sequence and compare modes | Open selected incident or trace |

A memory navigation entry with no incident selected shows a context picker, not fabricated global memory data. Invalid IDs show “Incident not found” with Back to queue. Browser back/forward restores filters, mode, selection and scroll; route changes announce the new heading and focus it. Deep links request current scoped data rather than relying on an earlier visit.

Desktop shell at 1366×768: 56 px header; 192 px navigation rail; main content padded 24 px. Header contains AFTERMARK IR, a persistent “SIMULATED · demo-prod” label, API/memory connection statuses and current run ID when present. Navigation uses text and icons, with selected state and `aria-current`. Main width is approximately 1126 px before inner grid gaps. Use a 12-column grid, 16 px gutters, max content width 1440 px. No decorative charts or activity counters.

Persistent context strip: incident ID, service, severity and lifecycle status, observed time and displayed timezone. Severity labels are supplied by backend; do not assign SEV-1 to sample data without an explicit fixture value. “Unresolved” is a lifecycle count; a blocked candidate does not itself change incident lifecycle. Memory mode is labelled “Memory for analysis: On / Off”; it is separate from simulator run state and from provider availability.

## 3. Critical INC-103 content hierarchy

The following is specified copy, not a claim of a running application:

**Previously worked. Now blocked.**

**Disable `new_checkout`** — succeeded in INC-101, operator-confirmed in simulation. **Blocked for INC-103.**

**Source:** INC-101 · Hindsight recall · `[actual source reference]` · verified `[actual timestamp]` by `[actual actor]`. Link: **View memory source**. If fields are missing, show “Verification unavailable”; never substitute sample identities or the current time.

| Check | Historical INC-101 | Current INC-103 | Visible reason |
|---|---|---|---|
| Required flag | `new_checkout` exists and was on | `new_checkout` absent | “Required flag no longer exists.” `FLAG_ABSENT` |
| Environment compatibility | checkout-api v1.3 | checkout-api v2.0.0 | “Recorded compatibility requirements do not match.” `ENV_DRIFT` |
| Current evidence | Old flag-related explanation; link to actual recorded premise | DB pool utilization 98%; include sample time/source | “Current DB evidence conflicts with the old explanation; investigate.” `CONTRADICTING_TELEMETRY` when backend supplies the conflicting premise |

Below the table: **Next: inspect database pool metrics and recent configuration changes (read-only).** Secondary text: “Database connection exhaustion is plausible, not confirmed. Nothing has been executed.” CTA: **Review diagnostic**. Secondary CTA: **Why blocked?** expands policy/input details, not the three primary reasons (those are always visible).

The blueprint does not supply INC-101 DB utilization. Show “Not recorded” rather than inventing a healthy baseline. Incompatible version is a backend policy finding, not a frontend string-comparison rule. “Absent” is distinct from `off`, `false`, an empty map and `unknown`. A DB metric alone is new evidence, not logical proof that every old hypothesis is impossible. If no explicit contradictory premise is provided, use “New DB evidence; cause unconfirmed” and mark the missing explanation. The absent flag still blocks the action.

If memory retrieval has no matching result, the UI must not show a false recalled INC-101 card to preserve the story. Show “No relevant memory returned.” Historical success and present blocking coexist; never overwrite the historical record with “failed.”

## 4. Screen 1 — CommandCenter

**Flow:** arrive → inspect incident queue → filter/search → select INC-103 → IncidentDetail. A secondary **Open Replay Lab** action begins the judging flow. Mode changes create a new analysis context; they do not rewrite prior results.

**Wireframe description:**

1. Top heading row: “Command Center”, unresolved count from server (or “Unavailable”), “Open Replay Lab”.
2. Context row: SIMULATED badge, stream state (Idle / Running / Paused / Disconnected), most recent event time, memory analysis mode selector.
3. Search/filter row: labelled incident ID/service search; status and service filters; Clear filters. Filtering is local only when the entire bounded demo list is present; otherwise API-backed with contract support.
4. Main queue, full width: incident link, severity, service/version, symptom, lifecycle, applicability summary, last update. Default stable ordering: unresolved first, then severity and newest event. New events show a “New updates available” control instead of reordering under the pointer or keyboard focus.
5. At most one compact selected-incident summary below/alongside the queue on wider screens. It is optional; never crowd the queue with invented impact totals.

**Interactions:** each row has a genuine incident link; avoid making a whole row the only click target. Enter opens the focused link. Query strings preserve filters. Memory Off helper: “Analyze current evidence without recall. Existing results keep their recorded mode.” Switching modes during an in-flight analysis cancels/supersedes its display; a late response cannot appear under the new mode.

**States:** initial loading uses blank skeleton rows, not plausible incident names. Empty queue: “No incidents in this run” and Open Replay Lab. Filter empty: “No incidents match” and Clear filters. Partial API error: preserve last successful queue with “Last updated [time] · may be stale,” Retry; never reset count to zero. Memory unavailable: queue remains usable; mode On may remain selected but shows “Recall unavailable,” not silently Off. SSE disconnected: retain events and show reconnect action; no fake live pulse.

**Responsive:** below 1024 px collapse rail to labelled menu and drop optional summary. Below 768 px use stacked incident cards with consistent field labels; severity, lifecycle, service and blocked status remain visible. Avoid hiding applicability in overflow menus. At 320 CSS px wrap labels without horizontal page scrolling.

## 5. Screen 2 — IncidentDetail

**Flow:** select incident → review observed evidence and historical candidate → see gate → inspect source or review diagnostic → record a simulated decision → see ledger acknowledgement and separate retain status. Alternate: open handover draft; copy only after review.

**Wireframe at 1366×768 (approximate vertical budget, to verify in browser):** header 56 px; incident heading/context from y=80–136; decisive gate panel y≈152–510; next-step row y≈526–618. Thus source, all three reasons and diagnostic CTA should be visible without scroll at normal zoom. Timeline and detailed evidence start below. This is a layout target, not measured rendering.

- Heading: INC-103 / checkout-api, supplied severity and lifecycle; Back to queue and Generate handover.
- Full-width gate panel: large headline, candidate action, historical-success and current-blocked labels; inline source/verification line; compact comparison table from §3. Color is secondary to text/icons.
- Next-step row: one read-only diagnostic with rationale, uncertainty and Review diagnostic action. There is no Apply or Override button for the blocked flag action.
- Below-fold two-column grid, roughly 7:5: left IncidentTimeline with observed/received times and source links; right Evidence panel with metric/log/config cards and environment fingerprint. Evidence links open an inline drawer anchored to the selected item, preserving incident context.
- Secondary hypothesis area shows generated reflection as unverified, with supporting and conflicting evidence IDs plus explicit unknowns. It is not the page hero.

**Review diagnostic drawer:** title, purpose, read-only scope, evidence inputs, simulated label, current analysis revision and action ID. Buttons: “Record simulated approval”, “Request more investigation”, “Cancel”. If an outcome is supplied later, require explicit succeeded/failed/unknown choice and source/actor; no default success. Approval records intent, not resolution. Backend acknowledgement drives final state. “Record simulated outcome” is available only for a legitimate simulated action and authorized demo role, never the blocked historical candidate. A rejected candidate can be annotated as rejected, not overridden.

**HandoverPanel (P1):** draft with status/impact, known facts and citations, actions actually tried and outcomes, rejected candidate and reasons, unknowns, suggested diagnostic, owner or “Unassigned”, snapshot time/revision. “Copy handover” copies text for user-controlled sharing; nothing is sent. Pending/failed retention must remain explicit. A changed incident revision marks the draft out-of-date and offers Regenerate. Unknown incident cause remains unknown.

**States:** Analyze pending disables decision submission while allowing evidence reading. Missing source → unverified, no green success assertion. Missing fingerprint → needs review unless another known hard veto exists. Existing hard veto remains blocked even when other checks are unknown. Provider outage allows current evidence inspection and known deterministic blocks; recall is unavailable. New evidence invalidates prior approval eligibility and displays “Evidence changed; re-analyze.” Failed decision save preserves draft, not a success toast. Duplicate click cannot create duplicate ledger entries.

**Responsive:** below 1024 px evidence/timeline stack after the gate and diagnostic. Below 768 px comparison becomes three labelled historical/current pairs; source line wraps. At mobile widths the three reasons may require scrolling but never collapsing. Drawer becomes full-width dialog. At 200%/400% zoom reflow takes precedence over desktop above-fold target. Sticky action bars must not cover focus or reasons.

## 6. Screen 3 — MemoryInspector

**Flow:** View memory source → selected recalled source and outcome → inspect actual trace → compare applicability → Return to INC-103. Support direct navigation but request incident context if absent.

**Wireframe:** heading “Memory Inspector” with “For INC-103” and Return link. Top summary keeps the selected source incident, historical outcome and present blocked state together. On desktop, a 30% left list displays actual recalled hits, each with source incident, candidate, historical outcome and applicability. The 70% right pane displays:

1. Provenance block: provider, bank scope/redacted bank label, source reference, source incident, captured time, verification time/actor, ledger link and retrieval trace ID. Show separate captured/verified/retrieved timestamps; none is a synonym for “fresh enough”.
2. Source excerpt exactly as returned, subject to explicit redaction; textual content, never executable HTML or commands. Label “Historical source text”; link to full authorized record when available. Long excerpts use Show more, no unreadable tiny scroll box.
3. Applicability comparison and all gate reasons, reusing the same component/data as IncidentDetail. Return link remains present.
4. Operation trace table: RETAIN / RECALL / REFLECT, started/completed timestamps, status, duration if measured, source IDs and redacted excerpt. Do not imply operations occurred in one request merely by arranging them in that order. RETAIN may belong to an earlier incident; trace association must be explicit.
5. Reflection output, separately labelled “Generated hypothesis · unverified”; source facts remain inspectable if reflect fails.

**Interactions:** selecting a hit updates URL and focus to source heading. Filters for outcome and trust are local to returned hits and display the number actually loaded. Copy reference copies the actual ID, not a fabricated citation. Quarantined text is collapsed behind “Untrusted source — view as text”; expanding never enables a decision. No edit/delete memory or reclassification of outcome in this screen.

**States:** recall pending → waiting with elapsed time, no placeholder evidence. Empty → no relevant sources returned. Recall successful but citation absent → “Source unavailable; recommendation unverified” plus trace state; no broken link. Forbidden/redacted source → “Source access restricted,” no attempt to infer content. Retain pending → historical ledger may show confirmed simulation, memory persistence still pending. Retain failed → Retry retention only through backend-supported idempotent flow. Reflect failed → “Reflection unavailable; retrieved facts still shown.” Cached trace → explicit snapshot time/run label. Quarantine does not imply the entire incident history is false.

**Responsive:** list becomes a labelled source selector above detail below 1024 px. At narrow widths trace rows become definition lists with operation/status/time and expandable IDs. Long IDs wrap; raw source text uses `white-space: pre-wrap` and word breaking. Do not reduce font size to fit.

## 7. Screen 4 — ReplayLab

**Flow:** inspect readiness → reset isolated demo (confirmation) → choose seed 42 → start cold INC-101 → confirm simulated outcome → wait for real retain → INC-102 recall → INC-103 veto → inspect why/source. An independent comparison view can inspect completed paired runs; it does not generate scores from the guided story.

**Wireframe:**

- Heading “Replay Lab”, SIMULATED label, seed, run ID, fixture/policy version and connection health.
- Compact control bar: Reset demo, Start, Pause, Step, explicit stage indicator INC-101 / INC-102 / INC-103. Controls are derived from acknowledged run state, not local timers. The active stage includes its incident link.
- Readiness checklist: API reachable, memory reachable, demo bank isolated, fixtures loaded, no run active. Each item is actual backend status or “Not checked”. Unknown is not ready.
- Main guided panel reuses the same gate/provenance cards as IncidentDetail; no separate scripted success components.
- Comparison section: Current evidence only (M0) versus Memory + gate (M2). On wide screens show equal columns; on narrow screens use labelled mode tabs preserving same incident and revision. Shared evidence snapshot ID and model/settings summary above both. Missing comparator → “Not run”, not zero performance.
- Expandable evaluation section: M0 / M1 memory without gate / M2 gated results with report ID, seed, dataset hash, case count, denominator, failed cases and measured timings. M1 is evaluation-only, visibly non-actionable; it never unlocks execution controls. Optional P1 run button only after endpoint support. Before a report exists show “No evaluation run” and metric definitions, no charts.

**Reset:** confirm dialog names the isolated demo run/bank and says the demo state will be reset. Default focus Cancel. No reset during running or pending retain; pause/stop to acknowledged safe state first. This is an in-product safeguard against accidental state loss, not a request for permission to write this specification. Reset failure leaves the old state visibly intact/uncertain. Never claim a clean bank without confirmation.

**Pause/step:** pause stops progression after backend acknowledgement; an in-flight provider call may finish and remains in trace. Step stays disabled until the previous stage is complete. Record any manual skipping as incomplete story, not a successful memory demonstration. On provider timeout, stop the narrative and offer Retry or a clearly labelled saved recording if one actually exists.

**Metric definitions:** supported next-step rate = oracle-permitted proposals / evaluated cases; stale-fix rate = forbidden historical recommendations / drift cases; unsafe-action block recall = correctly vetoed stale/unsafe proposals / such proposals presented to gate; evidence coverage = factual claims with real source IDs / factual claims; handover accuracy = correctly reproduced required facts / required facts checked; latency = measured median/p95 with request count and environment. If denominator is zero, show N/A. Failed cases are counted/reported explicitly; do not silently drop them. No inference of a 24-case evaluation from a three-case demo.

## 8. End-to-end state and interaction rules

| Component | Normal | Pending / empty | Failure / safety state | Required behavior |
|---|---|---|---|---|
| ValidityGateCard | Proposed, needs review, blocked with reason text | “Checking applicability” | Unknown check or stale revision | Hard veto dominates; never transiently display proposed before validation. |
| MemoryEvidenceCard | Actual source + historical outcome + applicability | No relevant memory / waiting | Unverified, restricted, quarantined | Missing data cannot become confirmed success. |
| IncidentTimeline | Ordered actual events | “No events yet” | Disconnected, duplicate/out-of-order stream | Deduplicate by event ID; preserve focus and show new-event notice. |
| DecisionControls | Review diagnostic; explicit simulated feedback | Saving; prevent double submit | Blocked candidate / stale analysis / save failed | Gate and server authorization are authoritative; draft preserved on failure. |
| HandoverPanel | Cited draft | Generating / no facts | Missing sources / newer revision / copy failed | Keep unknowns; no auto-send; copied status only after successful clipboard operation. |
| Mode selector | On or Off with result-mode label | New analysis pending | Late result for old mode | Response tied to mode+incident+revision; no relabelling cached content. |
| Trace table | Actual operation result | Pending / no call yet | Timeout, failed, cancelled | Status from backend; durations only when measured. |
| Replay controls | Idle, ready, running, paused, completed | Waiting for prerequisite | Failed, disconnected, reset uncertain | No fixed-delay completion and no fabricated success animation. |
| Toast/status area | Noncritical acknowledgement | Polite progress | Inline error plus retry | Important states remain inline after toast disappears. |
| Evidence drawer | Selected evidence with source/time | Loading | Missing/forbidden/deleted | Focus stays in dialog; close restores trigger focus. |

Frontend precedence: known blocked candidate stays blocked; otherwise incomplete verification/checks → needs review; proposed requires all mandatory checks and verification to pass. This is a display contract; frontend does not implement or weaken policy. Conflicting API fields yield “Inconsistent analysis — review required” and disable decisions. Re-analysis creates a new record; old explanations remain available as historical snapshots.

## 9. Design tokens

Dark operational default; no light theme is required for Phase 2 P0. These are candidate values to validate in browser, not a claim of completed contrast testing.

| Token | Value | Use |
|---|---|---|
| `color.canvas` | `#0B1220` | Page background |
| `color.surface` | `#111C2E` | Cards/navigation |
| `color.surfaceRaised` | `#1B2A41` | Menus, selected surfaces |
| `color.text` | `#F1F5F9` | Primary text |
| `color.textMuted` | `#B8C5D6` | Secondary text, not disabled-opacity text |
| `color.border` | `#63758F` | Control outlines/dividers where essential |
| `color.evidence` | `#67E8F9` | Source links, factual provenance |
| `color.blocked` | `#FDA4AF` | Blocked icon/text; dark background retained |
| `color.review` | `#FCD34D` | Needs-review icon/text |
| `color.verified` | `#86EFAC` | Explicit operator-verified simulated outcome only |
| `color.focus` | `#FDE68A` | 3 px outline, 3 px offset |
| `color.actionBg` / `actionText` | `#67E8F9` / `#0B1220` | Primary buttons |
| Font | system-ui, Segoe UI, sans-serif | No external font dependency |
| Monospace | ui-monospace, Consolas, monospace | IDs, versions and source snippets |
| Type | page 28/34, section 20/28, body 16/24, metadata 14/20 px | No critical information below 14 px |
| Spacing | 4, 8, 12, 16, 24, 32, 48 px | Consistent rhythm |
| Radius | control 6, card 10, dialog 12 px | Restrained rounding |
| Targets | minimum 44×44 px product target | Buttons/icons; allow wrapping labels |
| Motion | 120–160 ms opacity/color only | No auto-scrolling or celebratory animations |
| Layers | base 0, sticky 10, popover 30, dialog 40, toast 50 | Toast must not obscure active controls |

Selected/hover/focus/disabled states must differ independently. Disabled controls retain readable label and adjacent reason; do not rely on a tooltip on a disabled element. Status colors never replace words. Green historical success must not visually overpower the current blocked headline.

## 10. Accessibility and responsiveness requirements

Target WCAG 2.2 AA; normative reference [R10 in RESEARCH.md]. No conformance claim until audited. Require keyboard operation, no traps, visible focus, semantic landmarks/headings, labelled inputs, text equivalents for icons, and status announcements. Check text contrast ≥4.5:1 (large text ≥3:1), essential controls/graphics ≥3:1. Maintain reflow at 320 CSS px and readable 200% text resizing; meet target-size rules with the stricter 44 px product target where practical.

Product-specific requirements: tab order follows visible reading order; skip link to main; status chips are text, not color-only. Use tables with headers/captions for desktop comparisons and labelled lists on mobile. Progress uses `role=status`/polite announcements without reading every streamed log. A new block is announced once per analysis revision. Dialogs have names, focus containment, Escape close and focus return. Do not steal focus on incoming evidence. Respect reduced motion and forced-colors settings. Content must work without hover. Errors connect to relevant fields; reason lists remain readable without expansion. Source text is escaped and allowed links validated. Copy/export controls must not expose redacted secrets.

Viewport matrix for future verification: 1366×768 judging target; 1920×1080 wide; 1024×768 compact; 768×1024 tablet; 390×844 mobile; 320 CSS px reflow; 200% and 400% browser zoom. At 1366×768/100% the three rejection reasons, provenance summary and next diagnostic must fit above the fold. On mobile, prioritize readability rather than promising all content fits in one viewport.

## 11. Exact 60-second judging journey — target, not measured

Preconditions outside timed segment: real services configured; reset acknowledged; cold isolated demo bank; fixtures loaded; source evidence known; actual provider latency rehearsed. No seeded INC-101 success inside the cold-start path. If using seeded history for a shorter alternative, label that run “Pre-seeded history” and do not claim live learning. The timed script spans all three incidents and ends on the INC-103 refusal.

| Target time | Exact control / surface | Visible evidence | Narration |
|---|---|---|---|
| 0–12 s | ReplayLab → Start cold replay → INC-101 with Memory Off | v1.3; flag on; 503; current-evidence-only result with uncertainty | “Here is the first incident, with no history.” |
| 12–25 s | Review INC-101 simulated action → explicit outcome confirmation → wait for actual RETAIN | Succeeded in simulator with actor/time/source; separate actual retention completion | “The operator confirms the flag change worked. That outcome is stored.” |
| 25–38 s | Next: INC-102 → Memory On analysis | Actual RECALL source INC-101; compatible gate and proposed simulated action | “The same conditions make that experience useful.” |
| 38–52 s | Next: INC-103 → Open incident (IncidentDetail) | “Previously worked. Now blocked.” Source line; version difference; absent flag; DB evidence | “The symptoms look familiar, but the old fix no longer applies.” |
| 52–60 s | Why blocked? → View memory source (MemoryInspector) | Source excerpt and gate reasons, safe read-only next check; incident remains identifiable | “The source is real. The prerequisites fail. We investigate the database rather than reuse the flag fix.” |

Core refusal and provenance are visible before either final click; the final clicks deepen the audit. CommandCenter is reachable from navigation, but forcing a tour of every screen into this timed path would consume evidence time. A judge can separately use CommandCenter → INC-103 as a two-action entry into the decisive state.

No UI may advance because a time slot elapsed. If retention/recall exceeds the target, retain truthful Waiting/Failed states and continue narration honestly; elapsed time grows. A saved video/trace is permissible only if it exists and is clearly labelled “Recorded demonstration”; it is not live proof. Reflect appears in actual trace when run; if it fails, show degraded reflection while preserving factual recall and gate results.

## 12. Formative usability protocol — not run

Recruit three target participants, record actual roles and experience; students without on-call experience can assess clarity but must be reported as proxy users. Separate discovery interviews from usability sessions. Obtain consent and anonymize notes. Session target: 15–20 minutes. Use identical synthetic inputs; no production access. Ask participants to think aloud, but avoid hinting at the three reasons before the timed task. Capture timing silently; probing occurs after the first answer.

| Task | Neutral participant instruction | Success / measurement | Research link |
|---|---|---|---|
| T1 | “You are taking over INC-103. What would you do next, and why?” | Within 20 s identifies absent flag and incompatibility; no blocked-action choice. Record first action and reasons verbatim. | P1 |
| T2 | “Find the evidence that the earlier action worked. Who or what verified it?” | Within 30 s finds actual source and distinguishes operator-confirmed simulation from LLM inference. | P2 |
| T3 | “What can you conclude about the database from this screen?” | Within 30 s recognizes investigation direction and uncertainty; chooses read-only diagnostic. | P3 |
| T4 | “Prepare the next responder to continue.” | Within 45 s retrieves status, blocked action, evidence, unknown and owner/unassigned; no invented resolution. | P4 |
| T5 | Introduce timeout, navigate away: “Continue investigating the same incident. What is the memory status?” | Within 30 s recovers context and accurately identifies unavailable/stale result. | P5 |
| T6 | “Use only the keyboard to inspect the source, then return.” | No trap, lost focus or mouse assistance; all labels and reasons accessible. | Accessibility |

For a later comparative study, counterbalance an inline-comparison layout against a history-list layout using equivalent but different cases to reduce learning effects. With three people, report observations and raw counts, not significance or general effect sizes. The desk-research questions are falsified against these predeclared thresholds, not retrofitted after testing.

Record per task: participant pseudonym/role, UI version, viewport, scenario/revision, start/end/time, completion yes/no, unaided/assisted, selected action, explanation, confusion, source consulted, moderator intervention and consented screenshot reference. Report missing data explicitly. Avoid storing identifiable workplace details.

## 13. Future acceptance cases

All statuses below: **NOT RUN**. Owners: FE=frontend lead; BE=backend teammate; SIM=simulation/evaluation teammate. These are executable-test requirements, not existing test code.

| ID / priority / owner | Setup and action | Expected observable assertion |
|---|---|---|
| A01 / P0 / FE+BE | Actual INC-101 retained; analyze INC-103 | Actual recalled source remains linked; blocked status and all three provided reason codes map to human text; no apply/override control. |
| A02 / P0 / FE | Remove source ref or verification metadata | Unverified/missing fields explicit; no fabricated actor/time/green verified label. |
| A03 / P0 / FE+BE | Flag values on, off, absent, unknown in separate cases | Off never rendered absent; unknown requires review; confirmed absent blocks. |
| A04 / P0 / FE+BE | Different version with explicit compatibility, then incompatibility | Frontend renders backend policy; does not block solely from string inequality. |
| A05 / P0 / FE | Recall timeout after earlier successful analysis | Stale snapshot clearly marked; no fresh recall success; decisions needing current analysis disabled. |
| A06 / P0 / FE | Reflect fails after successful recall | Recall facts remain; reflection unavailable; no fabricated reflection text. |
| A07 / P0 / FE+BE | Simulated decision save succeeds; retain fails | Ledger outcome visible separately; memory persistence failed, not “learned”. |
| A08 / P0 / FE | Switch incident/mode while analyze pending | Late response cannot overwrite active incident/mode/revision. |
| A09 / P0 / FE+SIM | Duplicate and out-of-order SSE events; reconnect | No duplicated timeline/outcome; cursor/snapshot reconciliation; focus stable. |
| A10 / P0 / FE+BE | Stale revision submitted; server rejects | Submission shown failed/conflicted; refresh/reanalyze offered; no success toast. |
| A11 / P0 / FE | Keyboard-only navigation and dialog traversal | Logical order, visible focus, Escape/return focus; source reachable. |
| A12 / P0 / FE | 1366×768, 320 CSS px, zoom, reduced motion, screen reader | Above-fold desktop target; mobile reflow; labelled states; no color-only meaning or focus obstruction. |
| A13 / P0 / FE+BE | Poisoned note containing instructions/HTML | Escaped, quarantined data; no script/command execution or actionable control generated. |
| A14 / P0 / SIM+BE | Cold reset → retain → restart → recall | Real trace and persisted source; UI reflects backend truth, never fixture-simulated provider calls. |
| A15 / P0 / FE+SIM | Empty/failed evaluation, zero denominator | “Not run” / “Run failed” / N/A, never invented zero scores or charts. |
| A16 / P0 / FE | Open routes directly, back/forward, invalid incident | Correct data/selection or honest not-found; no broken navigation. |
| A17 / P1 / FE+BE | Generate handover, then update evidence | Unknowns and citations retained; draft marked out-of-date; owner never invented. |
| A18 / P0 / SIM+FE | Run timed journey with real providers | Record actual total and step timings; completed steps only; any overrun/failure reported. |
| A19 / P0 / FE+BE | Known hard veto plus missing source/check | Remains blocked and separately unverified; missing data cannot weaken veto. |
| A20 / P0 / FE+SIM | Paired modes have different evidence revisions | Comparison labelled non-comparable; no performance-improvement claim. |

## 14. Results and iteration worksheet

Current participants: 0. Sessions: 0. Application tests: 0. Accessibility audits: 0. Screenshots: none. No before/after UI evidence exists yet.

| Observation ID | Participant/task | Observed behavior (not interpretation) | Severity | Proposed fix | Before/after evidence | Retest |
|---|---|---|---|---|---|---|
| Pending | Not collected | Not collected | Unassigned | Pending observation | Not captured | Not run |

Severity: critical = unsafe action/misrepresented evidence; major = wrong conclusion or task blocked; minor = recoverable friction; cosmetic = no task consequence. Fix critical issues first, then top three observed problems; retain original failure record and add retest results. Phase 2 release criteria: all P0 safety/navigation states verified, actual provider trace proven, truthful replay rehearsal, and no known critical usability defects. If participants unavailable, explicitly report that usability validation is incomplete rather than substituting AI roleplay.

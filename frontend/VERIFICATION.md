# Frontend verification — 6 November 2026

Scope: this frontend, synthetic fixtures and controlled HTTP responses. No real backend/provider tests or participant sessions are claimed.

## Commands executed

Working directory: `frontend/`.

| Command | Result |
|---|---|
| `npm install` | Initial sandbox DNS failure. Retried with network permission; dependencies installed. |
| `npm install -D vitest@^4.1.12` | Passed. Updated test tool dependencies after initial audit reported 1 moderate and 2 critical advisories. |
| `npm install -D prettier` | Passed; audit reported **0 vulnerabilities**. |
| `npm run typecheck` | Passed, TypeScript strict mode. |
| `npm run build` | Passed, Vite production assets. Two dependency PURE-comment warnings from Zod are non-fatal. |
| `npm test` | **10 passed** (Vitest 4.1.12). |
| `npm run test:e2e` | **13 passed**, Microsoft Edge via Playwright; actual Vite servers launched and stopped by the runner. |
| `git diff --check` | Passed before staging; final staged check also required. |

Lockfile committed for reproducible `npm ci`. Test results are frontend validation, not evidence that Hindsight or backend policy is operational.

## Observed failures fixed

- Initial desktop diagnostic button ended at y=771, below the 768 px target. Moved reason codes beside check labels and tightened compact desktop spacing. Final automated assertion verifies the diagnostic button is inside the viewport; screenshot includes source, all reasons, uncertainty and CTA.
- Initial modal Escape close failed focus return under React StrictMode. Captured the original trigger once and explicitly closed the native dialog during cleanup; keyboard regression passes.
- Sandbox socket restriction blocked initial local browser readiness. Re-ran with local browser/network permission; no product defect was hidden.

## Coverage

- Hero: preserved historical outcome, three supplied veto/review reasons, no apply/override control, no INC-101 DB baseline.
- Missing source/actor/verification, hard-veto precedence, incompatible versus explicitly compatible policy, unknown checks, current-evidence-only mode.
- Idempotent local intent acknowledgement; unknown outcome; no inferred retention; stale revision rejection; mismatched analysis rejected; failed retention distinct from ledger acknowledgement.
- Stale read-only analysis snapshots survive screen navigation after recall failure; decisions remain disabled until a fresh analysis succeeds.
- Real browser HTTP interception tests for provider 503, malformed JSON shape, quarantine/HTML text escaping, reflection unavailable, late old-mode response, decision 409.
- Queue search and browser back preservation, direct routes, missing incident and memory context picker.
- Native dialog Tab, Escape and focus restoration; handover draft facts/Unassigned owner; source navigation.
- Automated axe WCAG 2 A/AA and 2.1 AA scans across all four screens, plus 320 px incident scan: **zero violations** in tested states.
- Overflow checks for all four screens at 1920, 1024, 768, 390 and 320 CSS px. Hero checked at 1366×768. Desktop and mobile PNGs inspected visually.
- Pure SSE helper: duplicate/out-of-order IDs and old generation exclusion. This is not a connected-stream test.

## Not run / incomplete

Real Hindsight retain/recall/reflect, persistence after restart, real stream disconnect/reconnect, live evaluation, backend authorization, backend reset, run-generation cache invalidation, actual 200%/400% browser zoom, manual screen-reader testing and human usability sessions. Reflow width tests are not represented as browser zoom tests. The 60-second live judging journey has not run. No measured performance, MTTR or usability improvement is claimed.

## Screenshots

`screenshots/incident-desktop-viewport.png` is exactly 1366×768. Other desktop images are full-page captures from that viewport. `incident-mobile.png` is a full-page capture at 390×844. All show fixture data and no live provider evidence.

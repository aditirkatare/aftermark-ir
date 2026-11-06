import { z } from "zod";
// Provisional UI contract from CODEX_HANDOFF §4. Not generated from OpenAPI.
export const Mode = z.enum(["memory_on", "memory_off"]);
export type Mode = z.infer<typeof Mode>;
export const Evidence = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  observed_at: z.string(),
  source_ref: z.string(),
  source_kind: z.string(),
});
export const Incident = z.object({
  incident_id: z.string(),
  service: z.string(),
  environment: z.string(),
  version: z.string(),
  severity: z.string().nullable(),
  lifecycle: z.string(),
  observed_at: z.string(),
  received_at: z.string(),
  source_kind: z.string(),
  revision: z.number(),
  flag: z.enum(["on", "off", "absent", "unknown"]),
  evidence: z.array(Evidence),
});
export type Incident = z.infer<typeof Incident>;
export const Hit = z.object({
  memory_ref: z.string().nullable(),
  source_incident: z.string(),
  candidate_action: z.string(),
  outcome: z.enum(["succeeded", "failed", "unknown"]),
  ledger_ref: z.string().nullable(),
  source_kind: z.string(),
  trust: z.enum(["verified", "unverified", "quarantined", "restricted"]),
  verified_at: z.string().nullable(),
  actor: z.string().nullable(),
  captured_at: z.string(),
  excerpt: z.string(),
  trace_id: z.string().nullable(),
});
export type Hit = z.infer<typeof Hit>;
export const Check = z.object({
  code: z.string(),
  label: z.string(),
  historical: z.string(),
  current: z.string(),
  explanation: z.string(),
  status: z.enum(["pass", "fail", "unknown"]),
  evidence_refs: z.array(z.string()),
});
export const Analysis = z.object({
  analysis_id: z.string(),
  incident_id: z.string(),
  mode: Mode,
  input_revision: z.number(),
  generated_at: z.string(),
  memory_status: z.enum([
    "fixture",
    "off",
    "unavailable",
    "empty",
    "succeeded",
  ]),
  memory_hits: z.array(Hit),
  gate: z.object({
    status: z.enum(["blocked", "proposed", "needs_review"]),
    policy_version: z.string(),
    input_revision: z.number(),
    checks: z.array(Check),
  }),
  hypothesis: z.string().nullable(),
  reflection_status: z.enum(["fixture", "unavailable", "succeeded"]),
  recommended_next_step: z.string(),
  action_id: z.literal("read-only-diagnostic"),
  executed: z.literal(false),
});
export type Analysis = z.infer<typeof Analysis>;
export const Decision = z.object({
  ledger_id: z.string(),
  analysis_id: z.string(),
  input_revision: z.number(),
  decision: z.enum(["approved", "investigate"]),
  actor: z.string(),
  recorded_at: z.string(),
  simulated: z.literal(true),
  outcome: z.enum(["succeeded", "failed", "unknown"]),
  retain_status: z.enum(["not_requested", "pending", "failed", "succeeded"]),
});
export type Decision = z.infer<typeof Decision>;
export const Trace = z.object({
  trace_id: z.string(),
  operation: z.enum(["retain", "recall", "reflect"]),
  provider: z.string(),
  status: z.enum(["pending", "succeeded", "failed", "cancelled"]),
  started_at: z.string(),
  completed_at: z.string().nullable(),
  duration_ms: z.number().nullable(),
  source_ids: z.array(z.string()),
  incident_id: z.string(),
});
export type Trace = z.infer<typeof Trace>;
export interface Adapter {
  kind: "simulation" | "http";
  list(signal?: AbortSignal): Promise<Incident[]>;
  analyze(
    id: string,
    mode: Mode,
    revision: number,
    signal?: AbortSignal,
  ): Promise<Analysis>;
  decide(
    id: string,
    a: Analysis,
    decision: "approved" | "investigate",
    key: string,
  ): Promise<Decision>;
  trace(id: string, signal?: AbortSignal): Promise<Trace[]>;
}
export function displayGate(a: Analysis) {
  if (
    a.gate.checks.some((c) => c.status === "fail") ||
    a.gate.status === "blocked"
  )
    return "blocked";
  if (
    a.gate.input_revision !== a.input_revision ||
    a.gate.checks.some((c) => c.status === "unknown") ||
    (a.mode === "memory_on" && !a.memory_hits.some(verified))
  )
    return "needs_review";
  return a.gate.status;
}
export function verified(h: Hit) {
  return (
    h.trust === "verified" &&
    !!h.memory_ref &&
    !!h.ledger_ref &&
    !!h.actor &&
    !!h.verified_at
  );
}

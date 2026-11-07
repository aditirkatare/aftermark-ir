import type {
  Adapter,
  Analysis,
  Decision,
  Incident,
  Mode,
} from "../types/contracts";
const stamp = "2026-11-06T10:00:00Z";
export const incidents: Incident[] = [103, 102, 101].map((n) => ({
  incident_id: `INC-${n}`,
  service: "checkout-api",
  environment: "demo-prod",
  version: n === 103 ? "2.0.0" : "1.3",
  severity: null,
  lifecycle: n === 101 ? "resolved" : "unresolved",
  observed_at: stamp,
  received_at: stamp,
  source_kind: "synthetic_fixture",
  revision: 1,
  flag: n === 103 ? "absent" : "on",
  evidence: [
    {
      id: `fixture-${n}-config`,
      label: "Environment fingerprint",
      value:
        n === 103
          ? "checkout-api v2.0.0 · new_checkout absent"
          : "checkout-api v1.3 · new_checkout on",
      observed_at: stamp,
      source_ref: `frontend fixture / INC-${n}`,
      source_kind: "synthetic_fixture",
    },
    ...(n === 103
      ? [
          {
            id: "fixture-103-db",
            label: "DB pool utilization",
            value: "98% · cause unconfirmed",
            observed_at: stamp,
            source_ref: "blueprint §9 / synthetic observation",
            source_kind: "synthetic_fixture",
          },
        ]
      : []),
  ],
}));
export function fixtureAnalysis(id: string, mode: Mode): Analysis {
  const i = incidents.find((i) => i.incident_id === id);
  if (!i) throw Error("Incident not found");
  const drift = id === "INC-103";
  const history = mode === "memory_on" && id !== "INC-101";
  return {
    analysis_id: `fixture-${id}-${mode}-r1`,
    incident_id: id,
    mode,
    input_revision: 1,
    generated_at: stamp,
    memory_status:
      mode === "memory_off" ? "off" : history ? "fixture" : "empty",
    memory_hits: history
      ? [
          {
            memory_ref: "fixture-source-101",
            source_incident: "INC-101",
            candidate_action: "Disable new_checkout",
            outcome: "succeeded",
            ledger_ref: "fixture-ledger-101",
            source_kind: "synthetic_fixture",
            trust: "verified",
            verified_at: "2026-11-06T09:30:00Z",
            actor: "Fixture operator (synthetic)",
            captured_at: "2026-11-06T09:25:00Z",
            excerpt:
              "SYNTHETIC FIXTURE: INC-101 checkout-api v1.3. The operator-confirmed simulated outcome of disabling new_checkout was succeeded. Compatibility requirement: checkout-api 1.3 and new_checkout present. Scenario premise: the flag path is the relevant failure mechanism. No historical DB utilization was recorded.",
            trace_id: null,
          },
        ]
      : [],
    gate: {
      status: drift ? "blocked" : history ? "proposed" : "needs_review",
      policy_version: "fixture-policy-1 (provisional)",
      input_revision: 1,
      checks: [
        {
          code: drift ? "FLAG_ABSENT" : "FLAG_PRESENT",
          label: "Required flag",
          historical: history ? "new_checkout exists · on" : "Not recalled",
          current: `new_checkout ${i.flag}`,
          explanation: drift
            ? "Required flag no longer exists."
            : "Flag is present; confirmation still required.",
          status: drift ? "fail" : "pass",
          evidence_refs: [`fixture-${id.slice(4)}-config`],
        },
        {
          code: drift ? "ENV_DRIFT" : "ENV_COMPATIBLE",
          label: "Environment compatibility",
          historical: history ? "checkout-api v1.3 required" : "Not recalled",
          current: `checkout-api v${i.version}`,
          explanation: drift
            ? "Recorded compatibility requirements do not match."
            : "Fixture compatibility requirement matches v1.3.",
          status: drift ? "fail" : "pass",
          evidence_refs: [`fixture-${id.slice(4)}-config`],
        },
        ...(drift
          ? [
              {
                code: history ? "CONTRADICTING_TELEMETRY" : "NEW_DB_EVIDENCE",
                label: "Current evidence",
                historical: history
                  ? "Flag-path premise · DB baseline not recorded"
                  : "Not recalled",
                current: "DB pool utilization 98%",
                explanation: history
                  ? "Fixture rule C1 challenges the old flag-path premise with current DB evidence. Cause unconfirmed."
                  : "New DB evidence; cause unconfirmed. No historical premise recalled.",
                status: "unknown" as const,
                evidence_refs: ["fixture-103-db"],
              },
            ]
          : []),
      ],
    },
    hypothesis: drift
      ? "Database connection exhaustion is plausible, not confirmed."
      : "Check current configuration and logs; cause remains unconfirmed.",
    reflection_status: "fixture",
    recommended_next_step: drift
      ? "Inspect database pool metrics and recent configuration changes"
      : "Inspect feature-flag configuration and request logs",
    action_id: "read-only-diagnostic",
    executed: false,
  };
}
export function simulationAdapter(): Adapter {
  const ledger = new Map<string, Decision>();
  return {
    kind: "simulation",
    async list() {
      return structuredClone(incidents);
    },
    async analyze(id, mode) {
      return fixtureAnalysis(id, mode);
    },
    async trace() {
      return [];
    },
    async decide(id, a, decision, key) {
      if (
        a.incident_id !== id ||
        a.input_revision !== 1 ||
        a.action_id !== "read-only-diagnostic"
      )
        throw Error("Evidence changed; re-analyze.");
      if (ledger.has(key)) return ledger.get(key)!;
      const d: Decision = {
        ledger_id: `local-${crypto.randomUUID()}`,
        analysis_id: a.analysis_id,
        input_revision: a.input_revision,
        decision,
        actor: "Local demo operator",
        recorded_at: new Date().toISOString(),
        simulated: true,
        outcome: "unknown",
        retain_status: "not_requested",
      };
      ledger.set(key, d);
      return d;
    },
  };
}

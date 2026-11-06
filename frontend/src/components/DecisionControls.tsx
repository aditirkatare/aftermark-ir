import { useRef, useState } from "react";
import { api } from "../api/client";
import type { Analysis, Decision } from "../types/contracts";
import { Dialog } from "./Dialog";
export function DecisionControls({ a }: { a: Analysis }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Decision>();
  const busy = useRef(false);
  const keys = useRef<Record<string, string>>({});
  async function submit(decision: "approved" | "investigate") {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const key = (keys.current[decision] ??= crypto.randomUUID());
      const result = await api.decide(a.incident_id, a, decision, key);
      if (
        result.analysis_id !== a.analysis_id ||
        result.input_revision !== a.input_revision ||
        result.decision !== decision
      )
        throw Error("Inconsistent decision acknowledgement — review required.");
      setSaved(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
      busy.current = false;
    }
  }
  return (
    <>
      <section className="panel diagnostic">
        <div>
          <div className="eyebrow">NEXT SAFE STEP · READ-ONLY</div>
          <h2>{a.recommended_next_step}</h2>
          <p>{a.hypothesis} Nothing has been executed.</p>
        </div>
        <button className="primary" onClick={() => setOpen(true)}>
          Review diagnostic →
        </button>
      </section>
      {open && (
        <Dialog title="Review diagnostic" onClose={() => setOpen(false)}>
          <p className="notice">
            SIMULATED decision ·{" "}
            {api.kind === "simulation"
              ? "browser-local ledger only"
              : "backend acknowledgement required"}
          </p>
          <h3>{a.recommended_next_step}</h3>
          <p>
            Read-only scope: inspect metrics, configuration and request logs.
            Approval records intent, not execution or resolution.
          </p>
          <p>
            Action: {a.action_id} · revision {a.input_revision}
          </p>
          <p>
            Evidence: {a.gate.checks.flatMap((c) => c.evidence_refs).join(", ")}
          </p>
          {saved ? (
            <div role="status" className="notice">
              Decision recorded: {saved.decision}. Outcome: {saved.outcome}.
              Retention: {saved.retain_status}.<br />
              Ledger {saved.ledger_id} · {saved.actor} · {saved.recorded_at}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                className="primary"
                disabled={pending}
                onClick={() => submit("approved")}
              >
                Record simulated approval
              </button>
              <button disabled={pending} onClick={() => submit("investigate")}>
                Request more investigation
              </button>
            </div>
          )}
          {pending && <p role="status">Saving decision…</p>}
          {error && (
            <p role="alert">
              {error} Draft preserved; retry this decision after review.
            </p>
          )}
          <button onClick={() => setOpen(false)}>Cancel</button>
        </Dialog>
      )}
    </>
  );
}

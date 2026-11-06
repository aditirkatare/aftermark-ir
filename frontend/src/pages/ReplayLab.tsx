import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAnalysis } from "../api/state";
import type { Incident, Mode } from "../types/contracts";
import { ValidityGateCard } from "../components/ValidityGateCard";
export function ReplayLab({ incidents }: { incidents: Incident[] }) {
  const [id, setId] = useState("INC-103");
  const [tab, setTab] = useState<Mode>("memory_on");
  const i = incidents.find((i) => i.incident_id === id);
  const off = useAnalysis(id, "memory_off", i?.revision || 1);
  const on = useAnalysis(id, "memory_on", i?.revision || 1);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONTROLLED SCENARIOS / COMPARISON</div>
          <h1 tabIndex={-1}>Replay Lab</h1>
          <p>
            SIMULATED · seed 42 ·{" "}
            {api.kind === "simulation" ? "pre-seeded UI fixtures" : "API mode"}{" "}
            · no live run
          </p>
        </div>
        <Link className="button" to={`/incidents/${id}`}>
          Open {id} →
        </Link>
      </div>
      <section className="panel">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2>Guided replay</h2>
            <p>Backend support pending. Cold learning has not been run.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Reset demo", "Start", "Pause", "Step"].map((t) => (
              <button key={t} disabled aria-describedby="replay-unavailable">
                {t}
              </button>
            ))}
          </div>
        </div>
        <p id="replay-unavailable" className="notice">
          Run controls need an acknowledged backend run and isolated memory
          bank. Fixture selection below is a preview, not replay progression.
        </p>
        <div className="readiness">
          {[
            "API reachable",
            "Memory reachable",
            "Demo bank isolated",
            "Fixtures on backend",
            "No active run",
          ].map((t) => (
            <div key={t}>
              <span className="muted">{t}</span>
              <strong>Not checked</strong>
            </div>
          ))}
        </div>
        <label className="scenario-select">
          Preview scenario
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {incidents.map((i) => (
              <option key={i.incident_id}>{i.incident_id}</option>
            ))}
          </select>
        </label>
      </section>
      <div className="section-heading">
        <div>
          <div className="eyebrow">SAME SNAPSHOT / DIFFERENT CONTEXT</div>
          <h2>Memory ON / OFF comparison</h2>
          <p>
            Evidence snapshot: {id} / revision {i?.revision}. Fixture outputs;
            no model or performance measurement.
          </p>
        </div>
      </div>
      <div className="mode-tabs" aria-label="Comparison mode">
        {(["memory_off", "memory_on"] as Mode[]).map((m) => (
          <button key={m} aria-pressed={tab === m} onClick={() => setTab(m)}>
            {m === "memory_on" ? "M2 · Memory + gate" : "M0 · Current evidence"}
          </button>
        ))}
      </div>
      <div className="comparison">
        {(
          [
            {
              label: "M0 · Current evidence only",
              mode: "memory_off",
              state: off,
            },
            {
              label: "M2 · Memory + validity gate",
              mode: "memory_on",
              state: on,
            },
          ] as const
        ).map((col) => (
          <section
            key={col.mode}
            className={
              tab === col.mode ? "comparison-mode selected" : "comparison-mode"
            }
          >
            <h3>{col.label}</h3>
            {col.state.pending ? (
              <p role="status">Analyzing…</p>
            ) : col.state.error ? (
              <p role="alert">
                {col.state.error}{" "}
                <button onClick={col.state.retry}>Retry</button>
              </p>
            ) : (
              col.state.data && (
                <>
                  <ValidityGateCard a={col.state.data} compact />
                  <p className="notice">
                    Next: {col.state.data.recommended_next_step}.{" "}
                    {col.state.data.hypothesis}
                  </p>
                </>
              )
            )}
          </section>
        ))}
      </div>
      {off.data &&
        on.data &&
        off.data.input_revision !== on.data.input_revision && (
          <p role="alert">
            Non-comparable: different evidence revisions. No performance claim
            can be made.
          </p>
        )}
      <section className="panel">
        <details>
          <summary>Evaluation reports · No evaluation run</summary>
          <p>
            M0: no memory. M1: ungated memory, evaluation-only and
            non-actionable. M2: memory with gate.
          </p>
          <p>
            Supported next-step rate = oracle-permitted proposals / evaluated
            cases. Stale-fix rate = forbidden recommendations / drift cases.
            Block recall = correctly vetoed unsafe proposals / unsafe proposals
            presented. Evidence coverage = cited factual claims / factual
            claims. Handover accuracy = correct required facts / required facts
            checked. Latency = measured median and p95 with request count.
          </p>
          <p>
            Report ID, dataset hash, case count, denominators, failed cases and
            timings: Not run. Zero denominator: N/A.
          </p>
        </details>
      </section>
    </>
  );
}

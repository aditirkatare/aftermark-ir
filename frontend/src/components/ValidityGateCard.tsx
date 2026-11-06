import { ShieldX, ShieldCheck } from "lucide-react";
import { displayGate, verified, type Analysis } from "../types/contracts";
import { MemoryEvidenceCard } from "./MemoryEvidenceCard";
export function ValidityGateCard({
  a,
  compact = false,
}: {
  a: Analysis;
  compact?: boolean;
}) {
  const status = displayGate(a);
  return (
    <section className={`panel gate ${status}`} aria-label="Validity gate">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">
            {status === "blocked" ? (
              <ShieldX size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}{" "}
            MEMORY VALIDITY GATE
          </div>
          <h2>
            {status === "blocked"
              ? a.memory_hits.some(
                  (h) => verified(h) && h.outcome === "succeeded",
                )
                ? "Previously worked. Now blocked."
                : "Current evidence. Action blocked."
              : status === "proposed"
                ? "Compatible history. Review before use."
                : "Investigate before acting."}
          </h2>
          <p className="candidate">
            Disable <code>new_checkout</code>{" "}
            <span className={`badge ${status}`}>
              {status.replace("_", " ")} for {a.incident_id}
            </span>
          </p>
        </div>
      </div>
      <MemoryEvidenceCard a={a} />
      <div
        className="checks"
        role="table"
        aria-label="Historical and current applicability"
      >
        <div className="check-head" role="row">
          <span role="columnheader">CHECK</span>
          <span role="columnheader">HISTORICAL · INC-101</span>
          <span role="columnheader">CURRENT · {a.incident_id}</span>
          <span role="columnheader">WHY IT MATTERS</span>
        </div>
        {a.gate.checks.map((c) => (
          <div className="check-row" role="row" key={c.code}>
            <strong role="cell">
              {c.label}
              <code className="reason">{c.code}</code>
            </strong>
            <span role="cell">
              <small className="mobile-label">Historical</small>
              {c.historical}
            </span>
            <span role="cell">
              <small className="mobile-label">Current</small>
              {c.current}
            </span>
            <span role="cell">{c.explanation}</span>
          </div>
        ))}
      </div>
      {!compact && (
        <details>
          <summary>Why blocked? / Policy details</summary>
          <p>
            Policy: {a.gate.policy_version} · input revision {a.input_revision}.
            Known hard vetoes remain blocked even when another check is unknown.
            This display does not enforce backend policy.
          </p>
          <p>
            Analysis {a.analysis_id} · evidence:{" "}
            {a.gate.checks.flatMap((c) => c.evidence_refs).join(", ")}
          </p>
        </details>
      )}
    </section>
  );
}

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Incident, Mode } from "../types/contracts";
import { useAnalysis } from "../api/state";
import { ValidityGateCard } from "../components/ValidityGateCard";
import { DecisionControls } from "../components/DecisionControls";
import { IncidentTimeline } from "../components/IncidentTimeline";
import { HandoverPanel } from "../components/HandoverPanel";
import { Dialog } from "../components/Dialog";
export function IncidentDetail({
  incidents,
  mode,
}: {
  incidents: Incident[];
  mode: Mode;
}) {
  const { incidentId } = useParams();
  const i = incidents.find((i) => i.incident_id === incidentId);
  return i ? (
    <Detail key={`${i.incident_id}-${mode}`} i={i} mode={mode} />
  ) : (
    <>
      <h1 tabIndex={-1}>Incident not found</h1>
      <Link to="/incidents">Back to queue</Link>
    </>
  );
}
function Detail({ i, mode }: { i: Incident; mode: Mode }) {
  const {
    data: a,
    pending,
    error,
    retry,
    stale,
  } = useAnalysis(i.incident_id, mode, i.revision);
  const [handover, setHandover] = useState(false);
  const [evidence, setEvidence] = useState<Incident["evidence"][number]>();
  return (
    <>
      <div className="page-heading compact">
        <div>
          <Link to="/incidents">← Back to queue</Link>
          <h1 tabIndex={-1}>
            {i.incident_id} <span className="muted">/ {i.service}</span>
          </h1>
          <p>
            Severity: {i.severity || "Not supplied"} · {i.lifecycle} · observed{" "}
            {i.observed_at} UTC · revision {i.revision}
          </p>
        </div>
        <button disabled={!a || pending} onClick={() => setHandover(true)}>
          Generate handover
        </button>
      </div>
      {pending && (
        <div className="panel" role="status">
          Checking applicability… Decisions unavailable until analysis
          completes.
        </div>
      )}
      {error && (
        <div role="alert" className="panel">
          {error} Recall unavailable.{" "}
          <button onClick={retry}>Retry analysis</button>
        </div>
      )}
      {stale && (
        <section aria-label="Stale analysis">
          <p className="notice">
            Stale snapshot from {stale.generated_at}. Recall unavailable;
            decisions disabled until re-analysis succeeds.
          </p>
          <ValidityGateCard a={stale} />
        </section>
      )}
      {a && (
        <>
          <ValidityGateCard a={a} />
          <DecisionControls key={a.analysis_id} a={a} />
        </>
      )}
      <div className="two-columns">
        <IncidentTimeline incident={i} />
        <section className="panel">
          <div className="eyebrow">OBSERVATIONS / REVISION {i.revision}</div>
          <h2>Current evidence</h2>
          {i.evidence.map((e) => (
            <button
              className="evidence-button"
              key={e.id}
              onClick={() => setEvidence(e)}
            >
              <span>{e.label}</span>
              <strong>{e.value}</strong>
              <span>Inspect source →</span>
            </button>
          ))}
          <p className="muted">
            Environment: {i.environment} · source: {i.source_kind}. Owner:
            Unassigned.
          </p>
        </section>
      </div>
      {handover && a && (
        <HandoverPanel i={i} a={a} onClose={() => setHandover(false)} />
      )}
      {evidence && (
        <Dialog title={evidence.label} onClose={() => setEvidence(undefined)}>
          <p>{evidence.value}</p>
          <p>Source: {evidence.source_ref}</p>
          <p>Observed: {evidence.observed_at} UTC</p>
          <p>
            Evidence ID: {evidence.id} · {evidence.source_kind}
          </p>
        </Dialog>
      )}
    </>
  );
}

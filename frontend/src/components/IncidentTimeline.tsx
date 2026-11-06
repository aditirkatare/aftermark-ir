import type { Incident } from "../types/contracts";
export function IncidentTimeline({ incident }: { incident: Incident }) {
  return (
    <section className="panel">
      <div className="eyebrow">INCIDENT CHRONOLOGY</div>
      <h2>Evidence timeline</h2>
      <ol className="timeline">
        {incident.evidence.map((e) => (
          <li key={e.id}>
            <time>{e.observed_at} UTC</time>
            <strong>{e.label}</strong>
            <p>{e.value}</p>
            <span className="muted">
              {e.source_kind} · {e.id}
            </span>
          </li>
        ))}
      </ol>
      <p className="muted">
        Received: {incident.received_at} · Snapshot revision {incident.revision}
        . Event stream not connected.
      </p>
    </section>
  );
}

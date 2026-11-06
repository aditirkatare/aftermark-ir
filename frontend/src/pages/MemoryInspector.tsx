import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Incident, Mode, Trace } from "../types/contracts";
import { useAnalysis } from "../api/state";
import { api } from "../api/client";
import { ValidityGateCard } from "../components/ValidityGateCard";
export function MemoryInspector({
  incidents,
  mode,
}: {
  incidents: Incident[];
  mode: Mode;
}) {
  const [params] = useSearchParams();
  const id = params.get("incident");
  const i = incidents.find((i) => i.incident_id === id);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SOURCE AUDIT / PROVENANCE</div>
          <h1 tabIndex={-1}>Memory Inspector</h1>
          <p>
            {id
              ? `For ${id}`
              : "Select an incident to inspect its analysis sources."}
          </p>
        </div>
        {i && (
          <Link className="button" to={`/incidents/${id}?mode=${mode}`}>
            Return to {id} →
          </Link>
        )}
      </div>
      {i ? (
        <Inspector key={`${i.incident_id}-${mode}`} i={i} mode={mode} />
      ) : (
        <section className="panel">
          <h2>{id ? "Incident not found" : "Choose incident context"}</h2>
          <div className="flex flex-wrap gap-4">
            {incidents.map((i) => (
              <Link
                className="button"
                key={i.incident_id}
                to={`/memory?incident=${i.incident_id}&mode=${mode}`}
              >
                {i.incident_id}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
function Inspector({ i, mode }: { i: Incident; mode: Mode }) {
  const [params, setParams] = useSearchParams();
  const { data, pending, error, retry, stale } = useAnalysis(
    i.incident_id,
    mode,
    i.revision,
  );
  const a = data || stale;
  const [copied, setCopied] = useState("");
  const [traces, setTraces] = useState<Trace[]>([]);
  const [traceError, setTraceError] = useState("");
  const [filter, setFilter] = useState("all");
  const hits =
    a?.memory_hits.filter((h) => filter === "all" || h.trust === filter) || [];
  const hit =
    hits.find((h) => h.memory_ref === params.get("source")) || hits[0];
  useEffect(() => {
    setTraces([]);
    setTraceError("");
    if (!hit?.trace_id) return;
    const c = new AbortController();
    api
      .trace(hit.trace_id, c.signal)
      .then(setTraces)
      .catch((e) => {
        if (!c.signal.aborted) setTraceError(e.message);
      });
    return () => c.abort();
  }, [hit?.trace_id]);
  return (
    <>
      {pending && <p role="status">Waiting for analysis sources…</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={retry}>Retry</button>
        </p>
      )}
      {stale && (
        <p className="notice">
          Stale snapshot from {stale.generated_at}. Recall unavailable; this is
          not a fresh retrieval.
        </p>
      )}
      {a && (
        <>
          <div className="inspector-grid">
            <aside className="panel">
              <h2>Returned sources</h2>
              <label>
                Trust filter
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All sources</option>
                  <option value="verified">Verified</option>
                  <option value="quarantined">Quarantined</option>
                </select>
              </label>
              <p>
                {
                  a.memory_hits.filter(
                    (h) => filter === "all" || h.trust === filter,
                  ).length
                }{" "}
                sources loaded
              </p>
              {hits.map((source, index) => (
                <button
                  key={source.memory_ref || index}
                  className="source-selection"
                  onClick={() => {
                    setParams(
                      (p) => {
                        p.set("source", source.memory_ref || "");
                        return p;
                      },
                      { replace: true },
                    );
                    requestAnimationFrame(() =>
                      document.getElementById("source-heading")?.focus(),
                    );
                  }}
                >
                  {source.source_incident}
                  <br />
                  {source.candidate_action}
                  <br />
                  <span className="badge">{source.outcome} · simulated</span>
                </button>
              ))}
            </aside>
            <section className="panel">
              <div className="eyebrow">HISTORICAL RECORD</div>
              <h2 id="source-heading" tabIndex={-1}>
                {hit
                  ? `${hit.source_incident} · source provenance`
                  : "No relevant memory returned"}
              </h2>
              {hit ? (
                <>
                  <dl className="metadata">
                    <dt>Provider</dt>
                    <dd>
                      {hit.source_kind === "synthetic_fixture"
                        ? "None — synthetic fixture adapter"
                        : hit.source_kind}
                    </dd>
                    <dt>Source reference</dt>
                    <dd>
                      {hit.memory_ref ||
                        "Source unavailable; recommendation unverified"}
                    </dd>
                    <dt>Captured</dt>
                    <dd>{hit.captured_at}</dd>
                    <dt>Verified</dt>
                    <dd>
                      {hit.verified_at || "Verification unavailable"} ·{" "}
                      {hit.actor || "Unknown"}
                    </dd>
                    <dt>Retrieved</dt>
                    <dd>
                      {a.memory_status === "fixture"
                        ? "Not retrieved from a memory service"
                        : a.generated_at}
                    </dd>
                    <dt>Ledger / trace</dt>
                    <dd>
                      {hit.ledger_ref || "Not recorded"} /{" "}
                      {hit.trace_id || "No provider trace"}
                    </dd>
                  </dl>
                  <h3>Historical source text</h3>
                  {hit.trust === "restricted" ? (
                    <p>Source access restricted</p>
                  ) : hit.trust === "quarantined" ? (
                    <details>
                      <summary>Untrusted source — view as text</summary>
                      <pre>{hit.excerpt}</pre>
                    </details>
                  ) : (
                    <pre>{hit.excerpt}</pre>
                  )}
                  <button
                    disabled={!hit.memory_ref}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(hit.memory_ref!);
                        setCopied("Reference copied");
                      } catch {
                        setCopied("Copy failed");
                      }
                    }}
                  >
                    Copy reference
                  </button>
                  <span role="status"> {copied}</span>
                </>
              ) : (
                <p>
                  {mode === "memory_off"
                    ? "Memory Off: no recall requested."
                    : "No source was returned. No historical success is asserted."}
                </p>
              )}
            </section>
          </div>
          <ValidityGateCard a={a} />
          <section className="panel">
            <h2>Provider operation traces</h2>
            <p className="muted">
              RETAIN, RECALL and REFLECT are shown only when supplied by the
              backend.
            </p>
            {traceError ? (
              <p role="alert">{traceError}</p>
            ) : traces.length ? (
              traces.map((t) => (
                <dl className="metadata" key={t.trace_id}>
                  <dt>{t.operation.toUpperCase()}</dt>
                  <dd>
                    {t.status} · {t.provider} · {t.incident_id}
                  </dd>
                  <dt>Started / completed</dt>
                  <dd>
                    {t.started_at} / {t.completed_at || "Pending"}
                  </dd>
                  <dt>Measured duration</dt>
                  <dd>
                    {t.duration_ms === null
                      ? "Not measured"
                      : `${t.duration_ms} ms`}
                  </dd>
                  <dt>Sources</dt>
                  <dd>{t.source_ids.join(", ")}</dd>
                </dl>
              ))
            ) : (
              <p>
                No provider calls recorded. The fixture does not establish
                Hindsight retrieval or persistence.
              </p>
            )}
            <h3>
              {a.reflection_status === "unavailable"
                ? "Reflection unavailable; retrieved facts still shown"
                : "Scenario hypothesis · unverified"}
            </h3>
            <p>{a.hypothesis || "No hypothesis returned."}</p>
          </section>
        </>
      )}
    </>
  );
}

import { Link, useSearchParams } from "react-router-dom";
import type { Incident } from "../types/contracts";
import { api } from "../api/client";
export function CommandCenter({ incidents }: { incidents: Incident[] }) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const status = params.get("status") || "all";
  const service = params.get("service") || "all";
  const list = incidents.filter(
    (i) =>
      (i.incident_id + " " + i.service)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (status === "all" || i.lifecycle === status) &&
      (service === "all" || i.service === service),
  );
  function update(key: string, value: string) {
    setParams(
      (p) => {
        p.set(key, value);
        return p;
      },
      { replace: true },
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">OPERATIONS / INCIDENT QUEUE</div>
          <h1 tabIndex={-1}>Command Center</h1>
          <p>
            {incidents.filter((i) => i.lifecycle === "unresolved").length}{" "}
            unresolved ·{" "}
            {api.kind === "simulation"
              ? "bounded synthetic fixture list"
              : "loaded incident snapshot"}
          </p>
        </div>
        <Link className="button" to="/replay">
          Open Replay Lab →
        </Link>
      </div>
      <section className="panel">
        <div className="flex justify-between flex-wrap gap-4">
          <div>
            <h2>Current incidents</h2>
            <p className="muted">
              Stream: disconnected · latest observed{" "}
              {incidents[0]?.observed_at || "Not recorded"} UTC
            </p>
          </div>
          <span className="badge">SIMULATED</span>
        </div>
        <div className="filters">
          <label>
            Search incident or service
            <input
              value={q}
              onChange={(e) => update("q", e.target.value)}
              placeholder="Search INC-103 or checkout-api"
            />
          </label>
          <label>
            Status
            <select
              value={status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="all">All statuses</option>
              <option>unresolved</option>
              <option>resolved</option>
            </select>
          </label>
          <label>
            Service
            <select
              value={service}
              onChange={(e) => update("service", e.target.value)}
            >
              <option value="all">All services</option>
              <option>checkout-api</option>
            </select>
          </label>
          <button
            onClick={() =>
              setParams({ mode: params.get("mode") || "memory_on" })
            }
          >
            Clear filters
          </button>
        </div>
        <div className="queue">
          {list.map((i) => (
            <article className="queue-row" key={i.incident_id}>
              <div>
                <Link
                  className="incident-link"
                  to={`/incidents/${i.incident_id}?mode=${params.get("mode") || "memory_on"}`}
                >
                  {i.incident_id} →
                </Link>
                <p>Severity: {i.severity || "Not supplied"}</p>
              </div>
              <div>
                <strong>{i.service}</strong>
                <p>v{i.version} · HTTP 503 / checkout errors</p>
              </div>
              <div>
                <span className="badge">{i.lifecycle}</span>
                <p className={i.flag === "absent" ? "blocked" : ""}>
                  {i.flag === "absent"
                    ? "Flag action blocked"
                    : i.lifecycle === "resolved"
                      ? "Historical simulated success"
                      : "Analysis required"}
                </p>
              </div>
              <div>
                <span className="muted">Last observed</span>
                <p>{i.observed_at} UTC</p>
              </div>
            </article>
          ))}
        </div>
        {!list.length && (
          <p role="status">
            {incidents.length
              ? "No incidents match. Clear filters to see the queue."
              : "No incidents in this run."}
          </p>
        )}
      </section>
      <section className="intro">
        <span className="eyebrow">THE DEFINING CHECK</span>
        <h2>Similar symptoms. Different conditions.</h2>
        <p>
          Open INC-103 to inspect why a previously successful response no longer
          applies, and where to investigate next.
        </p>
        <Link
          to={`/incidents/INC-103?mode=${params.get("mode") || "memory_on"}`}
        >
          Inspect INC-103 →
        </Link>
      </section>
    </>
  );
}

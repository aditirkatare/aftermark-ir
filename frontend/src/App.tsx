import { useEffect, useState, useRef } from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { api } from "./api/client";
import type { Incident, Mode } from "./types/contracts";
import { CommandCenter } from "./pages/CommandCenter";
import { IncidentDetail } from "./pages/IncidentDetail";
import { MemoryInspector } from "./pages/MemoryInspector";
import { ReplayLab } from "./pages/ReplayLab";
export function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [menu, setMenu] = useState(false);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const scrollPositions = useRef(new Map<string, number>());
  const [selectedIncident, setSelectedIncident] = useState<string>();
  const mode: Mode =
    params.get("mode") === "memory_off" ? "memory_off" : "memory_on";
  useEffect(() => {
    const c = new AbortController();
    setPending(true);
    api
      .list(c.signal)
      .then(setIncidents)
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setPending(false);
      });
    return () => c.abort();
  }, [reload]);
  useEffect(() => {
    setMenu(false);
    const id =
      location.pathname.match(/^\/incidents\/(INC-\d+)$/)?.[1] ||
      params.get("incident");
    if (id) setSelectedIncident(id);
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
      if (!pending)
        window.scrollTo(0, scrollPositions.current.get(location.pathname) || 0);
    });
    return () => {
      cancelAnimationFrame(frame);
      scrollPositions.current.set(location.pathname, window.scrollY);
    };
  }, [location.pathname, pending]);
  const suffix = `?mode=${mode}`;
  return (
    <>
      <a className="skip" href="#main">
        Skip to main content
      </a>
      <header className="header">
        <Link className="brand" to="/incidents">
          <Activity size={25} />
          <strong>
            AFTERMARK <span>IR</span>
          </strong>
        </Link>
        <span className="badge">SIMULATED · demo-prod</span>
        <div className="connection">
          {api.kind === "simulation"
            ? "Fixture adapter · API not connected"
            : "API adapter"}{" "}
          <span>
            Hindsight:{" "}
            {api.kind === "simulation" ? "not connected" : "status unchecked"}
          </span>
        </div>
        <button
          className="menu-toggle"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          <Menu size={20} /> Menu
        </button>
      </header>
      <aside className={`rail ${menu ? "open" : ""}`}>
        <div className="eyebrow">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <NavLink end to={`/incidents${suffix}`}>
            <LayoutDashboard size={18} />
            Command Center
          </NavLink>
          <NavLink to={`/incidents/${selectedIncident || "INC-103"}${suffix}`}>
            <ShieldCheck size={18} />
            Incident Detail
          </NavLink>
          <NavLink
            to={`/memory${suffix}${selectedIncident ? `&incident=${selectedIncident}` : ""}`}
          >
            <BookOpen size={18} />
            Memory Inspector
          </NavLink>
          <NavLink to={`/replay${suffix}`}>
            <FlaskConical size={18} />
            Replay Lab
          </NavLink>
        </nav>
        <div className="rail-note">
          <span className="eyebrow">HUMAN IN THE LOOP</span>
          <p>
            Evidence first.
            <br />
            Decisions stay yours.
          </p>
          <span className="muted">No production execution.</span>
        </div>
      </aside>
      <main id="main">
        <div className="workspace-bar">
          <span>
            {api.kind === "simulation"
              ? "SYNTHETIC FIXTURE PREVIEW · no live memory retrieval"
              : "BACKEND MODE · no automatic fixture fallback"}
          </span>
          <label className="mode-control">
            Memory for analysis
            <select
              aria-label="Memory for analysis"
              value={mode}
              onChange={(e) =>
                setParams((p) => {
                  p.set("mode", e.target.value);
                  return p;
                })
              }
            >
              <option value="memory_on">On</option>
              <option value="memory_off">Off</option>
            </select>
          </label>
        </div>
        {mode === "memory_off" && (
          <p className="mode-help">
            Analyze current evidence without recall. Existing results keep their
            recorded mode.
          </p>
        )}
        {pending ? (
          <section className="panel" role="status">
            Loading incident snapshot…
          </section>
        ) : error ? (
          <section className="panel" role="alert">
            {error}
            <p>Snapshot unavailable; unresolved count unavailable.</p>
            <button
              onClick={() => {
                setError("");
                setReload((n) => n + 1);
              }}
            >
              Retry queue
            </button>
          </section>
        ) : (
          <Routes>
            <Route path="/" element={<CommandCenter incidents={incidents} />} />
            <Route
              path="/incidents"
              element={<CommandCenter incidents={incidents} />}
            />
            <Route
              path="/incidents/:incidentId"
              element={<IncidentDetail incidents={incidents} mode={mode} />}
            />
            <Route
              path="/memory"
              element={<MemoryInspector incidents={incidents} mode={mode} />}
            />
            <Route
              path="/replay"
              element={<ReplayLab incidents={incidents} />}
            />
            <Route
              path="*"
              element={
                <>
                  <h1 tabIndex={-1}>Page not found</h1>
                  <Link to="/incidents">Back to queue</Link>
                </>
              }
            />
          </Routes>
        )}
        <footer>
          AFTERMARK IR <span>Historical outcome ≠ current applicability</span>
        </footer>
      </main>
    </>
  );
}

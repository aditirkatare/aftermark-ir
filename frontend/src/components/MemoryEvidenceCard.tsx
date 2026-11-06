import { Link } from "react-router-dom";
import { verified, type Analysis } from "../types/contracts";
export function MemoryEvidenceCard({ a }: { a: Analysis }) {
  const hit = a.memory_hits[0];
  return (
    <div className="provenance">
      {hit ? (
        <>
          <span
            className={
              verified(hit) && hit.outcome === "succeeded" ? "verified" : ""
            }
          >
            {verified(hit)
              ? `${hit.outcome === "succeeded" ? "Succeeded" : "Outcome: " + hit.outcome} in ${hit.source_incident} · operator-confirmed · simulated`
              : "Verification unavailable — unverified"}
          </span>
          <br />
          <span>
            Source:{" "}
            {hit.source_kind === "synthetic_fixture"
              ? "Synthetic fixture, not Hindsight recall"
              : hit.source_kind}{" "}
            · {hit.memory_ref || "Source unavailable"} · verified{" "}
            {hit.verified_at || "Not recorded"} by {hit.actor || "Unknown"}
          </span>{" "}
          <Link to={`/memory?incident=${a.incident_id}&mode=${a.mode}`}>
            View memory source →
          </Link>
        </>
      ) : a.memory_status === "off" ? (
        "Memory Off · current evidence only. No recall requested."
      ) : a.memory_status === "unavailable" ? (
        "Recall unavailable. Current evidence remains accessible."
      ) : (
        "No relevant memory returned."
      )}
    </div>
  );
}

import { useState } from "react";
import type { Analysis, Incident } from "../types/contracts";
import { Dialog } from "./Dialog";
export function HandoverPanel({
  i,
  a,
  onClose,
}: {
  i: Incident;
  a: Analysis;
  onClose: () => void;
}) {
  const [status, setStatus] = useState("");
  const text = `SIMULATED — frontend draft, not a backend handover\n${i.incident_id}: ${i.lifecycle}. Impact: checkout HTTP 503; extent unknown.\nSnapshot ${i.observed_at}, revision ${i.revision}.\nKnown facts: ${i.evidence.map((e) => `${e.value} [${e.id}]`).join("; ")}\nHistorical candidate: disable new_checkout. Gate: ${a.gate.status}. ${a.gate.checks.map((c) => c.code).join(", ")}.\nActions actually tried in current incident: not recorded. Outcomes: unknown.\nNext: ${a.recommended_next_step} (read-only).\nUnknown: root cause; customer impact; diagnostic outcome.\nOwner: Unassigned.\nMemory: ${a.memory_status}; live retention not connected. Review local decision ledger separately.`;
  return (
    <Dialog title="Review handover draft" onClose={onClose}>
      <pre>{text}</pre>
      <button
        className="primary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setStatus("Copied handover. Nothing was sent.");
          } catch {
            setStatus("Copy failed. Select the draft text to copy manually.");
          }
        }}
      >
        Copy handover
      </button>
      <p role="status">{status}</p>
    </Dialog>
  );
}

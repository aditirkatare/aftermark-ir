import { useEffect, useState } from "react";
import { api } from "./client";
import type { Analysis, Mode } from "../types/contracts";
// Read-only snapshots survive navigation. Run/reset integration must clear this cache.
const snapshots = new Map<string, Analysis>();
export function useAnalysis(id: string, mode: Mode, revision: number) {
  const key = `${id}:${mode}:${revision}`;
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{
    data?: Analysis;
    error?: string;
    pending: boolean;
  }>({ pending: true });
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setState({ pending: true });
    api
      .analyze(id, mode, revision, controller.signal)
      .then((data) => {
        if (active) {
          if (
            data.incident_id !== id ||
            data.mode !== mode ||
            data.input_revision !== revision ||
            data.gate.input_revision !== revision ||
            (data.gate.status === "proposed" &&
              data.gate.checks.some((c) => c.status === "fail"))
          )
            throw Error("Inconsistent analysis — review required");
          snapshots.set(key, data);
          setState({ data, pending: false });
        }
      })
      .catch((e) => {
        if (active) setState({ error: String(e.message), pending: false });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, mode, revision, retry]);
  return {
    ...state,
    stale: state.error ? snapshots.get(key) : undefined,
    retry: () => setRetry((n) => n + 1),
  };
}

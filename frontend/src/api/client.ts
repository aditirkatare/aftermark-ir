import { z } from "zod";
import {
  Analysis,
  Decision,
  Incident,
  Trace,
  type Adapter,
} from "../types/contracts";
import { simulationAdapter } from "./simulation";
export function httpAdapter(base: string): Adapter {
  async function request<T>(
    path: string,
    schema: z.ZodType<T>,
    signal?: AbortSignal,
    body?: unknown,
    key?: string,
  ) {
    const response = await fetch(`${base}${path}`, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw Error(
        response.status === 409
          ? "Evidence changed; re-analyze."
          : `API request failed (${response.status}). Retry when available.`,
      );
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success)
      throw Error("Inconsistent API response — review required.");
    return parsed.data;
  }
  return {
    kind: "http",
    list: (s) => request("/incidents", z.array(Incident), s),
    analyze: (id, mode, input_revision, s) =>
      request(`/incidents/${encodeURIComponent(id)}/analyze`, Analysis, s, {
        mode,
        input_revision,
      }),
    decide: (id, a, decision, key) =>
      request(
        `/incidents/${encodeURIComponent(id)}/decisions`,
        Decision,
        undefined,
        {
          analysis_id: a.analysis_id,
          input_revision: a.input_revision,
          action_id: a.action_id,
          decision,
          simulated: true,
        },
        key,
      ),
    trace: (id, s) =>
      request(`/memory/trace/${encodeURIComponent(id)}`, z.array(Trace), s),
  };
}
export const api =
  import.meta.env.VITE_ADAPTER === "http"
    ? httpAdapter(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000")
    : simulationAdapter();
export interface StreamEvent {
  event_id: string;
  generation: number;
  sequence: number;
}
export function reconcileEvents<T extends StreamEvent>(
  current: T[],
  incoming: T[],
  generation: number,
) {
  return [
    ...new Map(
      [...current, ...incoming]
        .filter((e) => e.generation === generation)
        .map((e) => [e.event_id, e]),
    ).values(),
  ].sort((a, b) => a.sequence - b.sequence);
}

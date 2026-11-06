import { describe, it, expect, vi } from "vitest";
import { Analysis, displayGate, verified } from "../src/types/contracts";
import { fixtureAnalysis, simulationAdapter } from "../src/api/simulation";
import { httpAdapter, reconcileEvents } from "../src/api/client";
describe("safety display and provisional adapter", () => {
  it("hero preserves historical success and all three supplied reasons", () => {
    const a = Analysis.parse(fixtureAnalysis("INC-103", "memory_on"));
    expect(displayGate(a)).toBe("blocked");
    expect(a.memory_hits[0].outcome).toBe("succeeded");
    expect(a.gate.checks.map((c) => c.code)).toEqual([
      "FLAG_ABSENT",
      "ENV_DRIFT",
      "CONTRADICTING_TELEMETRY",
    ]);
    expect(a.memory_hits[0].trace_id).toBeNull();
  });
  it("missing source/actor never verifies history or weakens a veto", () => {
    const a = fixtureAnalysis("INC-103", "memory_on");
    a.memory_hits[0].memory_ref = null;
    a.memory_hits[0].actor = null;
    expect(verified(a.memory_hits[0])).toBe(false);
    expect(displayGate(a)).toBe("blocked");
    const compatible = fixtureAnalysis("INC-102", "memory_on");
    compatible.memory_hits[0].verified_at = null;
    expect(displayGate(compatible)).toBe("needs_review");
  });
  it("memory off contains no fabricated recall or historical premise", () => {
    const a = fixtureAnalysis("INC-103", "memory_off");
    expect(a.memory_hits).toEqual([]);
    expect(a.memory_status).toBe("off");
    expect(a.gate.checks.every((c) => c.historical === "Not recalled")).toBe(
      true,
    );
  });
  it("display trusts policy findings rather than comparing version strings", () => {
    const a = fixtureAnalysis("INC-102", "memory_on");
    a.gate.checks[1].current = "v9.0 explicitly compatible";
    expect(displayGate(a)).toBe("proposed");
    a.gate.checks[1].status = "unknown";
    expect(displayGate(a)).toBe("needs_review");
  });
  it("explicit off and unknown remain distinct from absent", async () => {
    const list = await simulationAdapter().list();
    list[0].flag = "off";
    expect(list[0].flag).not.toBe("absent");
    list[0].flag = "unknown";
    expect(list[0].flag).toBe("unknown");
  });
  it("deduplicates and orders same-generation events", () => {
    expect(
      reconcileEvents(
        [{ event_id: "b", generation: 2, sequence: 2 }],
        [
          { event_id: "a", generation: 2, sequence: 1 },
          { event_id: "b", generation: 2, sequence: 2 },
          { event_id: "old", generation: 1, sequence: 3 },
        ],
        2,
      ).map((e) => e.event_id),
    ).toEqual(["a", "b"]);
  });
  it("acknowledges intent once, with unknown outcome and no retention", async () => {
    const api = simulationAdapter();
    const a = fixtureAnalysis("INC-103", "memory_on");
    const first = await api.decide("INC-103", a, "approved", "same");
    expect(await api.decide("INC-103", a, "approved", "same")).toEqual(first);
    expect(first.outcome).toBe("unknown");
    expect(first.retain_status).toBe("not_requested");
    await expect(
      api.decide("INC-103", { ...a, input_revision: 2 }, "approved", "stale"),
    ).rejects.toThrow("Evidence changed");
  });
  it("rejects malformed live responses and never falls back to fixtures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
    );
    await expect(httpAdapter("http://test").list()).rejects.toThrow(
      "Inconsistent API",
    );
    vi.unstubAllGlobals();
  });
  it("surfaces stale-revision conflict without claiming success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 409 })),
    );
    await expect(
      httpAdapter("http://test").decide(
        "INC-103",
        fixtureAnalysis("INC-103", "memory_on"),
        "approved",
        "key",
      ),
    ).rejects.toThrow("Evidence changed");
    vi.unstubAllGlobals();
  });
  it("never supplies simulated provider traces", async () => {
    expect(await simulationAdapter().trace("anything")).toEqual([]);
  });
});

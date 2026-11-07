import json
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from hindsight_client import Hindsight


# --------------------------------------------------
# Configuration and logging
# --------------------------------------------------

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aftermark")

BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "aftermark-ir")
HINDSIGHT_BASE_URL = os.getenv(
    "HINDSIGHT_BASE_URL",
    "https://api.hindsight.vectorize.io",
)
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")

_client = None

STAMP = "2026-11-06T10:00:00Z"


def now():
    return datetime.now(timezone.utc).isoformat()


def get_hindsight():
    global _client

    if not HINDSIGHT_API_KEY:
        raise RuntimeError("HINDSIGHT_API_KEY is not configured")

    if _client is None:
        _client = Hindsight(
            base_url=HINDSIGHT_BASE_URL,
            api_key=HINDSIGHT_API_KEY,
        )

    return _client


def value(obj, key, default=None):
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def finish_trace(trace, started, succeeded):
    trace["completed_at"] = now()
    trace["duration_ms"] = int(
        (datetime.now(timezone.utc) - started).total_seconds() * 1000
    )
    trace["status"] = "succeeded" if succeeded else "failed"


def start_trace(operation, incident_id, source_ids=None):
    started = datetime.now(timezone.utc)

    trace = {
        "trace_id": str(uuid.uuid4()),
        "operation": operation,
        "provider": "hindsight",
        "status": "pending",
        "started_at": started.isoformat(),
        "completed_at": None,
        "duration_ms": None,
        "source_ids": source_ids or [],
        "incident_id": incident_id,
    }

    traces.append(trace)
    return trace, started


def build_hit(item, trace_id):
    metadata = value(item, "metadata", {}) or {}

    if not isinstance(metadata, dict):
        metadata = {}

    text = (
        value(item, "text")
        or value(item, "content")
        or value(item, "fact")
        or str(item)
    )

    memory_ref = (
        value(item, "id")
        or value(item, "memory_id")
        or metadata.get("memory_ref")
    )

    # A recalled memory is NOT automatically verified.
    # Verification requires explicit provenance fields.
    verified = (
        metadata.get("trust") == "verified"
        and bool(metadata.get("ledger_ref"))
        and bool(metadata.get("actor"))
        and bool(metadata.get("verified_at"))
    )

    return {
        "memory_ref": str(memory_ref) if memory_ref else None,
        "source_incident": str(
            metadata.get("source_incident", "unknown")
        ),
        "candidate_action": str(
            metadata.get("candidate_action", text[:200])
        ),
        "outcome": (
            metadata.get("outcome")
            if metadata.get("outcome") in ("succeeded", "failed", "unknown")
            else "unknown"
        ),
        "ledger_ref": (
            str(metadata["ledger_ref"])
            if metadata.get("ledger_ref")
            else None
        ),
        "source_kind": "hindsight_memory",
        "trust": "verified" if verified else "unverified",
        "verified_at": (
            metadata.get("verified_at") if verified else None
        ),
        "actor": metadata.get("actor") if verified else None,
        "captured_at": str(
            metadata.get("captured_at", now())
        ),
        "excerpt": str(text)[:1000],
        "trace_id": trace_id,
    }


# --------------------------------------------------
# Synthetic demonstration incidents
# --------------------------------------------------

def make_incident(n):
    drift = n == 103

    evidence = [
        {
            "id": f"fixture-{n}-config",
            "label": "Environment fingerprint",
            "value": (
                "checkout-api v2.0.0 · new_checkout absent"
                if drift
                else "checkout-api v1.3 · new_checkout on"
            ),
            "observed_at": STAMP,
            "source_ref": f"frontend fixture / INC-{n}",
            "source_kind": "synthetic_fixture",
        }
    ]

    if drift:
        evidence.append({
            "id": "fixture-103-db",
            "label": "DB pool utilization",
            "value": "98% · cause unconfirmed",
            "observed_at": STAMP,
            "source_ref": "blueprint §9 / synthetic observation",
            "source_kind": "synthetic_fixture",
        })

    return {
        "incident_id": f"INC-{n}",
        "service": "checkout-api",
        "environment": "demo-prod",
        "version": "2.0.0" if drift else "1.3",
        "severity": None,
        "lifecycle": "resolved" if n == 101 else "unresolved",
        "observed_at": STAMP,
        "received_at": STAMP,
        "source_kind": "synthetic_fixture",
        "revision": 1,
        "flag": "absent" if drift else "on",
        "evidence": evidence,
    }


INCIDENTS = {
    f"INC-{n}": make_incident(n)
    for n in (101, 102, 103)
}


# --------------------------------------------------
# In-memory demo state
# --------------------------------------------------

analyses = {}
decisions = {}
idempotency = {}
traces = []


# --------------------------------------------------
# Request models
# --------------------------------------------------

class AnalyzeRequest(BaseModel):
    mode: Literal["memory_on", "memory_off"]
    input_revision: int


class DecisionRequest(BaseModel):
    analysis_id: str
    input_revision: int
    action_id: Literal["read-only-diagnostic"]
    decision: Literal["approved", "investigate"]
    simulated: Literal[True]


class RetainRequest(BaseModel):
    incident_id: str
    content: str
    candidate_action: str
    outcome: Literal["succeeded", "failed"]
    actor: str
    ledger_ref: str
    verified_at: str


# --------------------------------------------------
# Application lifecycle
# --------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

    if _client is not None:
        await _client.aclose()


app = FastAPI(
    title="AFTERMARK IR API",
    description="Memory-aware incident response backend",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Helpers for analysis
# --------------------------------------------------

def check(
    code,
    label,
    historical,
    current,
    explanation,
    status,
    refs,
):
    return {
        "code": code,
        "label": label,
        "historical": historical,
        "current": current,
        "explanation": explanation,
        "status": status,
        "evidence_refs": refs,
    }


# --------------------------------------------------
# Basic endpoints
# --------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "AFTERMARK IR backend is running!"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "aftermark-ir-backend",
    }


@app.get("/memory/health")
async def memory_health():
    try:
        client = get_hindsight()
        result = await client.aget_version()

        return {
            "status": "connected",
            "bank_id": BANK_ID,
            "api_version": value(result, "api_version"),
        }

    except Exception as exc:
        logger.exception("Hindsight health check failed")
        raise HTTPException(
            503,
            detail=f"Hindsight connection failed: {str(exc)[:300]}",
        )


@app.get("/incidents")
async def list_incidents():
    return [
        INCIDENTS[f"INC-{n}"]
        for n in (103, 102, 101)
    ]


# --------------------------------------------------
# Incident analysis: recall + reflect
# --------------------------------------------------

@app.post("/incidents/{incident_id}/analyze")
async def analyze(incident_id: str, request: AnalyzeRequest):
    incident = INCIDENTS.get(incident_id)

    if not incident:
        raise HTTPException(404, "Incident not found")

    if request.input_revision != incident["revision"]:
        raise HTTPException(
            409,
            "Evidence changed; re-analyze.",
        )

    drift = incident_id == "INC-103"
    mode = request.mode

    memory_hits = []
    memory_status = "off" if mode == "memory_off" else "unavailable"
    reflection_status = "unavailable"
    reflection_text = None

    if mode == "memory_on":
        try:
            client = get_hindsight()

            # Recall historical information.
            recall_trace, started = start_trace(
                "recall",
                incident_id,
                [item["id"] for item in incident["evidence"]],
            )

            try:
                recalled = await client.arecall(
                    bank_id=BANK_ID,
                    query=(
                        f"Past incidents, verified resolutions, actions and "
                        f"compatibility requirements for {incident['service']}. "
                        f"Current incident {incident_id}: version "
                        f"{incident['version']}, flag {incident['flag']}."
                    ),
                    budget="low",
                    max_tokens=1500,
                )

                results = value(recalled, "results", []) or []

                memory_hits = [
                    build_hit(item, recall_trace["trace_id"])
                    for item in results[:8]
                ]

                finish_trace(recall_trace, started, True)
                memory_status = (
                    "succeeded" if memory_hits else "empty"
                )

            except Exception:
                finish_trace(recall_trace, started, False)
                logger.exception(
                    "Hindsight recall failed for %s",
                    incident_id,
                )
                memory_status = "unavailable"

            # Reflection is separate so a reflection failure
            # does not erase a successful recall.
            reflect_trace, started = start_trace(
                "reflect",
                incident_id,
            )

            try:
                reflected = await client.areflect(
                    bank_id=BANK_ID,
                    query=(
                        f"Review relevant past incident learnings for "
                        f"{incident_id}. Identify useful context and "
                        f"uncertainties. Do not recommend an action that "
                        f"contradicts current evidence."
                    ),
                    context=json.dumps(incident),
                    budget="low",
                )

                reflection_text = (
                    value(reflected, "text")
                    or value(reflected, "answer")
                    or value(reflected, "response")
                )

                if reflection_text is None:
                    reflection_text = str(reflected)

                finish_trace(reflect_trace, started, True)
                reflection_status = "succeeded"

            except Exception:
                finish_trace(reflect_trace, started, False)
                logger.exception(
                    "Hindsight reflection failed for %s",
                    incident_id,
                )
                reflection_status = "unavailable"

        except Exception:
            logger.exception(
                "Hindsight setup failed for incident %s",
                incident_id,
            )
            memory_status = "unavailable"
            reflection_status = "unavailable"

    verified_hits = [
        hit for hit in memory_hits
        if hit["trust"] == "verified"
    ]

    historical = (
        verified_hits[0]["excerpt"][:250]
        if verified_hits
        else "No verified memory recalled"
    )

    refs = [f"fixture-{incident_id[4:]}-config"]

    checks = [
        check(
            "FLAG_ABSENT" if drift else "FLAG_PRESENT",
            "Required flag",
            historical if mode == "memory_on" else "Not recalled",
            f"new_checkout {incident['flag']}",
            (
                "Required flag no longer exists."
                if drift
                else "Flag is present; confirmation still required."
            ),
            "fail" if drift else "pass",
            refs,
        ),
        check(
            "ENV_DRIFT" if drift else "ENV_COMPATIBLE",
            "Environment compatibility",
            historical if mode == "memory_on" else "Not recalled",
            f"checkout-api v{incident['version']}",
            (
                "Recorded compatibility requirements do not match."
                if drift
                else "Fixture compatibility requirement matches v1.3."
            ),
            "fail" if drift else "pass",
            refs,
        ),
    ]

    if drift:
        checks.append(
            check(
                "CONTRADICTING_TELEMETRY"
                if mode == "memory_on"
                else "NEW_DB_EVIDENCE",
                "Current evidence",
                (
                    "Historical premise requires review"
                    if mode == "memory_on"
                    else "Not recalled"
                ),
                "DB pool utilization 98%",
                "Current DB evidence challenges the old premise. "
                "Cause remains unconfirmed.",
                "unknown",
                ["fixture-103-db"],
            )
        )

    # Current evidence always controls the safety gate.
    # Memory cannot override a current contradiction.
    gate_status = "blocked" if drift else "needs_review"

    analysis = {
        "analysis_id": str(uuid.uuid4()),
        "incident_id": incident_id,
        "mode": mode,
        "input_revision": incident["revision"],
        "generated_at": now(),
        "memory_status": memory_status,
        "memory_hits": memory_hits,
        "gate": {
            "status": gate_status,
            "policy_version": "aftermark-policy-1",
            "input_revision": incident["revision"],
            "checks": checks,
        },
        "hypothesis": (
            reflection_text
            if reflection_text
            else (
                "Database connection exhaustion is plausible, not confirmed."
                if drift
                else "Check current configuration and logs; "
                     "cause remains unconfirmed."
            )
        ),
        "reflection_status": reflection_status,
        "recommended_next_step": (
            "Inspect database pool metrics and recent configuration changes"
            if drift
            else "Inspect feature-flag configuration and request logs"
        ),
        "action_id": "read-only-diagnostic",
        "executed": False,
    }

    analyses[analysis["analysis_id"]] = analysis
    return analysis


# --------------------------------------------------
# Simulated decision endpoint
# --------------------------------------------------

@app.post("/incidents/{incident_id}/decisions")
async def record_decision(
    incident_id: str,
    request: DecisionRequest,
    idempotency_key: str = Header(alias="Idempotency-Key"),
):
    if idempotency_key in idempotency:
        return idempotency[idempotency_key]

    analysis = analyses.get(request.analysis_id)

    if not analysis or analysis["incident_id"] != incident_id:
        raise HTTPException(404, "Analysis not found")

    if request.input_revision != INCIDENTS[incident_id]["revision"]:
        raise HTTPException(
            409,
            "Evidence changed; re-analyze.",
        )

    if request.input_revision != analysis["input_revision"]:
        raise HTTPException(
            409,
            "Evidence changed; re-analyze.",
        )

    if analysis["gate"]["status"] == "blocked":
        raise HTTPException(
            409,
            "Decision blocked by validity gate.",
        )

    result = {
        "ledger_id": str(uuid.uuid4()),
        "analysis_id": request.analysis_id,
        "input_revision": request.input_revision,
        "decision": request.decision,
        "actor": "Local demo operator",
        "recorded_at": now(),
        "simulated": True,
        "outcome": "unknown",
        "retain_status": "not_requested",
    }

    decisions[result["ledger_id"]] = result
    idempotency[idempotency_key] = result

    return result


# --------------------------------------------------
# Explicit operator-verified memory retention
# --------------------------------------------------

@app.post("/memory/retain")
async def retain_memory(request: RetainRequest):
    if request.incident_id not in INCIDENTS:
        raise HTTPException(404, "Incident not found")

    trace, started = start_trace(
        "retain",
        request.incident_id,
    )

    content = (
        f"Incident: {request.incident_id}\n"
        f"Action: {request.candidate_action}\n"
        f"Outcome: {request.outcome}\n"
        f"Operator: {request.actor}\n"
        f"Ledger reference: {request.ledger_ref}\n"
        f"Verified at: {request.verified_at}\n"
        f"Details: {request.content}"
    )

    metadata = {
        "source_incident": request.incident_id,
        "candidate_action": request.candidate_action,
        "outcome": request.outcome,
        "actor": request.actor,
        "ledger_ref": request.ledger_ref,
        "verified_at": request.verified_at,
        "trust": "verified",
        "captured_at": now(),
    }

    try:
        client = get_hindsight()

        await client.aretain(
            bank_id=BANK_ID,
            content=content,
            context="AFTERMARK IR operator-verified incident outcome",
            metadata=metadata,
            tags=[
                "aftermark-ir",
                request.incident_id,
                "verified",
            ],
        )

        finish_trace(trace, started, True)

        return {
            "status": "succeeded",
            "trace_id": trace["trace_id"],
            "incident_id": request.incident_id,
        }

    except Exception as exc:
        finish_trace(trace, started, False)

        logger.exception(
            "Hindsight retain failed for %s",
            request.incident_id,
        )

        raise HTTPException(
            503,
            detail=f"Hindsight retain failed: {str(exc)[:300]}",
        )


# --------------------------------------------------
# Memory trace endpoint
# --------------------------------------------------

@app.get("/memory/trace/{trace_id}")
async def get_trace(trace_id: str):
    return [
        trace for trace in traces
        if trace["trace_id"] == trace_id
    ]
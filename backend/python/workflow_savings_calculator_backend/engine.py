"""Backend evidence and ROI engine for Workflow Savings Calculator.

This module is intentionally dependency-free so chapters can run it in locked-down
school, nonprofit, or small-business environments. It turns structured evidence
and workflow economics into a backend-grade release packet for API, CLI, batch,
or data-pipeline usage.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from hashlib import sha256
from statistics import mean
from typing import Iterable, Mapping, Any

PRODUCT_SLUG = "workflow-savings-calculator"
PRODUCT_TITLE = "Workflow Savings Calculator"
DOMAIN_ROWS = [
  "Manual steps listed",
  "Frequency entered",
  "Minutes per run entered",
  "Error cost estimated",
  "Build effort estimated",
  "Maintenance cost estimated",
  "Risk factors checked",
  "Recommendation generated"
]
ARTIFACTS = [
  "ROI brief",
  "Scenario CSV",
  "Build/no-build memo"
]
REQUIRED_WORKFLOW_FIELDS = {
    "monthly_volume": (0, 1_000_000),
    "minutes_per_item": (0, 10_000),
    "hourly_rate": (0, 10_000),
    "build_hours": (0, 100_000),
    "maintenance_hours_monthly": (0, 10_000),
    "confidence_percent": (0, 100),
    "failure_risk_percent": (0, 100),
}

@dataclass(frozen=True)
class EvidenceItem:
    label: str
    score: float
    evidence: str
    owner: str = "Volta reviewer"
    approved: bool = False

    def normalized_score(self) -> float:
        return max(0.0, min(100.0, float(self.score)))


def score_items(items: Iterable[EvidenceItem]) -> dict[str, Any]:
    rows = list(items)
    if not rows:
        return {"score": 0, "approved": False, "coverage": 0, "warnings": ["No evidence items supplied."]}
    scores = [item.normalized_score() for item in rows]
    coverage = round(100 * sum(1 for item in rows if item.evidence.strip()) / len(rows))
    approved = all(item.approved for item in rows) and coverage == 100 and mean(scores) >= 85
    warnings = []
    if coverage < 100:
        warnings.append("Every backend evidence item needs source notes before handoff.")
    if mean(scores) < 85:
        warnings.append("Average score is below the Volta production threshold.")
    if not all(item.approved for item in rows):
        warnings.append("At least one item still needs owner or mentor approval.")
    return {"score": round(mean(scores)), "approved": approved, "coverage": coverage, "warnings": warnings}


def summarize_rows(payload: Mapping[str, Any]) -> list[EvidenceItem]:
    rows = payload.get("rows", [])
    result: list[EvidenceItem] = []
    for index, label in enumerate(DOMAIN_ROWS):
        source = rows[index] if index < len(rows) and isinstance(rows[index], Mapping) else {}
        result.append(EvidenceItem(
            label=str(source.get("label", label)),
            score=float(source.get("score", 0)),
            evidence=str(source.get("evidence", "")),
            owner=str(source.get("owner", "Volta reviewer")),
            approved=bool(source.get("approved", False)),
        ))
    return result


def validate_payload(payload: Mapping[str, Any]) -> list[str]:
    errors: list[str] = []
    if not isinstance(payload, Mapping):
        return ["payload must be a JSON object"]
    rows = payload.get("rows", [])
    if rows is not None and not isinstance(rows, list):
        errors.append("rows must be a list")
    if isinstance(rows, list) and len(rows) > 100:
        errors.append("rows limit is 100")
    workflow = payload.get("workflow", {})
    if workflow and not isinstance(workflow, Mapping):
        errors.append("workflow must be an object")
    for field, (minimum, maximum) in REQUIRED_WORKFLOW_FIELDS.items():
        if field in workflow:
            try:
                value = float(workflow[field])
            except (TypeError, ValueError):
                errors.append(f"workflow.{field} must be numeric")
                continue
            if not minimum <= value <= maximum:
                errors.append(f"workflow.{field} must be between {minimum} and {maximum}")
    if workflow.get("contains_sensitive_data") and not workflow.get("owner_approval"):
        errors.append("owner_approval is required for workflows with sensitive data")
    return errors


def workflow_number(workflow: Mapping[str, Any], key: str, default: float) -> float:
    try:
        return float(workflow.get(key, default))
    except (TypeError, ValueError):
        return default


def calculate_roi(payload: Mapping[str, Any]) -> dict[str, Any]:
    workflow = payload.get("workflow", {}) if isinstance(payload.get("workflow", {}), Mapping) else {}
    monthly_volume = workflow_number(workflow, "monthly_volume", 120)
    minutes_per_item = workflow_number(workflow, "minutes_per_item", 15)
    hourly_rate = workflow_number(workflow, "hourly_rate", 45)
    build_hours = workflow_number(workflow, "build_hours", 40)
    maintenance_hours_monthly = workflow_number(workflow, "maintenance_hours_monthly", 4)
    confidence = workflow_number(workflow, "confidence_percent", 80) / 100
    failure_risk = workflow_number(workflow, "failure_risk_percent", 15) / 100
    gross_monthly_savings = monthly_volume * (minutes_per_item / 60) * hourly_rate
    maintenance_cost = maintenance_hours_monthly * hourly_rate
    build_cost = build_hours * hourly_rate
    risk_adjusted_monthly_savings = max(0, gross_monthly_savings * confidence * (1 - failure_risk) - maintenance_cost)
    payback_months = round(build_cost / risk_adjusted_monthly_savings, 2) if risk_adjusted_monthly_savings > 0 else None
    recommendation = "build" if risk_adjusted_monthly_savings >= 500 and (payback_months is not None and payback_months <= 6) else "defer"
    return {
        "gross_monthly_savings": round(gross_monthly_savings, 2),
        "risk_adjusted_monthly_savings": round(risk_adjusted_monthly_savings, 2),
        "maintenance_cost_monthly": round(maintenance_cost, 2),
        "build_cost": round(build_cost, 2),
        "payback_months": payback_months,
        "recommendation": recommendation,
    }


def sensitivity_analysis(payload: Mapping[str, Any]) -> list[dict[str, Any]]:
    workflow = dict(payload.get("workflow", {})) if isinstance(payload.get("workflow", {}), Mapping) else {}
    scenarios = []
    for name, multiplier in [("low", 0.75), ("base", 1.0), ("high", 1.25)]:
        scenario_payload = dict(payload)
        scenario_workflow = dict(workflow)
        for key in ["monthly_volume", "minutes_per_item", "hourly_rate"]:
            if key in scenario_workflow:
                scenario_workflow[key] = workflow_number(workflow, key, 0) * multiplier
        scenario_payload["workflow"] = scenario_workflow
        roi = calculate_roi(scenario_payload)
        scenarios.append({"scenario": name, "risk_adjusted_monthly_savings": roi["risk_adjusted_monthly_savings"], "payback_months": roi["payback_months"]})
    return scenarios


def build_release_packet(payload: Mapping[str, Any]) -> dict[str, Any]:
    validation_errors = validate_payload(payload)
    items = summarize_rows(payload)
    scoring = score_items(items)
    roi = calculate_roi(payload)
    fingerprint_source = "|".join(f"{item.label}:{item.normalized_score()}:{item.evidence}:{item.approved}" for item in items)
    digest = sha256(f"{PRODUCT_SLUG}|{fingerprint_source}|{roi}".encode("utf-8")).hexdigest()[:16]
    warnings = list(scoring["warnings"])
    warnings.extend(validation_errors)
    return {
        "product": {"slug": PRODUCT_SLUG, "title": PRODUCT_TITLE},
        "score": {**scoring, "approved": scoring["approved"] and not validation_errors, "warnings": warnings},
        "artifacts": ARTIFACTS,
        "items": [asdict(item) for item in items],
        "workflow_roi": roi,
        "sensitivity": sensitivity_analysis(payload),
        "schema": {"required_workflow_fields": sorted(REQUIRED_WORKFLOW_FIELDS.keys()), "row_limit": 100},
        "release_hash": digest,
    }

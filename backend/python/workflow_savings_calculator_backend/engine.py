"""Backend evidence engine for Workflow Savings Calculator.

This module is intentionally dependency-free so chapters can run it in locked-down
school, nonprofit, or small-business environments. It turns structured evidence
into a backend-grade release packet that can be called from a future API, batch
job, or data pipeline.
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


def build_release_packet(payload: Mapping[str, Any]) -> dict[str, Any]:
    items = summarize_rows(payload)
    scoring = score_items(items)
    fingerprint_source = "|".join(f"{item.label}:{item.normalized_score()}:{item.evidence}:{item.approved}" for item in items)
    digest = sha256(f"{PRODUCT_SLUG}|{fingerprint_source}".encode("utf-8")).hexdigest()[:16]
    return {
        "product": {"slug": PRODUCT_SLUG, "title": PRODUCT_TITLE},
        "score": scoring,
        "artifacts": ARTIFACTS,
        "items": [asdict(item) for item in items],
        "release_hash": digest,
    }

export const domain = {
  "kind": "roi-calculator",
  "title": "Workflow Savings Calculator",
  "purpose": "A purpose-built roi calculator interface for estimate whether an automation is actually worth building before a student pod spends time on it.",
  "inputTitle": "Product-specific inputs",
  "previewTitle": "Generated working outputs",
  "tableTitle": "Workflow tasks",
  "metricLabels": [
    "Monthly Savings",
    "Payback Period",
    "Fragility Risk"
  ],
  "fields": [
    {
      "id": "organization-client",
      "label": "Organization / client",
      "type": "text",
      "sample": "BrightPath Tutoring Studio",
      "placeholder": "Enter organization / client"
    },
    {
      "id": "primary-goal",
      "label": "Primary goal",
      "type": "text",
      "sample": "automations greenlit with documented ROI",
      "placeholder": "Enter primary goal"
    },
    {
      "id": "owner-reviewer",
      "label": "Owner / reviewer",
      "type": "text",
      "sample": "Volta project lead",
      "placeholder": "Enter owner / reviewer"
    },
    {
      "id": "evidence-source",
      "label": "Evidence source",
      "type": "text",
      "sample": "Owner interview + public audit",
      "placeholder": "Enter evidence source"
    },
    {
      "id": "monthly-volume",
      "label": "Monthly volume",
      "type": "number",
      "sample": 120,
      "placeholder": "Enter monthly volume"
    },
    {
      "id": "minutes-per-item",
      "label": "Minutes per item",
      "type": "number",
      "sample": 15,
      "placeholder": "Enter minutes per item"
    },
    {
      "id": "dollar-value-cost",
      "label": "Dollar value / cost",
      "type": "number",
      "sample": 45,
      "placeholder": "Enter dollar value / cost"
    },
    {
      "id": "confidence-percent",
      "label": "Confidence percent",
      "type": "number",
      "sample": 80,
      "placeholder": "Enter confidence percent"
    }
  ],
  "rows": [
    "Manual steps listed",
    "Frequency entered",
    "Minutes per run entered",
    "Error cost estimated",
    "Build effort estimated",
    "Maintenance cost estimated",
    "Risk factors checked",
    "Recommendation generated"
  ],
  "artifacts": [
    "ROI brief",
    "Scenario CSV",
    "Build/no-build memo"
  ],
  "checks": [
    "Frequency/time/cost required",
    "High-risk workflows cannot auto-greenlight",
    "Owner approval required"
  ],
  "sampleClient": "BrightPath Tutoring Studio"
};

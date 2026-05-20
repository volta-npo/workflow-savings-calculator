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
    {"id": "portfolio-size", "label": "Portfolio size", "type": "number", "sample": 18, "placeholder": "Enter portfolio size"},
    {"id": "approval-committee", "label": "Approval committee", "type": "text", "sample": "Mentor + owner + technical lead", "placeholder": "Enter approval committee"},
    {"id": "payback-threshold", "label": "Payback threshold", "type": "number", "sample": 6, "placeholder": "Enter payback threshold months"},
    {"id": "integration-risk", "label": "Integration risk", "type": "text", "sample": "Medium: CRM export dependency", "placeholder": "Enter integration risk"},
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
    "Recommendation generated",
    "Payload schema validated",
    "Risk-adjusted ROI calculated",
    "Sensitivity analysis completed",
    "OpenAPI contract fixture passed",
    "Automation portfolio workspace provisioned",
    "Approval committee assigned",
    "Portfolio ranking dashboard generated",
    "Dependency and integration risks mapped",
    "Implementation readiness checklist completed",
    "Post-launch savings verification plan written",
    "Automation kill-switch owner assigned",
    "Quarterly ROI review scheduled",
  ],
  "artifacts": [
    "ROI brief",
    "Scenario CSV",
    "Build/no-build memo",
    "Automation portfolio dashboard",
    "Implementation readiness memo",
    "Post-launch savings verification plan",
  ],
  "checks": [
    "Frequency/time/cost required",
    "High-risk workflows cannot auto-greenlight",
    "Owner approval required",
    "High-risk automations require owner and technical approval",
    "Payback claim must include risk-adjusted scenario",
    "Post-launch verification plan required before build recommendation",
  ],
  "sampleClient": "BrightPath Tutoring Studio",
  "modules": [
    {"name": "Automation portfolio dashboard", "description": "Ranks candidate workflows by savings, payback, risk, confidence, effort, dependencies, and owner priority."},
    {"name": "Implementation readiness checklist", "description": "Confirms data access, integration stability, rollback owner, exception handling, and support burden before build."},
    {"name": "Post-launch verification planner", "description": "Defines baseline, measurement window, owner signoff, savings evidence, and recalibration workflow."},
    {"name": "Kill-switch and rollback owner", "description": "Documents who can pause automation, restore manual workflow, and notify impacted users."},
    {"name": "Committee approval workflow", "description": "Routes build/no-build decisions through mentor, owner, technical lead, and risk reviewer."},
    {"name": "Scenario comparison library", "description": "Stores low/base/high outcomes, assumptions, actuals, and lessons across automation candidates."}
  ],
  "saas": {
    "customerSegments": [
      "Student automation pods prioritizing build candidates",
      "Small businesses deciding what not to automate",
      "Nonprofits balancing labor savings and operational risk",
      "Mentors approving safe, ROI-backed automation projects"
    ],
    "pricingTiers": [
      "Free: single ROI memo and scenario CSV",
      "Portfolio: ranked automation backlog and approval workflow",
      "Ops Pro: API scoring, readiness checks, and verification plans",
      "Agency: cross-client automation portfolio analytics and white-label memos"
    ],
    "onboardingChecklist": [
      "Create automation portfolio workspace",
      "Enter manual workflow economics and risk factors",
      "Set payback threshold and approval committee",
      "Run low/base/high sensitivity analysis",
      "Assign kill-switch owner and verification plan"
    ],
    "successMetrics": [
      "Every build recommendation includes risk-adjusted ROI",
      "High-risk candidates have committee approval",
      "Post-launch verification plan exists before implementation",
      "Portfolio ranking identifies top build/no-build decisions"
    ],
    "dashboards": [
      "Automation portfolio ranking",
      "Risk-adjusted payback scenarios",
      "Implementation readiness blockers",
      "Post-launch savings verification"
    ],
    "dataModel": [
      "AutomationWorkspace",
      "WorkflowCandidate",
      "RoiScenario",
      "RiskFactor",
      "ApprovalDecision",
      "ReadinessCheck",
      "VerificationPlan",
      "PortfolioRank"
    ],
    "permissions": [
      "Owner: final business approval and kill-switch assignment",
      "Technical lead: integration risk and readiness review",
      "Mentor: ROI assumptions and certification",
      "Viewer: client-safe memo access"
    ],
    "compliance": [
      "Sensitive-data workflows require owner approval",
      "High-risk recommendations cannot auto-greenlight",
      "Request payloads must satisfy schema bounds",
      "CORS and request limits protect local API usage"
    ],
    "lifecycle": [
      "Intake",
      "Estimate",
      "Risk-adjust",
      "Compare",
      "Approve",
      "Build",
      "Verify",
      "Re-rank"
    ],
    "retentionSignals": [
      "Verification plan completed after launch",
      "Candidate re-ranked after actual savings",
      "High-risk backlog aging without decision",
      "API scoring used across multiple candidates"
    ],
    "exportChannels": [
      "ROI brief",
      "Scenario CSV",
      "Build/no-build memo",
      "Portfolio dashboard",
      "Verification plan",
      "Python API score packet"
    ],
    "playbooks": [
      "Automation intake ROI workflow",
      "Risk-adjusted recommendation review",
      "Sensitivity scenario workshop",
      "OpenAPI/CLI fixture validation"
    ],
    "automations": [
      "Payload schema validation",
      "Risk-adjusted ROI calculation",
      "Sensitivity scenario export",
      "Request size and CORS guardrails"
    ],
    "revenueModel": "Automation portfolio SaaS with ROI seats, API scoring, scenario exports, and stakeholder approvals",
    "integrationTargets": [
      "Zapier/Make intake exports",
      "Google Sheets scenario packs",
      "Python API /score",
      "OpenAPI contract docs"
    ]
  }
};

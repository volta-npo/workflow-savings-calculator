export const config = {
    "number": 32,
    "slug": "workflow-savings-calculator",
    "title": "Workflow Savings Calculator",
    "category": "AI & Automation",
    "tagline": "Estimate whether an automation is actually worth building before a student pod spends time on it.",
    "persona": "AI/ops students evaluating Zapier, Make, and custom automations.",
    "gap": "Automation projects often chase novelty instead of hours saved or errors reduced.",
    "niche": "Practical automation triage for low-budget clients.",
    "metric": "automations greenlit with documented ROI",
    "modules": [
        "Task frequency inputs",
        "Time-saved calculator",
        "Risk and fragility score",
        "Build/no-build recommendation"
    ],
    "theme": {
        "accent": "#7c3aed",
        "accent2": "#c4b5fd",
        "emoji": "\u26a1",
        "metricLabel": "Automation safety",
        "workflow": [
            "Define workflow boundary",
            "Identify data and failure risks",
            "Require human review",
            "Export safe implementation plan"
        ],
        "privacy": "No external AI calls are made. Treat customer data, credentials, payments, and public posting as high risk."
    },
    "statuses": [
        "not-started",
        "blocked",
        "in-progress",
        "ready",
        "approved"
    ],
    "criteria": [
        {
            "id": "task-frequency-inputs",
            "label": "Task frequency inputs",
            "weight": 15,
            "defaultStatus": "not-started",
            "prompt": "Implement and verify task frequency inputs with evidence that a Volta student pod, mentor, and owner can understand."
        },
        {
            "id": "time-saved-calculator",
            "label": "Time-saved calculator",
            "weight": 15,
            "defaultStatus": "not-started",
            "prompt": "Implement and verify time-saved calculator with evidence that a Volta student pod, mentor, and owner can understand."
        },
        {
            "id": "risk-and-fragility-score",
            "label": "Risk and fragility score",
            "weight": 15,
            "defaultStatus": "not-started",
            "prompt": "Implement and verify risk and fragility score with evidence that a Volta student pod, mentor, and owner can understand."
        },
        {
            "id": "build-no-build-recommendation",
            "label": "Build/no-build recommendation",
            "weight": 15,
            "defaultStatus": "not-started",
            "prompt": "Implement and verify build/no-build recommendation with evidence that a Volta student pod, mentor, and owner can understand."
        },
        {
            "id": "evidence-quality",
            "label": "Evidence quality",
            "weight": 10,
            "defaultStatus": "not-started",
            "prompt": "Attach proof, source notes, screenshots, owner confirmation, or reviewer rationale."
        },
        {
            "id": "owner-handoff",
            "label": "Owner handoff",
            "weight": 10,
            "defaultStatus": "not-started",
            "prompt": "Make the output understandable and maintainable by a nontechnical owner."
        },
        {
            "id": "mission-alignment",
            "label": "Mission alignment",
            "weight": 10,
            "defaultStatus": "not-started",
            "prompt": "Show how this advances digital equity, student growth, or pro bono delivery."
        },
        {
            "id": "qa-safety",
            "label": "QA and safety",
            "weight": 10,
            "defaultStatus": "not-started",
            "prompt": "Resolve privacy, accessibility, accuracy, and operational risks before handoff."
        }
    ],
    "templates": {
        "actions": [
            "Run a real Volta scenario for Workflow Savings Calculator and capture baseline evidence.",
            "Complete the task frequency inputs workflow with owner-safe notes.",
            "Resolve all blocked rubric items and add evidence for every ready item.",
            "Export the handoff packet and review it with a mentor before client use."
        ]
    },
    "sample": {
        "clientName": "BrightPath Tutoring Studio",
        "chapter": "El Paso",
        "studentLead": "Volta Student Lead",
        "notes": "Responsible automation project to reduce admin time without exposing student data. Workflow Savings Calculator sample.",
        "evidencePrefix": "Workflow Savings Calculator",
        "evidence": [
            "Discovery call notes captured with owner confirmation.",
            "Public digital footprint reviewed and summarized.",
            "Mentor QA comments attached before handoff."
        ]
    }
};
//# sourceMappingURL=config.js.map
# API Reference: Workflow Savings Calculator

## Static app contract

The browser app is local-first. Data is stored in the user's browser unless explicitly exported.

| Capability | File | Contract |
|---|---|---|
| Product config | `src/config.ts` | Mission, rubric, sample scenario, privacy rules. |
| Domain engine | `src/domain-core.ts` | Domain-specific calculations and generated artifacts. |
| release certification | `src/release-core.ts` | Release gates, export/import, deterministic hashes. |

## Python backend HTTP API

Base URL: `http://127.0.0.1:8787`

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Runtime health and product identity. |
| POST | `/score` | Build backend release packet from evidence rows. |

Example:

```bash
curl -s http://127.0.0.1:8787/health
curl -s -X POST http://127.0.0.1:8787/score \
  -H 'content-type: application/json' \
  -d '{"rows": []}'
```

## OpenAPI

See `openapi.yaml` for backend-enabled products.

# Deployment Guide: Workflow Savings Calculator

This repository is deployable in three supported modes.

## 1. GitHub Pages

The default public deployment is GitHub Pages. The app is static and uses local browser storage.

- URL: https://volta-npo.github.io/workflow-savings-calculator/
- Build command: `npm run build`
- Output: checked-in static assets at repository root and `src/*.js` compiled from TypeScript

## 2. Docker

```bash
make docker-build
make docker-run
```

The container serves the static app with hardened Nginx headers on port `8080`. Compose maps it to `4173`.

## 3. Backend services

### Python backend

```bash
npm run serve:python
curl http://127.0.0.1:8787/health
```

## Production checklist

- Run `make release-check`.
- Confirm no client secrets or regulated data are committed.
- Confirm GitHub Actions CI is green.
- Confirm GitHub Pages is built.
- Use exported JSON bundles for client-owned backups.

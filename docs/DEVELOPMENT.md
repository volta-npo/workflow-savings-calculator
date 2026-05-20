# Development Notes

## Source of truth

TypeScript files are the authoritative source. JavaScript, declaration, and source-map files are committed so the repository can run directly on GitHub Pages without a separate build service.

When changing source code:

1. Edit the TypeScript files.
2. Run `npm run build`.
3. Commit the generated JavaScript output in the same change.

## UI safety standard

These tools are local-first browser apps. User-entered and imported workspace data must be escaped before it is rendered into HTML. Native browser request dialogs are intentionally avoided; use inline, labeled controls instead.

## Validation

Run before publishing:

```bash
npm ci
npm test
```

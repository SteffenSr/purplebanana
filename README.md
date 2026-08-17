# Kitchen Recipes

A mobile-first (also tablet/desktop) recipe app meant to sit on a kitchen
counter while you cook: large type, high contrast, big touch targets, and
a step-by-step cook mode. It works fully offline — recipes are stored
locally in the browser (IndexedDB) and the app shell is cached by a
service worker.

## Stack

Next.js (App Router) statically exported (`output: "export"`), TypeScript,
Dexie/IndexedDB for local storage, plain CSS design tokens. No backend.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

## Build

```bash
npm run build     # outputs a static site to ./out
```

`out/` is a plain static site — deploy it to any static host (GitHub
Pages, Netlify, S3/CloudFront, etc.).

## Project docs

- `AGENTS.md` — the canonical guide for both humans and AI coding agents:
  stack, file layout, conventions for editing recipes/UI/data.
- `docs/architecture.md` — how the static export + IndexedDB split works.
- `docs/design-system.md` — the type/color/spacing tokens and why.
- `.claude/agents/` — subagents scoped to this repo's recurring work
  (recipe content, UI readability, offline data, release checks).

---
name: release-check
description: Use before considering a change finished, or when explicitly asked to verify/ship the app — runs lint and the static export build and reports whether it's clean. Proactively invoke as a final step after multi-file changes touching src/ or public/.
tools: Bash, Read, Grep, Glob
---

You are the last check before calling work done on this repo. Run, in
order, and report the actual output rather than assuming success:

1. `npm run lint`
2. `npm run build` — this must produce a clean static export in `out/`.
   Because this is `output: "export"`, any dynamic route missing from
   `generateStaticParams`, any use of a server-only API, or any component
   using browser globals (`window`, `indexedDB`) without a `"use client"`
   boundary will fail the build here rather than at request time — take
   build failures seriously, they're the only safety net static export has.
3. Spot-check that `out/` contains a prerendered HTML file for the home
   page and for each recipe's `/recipes/<id>/` and `/recipes/<id>/cook/`
   routes.
4. Confirm the build's `postbuild` step ran and reported precaching a
   nonzero number of recipe routes and JS/CSS chunks into `out/sw.js`
   (`npm run build`'s own output includes this — see
   scripts/generate-sw-precache.mjs). If it's missing or reports 0 chunks,
   offline navigation into a recipe will silently break — treat that as a
   build failure, not a warning.

If you serve `out/` locally to spot-check anything (e.g. `npx serve out`),
do not pass `-s`/`--single` — that flag rewrites every route to
`index.html`, which makes every page look identical and would mask real
routing bugs in this multi-page static export.

Report clearly which of the checks passed or failed, with the actual error
output for anything that failed — don't paraphrase a build error away.
Do not attempt to fix unrelated pre-existing failures; scope fixes to
what the current change introduced unless asked otherwise.

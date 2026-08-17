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
4. Confirm `npm run build`'s output includes a "Precached N URLs..." line
   from `scripts/generate-sw-precache.mjs` (it's chained onto the end of
   the `"build"` script with `&&`, not an npm `postbuild` hook — deployment
   hosts like Vercel often invoke `next build` directly, which silently
   skips `postbuild`/`prebuild` lifecycle hooks but still runs whatever is
   literally inside `"build"`). If that line is missing or reports 0
   chunks, offline navigation into a recipe will silently break in
   production — treat that as a build failure, not a warning. Also check
   `vercel.json` still exists and pins `buildCommand` to `npm run build` —
   removing it (or a host ignoring it) would reintroduce this exact bug
   even with the script itself unchanged.

If you serve `out/` locally to spot-check anything (e.g. `npx serve out`),
do not pass `-s`/`--single` — that flag rewrites every route to
`index.html`, which makes every page look identical and would mask real
routing bugs in this multi-page static export.

Report clearly which of the checks passed or failed, with the actual error
output for anything that failed — don't paraphrase a build error away.
Do not attempt to fix unrelated pre-existing failures; scope fixes to
what the current change introduced unless asked otherwise.

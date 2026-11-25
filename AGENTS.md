# AGENTS.md — AlignmentViewer

## What this is

A dependency-free browser widget that renders genome (or any alphabet) sequence
alignments to an HTML5 `<canvas>`. One entry point, UMD-wrapped:

```js
alignmentViewer(seqs, config).then(canvas => document.body.appendChild(canvas));
```

- `seqs` — array of **objects with a `seq` property** (e.g. `{ id, seq: 'ACTG...' }`).
  Input objects are never mutated; sequences are uppercased into a local copy.
- `config` — optional. `width` (default 1), `height` (default 1) are per-cell pixels
  (not figure size). `showChar` (default false) renders characters — slow, use with care.
  `colors` maps nucleotide → color (defaults: A `#ccff00`, C `#ffff00`, G `#ff9900`,
  T `#ff6600`, `ambig` `#ffffff`).
- The function is **async** (returns a Promise).

## Repository layout

- `index.js` — **the entire library** (UMD: AMD / CommonJS / global). No build step
  beyond minification; keep it self-contained and dependency-free.
- `dist/alignment-viewer.js` — symlink to `index.js` (used by demo/benchmark).
- `dist/alignment-viewer.min.js` — minified build, **checked in**; rebuild after edits.
- `demo/`, `benchmark/` — standalone HTML pages that load the symlinked build.
- `package.json`, `package-lock.json` — build tooling only. The npm package contains only
  `index.js`, `dist/alignment-viewer.min.js` and docs (the `files` list in `package.json`).
  There is deliberately no `exports` map, because downstream code imports
  `dist/alignment-viewer.min.js` directly.

## Commands

- Install: `npm install`
- Build: `npm run build` — cleans `dist/*.min.js`, then `uglify-js` → `dist/alignment-viewer.min.js`.
  Run this after changing `index.js`.
- Serve locally: `npm start` — `http-server`; open `/demo/` and `/benchmark/`.
- Tests: `npm test` — `vitest run` (config in `vitest.config.mjs`, single suite in `index.test.js`).
  The library is browser-only, so the suite stubs `document`/canvas with an in-memory 2D-context recorder; no new dependencies.
- Lint: `npm run lint` (flat config in `eslint.config.mjs`).
- CI: `.github/workflows/ci.yml` runs lint, tests and a check that the checked-in
  `dist/alignment-viewer.min.js` matches a fresh build.

## Conventions & gotchas

- Cells and canvas both use `Math.ceil(width)`/`Math.ceil(height)`; canvas size is
  `longest * ceil(width)` by `n * ceil(height)`.
- The promise rejects when the canvas is unusable (exceeds browser limits). Large
  canvases are checked with a one-pixel readback; small ones are not.
- Browser-only (`document`, Canvas 2D). Do not add Node-only APIs.
- `demo/` and `benchmark/` use `dist/alignment-viewer.js` (the symlink) — edit
  `index.js`, never the symlink or the minified file directly.
- Fix the README when touching the public API.
- License: Apache-2.0 / CC0 for US government work. Public contributions: see
  [CONTRIBUTING.md](CONTRIBUTING.md) (PRs require ≥7 days review + majority +1).

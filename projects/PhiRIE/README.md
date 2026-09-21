# PhiRIE project page

Live page: https://runyiyang.github.io/projects/PhiRIE/

This folder includes the deployable page and the complete editable source in
[`_source/`](./_source/). It contains three interactive WebGPU experiences,
45 visualization views, six recorded videos, three paper figures, the manuscript
snapshot, 3D assets, self-hosted fonts, browser tests, and asset provenance.

## Edit and rebuild

Use Node.js 22. From the repository root:

```bash
cd projects/PhiRIE/_source
npm ci
npm run dev
# Open http://127.0.0.1:5173/projects/PhiRIE/
```

Before committing changes, regenerate the published files:

```bash
npm run publish:pages
npm run format:check
```

The build is copied into `projects/PhiRIE/`; `_source/` is retained in Git for
editing. `build-manifest.json` records the generated files and SHA-256 checksums.
Commit the source and regenerated files together on the existing `master` branch.
The repository's existing GitHub Pages deployment serves the built page directly.

## Preview the exact published folder

From the repository root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
# Open http://127.0.0.1:4173/projects/PhiRIE/
```

WebGPU requires HTTPS or localhost and a supported browser/adapter. The page
shows recorded alternatives when WebGPU is unavailable. Read
[`_source/README.md`](./_source/README.md) for demo scope, data provenance, asset
reproduction, and browser verification. These demonstrations retain the original
GT-assisted scene construction, approximate collision geometry, and scripted
robot replay limitations.

## Source origin

Copied from `RunyiYang/PhiRIE`, `website/`, commit
`f41a2e8c2a9f396ea34128264a805430eac5c22f`, then adapted for this subdirectory.
Research asset bytes and their provenance checksums are unchanged.

## Validation for this migration

On 2026-09-21, all 12 browser checks passed against the actual published folder
at `/projects/PhiRIE/`, with no browser errors or detected axe WCAG A/AA
violations. Checks cover all three WebGPU interactions, six videos, media links,
gallery and comparison controls, mobile layout, and unavailable-WebGPU behavior.
The adapter was Chromium SwiftShader (software WebGPU); hardware performance and
other browser engines were not measured. See [validation.json](./validation.json).

All 61 research asset checksums match the provenance manifest in both the source
and published copy. All 79 generated files match `build-manifest.json`.
The production build and formatting checks passed; npm audit found zero known
vulnerabilities at build time.

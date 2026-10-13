# Develop and release Cat Compass

Use Node.js 22 or later. Clone the repository and run `npm ci`.

## Commands

| Command | Result |
|---|---|
| `npm run dev` | Vite on `0.0.0.0:5195`, with strict port checking |
| `npm run build` | Type check, web build and offline service worker |
| `npm run preview` | Production preview on `0.0.0.0:5197` |
| `npm run desktop` | Build and launch Electron |
| `npm run desktop:dev` | Launch Electron against the running dev server |
| `npm run desktop:dist` | Current-platform installer |
| `npm run check` | Unit tests, build and browser checks |
| `npm run test:desktop` | Real Electron check with isolated records |
| `npm run downloads` | Optional local installer server on strict port `5198` |

Use the Tailscale IP of your own machine when browsing from another device. Do not expose development through Funnel. Secure phone installation needs HTTPS.

## Code map

| Path | Responsibility |
|---|---|
| `src/feeding.ts` | Input validation and energy/portion calculations |
| `src/profile.ts` | Profile defaults, migration and storage |
| `src/care.ts` | Care records, backup parsing and storage |
| `src/calendar.ts` | RFC 5545 export and UTF-8 line folding |
| `src/transfer.ts` | Authenticated snapshot transfer |
| `src/guides.ts`, `src/sources.ts` | Original summaries and source records |
| `src/components/` | Forms, library, records and original art |
| `desktop/` | Sandboxed Electron shell and native schedule |
| `tests/` | Browser and offline checks |
| `evidence/` | Public source ledger and inspection boundaries |

Follow [DESIGN.md](../DESIGN.md). Original icon assets can be regenerated with `scripts/generate-icons.py`; Pillow is required only for that edit step.

## Verification

Install Chromium once:

```bash
npx playwright install chromium
npm run check
npm run test:desktop
```

Set `OPENCODE_TEMP_DIR` to an existing approved temporary directory when running inside OpenCode. Other environments use the OS temporary directory. `CAT_COMPASS_EXECUTABLE` can select a packaged executable for the desktop check.

CI runs the unit tests, type check, production build, desktop/phone-sized Chromium checks and production offline checks. macOS desktop smoke checks use an isolated data folder. Do not run test cases against real owner records.

The recorded local baseline is 61 unit tests and 24 browser tests. A successful package build does not prove audible notification delivery, clinical correctness or runtime behaviour on another OS.

## Releases

1. Update the package version, lockfile and changelog together.
2. Update source records and user documentation when behaviour changes.
3. Run the quality gate. Build and drive the packaged Apple Silicon app.
4. Commit the release source. Create an annotated `v<version>` tag on that commit.
5. Push the tag. The desktop workflow builds Apple Silicon, Intel Mac, Windows x64 and Linux x64 packages.
6. Keep the GitHub Release in draft until all expected assets and `SHA256SUMS.txt` are present.
7. Check file names, hashes and platform limits. Publish the release only after those checks.

The workflow does not use signing secrets by default. Public desktop releases remain unsigned until the project supplies a documented signing and notarization process. No automatic desktop updater is configured.

GitHub Pages deploys the HTTPS companion from `main` after verification. Download links point to GitHub Releases. The companion stores records in the browser; GitHub does not receive a normal profile upload from the app.

## Dependency audit

Run `npm audit --omit=dev` for runtime dependencies. Also review the full audit. The recorded full audit has eight moderate advisories in packaging dependencies. Do not downgrade packages or apply broad overrides merely to make an audit count zero. Verify compatibility and the affected path.

## Source evidence

Keep public citations and short excerpts in `evidence/veterinary-research.json`. Raw third-party application artifacts and full REA output remain local and ignored by git. Do not ship account data, API tokens or captured private sessions.

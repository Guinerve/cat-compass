# Develop Cat Compass

Use Node.js 22 or later. Clone the repository and run `npm ci`.

## Commands

| Command | Result |
|---|---|
| `npm run dev` | Vite on `0.0.0.0:5195`. It stops if the port is in use. |
| `npm run build` | Type check, web build and offline service worker |
| `npm run preview` | Production preview on `0.0.0.0:5197` |
| `npm run desktop` | Build, then open the Electron app |
| `npm run desktop:dev` | Open Electron against the running dev server |
| `npm run desktop:dist` | Build an installer for the current platform |
| `npm run check` | Unit tests, build and browser tests |
| `npm run test:desktop` | Drive the real Electron app with test records |
| `npm run downloads` | Optional local installer server on port `5198` |

The dev and preview servers listen on all interfaces, so other devices on your network can open them. A phone can only install the web app over HTTPS.

## Code map

| Path | What it holds |
|---|---|
| `src/feeding.ts` | Input checks and the energy and portion maths |
| `src/profile.ts` | Profile defaults, migration and storage |
| `src/care.ts` | Care records, backup parsing and storage |
| `src/calendar.ts` | RFC 5545 calendar export and UTF-8 line folding |
| `src/transfer.ts` | Encrypted snapshot transfer |
| `src/guides.ts`, `src/sources.ts` | Guide text and source records |
| `src/components/` | Forms, library, records and the cat artwork |
| `desktop/` | Sandboxed Electron shell and the saved reminder schedule |
| `tests/` | Browser and offline tests |
| `evidence/` | Source ledger and release evidence |

Follow [DESIGN.md](../DESIGN.md) for interface changes. `scripts/generate-icons.py` rebuilds the app icons. It needs Pillow.

## Tests

Install Chromium once, then run the checks:

```bash
npx playwright install chromium
npm run check
npm run test:desktop
```

The desktop check uses a new temporary data folder each time. Set `CAT_COMPASS_EXECUTABLE` to test a packaged app instead of the source tree. Never run tests against real owner records.

CI runs the unit tests, type check, production build and the browser tests at desktop and phone width. It also reloads the production build offline. The current count is 61 unit tests and 26 browser tests. A passing build does not prove that alerts make a sound, that the care content is clinically right or that the app runs on another platform.

## Releases

The Desktop release workflow builds Apple Silicon, Intel Mac, Windows x64 and Linux x64 packages from a `v<version>` tag. It uploads them to a draft GitHub Release with `SHA256SUMS.txt`. It refuses to replace files on a release that is already published. The builds are unsigned, and there is no automatic updater.

GitHub Pages deploys the web app from `main` after the tests pass. The web app keeps records in the browser. It does not upload profiles to GitHub.

## Dependency audit

Run `npm audit --omit=dev` for runtime packages, and review the full `npm audit` too. The full audit lists 8 moderate advisories in the desktop packaging tools. Do not downgrade packages or add broad overrides just to reach zero. Check the affected path first.

## Source evidence

Keep citations and short excerpts in `evidence/veterinary-research.json`. Do not commit raw captures of other websites, account data or tokens.

# Contribute to Cat Compass

Start with an issue for a large change. Describe the owner task, expected result and evidence needed. Keep small fixes in a focused pull request.

## Set up

```bash
npm ci
npx playwright install chromium
npm run dev
```

Use Node.js 22 or later. See [Development](docs/development.md) for commands and module boundaries. Follow [DESIGN.md](DESIGN.md) for interface changes.

## Code changes

- Validate storage, file and form data at the boundary. Treat parsed JSON as unknown until checked.
- Keep invalid feeding inputs editable. Do not replace a rejected plan with silent maintenance defaults.
- Preserve local records. Get explicit confirmation before removal or import replacement.
- Keep the Electron renderer sandboxed. Do not expand the preload API without a specific owner task and security review.
- Keep the browser app free of analytics and remote fonts.
- Add a regression test for the public behaviour that changed.

Run `npm run check` before submitting. For desktop changes, also run `npm run test:desktop`. State what you did not test. Never use real owner records in a fixture or screenshot.

## Health content

A named organisation alone is not a citation. Include the exact URL, source title, publisher, version/read date, section or page, supported claim and limits. Read the source body. Do not use a search snippet as proof.

Keep observations separate from app assumptions and unresolved points. A source check is not clinical approval. Do not add diagnosis, dosing or exact treatment schedules without a defined clinical review process. Preserve Australian/local product and legal limits.

Update `src/sources.ts`, the relevant content and the source coverage tests together. Use short excerpts and original summaries. Do not republish articles, photographs or application code.

## Pull request checklist

- [ ] The change solves a named owner task or documented defect.
- [ ] Tests and the type check pass.
- [ ] Screenshots show the changed screen at desktop and phone width, where relevant.
- [ ] Keyboard focus and labels remain usable.
- [ ] Storage migration and backup compatibility were checked.
- [ ] Clinical/source limits remain visible.
- [ ] Documentation and changelog match the behaviour.
- [ ] No tokens, private records or raw captures of other sites are included.

Submitting code permits its use under the repository's MIT licence. Linked source material keeps its own rights. Follow the [community rules](CODE_OF_CONDUCT.md).

# Changelog

Changes are grouped by release. Clinical source checks are not veterinary approval.

## 0.2.0 — 2026-10-13

### Added

- Local desktop packages and an offline-capable HTTPS web app.
- A new care dashboard, original cat art and responsive navigation.
- Separate profiles, vet contacts and microchip details.
- Weight history, vet-visit notes and persistent checklists.
- Native desktop reminder scheduling and `.ics` phone calendar export.
- Password-protected profile/reminder QR transfer and strict full-backup import.
- 15 original care guides and 31 traceable source records.
- A printable care handover and public installation, privacy and support guides.
- GitHub release builds, checksums, CI and Pages deployment.

### Corrected

- Feeding now rejects invalid or missing active-food energy, fractional meals and unconfirmed example profiles.
- Treat calories are included in the daily total, not added on top.
- Special health states require a vet-set target. Weight loss no longer silently falls back to maintenance.
- Weight loss requires a vet-agreed target and has no duration forecast.
- Breathing trouble and suspected permethrin exposure no longer suggest waiting.
- F3 guidance distinguishes FPV from risk-dependent FHV/FCV revaccination.
- Parasite advice no longer treats a region as automatically tick-free.
- Source links and breed notes now preserve exact evidence and limits.
- First-visit care records now retain their profile owner across reloads.

### Release limits

Unsigned desktop builds. No notarization, clinical approval or automatic two-way sync. Real phone alerts and non-Apple-Silicon runtime checks remain open. The exact ACT 1 July 2022 birthday boundary remains unresolved.

## 0.1.0 — 2026-10-13

Initial browser care-plan prototype, feeding maths, routine and safety panels, multi-cat storage and printable sheet. Subsequent source checks removed unsupported claims. No desktop release was published for this version.

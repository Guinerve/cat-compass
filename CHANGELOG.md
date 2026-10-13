# Changelog

Changes are grouped by release. Clinical source checks are not veterinary approval.

## Unreleased

- A removed cat now stays removed after a reload. Before this fix, it came back.
- Dark mode follows the system setting. Small text is now at least 12 px.
- App text and documents use plain English without dashes.

## 0.2.0 (13 October 2026)

### Added

- Local desktop packages and an HTTPS web app that works offline.
- A new care dashboard, original cat art and responsive navigation.
- Separate profiles, vet contacts and microchip details.
- Weight history, vet visit notes and checklists that persist.
- Native desktop reminder scheduling and `.ics` phone calendar export.
- A QR transfer for one profile and its reminders, protected by a password, and strict import of full backups.
- 15 original care guides and 31 traceable source records.
- A printable care handover and public installation, privacy and support guides.
- GitHub release builds, checksums, CI and Pages deployment.

### Corrected

- Feeding now rejects invalid or missing energy values for the food in use, fractional meals and unconfirmed example profiles.
- Treat calories are included in the daily total, not added on top.
- Special health states require a target set by the vet. Weight loss no longer silently falls back to maintenance.
- Weight loss requires a vet-agreed target and has no duration forecast.
- Breathing trouble and suspected permethrin exposure no longer suggest waiting.
- F3 guidance separates FPV from FHV/FCV revaccination, which depends on risk.
- Parasite advice no longer treats any region as free of ticks.
- Source links and breed notes now preserve exact evidence and limits.
- Care records made on the first visit now keep their profile after a reload.

### Release limits

Unsigned desktop builds. No notarisation, clinical approval or automatic sync. Real phone alerts and runtime checks on platforms other than Apple Silicon remain open. The exact ACT 1 July 2022 birthday boundary remains unresolved.

## 0.1.0 (13 October 2026)

First browser prototype of the care plan, with feeding maths, routine and safety panels, storage for several cats and a printable sheet. Subsequent source checks removed unsupported claims. No desktop release was published for this version.

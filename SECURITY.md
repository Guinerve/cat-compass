# Security policy

Cat Compass handles owner-entered pet records, local backups, calendar exports and encrypted snapshot links. No account server or live-sync service is included.

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/Guinerve/cat-compass/security/advisories/new). Do not publish an exploit with real records, transfer passwords or private links in a public issue.

Include the version, platform, affected feature, reproducible steps, expected boundary and impact. Use synthetic records. State whether the finding concerns the app, a build dependency, the hosting platform or an imported file.

No response time, bug bounty or commercial support SLA is promised. For active pet-health emergencies, contact a veterinarian, not this reporting channel.

## Supported releases

Only the latest early-access release receives fixes. There is no long-term-support branch. Export a backup before updating. Desktop updates are manual.

## Current boundaries

- Desktop builds are unsigned and not notarized. SHA-256 checksums detect a changed file, not a trusted publisher.
- The Electron renderer uses context isolation, sandboxing and disabled Node integration. The preload bridge only accepts a validated reminder schedule.
- Profiles and full JSON backups are not encrypted at rest by Cat Compass. Use OS account and disk protection.
- QR transfers use AES-256-GCM and PBKDF2-SHA-256. A trusted host can still access page fragments. Expiry uses the receiving device's clock. There is no remote revocation service.
- Calendar exports can reveal a cat's name and care tasks. They are static copies controlled by the receiving calendar.
- The full dependency audit includes known moderate packaging-tool advisories. A passing runtime audit does not mean the complete toolchain has no risk.

Do not add analytics, remote code, a broader preload bridge or cloud uploads without documenting the new data flow and threat boundary.

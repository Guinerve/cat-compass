# Privacy and data handling

Cat Compass stores records locally by default. It does not require an account, include analytics or send a normal profile upload to an application server.

## What is stored

Profiles contain names, ages, weights, health notes, vet contacts and optional microchip numbers. Care records contain reminders, journal entries and checklist progress.

The web app uses browser local storage. The desktop app uses its local browser profile. Native reminder scheduling also writes a local `reminder-schedule.json`. OS account and disk protection apply; Cat Compass does not encrypt these records at rest.

## What leaves the device

You choose to export a backup, care sheet or calendar file, or create a transfer link. Full backups and printed sheets are not encrypted. A calendar provider receives events when you import them into its service.

A QR transfer contains an encrypted snapshot in a URL fragment. The password is entered separately. Browser history, bookmarks or clipboard services may retain copies. The receiving app reads the fragment. Code from the trusted host can also read it. This is not a live sync connection.

External source links open the publisher's site. The publisher controls its own privacy practices. The app sends no referral details through those links.

## Hosting and GitHub

GitHub hosts source, downloads and the web companion. Normal page and file requests reach GitHub infrastructure. This app policy does not replace [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

Public GitHub issues and discussions are public. Do not attach real records, full backups, private transfer links or passwords. Replace names and identifying details with examples.

## Remove or move records

Export a backup before clearing storage, changing browsers or reinstalling. Import is replacement, not a merge. Clearing browser site data removes the web records. Removing a desktop app may leave its local data folder behind.

Cat removal deletes related app records after confirmation. It does not remove copies already exported, calendar events or files on another device. You must remove those copies separately.

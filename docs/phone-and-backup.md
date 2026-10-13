# Use your phone and keep a backup

Cat Compass does not provide automatic two-way sync. Calendar exports, QR transfers and backup imports create copies.

## Calendar reminders

1. Set a task and date in **Reminders**. Use vet-agreed dates or product-label intervals for health care.
2. Select **Export all to calendar**.
3. Import the `.ics` file into a calendar account shared with your phone.
4. Check the imported times and enable calendar alerts.

Apple Calendar can import the file. Google Calendar imports files through its web interface. Alert delivery belongs to the calendar, not Cat Compass.

Repeating events use a fixed UTC time. Local time can shift after daylight saving. Calendar copies do not change when you edit or delete an app reminder. Remove old calendar events before importing replacements to avoid duplicates.

## Install the web app

Open [Cat Compass over HTTPS](https://guinerve.github.io/cat-compass/).

- On Chrome or Edge, use the browser's install control.
- On iPhone, use Safari's **Share → Add to Home Screen**.

Complete one online load before testing offline use. External source pages still need a connection. Browser records are separate from desktop records. Ordinary HTTP development URLs do not support phone PWA installation.

Phone-sized Chromium tests cover layout and transfer. Real iOS/Android installation and alert delivery remain unverified.

## Transfer one profile

1. Export a full backup on the receiving device before replacing its records.
2. On the sending device, open **Phone & backup**.
3. Choose the trusted Cat Compass HTTPS address.
4. Use a separate transfer password of at least 12 characters.
5. Create the private transfer and scan the QR code on the phone.
6. Send the password separately. Enter it on the phone.
7. Confirm replacement of local records.

The small transfer contains the selected cat's profile and reminders. Journal and checklist records are excluded. Use a full backup for those records. If the transfer is too large for a QR code, copy its link.

Transfers use AES-256-GCM and PBKDF2-SHA-256 with 210,000 iterations. Salt and IV are random. The encrypted snapshot expires after 24 hours according to the receiving device's clock. There is no remote revocation service.

The encrypted payload is in the URL fragment, not a normal server request. The password is not in the link. Code served by the trusted host can still access fragments. Do not use an unknown mirror or put a private link in a public issue.

## Full backup

Select **Export full backup** to save every profile, reminder, journal entry and checklist. The JSON file is **not encrypted**. Store it privately.

Import validates the file before asking you to replace local records. It is not a merge. File size is limited to 5 MB. Keep the original file until you confirm the restored records.

Storage failures show a warning. Keep a backup before closing the app when you see one. Clearing site data or using a different browser does not move old records automatically.

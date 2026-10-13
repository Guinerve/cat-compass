# Install Cat Compass

Download the app from [GitHub Releases](https://github.com/Guinerve/cat-compass/releases/latest). Choose the file that matches your computer. Releases include a SHA-256 checksum file.

## macOS

1. Open **Apple menu → About This Mac**. If it lists an Apple chip, choose `mac-arm64`. If it lists Intel, choose `mac-x64`.
2. Download the DMG from the release page.
3. Check the download hash against `SHA256SUMS.txt`.
4. Open the DMG. Move Cat Compass to Applications.
5. Open the app only if you trust this unsigned build.

The app is not signed or notarised. macOS may block it. Review the release and publisher before you use any system approval control. Do not disable Gatekeeper, remove quarantine flags or turn off malware protection.

Closing the window hides the app. It continues to check reminders. Use the tray menu or **Quit Cat Compass** to stop it. System settings control notifications. No alerts are promised while the computer is asleep or the app is quit.

## Windows

Choose the `win-x64.exe` installer only after it appears in the release. Run it and choose an install location. The installer is unsigned, so Windows may warn about an unknown publisher. Do not disable protection to install it.

The package build is automated. A real Windows runtime check has not yet been completed.

## Linux

Choose the `linux-x64.AppImage` only after it appears in the release. Set that file's execute permission, then open it:

```bash
chmod +x Cat-Compass-0.2.0-linux-x64.AppImage
./Cat-Compass-0.2.0-linux-x64.AppImage
```

AppImage support varies by distribution. Do not run the app as root or disable Electron's sandbox. The package build is automated; a real Linux runtime check remains open.

## Verify a download

On macOS:

```bash
shasum -a 256 Cat-Compass-0.2.0-mac-arm64.dmg
```

On Linux:

```bash
sha256sum Cat-Compass-0.2.0-linux-x64.AppImage
```

In Windows PowerShell:

```powershell
Get-FileHash .\Cat-Compass-0.2.0-win-x64.exe -Algorithm SHA256
```

Compare the complete value with the release's `SHA256SUMS.txt`. A hash checks integrity, not publisher identity. Stop if the values differ.

## Update or remove the app

Export a full backup before an update. Download the new installer from GitHub and replace the app. Automatic desktop updates are not included.

Removing the desktop app does not necessarily remove its local records. Export what you need first. Clearing browser site data deletes the web app's local records. Desktop and browser records are separate.

For setup, continue to [Getting started](getting-started.md).

import type { Reminder } from "./care";
import type { CatProfile } from "./profile";

const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
// RFC 5545 folds content lines at 75 octets, not 75 JavaScript characters.
export function foldLine(line: string): string {
  const rows: string[] = []; let row = "", bytes = 0;
  for (const ch of line) {
    const size = new TextEncoder().encode(ch).length;
    if (bytes + size > 75) { rows.push(row); row = " "; bytes = 1; }
    row += ch; bytes += size;
  }
  rows.push(row); return rows.join("\r\n");
}
export function calendarExport(reminders: Reminder[], cats: CatProfile[], now = new Date()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cat Compass//Care reminders//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Cat Compass"];
  for (const r of reminders.filter(r => r.enabled)) {
    const cat = cats.find(c => c.id === r.catId);
    lines.push("BEGIN:VEVENT", `UID:${encodeURIComponent(r.id)}@cat-compass.local`, `DTSTAMP:${stamp(now.toISOString())}`, `DTSTART:${stamp(r.due)}`, `DURATION:PT15M`, `SUMMARY:${escape(`${cat?.name || "Cat"}: ${r.title}`)}`, "DESCRIPTION:Care reminder. Follow your vet's instructions. This is not a prescription.");
    if (r.repeat !== "none") lines.push(`RRULE:FREQ=${r.repeat === "daily" ? "DAILY" : "WEEKLY"}`);
    lines.push("BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", `DESCRIPTION:${escape(r.title)}`, "END:VALARM", "END:VEVENT");
  }
  lines.push("END:VCALENDAR"); return lines.map(foldLine).join("\r\n") + "\r\n";
}

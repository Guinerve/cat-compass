import { describe, it, expect, beforeEach } from "vitest";
import { completeReminder, emptyCare, loadCare, makeBackup, parseBackup, parseCare, saveCare, type Reminder } from "./care";
import { newCat, sanitize } from "./profile";
import { calendarExport, foldLine } from "./calendar";
import { companionUrl, openTransfer, sealTransfer } from "./transfer";
import { sources, getSource } from "./sources";
import { guides } from "./guides";
import { healthSchedule } from "./health";
import redflags from "./content/redflags.json";
import breeds from "./content/breeds.json";
const reminder: Reminder = { id: "task-1", catId: "cat-1", title: "Weigh-in", due: "2026-10-14T08:00:00.000Z", repeat: "weekly", enabled: true };
beforeEach(() => { const data = new Map<string,string>(); Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string,v: string) => data.set(k,v), removeItem: (k: string) => data.delete(k) } }); });
describe("care records and backups", () => {
  it("round trips all owned data", () => {
    const cat = { ...newCat(), id: "cat-1" }; const care = { ...emptyCare(), reminders: [reminder], journal: [{ id: "j-1", catId: cat.id, kind: "weight" as const, date: "2026-10-13", weightKg: 4.2, text: "Comfortable" }], checks: { [cat.id]: ["new:1"] } };
    expect(parseBackup(JSON.parse(JSON.stringify(makeBackup([cat], care)))).care).toEqual(care);
    expect(saveCare(care)).toBe(true); expect(loadCare().care).toEqual(care);
  });
  it("rejects missing, wrong-version, duplicate and orphan data", () => {
    const cat = newCat(); const backup = makeBackup([cat], emptyCare());
    expect(() => parseBackup({ ...backup, version: 1 })).toThrow();
    expect(() => parseBackup({ ...backup, cats: [{ ...cat, activity: "wild" }] })).toThrow(/activity/);
    expect(() => parseBackup({ ...backup, cats: [cat,cat] })).toThrow(/Duplicate/);
    expect(() => parseBackup({ ...backup, care: { ...emptyCare(), reminders: [reminder] } })).toThrow(/missing cat/);
    expect(() => parseBackup({ ...backup, cats: [{ ...cat, weightKg: "4" }] })).toThrow(/weightKg/);
  });
  it("validates native-looking dates, finite weights and unique records", () => {
    expect(() => parseCare({ ...emptyCare(), reminders: [{ ...reminder, due: "tomorrow" }] })).toThrow();
    expect(() => parseCare({ ...emptyCare(), reminders: [{ ...reminder, due: "2026-02-30T08:00:00.000Z" }] })).toThrow();
    expect(() => parseCare({ ...emptyCare(), reminders: [reminder,reminder] })).toThrow(/Duplicate/);
    expect(() => parseCare({ ...emptyCare(), journal: [{ id: "j", catId: "cat", date: "2026-10-13", kind: "weight", text: "", weightKg: NaN }] })).toThrow(/weight/);
  });
  it("keeps unreadable records without overwriting them", () => {
    localStorage.setItem("cat-compass:care:v2", "bad"); expect(loadCare().problem).not.toBeNull(); expect(localStorage.getItem("cat-compass:care:v2")).toBe("bad"); expect(localStorage.getItem("cat-compass:care:v2:unreadable")).toBe("bad");
  });
  it("advances recurring reminders past now; completes a one-time reminder", () => {
    expect(completeReminder(reminder, new Date("2026-10-29T08:00:00Z")).due).toBe("2026-11-04T08:00:00.000Z");
    expect(completeReminder({ ...reminder, repeat: "none" }).enabled).toBe(false);
  });
  it("migrates invalid persisted enum fields without breaking the UI", () => expect(sanitize({ activity: "wild", sex: "unknown", reproductiveState: "other" })?.activity).toBe("normal"));
  it("does not preserve food confirmation when persisted energy is corrupt", () => expect(sanitize({ foodConfirmed: true, dryKcalPerKg: "bad", wetKcalPerCan: 80, wetCanGrams: 85 })?.foodConfirmed).toBe(false));
});
describe("phone calendar", () => {
  it("includes stable UIDs, UTC times, repeats and alarms; excludes disabled tasks", () => {
    const cal = calendarExport([reminder, { ...reminder, id: "off", enabled: false }], [{ ...newCat(), id: "cat-1", name: "Miso" }]);
    expect(cal).toContain("UID:task-1@cat-compass.local\r\n"); expect(cal).toContain("DTSTART:20261014T080000Z"); expect(cal).toContain("RRULE:FREQ=WEEKLY"); expect(cal).toContain("TRIGGER:-PT10M"); expect(cal).toContain("SUMMARY:Miso: Weigh-in"); expect(cal).not.toContain("UID:off");
  });
  it("escapes line injection and folds Unicode by octets", () => {
    const cal = calendarExport([{ ...reminder, title: "food,play;\nEND:VEVENT" }], [newCat()]); expect(cal).toContain("food\\,play\\;\\nEND:VEVENT");
    for (const line of foldLine("SUMMARY:" + "猫".repeat(100)).split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(foldLine("SUMMARY:" + "猫".repeat(100)).replace(/\r\n /g, "")).toBe("SUMMARY:" + "猫".repeat(100));
  });
});
describe("private transfer", () => {
  it("encrypts, authenticates, expires and restores a strict backup", async () => {
    const backup = makeBackup([newCat()], emptyCare()), password = "a-long-private-password", now = Date.now();
    const sealed = await sealTransfer(backup,password,now); expect(sealed).not.toContain("My cat"); expect(await openTransfer(sealed,password,now)).toEqual(backup);
    await expect(openTransfer(sealed,"wrong-password",now)).rejects.toThrow(/could not/); await expect(openTransfer(sealed,password,now + 86400001)).rejects.toThrow(/expire/);
    await expect(openTransfer(sealed.slice(0,-4) + "AAAA",password,now)).rejects.toThrow();
  });
  it("accepts only trusted HTTPS URLs without credentials", () => {
    expect(companionUrl("https://example.com/cats/#old").toString()).toBe("https://example.com/cats/");
    expect(() => companionUrl("http://example.com")).toThrow(); expect(() => companionUrl("https://name:pass@example.com")).toThrow(); expect(() => companionUrl("javascript:alert(1)")).toThrow();
  });
});
describe("traceable source coverage", () => {
  it("has exact HTTPS pages and read dates for every displayed reference", () => {
    expect(new Set(sources.map(s => s.id)).size).toBe(sources.length);
    for (const s of sources) { expect(s.url).toMatch(/^https:\/\//); expect(s.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(s.limits.length).toBeGreaterThan(20); }
    for (const guide of guides) for (const id of guide.sources) expect(getSource(id), id).toBeDefined();
    for (const flag of redflags) expect(getSource(flag.sourceId), flag.id).toBeDefined();
    for (const breed of breeds) for (const id of breed.sourceIds) expect(getSource(id), breed.id).toBeDefined();
    for (const item of healthSchedule({ ageMonths: 36, lifestyle: "outdoor", region: "act" })) expect(getSource(item.sourceId), item.title).toBeDefined();
  });
});

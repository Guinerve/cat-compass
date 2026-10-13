import { sanitize, type CatProfile } from "./profile";

export type Repeat = "none" | "daily" | "weekly";
export interface Reminder { id: string; catId: string; title: string; due: string; repeat: Repeat; enabled: boolean }
export interface JournalEntry { id: string; catId: string; date: string; kind: "weight" | "note" | "vet"; weightKg: number | null; text: string }
export interface CareData { reminders: Reminder[]; journal: JournalEntry[]; checks: Record<string, string[]> }
export interface Backup { version: 2; exportedAt: string; cats: CatProfile[]; care: CareData }
export const emptyCare = (): CareData => ({ reminders: [], journal: [], checks: {} });
const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max = 5000): v is string => typeof v === "string" && v.length <= max;
const date = (v: unknown): v is string => text(v, 40) && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;

export function parseCare(raw: unknown): CareData {
  if (!record(raw) || !Array.isArray(raw.reminders) || !Array.isArray(raw.journal) || !record(raw.checks)) throw new Error("Care records have an invalid format.");
  if (raw.reminders.length > 1000 || raw.journal.length > 10000 || Object.keys(raw.checks).length > 100) throw new Error("Too many care records.");
  const reminders = raw.reminders.map((r): Reminder => {
    if (!record(r) || !text(r.id, 100) || !r.id || !text(r.catId, 100) || !text(r.title, 200) || !r.title.trim() || !date(r.due) || !["none", "daily", "weekly"].includes(String(r.repeat)) || typeof r.enabled !== "boolean") throw new Error("A reminder is invalid.");
    return { id: r.id, catId: r.catId, title: r.title, due: r.due, repeat: r.repeat as Repeat, enabled: r.enabled };
  });
  const journal = raw.journal.map((r): JournalEntry => {
    if (!record(r) || !text(r.id, 100) || !r.id || !text(r.catId, 100) || !text(r.date, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || !Number.isFinite(Date.parse(r.date)) || new Date(r.date).toISOString().slice(0, 10) !== r.date || !["weight", "note", "vet"].includes(String(r.kind)) || !text(r.text)) throw new Error("A journal entry is invalid.");
    if (r.kind === "weight" ? typeof r.weightKg !== "number" || !Number.isFinite(r.weightKg) || r.weightKg < 0.3 || r.weightKg > 15 : r.weightKg !== null) throw new Error("A recorded weight is invalid.");
    return { id: r.id, catId: r.catId, date: r.date, kind: r.kind as JournalEntry["kind"], weightKg: r.weightKg as number | null, text: r.text };
  });
  for (const items of [reminders, journal]) if (new Set(items.map(i => i.id)).size !== items.length) throw new Error("Duplicate record IDs.");
  const checks: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw.checks)) {
    if (["__proto__", "constructor", "prototype"].includes(key) || key.length > 100 || !Array.isArray(value) || value.length > 100 || !value.every(x => text(x, 100))) throw new Error("A checklist is invalid.");
    checks[key] = value;
  }
  return { reminders, journal, checks };
}

export function loadCare(): { care: CareData; problem: string | null } {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("cat-compass:care:v2");
    return { care: raw ? parseCare(JSON.parse(raw)) : emptyCare(), problem: null };
  } catch {
    if (raw) { try { localStorage.setItem("cat-compass:care:v2:unreadable", raw); } catch { /* Keep original key. */ } }
    return { care: emptyCare(), problem: "Care records could not be loaded. Existing data is kept. Export a backup before editing." };
  }
}
export function saveCare(care: CareData): boolean {
  try { localStorage.setItem("cat-compass:care:v2", JSON.stringify(care)); return true; } catch { return false; }
}
export function makeBackup(cats: CatProfile[], care: CareData): Backup { return { version: 2, exportedAt: new Date().toISOString(), cats, care }; }
export function parseBackup(raw: unknown): Backup {
  if (!record(raw) || raw.version !== 2 || !date(raw.exportedAt) || !Array.isArray(raw.cats) || !raw.cats.length || raw.cats.length > 50) throw new Error("Use a Cat Compass version 2 backup (1 to 50 cats).");
  const cats = raw.cats.map(c => {
    if (!record(c) || !text(c.id, 100) || !c.id) throw new Error("A cat profile is invalid.");
    const profile = sanitize(c);
    if (!profile) throw new Error("A cat profile is invalid.");
    // Import is strict. Migration of older local profiles uses sanitize separately.
    for (const key of Object.keys(profile) as (keyof CatProfile)[]) if (c[key] !== profile[key]) throw new Error(`Invalid or missing profile field: ${key}.`);
    return profile;
  });
  const ids = new Set(cats.map(c => c.id));
  if (ids.size !== cats.length) throw new Error("Duplicate cat IDs.");
  const care = parseCare(raw.care);
  if ([...care.reminders, ...care.journal].some(r => !ids.has(r.catId)) || Object.keys(care.checks).some(id => !ids.has(id))) throw new Error("A care record refers to a missing cat.");
  return { version: 2, exportedAt: raw.exportedAt, cats, care };
}
export function completeReminder(r: Reminder, now = new Date()): Reminder {
  if (r.repeat === "none") return { ...r, enabled: false };
  const due = new Date(r.due);
  do { due.setDate(due.getDate() + (r.repeat === "daily" ? 1 : 7)); } while (due <= now);
  return { ...r, due: due.toISOString() };
}
export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function download(name: string, data: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

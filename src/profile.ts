import type { Activity } from "./feeding";
import type { Lifestyle, Region } from "./health";
import breeds from "./content/breeds.json";

export interface CatProfile {
  id: string;
  name: string;
  ageMonths: number;
  breedId: string;
  weightKg: number;
  bcs: number;
  sex: "female" | "male";
  desexed: boolean;
  lifestyle: Lifestyle;
  region: Region;
  activity: Activity;
  conditions: string;
  dryKcalPerKg: number;
  wetKcalPerCan: number;
  wetCanGrams: number;
  wetShare: number;
  mealsPerDay: number;
  weightLossMode: boolean;
  /** 0 = not set. Set with your vet. */
  targetWeightKg: number;
  treatKcalPerDay: number;
  vetKcalPerDay: number;
  reproductiveState: "normal" | "pregnant" | "nursing";
  foodConfirmed: boolean;
  profileConfirmed: boolean;
  vetName: string;
  vetPhone: string;
  emergencyPhone: string;
  microchip: string;
}

export function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");
}
export const newCat = (): CatProfile => ({
  id: newId(), name: "My cat", ageMonths: 36, breedId: "dsh", weightKg: 4.2, bcs: 5, sex: "female",
  desexed: true, lifestyle: "indoor", region: "act", activity: "normal", conditions: "",
  dryKcalPerKg: 3800, wetKcalPerCan: 80, wetCanGrams: 85, wetShare: 0.5, mealsPerDay: 2, weightLossMode: false, targetWeightKg: 0,
  treatKcalPerDay: 0, vetKcalPerDay: 0, reproductiveState: "normal", foodConfirmed: false, profileConfirmed: false,
  vetName: "", vetPhone: "", emergencyPhone: "", microchip: "",
});

export const BCS_DESCRIPTIONS: Record<number, string> = {
  1: "Emaciated: ribs, spine and hip bones visible, no body fat",
  2: "Very thin: ribs easily visible, obvious waist, minimal fat",
  3: "Thin: ribs easily felt with minimal fat, clear waist",
  4: "Lean: ribs felt with slight fat cover, visible waist",
  5: "Ideal: ribs felt with a thin fat cover, waist behind ribs, small belly pad",
  6: "Slightly heavy: ribs felt with moderate fat, waist barely visible",
  7: "Heavy: ribs hard to feel, no waist, rounded belly",
  8: "Obese: ribs cannot be felt, obvious belly, fat deposits",
  9: "Severely obese: heavy fat over ribs, spine and belly",
};

const KEY = "cat-compass:v1";
const BACKUP_KEY = "cat-compass:v1:unreadable";

export interface Loaded {
  cats: CatProfile[];
  /** Set when stored data existed but could not be used. The raw value is kept under a backup key. */
  problem: string | null;
}

/** Fill any missing or wrongly-typed field from the defaults so old or partial data can't crash the UI. */
export function sanitize(raw: unknown): CatProfile | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = newCat();
  const r = raw as Record<string, unknown>;
  const out: Record<string, unknown> = { ...d };
  for (const k of Object.keys(d) as (keyof CatProfile)[]) {
    if (typeof r[k] === typeof d[k] && !(typeof d[k] === "number" && !Number.isFinite(r[k] as number))) out[k] = r[k];
  }
  const enums = { sex: ["female", "male"], lifestyle: ["indoor", "enclosure", "outdoor"], region: ["act", "east-coast", "other"], activity: ["low", "normal", "high"], reproductiveState: ["normal", "pregnant", "nursing"] };
  for (const [k, allowed] of Object.entries(enums)) if (!allowed.includes(String(out[k]))) out[k] = d[k as keyof CatProfile];
  if (typeof out.id !== "string" || !out.id || out.id.length > 100 || ["__proto__", "constructor", "prototype"].includes(out.id)) out.id = d.id;
  if (!breeds.some(b => b.id === out.breedId)) out.breedId = d.breedId;
  const limits: Partial<Record<keyof CatProfile, number>> = { name: 100, conditions: 5000, vetName: 200, vetPhone: 40, emergencyPhone: 40, microchip: 40 };
  for (const [k, max] of Object.entries(limits)) if (typeof out[k] === "string") out[k] = out[k].slice(0, max);
  if (["dryKcalPerKg", "wetKcalPerCan", "wetCanGrams"].some(k => typeof r[k] !== "number" || !Number.isFinite(r[k]))) out.foodConfirmed = false;
  if (["ageMonths", "weightKg", "bcs", "desexed", "activity", "conditions", "reproductiveState"].some(k => r[k] !== out[k])) out.profileConfirmed = false;
  return out as unknown as CatProfile;
}

export function loadCats(): Loaded {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { cats: [newCat()], problem: "This browser is blocking local storage, so changes won't be saved." };
  }
  if (raw === null) return { cats: [newCat()], problem: null };
  try {
    const data = JSON.parse(raw) as unknown;
    const cats = Array.isArray(data) ? data.map(sanitize).filter((c): c is CatProfile => c !== null) : [];
    if (cats.length > 0) {
      const seen = new Set<string>();
      for (const c of cats) { if (seen.has(c.id)) c.id = newId(); seen.add(c.id); }
      return { cats, problem: null };
    }
  } catch { /* fall through to the backup path */ }
  try { localStorage.setItem(BACKUP_KEY, raw); } catch { /* nothing more we can do */ }
  return { cats: [newCat()], problem: "Your saved cats couldn't be read, so you're seeing a fresh profile. The old data is kept as a backup in this browser." };
}

/** Returns false when the browser refused the write (private mode, full quota). */
export function saveCats(cats: CatProfile[]): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(cats)); return true; } catch { return false; }
}

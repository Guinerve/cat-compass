import { beforeEach, describe, expect, it } from "vitest";
import { loadCats, newCat, sanitize, saveCats } from "./profile";

class MemStorage {
  data = new Map<string, string>();
  throwOnSet = false;
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { if (this.throwOnSet) throw new Error("quota"); this.data.set(k, v); }
  removeItem(k: string) { this.data.delete(k); }
}
let store: MemStorage;
beforeEach(() => { store = new MemStorage(); (globalThis as unknown as { localStorage: MemStorage }).localStorage = store; });

describe("stored profiles", () => {
  it("first visit: a fresh cat and no problem", () => {
    const l = loadCats();
    expect(l.cats).toHaveLength(1);
    expect(l.problem).toBeNull();
  });
  it("round-trips", () => {
    const c = { ...newCat(), name: "Miso", weightKg: 5.1 };
    expect(saveCats([c])).toBe(true);
    expect(loadCats().cats[0]!.name).toBe("Miso");
  });
  it("corrupt JSON is reported and backed up, not silently replaced", () => {
    store.setItem("cat-compass:v1", "{not json");
    const l = loadCats();
    expect(l.problem).toMatch(/couldn't be read/);
    expect(store.getItem("cat-compass:v1:unreadable")).toBe("{not json");
    expect(store.getItem("cat-compass:v1")).toBe("{not json"); // untouched until the user edits
  });
  it("old or partial profiles are filled from defaults instead of crashing", () => {
    const l = (sanitize({ name: "Old", weightKg: "heavy", ageMonths: 12 }))!;
    expect(l.name).toBe("Old");
    expect(l.ageMonths).toBe(12);
    expect(typeof l.weightKg).toBe("number"); // bad type falls back
    expect(typeof l.conditions).toBe("string");
  });
  it("a failed write is reported to the caller", () => {
    store.throwOnSet = true;
    expect(saveCats([newCat()])).toBe(false);
  });
});

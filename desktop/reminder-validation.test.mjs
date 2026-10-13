import { describe, it, expect } from "vitest";
import { validReminders } from "./reminder-validation.mjs";
const r = { id: "a", catId: "cat", catName: "Miso", title: "Weigh in", due: "2026-10-14T10:00:00.000Z", repeat: "weekly", enabled: true };
describe("native IPC input", () => {
  it("accepts a bounded schedule", () => expect(validReminders([r])).toBe(true));
  it("rejects unsafe IDs, duplicate IDs, invalid dates and oversized titles", () => {
    expect(validReminders([{ ...r, id: "__proto__" }])).toBe(false);
    expect(validReminders([r, r])).toBe(false);
    expect(validReminders([{ ...r, due: "never" }])).toBe(false);
    expect(validReminders([{ ...r, title: "a".repeat(201) }])).toBe(false);
  });
});

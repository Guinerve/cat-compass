import { describe, expect, it } from "vitest";
import { healthSchedule, dailyRoutine } from "./health";

describe("healthSchedule", () => {
  it("always includes the F3 core vaccine", () => {
    for (const lifestyle of ["indoor", "outdoor", "enclosure"] as const) {
      const s = healthSchedule({ ageMonths: 24, lifestyle, region: "act" });
      expect(s.some((i) => i.title.startsWith("F3"))).toBe(true);
    }
  });
  it("adds FIV only for outdoor cats", () => {
    const has = (l: "indoor" | "outdoor" | "enclosure") =>
      healthSchedule({ ageMonths: 24, lifestyle: l, region: "other" }).some((i) => i.title.startsWith("FIV"));
    expect(has("outdoor")).toBe(true);
    expect(has("indoor")).toBe(false);
    expect(has("enclosure")).toBe(false);
  });
  it("does not treat ACT or other regions as tick-free", () => {
    const has = (r: "act" | "east-coast" | "other") =>
      healthSchedule({ ageMonths: 24, lifestyle: "indoor", region: r }).some((i) => i.title.includes("tick"));
    expect(has("east-coast")).toBe(true);
    expect(has("other")).toBe(true);
    expect(has("act")).toBe(true);
  });
  it("check-up rhythm follows life stage", () => {
    const when = (age: number) => healthSchedule({ ageMonths: age, lifestyle: "indoor", region: "other" }).find((i) => /check/i.test(i.title))!.when;
    expect(when(150)).toBe("Every 6 months");
    expect(when(36)).toBe("Every 12 months");
  });
  it("routine adds a midday meal for 3+ meals", () => {
    expect(dailyRoutine({ mealsPerDay: 3, coat: "short", ageMonths: 36 }).some((b) => b.time === "Midday")).toBe(true);
    expect(dailyRoutine({ mealsPerDay: 2, coat: "short", ageMonths: 36 }).some((b) => b.time === "Midday")).toBe(false);
  });
});

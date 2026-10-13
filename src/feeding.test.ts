import { describe, expect, it } from "vitest";
import { feedingPlan, feedingProblems, lifeStage, rer, stageFactor, type FeedingInput } from "./feeding";

const base: FeedingInput = {
  weightKg: 4, bcs: 5, ageMonths: 36, desexed: true, activity: "normal",
  weightLossMode: false, dryKcalPerKg: 3800, wetShare: 0, mealsPerDay: 2,
};

describe("RER", () => {
  it("matches the AAHA 2021 Box 1 worked example: 4.5 kg gives kg^0.75 = 3.09 and RER 216 kcal/day", () => {
    expect(Math.pow(4.5, 0.75)).toBeCloseTo(3.09, 2);
    expect(rer(4.5)).toBeCloseTo(216, 0);
  });
  it("70 × kg^0.75 (4 kg → 197.99 kcal; 3 kg → 159.5; 5 kg → 234.0)", () => {
    expect(rer(4)).toBeCloseTo(197.99, 1);
    expect(rer(3)).toBeCloseTo(159.55, 1);
    expect(rer(5)).toBeCloseTo(234.0, 0);
  });
});

describe("life stage factors", () => {
  it("assigns stages by age", () => {
    expect(lifeStage(2)).toBe("kitten-young");
    expect(lifeStage(8)).toBe("kitten-older");
    expect(lifeStage(36)).toBe("adult");
    expect(lifeStage(150)).toBe("senior");
  });
  // Factors from AAHA 2021 Nutrition and Weight Management Guidelines, Box 1 (feline column).
  it("follows AAHA Box 1: neutered 1.2–1.4, intact 1.4–1.6, inactive 1.0, growth 2.5", () => {
    expect(stageFactor({ ageMonths: 36, desexed: true, activity: "normal" })).toBe(1.2);
    expect(stageFactor({ ageMonths: 36, desexed: true, activity: "high" })).toBe(1.4);
    expect(stageFactor({ ageMonths: 36, desexed: false, activity: "normal" })).toBe(1.4);
    expect(stageFactor({ ageMonths: 36, desexed: false, activity: "high" })).toBe(1.6);
    expect(stageFactor({ ageMonths: 36, desexed: true, activity: "low" })).toBe(1.0);
    expect(stageFactor({ ageMonths: 3, desexed: false, activity: "normal" })).toBe(2.5);
    expect(stageFactor({ ageMonths: 8, desexed: false, activity: "normal" })).toBe(2.5);
  });
  it("seniors are not capped below the adult factor (no source for a senior cap)", () => {
    expect(stageFactor({ ageMonths: 150, desexed: true, activity: "normal" })).toBe(1.2);
  });
});

describe("feeding plan worked examples", () => {
  it("4 kg desexed adult: 237.6 kcal/day, 62.5 g of 3800 kcal/kg dry food", () => {
    const p = feedingPlan(base);
    expect(p.kcalPerDay).toBeCloseTo(237.59, 1);
    expect(p.dryGramsPerDay!).toBeCloseTo(62.5, 1);
    expect(p.perMealKcal).toBeCloseTo(118.8, 1);
  });

  it("splits kcal between dry and wet: 50% wet with 80 kcal cans", () => {
    const p = feedingPlan({ ...base, wetShare: 0.5, wetKcalPerCan: 80, wetCanGrams: 85 });
    expect(p.dryGramsPerDay!).toBeCloseTo(31.26, 1);
    expect(p.wetCansPerDay!).toBeCloseTo(1.485, 2);
    expect(p.wetGramsPerDay!).toBeCloseTo(126.2, 0);
  });

  it("weight-loss mode feeds RER×0.8 for the vet-set target weight (AAHA: base it on ideal weight)", () => {
    const p = feedingPlan({ ...base, weightKg: 6, bcs: 7, weightLossMode: true, targetWeightKg: 5 });
    expect(p.targetWeightKg).toBe(5);
    expect(p.kcalPerDay).toBeCloseTo(0.8 * rer(5), 6);
    expect(p.weightLoss!.minWeeklyLossKg).toBeCloseTo(0.03, 6);
    expect(p.weightLoss!.maxWeeklyLossKg).toBeCloseTo(0.12, 6);
  });

  it("does not silently fall back to maintenance without a target", () => {
    expect(() => feedingPlan({ ...base, weightKg: 6, bcs: 7, weightLossMode: true })).toThrow(/target weight/);
  });

  it("never applies weight loss to an ideal-weight cat or a kitten", () => {
    expect(() => feedingPlan({ ...base, weightLossMode: true, targetWeightKg: 4 })).toThrow(/overweight/);
    expect(() => feedingPlan({ ...base, ageMonths: 6, bcs: 7, weightLossMode: true, targetWeightKg: 3 })).toThrow(/growing/);
  });

  it("blocks missing energy for active food; ignores unused food", () => {
    expect(() => feedingPlan({ ...base, dryKcalPerKg: undefined })).toThrow(/dry food energy/);
    expect(feedingPlan({ ...base, wetShare: 1, dryKcalPerKg: undefined, wetKcalPerCan: 80, wetCanGrams: 85 }).dryGramsPerDay).toBeNull();
  });
});

describe("input validation", () => {
  const ok = base;
  it("accepts sane inputs", () => expect(feedingProblems(ok)).toEqual([]));
  it("rejects negative, zero, NaN and absurd weights (a negative weight would give NaN kcal)", () => {
    for (const w of [-1, 0, NaN, 40]) expect(feedingProblems({ ...ok, weightKg: w }).length).toBe(1);
  });
  it("rejects bad age, BCS and meals", () => {
    expect(feedingProblems({ ...ok, ageMonths: -3 }).join(" ")).toMatch(/age/);
    expect(feedingProblems({ ...ok, bcs: 11 }).length).toBe(1);
    expect(feedingProblems({ ...ok, mealsPerDay: 0 }).length).toBe(1);
  });
});

describe("full feeding boundary", () => {
  it("blocks explicitly unconfirmed example profiles", () => expect(() => feedingPlan({ ...base, profileConfirmed: false })).toThrow(/Starting values are examples/));
  it.each([NaN, Infinity, -1, 0, 10001])("rejects bad dry kcal/kg: %s", value => {
    expect(() => feedingPlan({ ...base, dryKcalPerKg: value })).toThrow(/dry food energy/);
  });
  it.each([NaN, Infinity, -0.1, 1.1])("does not silently clamp wet share: %s", value => {
    expect(() => feedingPlan({ ...base, wetShare: value })).toThrow(/Wet food share/);
  });
  it.each([0, NaN, Infinity, -1])("requires wet energy and pack grams: %s", value => {
    expect(() => feedingPlan({ ...base, wetShare: 0.5, wetKcalPerCan: value, wetCanGrams: 85 })).toThrow(/wet food energy/);
    expect(() => feedingPlan({ ...base, wetShare: 0.5, wetKcalPerCan: 80, wetCanGrams: value })).toThrow(/pack|size/);
  });
  it("requires whole meals and age; no unweaned kitten portions", () => {
    expect(() => feedingPlan({ ...base, mealsPerDay: 2.5 })).toThrow(/whole meals/);
    expect(() => feedingPlan({ ...base, ageMonths: 12.5 })).toThrow(/whole months/);
    expect(() => feedingPlan({ ...base, ageMonths: 1 })).toThrow(/unweaned/);
  });
  it("uses an explicit vet target for illness, underweight, pregnancy or nursing", () => {
    for (const patch of [{ conditions: "CKD" }, { bcs: 2 }, { reproductiveState: "pregnant" as const }, { reproductiveState: "nursing" as const }]) {
      expect(() => feedingPlan({ ...base, ...patch })).toThrow(/set by your vet/);
      expect(feedingPlan({ ...base, ...patch, vetKcalPerDay: 250 }).kcalPerDay).toBe(250);
    }
  });
  it("counts treats within total kcal and rejects more than 10%", () => {
    const total = feedingPlan(base).kcalPerDay;
    const p = feedingPlan({ ...base, treatKcalPerDay: 20, wetShare: 0.5, wetKcalPerCan: 80, wetCanGrams: 85 });
    expect(p.kcalPerDay).toBeCloseTo(total);
    expect(p.dryGramsPerDay! * 3.8 + p.wetCansPerDay! * 80 + 20).toBeCloseTo(total, 10);
    expect(p.perMealKcal * base.mealsPerDay + 20).toBeCloseTo(total);
    expect(() => feedingPlan({ ...base, treatKcalPerDay: total * 0.1 + 0.01 })).toThrow(/10%/);
    expect(() => feedingPlan({ ...base, treatKcalPerDay: NaN })).toThrow(/finite/);
  });
  it("has no senior calorie cap and uses published life-stage boundaries", () => {
    expect(lifeStage(84)).toBe("mature-adult"); expect(lifeStage(120)).toBe("mature-adult"); expect(lifeStage(121)).toBe("senior");
  });
  it.each([0, 6, 7, NaN, Infinity])("rejects invalid weight-loss target: %s", target => {
    expect(() => feedingPlan({ ...base, weightKg: 6, bcs: 7, weightLossMode: true, targetWeightKg: target })).toThrow(/target weight/);
  });
});

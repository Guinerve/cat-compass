import { describe, expect, it } from "vitest";
import { feedingPlan, feedingProblems, idealWeightKg, lifeStage, rer, stageFactor, type FeedingInput } from "./feeding";

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

  it("weight-loss mode feeds RER×0.8 for the ideal weight", () => {
    // 6 kg at BCS 7 → ideal 6/1.2 = 5 kg; RER(5)=234.0; ×0.8 = 187.2 kcal
    expect(idealWeightKg(6, 7)).toBeCloseTo(5, 6);
    const p = feedingPlan({ ...base, weightKg: 6, bcs: 7, weightLossMode: true });
    expect(p.targetWeightKg).toBeCloseTo(5, 6);
    expect(p.kcalPerDay).toBeCloseTo(0.8 * rer(5), 6);
    expect(p.weightLoss!.weeklyLossKg).toBeCloseTo(0.06, 6);
    expect(p.weightLoss!.weeksToTarget).toBe(17);
  });

  it("never applies weight loss to an ideal-weight cat or a kitten", () => {
    expect(feedingPlan({ ...base, weightLossMode: true }).weightLoss).toBeUndefined();
    expect(feedingPlan({ ...base, ageMonths: 6, bcs: 7, weightLossMode: true }).weightLoss).toBeUndefined();
  });

  it("returns null amounts when food energy is unknown", () => {
    const p = feedingPlan({ ...base, dryKcalPerKg: undefined });
    expect(p.dryGramsPerDay).toBeNull();
  });
});

describe("input validation", () => {
  const ok = { weightKg: 4, ageMonths: 36, bcs: 5, mealsPerDay: 2 };
  it("accepts sane inputs", () => expect(feedingProblems(ok)).toEqual([]));
  it("rejects negative, zero, NaN and absurd weights (a negative weight would give NaN kcal)", () => {
    for (const w of [-1, 0, NaN, 40]) expect(feedingProblems({ ...ok, weightKg: w }).length).toBe(1);
  });
  it("rejects bad age, BCS and meals", () => {
    expect(feedingProblems({ ...ok, ageMonths: -3 }).length).toBe(1);
    expect(feedingProblems({ ...ok, bcs: 11 }).length).toBe(1);
    expect(feedingProblems({ ...ok, mealsPerDay: 0 }).length).toBe(1);
  });
});

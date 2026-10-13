/**
 * Energy requirement maths for cats.
 *   RER = 70 × kg^0.75            (resting energy requirement, kcal/day)
 *   DER = RER × life-stage factor
 * Factors are the feline life-stage factors in AAHA 2021 Nutrition and Weight Management Guidelines, Box 1:
 *   neutered adult 1.2–1.4, intact adult 1.4–1.6, inactive / obese-prone 1.0, weight loss 0.8 (of ideal weight),
 *   growth 2.5. Starting points to adjust by monitoring weight and body condition, not prescriptions.
 */

export type LifeStage = "kitten-young" | "kitten-older" | "adult" | "mature-adult" | "senior";
export type Activity = "low" | "normal" | "high";

export interface FeedingInput {
  weightKg: number;
  /** 1–9 body condition score; 5 is ideal */
  bcs: number;
  ageMonths: number;
  desexed: boolean;
  activity: Activity;
  weightLossMode: boolean;
  /** Target (ideal) weight in kg, set with your vet. Weight-loss mode needs it; there is no formula for it here. */
  targetWeightKg?: number;
  /** kcal metabolisable energy per kg of food (dry) */
  dryKcalPerKg?: number;
  /** kcal per whole can or pouch; wetCanGrams is that pack's weight */
  wetKcalPerCan?: number;
  wetCanGrams?: number;
  /** share of daily kcal from wet food, 0–1 */
  wetShare: number;
  mealsPerDay: number;
  treatKcalPerDay?: number;
  vetKcalPerDay?: number;
  conditions?: string;
  reproductiveState?: "normal" | "pregnant" | "nursing";
  profileConfirmed?: boolean;
}

export const rer = (kg: number): number => 70 * Math.pow(kg, 0.75);

export function lifeStage(ageMonths: number): LifeStage {
  if (ageMonths < 4) return "kitten-young";
  if (ageMonths < 12) return "kitten-older";
  if (ageMonths > 120) return "senior"; // AAHA/AAFP 2021: over 10 years
  if (ageMonths >= 84) return "mature-adult";
  return "adult";
}

export function stageFactor(input: Pick<FeedingInput, "ageMonths" | "desexed" | "activity">): number {
  if (lifeStage(input.ageMonths).startsWith("kitten")) return 2.5; // AAHA: feline growth factor 2.5
  if (input.activity === "low") return 1.0; // inactive / obese-prone
  // Adult ranges: neutered 1.2–1.4, intact 1.4–1.6. Normal activity uses the low end, high activity the high end.
  const [lo, hi] = input.desexed ? [1.2, 1.4] : [1.4, 1.6];
  return input.activity === "high" ? hi : lo;
}

export interface FeedingPlan {
  rer: number;
  factor: number;
  kcalPerDay: number;
  targetWeightKg: number;
  dryGramsPerDay: number | null;
  wetCansPerDay: number | null;
  wetGramsPerDay: number | null;
  perMealKcal: number;
  foodKcalPerDay: number;
  treatKcalPerDay: number;
  weightLoss?: { minWeeklyLossKg: number; maxWeeklyLossKg: number };
  notes: string[];
}

export function feedingPlan(i: FeedingInput): FeedingPlan {
  const problems = feedingProblems(i);
  if (problems.length) throw new RangeError(problems.join(" "));
  const notes: string[] = [];
  const stage = lifeStage(i.ageMonths);
  const growing = stage === "kitten-young" || stage === "kitten-older";
  const target = i.weightLossMode ? i.targetWeightKg! : i.weightKg;
  const losing = target < i.weightKg;
  const base = rer(target);
  const factor = losing ? 0.8 : stageFactor(i);
  const kcal = i.vetKcalPerDay || base * factor;
  const treats = i.treatKcalPerDay ?? 0;
  if (treats > kcal * 0.1) throw new RangeError("Treats must be at most 10% of daily calories. Ask your vet about diet changes.");
  const foodKcal = kcal - treats;

  const wetShare = i.wetShare;
  const dryKcal = foodKcal * (1 - wetShare);
  const wetKcal = foodKcal * wetShare;
  const dryG = wetShare < 1 && i.dryKcalPerKg ? (dryKcal / i.dryKcalPerKg) * 1000 : null;
  const canG = i.wetCanGrams ?? 85;
  const cans = wetShare > 0 && i.wetKcalPerCan ? wetKcal / i.wetKcalPerCan : null;

  let weightLoss: FeedingPlan["weightLoss"];
  if (losing) {
    weightLoss = { minWeeklyLossKg: i.weightKg * 0.005, maxWeeklyLossKg: i.weightKg * 0.02 };
    notes.push("Weight-loss plans should be set up and monitored with your vet. Never fast a cat: rapid loss risks hepatic lipidosis.");
  }
  if (i.bcs <= 3) notes.push("This cat looks underweight. Check with your vet before changing food.");
  if (stage === "kitten-young" || stage === "kitten-older") notes.push("Kittens grow fast: reweigh weekly and adjust. Use kitten-formulated food.");
  if (i.vetKcalPerDay) notes.push("This plan uses your vet's daily calorie target, not the life-stage estimate. Include treats in that total.");
  if (!i.vetKcalPerDay && i.activity !== "low" && !growing && !losing) notes.push("App assumption: normal activity uses the lower end of AAHA’s adult range; high activity uses the upper end. AAHA does not assign activity levels to those endpoints.");
  if (losing) notes.push("Use a diet suitable for supervised weight loss. Cutting an ordinary diet can reduce essential nutrients.");
  notes.push("These are starting amounts, not prescriptions. Monitor weight and body condition with your vet. Offer fresh water at all times; no fixed water quota is calculated.");

  return {
    rer: base, factor, kcalPerDay: kcal, targetWeightKg: target,
    dryGramsPerDay: dryG,
    wetCansPerDay: cans,
    wetGramsPerDay: cans !== null ? cans * canG : null,
    perMealKcal: foodKcal / i.mealsPerDay,
    foodKcalPerDay: foodKcal, treatKcalPerDay: treats,
    weightLoss, notes,
  };
}

/** Reasons a plan can't be calculated. An empty list means the inputs are usable. */
export function feedingProblems(i: FeedingInput): string[] {
  const out: string[] = [];
  if (i.profileConfirmed === false) out.push("Confirm your cat’s age, weight and body condition on the Profile page. Starting values are examples.");
  if (!Number.isFinite(i.weightKg) || i.weightKg < 0.3 || i.weightKg > 15) out.push("Enter a weight between 0.3 and 15 kg.");
  if (!Number.isInteger(i.ageMonths) || i.ageMonths < 0 || i.ageMonths > 30 * 12) out.push("Enter an age in whole months between 0 and 30 years.");
  if (!Number.isInteger(i.bcs) || i.bcs < 1 || i.bcs > 9) out.push("Pick a body condition score from 1 to 9.");
  if (!Number.isInteger(i.mealsPerDay) || i.mealsPerDay < 1 || i.mealsPerDay > 8) out.push("Enter 1 to 8 whole meals per day.");
  if (!["low", "normal", "high"].includes(i.activity) || typeof i.desexed !== "boolean") out.push("Select a valid activity and desexing status.");
  if (typeof i.weightLossMode !== "boolean") out.push("Select a valid feeding goal.");
  if (!Number.isFinite(i.wetShare) || i.wetShare < 0 || i.wetShare > 1) out.push("Wet food share must be between 0% and 100%.");
  if (i.wetShare < 1 && (!Number.isFinite(i.dryKcalPerKg) || i.dryKcalPerKg! <= 0 || i.dryKcalPerKg! > 10000)) out.push("Enter dry food energy from the label, in kcal/kg (more than 0, up to 10000).");
  if (i.wetShare > 0) {
    if (!Number.isFinite(i.wetKcalPerCan) || i.wetKcalPerCan! <= 0 || i.wetKcalPerCan! > 10000) out.push("Enter wet food energy from the label, in kcal per can or pouch (more than 0, up to 10000).");
    if (!Number.isFinite(i.wetCanGrams) || i.wetCanGrams! <= 0 || i.wetCanGrams! > 2000) out.push("Enter the wet can or pouch size in grams (more than 0, up to 2000).");
  }
  const vet = i.vetKcalPerDay ?? 0;
  if (!Number.isFinite(vet) || vet < 0 || vet > 3000) out.push("Vet calorie target must be 0 (not set) or up to 3000 kcal/day.");
  if (!Number.isFinite(i.treatKcalPerDay ?? 0) || (i.treatKcalPerDay ?? 0) < 0) out.push("Treat calories must be a finite number of 0 or more.");
  if (i.ageMonths < 2) out.push("This calculator is not for unweaned kittens. Get a feeding plan from your vet.");
  if (i.reproductiveState && !["normal", "pregnant", "nursing"].includes(i.reproductiveState)) out.push("Select a valid reproductive state.");
  if ((i.conditions?.trim() || i.reproductiveState === "pregnant" || i.reproductiveState === "nursing" || i.bcs <= 3) && !vet) out.push("Health conditions, pregnancy, nursing or low body condition need a daily calorie target set by your vet.");
  if (i.weightLossMode) {
    if (i.ageMonths < 12 || i.reproductiveState === "pregnant" || i.reproductiveState === "nursing") out.push("Weight-loss mode is not for growing, pregnant or nursing cats.");
    if (i.bcs <= 5) out.push("Weight-loss mode needs an overweight body condition score and vet review.");
    if (!Number.isFinite(i.targetWeightKg) || i.targetWeightKg! < 0.3 || i.targetWeightKg! >= i.weightKg) out.push("Set a vet-agreed target weight of at least 0.3 kg, below current weight.");
  }
  if (!out.length) {
    const kcal = vet || rer(i.weightLossMode ? i.targetWeightKg! : i.weightKg) * (i.weightLossMode ? 0.8 : stageFactor(i));
    if ((i.treatKcalPerDay ?? 0) > kcal * 0.1) out.push("Treats must be at most 10% of daily calories. Reduce the treat allowance.");
  }
  return out;
}

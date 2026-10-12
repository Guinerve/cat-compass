/**
 * Energy requirement maths for cats.
 *   RER = 70 × kg^0.75            (resting energy requirement, kcal/day)
 *   DER = RER × life-stage factor
 * Factors follow the commonly used WSAVA / AAHA tables; they are starting points, not prescriptions.
 */

export type LifeStage = "kitten-young" | "kitten-older" | "adult" | "senior";
export type Activity = "low" | "normal" | "high";

export interface FeedingInput {
  weightKg: number;
  /** 1–9 body condition score; 5 is ideal */
  bcs: number;
  ageMonths: number;
  desexed: boolean;
  activity: Activity;
  weightLossMode: boolean;
  /** kcal metabolisable energy per kg of food (dry) */
  dryKcalPerKg?: number;
  /** kcal per 85 g can, or per-can energy with canGrams */
  wetKcalPerCan?: number;
  wetCanGrams?: number;
  /** share of daily kcal from wet food, 0–1 */
  wetShare: number;
  mealsPerDay: number;
}

export const rer = (kg: number): number => 70 * Math.pow(kg, 0.75);

export function lifeStage(ageMonths: number): LifeStage {
  if (ageMonths < 4) return "kitten-young";
  if (ageMonths < 12) return "kitten-older";
  if (ageMonths >= 132) return "senior"; // 11+ years
  return "adult";
}

export function stageFactor(input: Pick<FeedingInput, "ageMonths" | "desexed" | "activity">): number {
  const stage = lifeStage(input.ageMonths);
  if (stage === "kitten-young") return 2.5;
  if (stage === "kitten-older") return 2.0;
  let f = input.desexed ? 1.2 : 1.4;
  if (input.activity === "low") f = Math.min(f, 1.0);
  if (input.activity === "high") f += 0.2;
  if (stage === "senior") f = Math.min(f, 1.1);
  return f;
}

/** Estimate ideal weight: roughly 10% of body weight per BCS point above 5, 5% per point below. */
export function idealWeightKg(weightKg: number, bcs: number): number {
  if (bcs > 5) return weightKg / (1 + 0.1 * (bcs - 5));
  if (bcs < 5) return weightKg / (1 - 0.05 * (5 - bcs));
  return weightKg;
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
  waterMlPerDay: number;
  weightLoss?: { weeklyLossKg: number; weeksToTarget: number };
  notes: string[];
}

export function feedingPlan(i: FeedingInput): FeedingPlan {
  const notes: string[] = [];
  const stage = lifeStage(i.ageMonths);
  const target = i.weightLossMode && i.bcs > 5 && stage !== "kitten-young" && stage !== "kitten-older"
    ? idealWeightKg(i.weightKg, i.bcs) : i.weightKg;
  const losing = target < i.weightKg;
  const base = rer(target);
  const factor = losing ? 0.8 : stageFactor(i);
  const kcal = base * factor;

  const wetShare = Math.min(1, Math.max(0, i.wetShare));
  const dryKcal = kcal * (1 - wetShare);
  const wetKcal = kcal * wetShare;
  const dryG = i.dryKcalPerKg && i.dryKcalPerKg > 0 ? (dryKcal / i.dryKcalPerKg) * 1000 : null;
  const canG = i.wetCanGrams ?? 85;
  const cans = i.wetKcalPerCan && i.wetKcalPerCan > 0 ? wetKcal / i.wetKcalPerCan : null;

  let weightLoss: FeedingPlan["weightLoss"];
  if (losing) {
    const cap = i.weightKg * 0.01; // aim for ~1% of body weight per week; vet to confirm
    weightLoss = { weeklyLossKg: cap, weeksToTarget: Math.ceil((i.weightKg - target) / cap) };
    notes.push("Weight-loss plans should be set up and monitored with your vet. Never fast a cat: rapid loss risks hepatic lipidosis.");
  }
  if (i.weightLossMode && i.bcs <= 5) notes.push("Body condition looks ideal or lean, so no weight-loss target was applied.");
  if (i.bcs <= 3) notes.push("This cat looks underweight. Check with your vet before changing food.");
  if (stage === "kitten-young" || stage === "kitten-older") notes.push("Kittens grow fast: reweigh weekly and adjust. Use kitten-formulated food.");
  notes.push("These are starting amounts. Adjust against body condition and weight every 2–4 weeks, and follow the feeding guide on your food if your vet advises otherwise.");

  return {
    rer: base, factor, kcalPerDay: kcal, targetWeightKg: target,
    dryGramsPerDay: dryG,
    wetCansPerDay: cans,
    wetGramsPerDay: cans !== null ? cans * canG : null,
    perMealKcal: kcal / Math.max(1, i.mealsPerDay),
    waterMlPerDay: 50 * target, // ~50 ml/kg/day total water, including the water in wet food
    weightLoss, notes,
  };
}

/** Reasons a plan can't be calculated. An empty list means the inputs are usable. */
export function feedingProblems(i: Pick<FeedingInput, "weightKg" | "ageMonths" | "bcs" | "mealsPerDay">): string[] {
  const out: string[] = [];
  if (!Number.isFinite(i.weightKg) || i.weightKg < 0.3 || i.weightKg > 15) out.push("Enter a weight between 0.3 and 15 kg.");
  if (!Number.isFinite(i.ageMonths) || i.ageMonths < 0 || i.ageMonths > 30 * 12) out.push("Enter an age between 0 and 30 years.");
  if (!Number.isInteger(i.bcs) || i.bcs < 1 || i.bcs > 9) out.push("Pick a body condition score from 1 to 9.");
  if (!Number.isFinite(i.mealsPerDay) || i.mealsPerDay < 1 || i.mealsPerDay > 8) out.push("Meals per day should be between 1 and 8.");
  return out;
}

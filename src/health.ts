import { lifeStage } from "./feeding";

export type Lifestyle = "indoor" | "outdoor" | "enclosure";
export type Region = "act" | "east-coast" | "other";

export interface ScheduleItem {
  title: string;
  when: string;
  note: string;
  source: string;
}

/** Australian vaccine, parasite and checkup rhythm. A starting point to discuss with your vet. */
export function healthSchedule(p: { ageMonths: number; lifestyle: Lifestyle; region: Region }): ScheduleItem[] {
  const stage = lifeStage(p.ageMonths);
  const items: ScheduleItem[] = [];
  const kitten = stage === "kitten-young" || stage === "kitten-older";

  items.push({
    title: "F3 core vaccine (panleukopenia, herpesvirus, calicivirus)",
    when: kitten
      ? "From 6–8 weeks, repeated every 2–4 weeks until at least 16 weeks, then a booster from 26 weeks (6 months) to 12 months"
      : "After the kitten course and first booster, core vaccines are usually due no more often than every 3 years; your vet will set the interval",
    note: "Core for every cat, including indoor cats. Exact timing varies by vaccine brand and by clinic.", source: "WSAVA 2024 Guidelines for the Vaccination of Dogs and Cats",
  });
  if (p.lifestyle === "outdoor") {
    items.push({
      title: "FIV vaccine",
      when: "Discuss from 8 weeks for cats that roam, then annual boosters if used",
      note: "Considered for outdoor cats that may fight. Ask your vet whether it suits your cat.", source: "AAFP / WSAVA",
    });
  }
  items.push({
    title: "Intestinal worming",
    when: kitten ? "Every 2 weeks until 12 weeks, then monthly until 6 months" : "Every 3 months for adults",
    note: "Use a cat-safe product at the right dose for current weight.", source: "ESCCAP / RSPCA Australia",
  });
  items.push({
    title: "Flea control",
    when: "Monthly or as per the product, all year",
    note: "Never use dog products. Permethrin can kill cats.", source: "RSPCA Australia",
  });
  if (p.region === "east-coast") {
    items.push({
      title: "Paralysis tick prevention",
      when: "Year-round in tick areas (peak spring and summer)",
      note: "Use a product registered for cats and check daily. Ticks can be fatal within days.", source: "Australian Veterinary Association",
    });
  }
  items.push({
    title: "Heartworm prevention",
    when: "Per your vet, depending on region and product",
    note: "Heartworm risk varies across Australia. Combined products may cover worms and heartworm.", source: "Australian Veterinary Association",
  });
  items.push({
    title: stage === "senior" ? "Senior check-up with bloods and blood pressure" : kitten ? "Kitten visits and desexing plan" : "Annual health check",
    when: stage === "senior" ? "Every 6 months" : kitten ? "With each vaccination visit" : "Every 12 months",
    note: "Weigh the cat, check teeth and heart, and review diet.", source: "AAFP / ISFM",
  });
  items.push({
    title: "Dental check",
    when: "At every check-up; professional clean as advised",
    note: "Dental disease is very common in cats and often hidden.", source: "International Cat Care",
  });
  return items;
}

export interface RoutineBlock {
  time: string;
  title: string;
  detail: string;
}

export function dailyRoutine(p: { mealsPerDay: number; coat: string; ageMonths: number }): RoutineBlock[] {
  const blocks: RoutineBlock[] = [
    { time: "Morning", title: "Breakfast and fresh water", detail: "First meal of the day. Scoop the litter tray." },
    { time: "Morning", title: "Play: hunt → catch → eat", detail: "10–15 minutes with a wand toy, finishing with a catch and a small meal or treat, then grooming and sleep." },
  ];
  if (p.mealsPerDay >= 3) blocks.push({ time: "Midday", title: "Small meal", detail: "Food puzzle or small portion." });
  blocks.push(
    { time: "Evening", title: "Play session and dinner", detail: "Another 10–15 minute play session, then the evening meal." },
    { time: "Evening", title: p.coat === "long" ? "Brush coat (daily)" : "Brush coat (a few times a week)", detail: p.coat === "none" ? "Hairless cats need regular skin wipes and sun care." : "Short sessions with a comb or soft brush." },
    { time: "Night", title: "Quiet time", detail: "Keep litter tray clean and water topped up." },
  );
  if (p.ageMonths >= 12) blocks.push({ time: "Weekly", title: "Nail trim and weigh-in", detail: "Trim the sharp tips only. Weigh once a month and record it." });
  return blocks;
}

export const toothBrushingPlan = [
  "Days 1–3: Let the cat lick a little cat-safe toothpaste from your finger.",
  "Days 4–6: Rub your finger gently along the outside of the upper teeth.",
  "Days 7–9: Add a finger brush or soft cloth, a few seconds at a time.",
  "Days 10–14: Move to a soft cat toothbrush, a few teeth at a time.",
  "Weeks 3+: Brush all outer surfaces for 30–60 seconds, ending with a treat.",
];

import { lifeStage } from "./feeding";

export type Lifestyle = "indoor" | "outdoor" | "enclosure";
export type Region = "act" | "east-coast" | "other";

export interface ScheduleItem {
  title: string;
  when: string;
  note: string;
  source: string;
  sourceId: string;
}

/** Australian vaccine, parasite and checkup rhythm. A starting point to discuss with your vet. */
export function healthSchedule(p: { ageMonths: number; lifestyle: Lifestyle; region: Region }): ScheduleItem[] {
  const stage = lifeStage(p.ageMonths);
  const items: ScheduleItem[] = [];
  const kitten = stage === "kitten-young" || stage === "kitten-older";

  items.push({
    title: "F3 core vaccine (panleukopenia, herpesvirus, calicivirus)",
    when: kitten
      ? "Usually start at 6–8 weeks, repeat every 2–4 weeks until at least 16 weeks (20 weeks in especially high-risk settings). WSAVA recommends revaccination at 26 weeks or older."
      : "After effective immunisation, low-risk cats using modified-live vaccines generally have intervals of at least 3 years. Higher-risk cats may need annual herpesvirus/calicivirus revaccination.",
    note: "FPV protection differs from FHV/FCV protection. Boarding, other-cat contact, history, vaccine type and label matter. Your vet chooses the schedule.", source: "WSAVA 2024", sourceId: "wsava-vaccination-2024",
  });
  if (p.lifestyle === "outdoor") {
    items.push({
      title: "FIV vaccine",
      when: "Discuss exposure risk and testing before vaccination. If used: 3 initial doses from at least 8 weeks, 2–3 weeks apart; annual boosters for continuing risk.",
      note: "Non-core, incomplete protection and variable efficacy evidence. Avoiding fights is best. Vaccination can affect some FIV test results.", source: "WSAVA 2024", sourceId: "wsava-vaccination-2024",
    });
  }
  items.push({ title: "FeLV risk discussion", when: "Ask your vet about local prevalence, other-cat exposure and testing.", note: "WSAVA considers FeLV core for young cats and exposed adults where the disease is endemic. Availability and local risk differ. This app does not choose a vaccine.", source: "WSAVA 2024", sourceId: "wsava-vaccination-2024" });
  items.push({
    title: "Intestinal worming",
    when: kitten ? "One Australian clinic’s example: every 2 weeks to 12 weeks, then monthly to 6 months. Confirm with your vet." : "Vet-set intervals based on hunting, fleas, local worms, travel and product coverage.",
    note: "This is a clinic example, not a national prescription. Use a cat-labelled product for current age and weight. Combination products do not cover every parasite.", source: "North Road Veterinary Centre", sourceId: "australian-worming-clinic",
  });
  items.push({
    title: "Flea control",
    when: "Year-round prevention at the product-label interval, as advised by your vet.",
    note: "Never use dog flea products on cats. Permethrin can kill cats, including after close contact with a treated dog.", source: "RSPCA Australia", sourceId: "rspca-fleas",
  });
  {
    items.push({
      title: "Paralysis tick prevention",
      when: p.region === "east-coast" ? "Discuss local seasonal risk; some northern areas have year-round exposure. Search daily in tick areas." : "Ask about local habitat and travel to tick areas. ACT and other regions are not assumed tick-free.",
      note: "Use cat-registered prevention and search daily even with treatment. Suspected paralysis needs immediate care; do not offer food or water or give anything orally.", source: "RSPCA Australia", sourceId: "rspca-paralysis-ticks",
    });
  }
  items.push({
    title: "Heartworm prevention",
    when: "Per your vet, depending on region and product",
    note: "Risk and cat-registered products need a local vet’s advice. The linked clinic opinion is dated and is not current national prevalence evidence.", source: "Walkerville Vet", sourceId: "australian-heartworm-clinic",
  });
  items.push({
    title: stage === "senior" ? "Senior check-up and screening plan" : kitten ? "Kitten visits and desexing plan" : "Annual health check",
    when: stage === "senior" ? "Every 6 months" : kitten ? "With each vaccination visit" : "Every 12 months",
    note: "Annual examinations are a minimum. Seniors need at least 6-monthly reviews; illness may need more visits. Ask about blood tests and blood pressure for this cat.", source: "AAHA / AAFP 2021", sourceId: "aaha-aafp-life-stage-2021",
  });
  items.push({
    title: "Dental check",
    when: "At every check-up; professional clean as advised",
    note: "Dental disease can be painful. If gums are sore, ask your vet before brushing.", source: "Cornell Feline Health Center", sourceId: "cornell-dental",
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
    { time: "Morning", title: "Water, litter and a comfort check", detail: "Refresh water, scoop litter and check appetite. Use the feeding plan’s total allowance, not extra food for each activity." },
    { time: "Morning", title: "Play: hunt → catch → rest", detail: "Offer a short wand session and a final catch. Stop when the cat tires. A 10–15 minute session is a routine example, not a required dose. Put string toys away." },
  ];
  if (p.mealsPerDay >= 3) blocks.push({ time: "Midday", title: "Small meal", detail: "Food puzzle or small portion." });
  blocks.push(
    { time: "Meals", title: `Divide the daily allowance into ${p.mealsPerDay} meal(s)`, detail: "Choose times that fit your cat. Puzzle food and treats come from the same daily allowance." },
    { time: "Evening", title: "Play and quiet company", detail: "Offer play or gentle contact if the cat wants it. Do not force interaction." },
    { time: "Evening", title: p.coat === "none" ? "Check skin comfort" : "Check the coat and offer gentle grooming", detail: p.coat === "none" ? "Ask your vet about skin care. Do not use human skin products." : "Use short, comfortable sessions. Long coats may need daily attention. Stop if grooming hurts." },
    { time: "Night", title: "Quiet time", detail: "Keep litter tray clean and water topped up." },
  );
  if (p.ageMonths >= 12) blocks.push({ time: "Regularly", title: "Check nails and record weight", detail: "Routine monthly weighing is an app suggestion. Weigh more often for growth or a vet-supervised weight plan. Ask for a nail-trim demonstration." });
  return blocks;
}

export const toothBrushingPlan = [
  "Let the cat try a small amount of cat-safe toothpaste. Do not use human toothpaste.",
  "When comfortable, briefly touch the outside of the teeth. Reward calm contact.",
  "Introduce a soft cat toothbrush for a few seconds. Stop before the cat becomes upset.",
  "Build toward regular brushing at the cat’s pace. A fixed training timetable is not required.",
  "Use rewards within the daily calorie allowance. Stop and contact your vet for pain or bleeding.",
];

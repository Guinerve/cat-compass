import { Printer, Phone, ShieldAlert, Trash2 } from "lucide-react";
import breeds from "../content/breeds.json";
import redflags from "../content/redflags.json";
import act from "../content/act.json";
import newowner from "../content/newowner.json";
import { feedingPlan, feedingProblems, lifeStage } from "../feeding";
import { dailyRoutine, healthSchedule, toothBrushingPlan } from "../health";
import { BCS_DESCRIPTIONS, type CatProfile } from "../profile";
import type { CareData } from "../care";
import { SourceLinks } from "./Library";

type Upd = (patch: Partial<CatProfile>) => void;
const number = (s: string) => s === "" ? 0 : Number(s);
export function RedFlagPanel({ cat }: { cat: CatProfile }) {
  return <details className="redflags"><summary><ShieldAlert size={18} /><span>Know when it cannot wait</span><small>Emergency signs & contacts</small></summary>
    <p>Call a vet now for trouble breathing, no urine, collapse or possible poisoning. Do not wait for the next reminder.</p>
    <div className="contact-row">{cat.emergencyPhone && <a href={`tel:${cat.emergencyPhone.replace(/[^+\d]/g, "")}`}><Phone size={15} /> Emergency vet: {cat.emergencyPhone}</a>}<a href="tel:1300869738">Animal Poisons Helpline (Australia): 1300 869 738</a></div>
    <SourceLinks ids={["animal-poisons-au"]} />
    <ul>{redflags.map(r => <li key={r.id}><b>{r.title}</b><p>{r.signs}</p><p>{r.action}</p><SourceLinks ids={[r.sourceId]} /></li>)}</ul>
  </details>;
}
export function Profile({ cat, update, remove }: { cat: CatProfile; update: Upd; remove?: () => void }) {
  return <div className="stack">
    <section className="panel"><h2>Meet {cat.name || "your cat"}</h2><p className="hint">A new profile starts with example values. Replace them with this cat’s details before you use feeding amounts.</p><div className="form-grid">
      <label>Name<input maxLength={100} value={cat.name} onChange={e => update({ name: e.target.value })} /></label>
      <label>Age (whole months)<input type="number" min={0} max={360} step={1} value={cat.ageMonths} onChange={e => update({ ageMonths: number(e.target.value) })} /><small>{Math.floor(cat.ageMonths / 12)} years, {cat.ageMonths % 12} months</small></label>
      <label>Breed<select value={cat.breedId} onChange={e => update({ breedId: e.target.value })}>{breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label>Current weight (kg)<input type="number" min={0.3} max={15} step={0.01} value={cat.weightKg} onChange={e => update({ weightKg: number(e.target.value) })} /></label>
      <label>Sex<select value={cat.sex} onChange={e => update({ sex: e.target.value === "male" ? "male" : "female" })}><option value="female">Female</option><option value="male">Male</option></select></label>
      <label>Reproductive state<select value={cat.reproductiveState} onChange={e => update({ reproductiveState: e.target.value as CatProfile["reproductiveState"] })}><option value="normal">Not pregnant or nursing</option><option value="pregnant">Pregnant</option><option value="nursing">Nursing</option></select></label>
      <label className="check"><input type="checkbox" checked={cat.desexed} onChange={e => update({ desexed: e.target.checked })} /> Desexed / neutered</label>
    </div><label className="check label-confirm"><input type="checkbox" checked={cat.profileConfirmed} onChange={e => update({ profileConfirmed: e.target.checked })} /> I checked this cat’s age, current weight and body condition. These are not example values.</label></section>
    <section className="panel"><div className="section-heading"><h2>Body condition, not just weight</h2><span className="badge">{cat.bcs} / 9</span></div><p>Feel the ribs and look for a waist. Use the linked veterinary chart. These descriptions cannot replace a check by hand.</p>
      <div className="bcs" role="group" aria-label="Body condition score">{[1,2,3,4,5,6,7,8,9].map(n => <button key={n} type="button" aria-pressed={cat.bcs === n} className={cat.bcs === n ? "on" : ""} onClick={() => update({ bcs: n })}>{n}</button>)}</div><div className="bcs-scale"><span>Too thin</span><span>Ideal</span><span>Too heavy</span></div><p className="bcs-description">{BCS_DESCRIPTIONS[cat.bcs] || "Choose a score from 1 to 9."}</p><SourceLinks ids={["wsava-bcs"]} />
    </section>
    <section className="panel"><h2>Life & health</h2><div className="form-grid">
      <label>Lifestyle<select value={cat.lifestyle} onChange={e => update({ lifestyle: e.target.value as CatProfile["lifestyle"] })}><option value="indoor">Indoor only</option><option value="enclosure">Indoor + secure enclosure</option><option value="outdoor">Indoor / outdoor</option></select></label>
      <label>Region<select value={cat.region} onChange={e => update({ region: e.target.value as CatProfile["region"] })}><option value="act">ACT, Australia</option><option value="east-coast">Eastern Australia, tick area</option><option value="other">Other region (check local rules)</option></select></label>
      <label>Activity<select value={cat.activity} onChange={e => update({ activity: e.target.value as CatProfile["activity"] })}><option value="low">Low / sedentary</option><option value="normal">Normal</option><option value="high">High</option></select></label>
      <label>Known health conditions<textarea rows={2} maxLength={5000} value={cat.conditions} placeholder="Kidney disease, diabetes, food allergy…" onChange={e => update({ conditions: e.target.value })} /></label>
    </div><FeedingGoal cat={cat} update={update} /></section>
    <section className="panel"><h2>Your care contacts</h2><div className="form-grid">
      <label>Vet or clinic<input maxLength={200} value={cat.vetName} onChange={e => update({ vetName: e.target.value })} /></label>
      <label>Vet phone<input type="tel" maxLength={40} value={cat.vetPhone} onChange={e => update({ vetPhone: e.target.value })} /></label>
      <label>Emergency vet phone<input type="tel" maxLength={40} value={cat.emergencyPhone} onChange={e => update({ emergencyPhone: e.target.value })} /></label>
      <label>Microchip number<input maxLength={40} value={cat.microchip} onChange={e => update({ microchip: e.target.value })} /></label>
    </div><p className="hint">Stored on this device. Shared only when you export or transfer records.</p></section>
    {remove && <button className="danger" onClick={remove}><Trash2 size={15} /> Remove this cat and their records</button>}
  </div>;
}
function FeedingGoal({ cat, update }: { cat: CatProfile; update: Upd }) {
  return <div className="form-grid separated"><label className="check"><input type="checkbox" checked={cat.weightLossMode} onChange={e => update({ weightLossMode: e.target.checked })} /> Weight loss supervised by your vet</label>
    {cat.weightLossMode && <label>Target weight agreed with your vet (kg)<input type="number" step={0.01} min={0.3} max={15} value={cat.targetWeightKg || ""} onChange={e => update({ targetWeightKg: number(e.target.value) })} /></label>}
    <label>Daily calories set by your vet (optional, kcal/day)<input type="number" min={0} max={3000} value={cat.vetKcalPerDay || ""} placeholder="Leave blank for the general estimate" onChange={e => update({ vetKcalPerDay: number(e.target.value) })} /><small>Required for health conditions, low BCS, pregnancy or nursing. Do not invent a target.</small></label>
  </div>;
}
export function Feeding({ cat, update }: { cat: CatProfile; update: Upd }) {
  const problems = feedingProblems(cat);
  const plan = problems.length ? null : feedingPlan(cat);
  return <div className="feeding-layout"><div className="stack"><section className="panel"><h2>What is in the bowl?</h2><p className="hint">The saved numbers start as examples. Enter the energy on your own food label. Wet share means calories, not weight.</p>
    <div className="form-grid">
      <label>Dry food energy (kcal/kg)<input aria-label="Dry food energy (kcal/kg)" type="number" min={1} max={10000} value={cat.dryKcalPerKg} onChange={e => update({ dryKcalPerKg: number(e.target.value), foodConfirmed: false })} /><small>kcal/100 g × 10 = kcal/kg. kJ/kg ÷ 4.184 = kcal/kg.</small></label>
      <label>Wet food energy (kcal/can or pouch)<input type="number" min={1} max={10000} value={cat.wetKcalPerCan} onChange={e => update({ wetKcalPerCan: number(e.target.value), foodConfirmed: false })} /><small>For kcal/100 g: multiply by pack grams ÷ 100.</small></label>
      <label>Wet can or pouch size (g)<input type="number" min={1} max={2000} value={cat.wetCanGrams} onChange={e => update({ wetCanGrams: number(e.target.value), foodConfirmed: false })} /></label>
      <label>Meals per day<input type="number" min={1} max={8} step={1} value={cat.mealsPerDay} onChange={e => update({ mealsPerDay: number(e.target.value) })} /></label>
      <label className="full">Calories from wet food: {Math.round(cat.wetShare * 100)}%<input type="range" min={0} max={100} step={5} value={cat.wetShare * 100} onChange={e => update({ wetShare: number(e.target.value) / 100 })} /><div className="range-labels"><span>All dry</span><span>All wet</span></div></label>
      <label>Treats (kcal/day)<input aria-label="Treats (kcal/day)" type="number" min={0} value={cat.treatKcalPerDay} onChange={e => update({ treatKcalPerDay: number(e.target.value) })} /><small>Count every snack. At most 10% of daily calories.</small></label>
    </div><label className="check label-confirm"><input type="checkbox" checked={cat.foodConfirmed} onChange={e => update({ foodConfirmed: e.target.checked })} /> I checked the food energy and pack size against the labels. The food is complete for this cat’s life stage.</label>
    <SourceLinks ids={["aaha-nutrition", "wsava-nutrition"]} /></section>
    <section className="panel"><h2>A plan that fits their health</h2><FeedingGoal cat={cat} update={update} /><p className="hint">For a kitten, use food formulated for growth. This calculator is not for unweaned kittens. No fasting, homemade diet recipes or medication doses are provided.</p></section>
    </div><section className="panel food-result" aria-live="polite"><p className="eyebrow">{cat.name.toUpperCase()}’S DAILY STARTING POINT</p>
      {problems.length ? <><h2>Check these details first</h2><ul className="validation" role="alert">{problems.map(p => <li key={p}>{p}</li>)}</ul></> : !cat.foodConfirmed ? <><h2>Real labels.<br />Not example portions.</h2><p>Confirm your food details to show daily amounts. There is no safe portion without the right energy units.</p></> : plan && <>
        <div className="calorie-number">{Math.round(plan.kcalPerDay)}<span>kcal / day</span></div><p className="hint">{cat.vetKcalPerDay ? "Your vet’s calorie target" : `RER ${plan.rer.toFixed(1)} × factor ${plan.factor}`}</p>
        <div className="food-amounts">{plan.dryGramsPerDay !== null && <div><span>Dry food</span><strong>{plan.dryGramsPerDay.toFixed(1)} <small>g</small></strong></div>}{plan.wetCansPerDay !== null && <div><span>Wet food</span><strong>{plan.wetCansPerDay.toFixed(2)} <small>packs</small></strong><small>{plan.wetGramsPerDay!.toFixed(1)} g total</small></div>}{plan.treatKcalPerDay > 0 && <div><span>Treat allowance</span><strong>{plan.treatKcalPerDay} <small>kcal</small></strong></div>}</div>
        <p>{plan.perMealKcal.toFixed(1)} kcal of food per meal, across {cat.mealsPerDay} meals. Treats are already deducted.</p>
        {plan.weightLoss && <div className="callout">Goal agreed with your vet: {plan.targetWeightKg} kg. The guideline loss range is {(plan.weightLoss.minWeeklyLossKg * 1000).toFixed(0)} to {(plan.weightLoss.maxWeeklyLossKg * 1000).toFixed(0)} g/week (0.5% to 2% of current weight). Your vet sets the rate. The app does not forecast when the cat reaches the goal.</div>}
        {plan.notes.map(n => <p className="hint" key={n}>{n}</p>)}<SourceLinks ids={plan.weightLoss ? ["aaha-nutrition", "aaha-weight-reduction-2021", "feline-obesity-review-2014"] : ["aaha-nutrition", "aaha-feeding-2021"]} />
      </>}
    </section></div>;
}
export function Health({ cat }: { cat: CatProfile }) {
  const breed = breeds.find(b => b.id === cat.breedId);
  return <div className="stack"><div className="callout">These are discussion points, not due dates. Your vet chooses products and intervals for your cat and region. Enter agreed dates in Reminders.</div><section className="panel"><h2>Preventive care · {lifeStage(cat.ageMonths).replace("-", " ")}</h2><div className="health-grid">{healthSchedule(cat).map(i => <article key={i.title} className="health-item"><h3>{i.title}</h3><p>{i.when}</p><p className="hint">{i.note}</p><SourceLinks ids={[i.sourceId]} /></article>)}</div></section>
    {breed && <section className="panel"><h2>Breed & screening · {breed.name}</h2><p>This list is not complete. Breed links are not diagnoses. A negative genetic test does not rule out heart disease. Ask your vet which checks are useful.</p>{breed.risks.length ? <ul>{breed.risks.map(r => <li key={r}>{r}</li>)}</ul> : <p className="hint">The app lists no claim for this breed. That does not mean there is no risk.</p>}<SourceLinks ids={breed.sourceIds} /></section>}
    {cat.region === "act" && <section className="panel"><h2>Living with a cat in the ACT</h2><p>{act.note}</p><ul>{act.items.map(i => <li key={i}>{i}</li>)}</ul><SourceLinks ids={["act-cats"]} /></section>}
  </div>;
}
export function Routine({ cat, compact = false }: { cat: CatProfile; compact?: boolean }) {
  const coat = breeds.find(b => b.id === cat.breedId)?.coat || "short";
  return <section className="panel routine"><div className="section-heading"><h2>A rhythm for their day</h2><span className="badge">Play · eat · rest</span></div><ol className="timeline">{dailyRoutine({ mealsPerDay: cat.mealsPerDay, coat, ageMonths: cat.ageMonths }).map((b, i) => <li key={i}><span className="timeline-time">{b.time}</span><div><b>{b.title}</b><p className="hint">{b.detail}</p></div></li>)}</ol><SourceLinks ids={["aafp-environment"]} />{!compact && <><h3>Build a habit of brushing teeth</h3><p>Go at your cat’s pace. Stop if it hurts or they resist. Ask your vet to check sore gums first.</p><ol>{toothBrushingPlan.map(s => <li key={s}>{s}</li>)}</ol><SourceLinks ids={["cats-teeth", "cornell-dental"]} /></>}</section>;
}
export function NewOwner({ cat, care, change }: { cat: CatProfile; care: CareData; change: (c: CareData) => void }) {
  const checked = care.checks[cat.id] || [];
  return <div className="stack"><section className="panel"><h2>The first week</h2><ul>{newowner.firstWeek.map(s => <li key={s}>{s}</li>)}</ul><SourceLinks ids={["aafp-environment", "cats-carrier"]} /></section><section className="panel"><h2>A safer home</h2><div className="task-list">{newowner.proofing.map((s, i) => <label className="task" key={s}><input type="checkbox" checked={checked.includes(`new:${i}`)} onChange={e => change({ ...care, checks: { ...care.checks, [cat.id]: e.target.checked ? [...checked, `new:${i}`] : checked.filter(x => x !== `new:${i}`) } })} /><span>{s}</span></label>)}</div><SourceLinks ids={["fda-lilies", "icatcare-poisons"]} /></section><div className="two-col"><section className="panel"><h2>Useful from day one</h2><ul>{newowner.wish.map(s => <li key={s}>{s}</li>)}</ul></section><section className="panel"><h2>A starting shopping list</h2><p className="hint">Illustrative AUD costs, not current quotes. Allow for vet care, insurance or an emergency fund.</p><table><thead><tr><th>Item</th><th>Budget guide</th></tr></thead><tbody>{newowner.shopping.map(s => <tr key={s.item}><td>{s.item}</td><td>{s.cost}</td></tr>)}</tbody></table></section></div></div>;
}
export function Fridge({ cat }: { cat: CatProfile }) {
  const problems = feedingProblems(cat);
  const plan = problems.length || !cat.foodConfirmed ? null : feedingPlan(cat);
  return <section className="panel fridge"><button className="primary noprint" onClick={() => window.print()}><Printer size={16} /> Print / save as PDF</button><p className="eyebrow">CAT COMPASS · CARE HANDOVER</p><h2>{cat.name || "My cat"}</h2><p>{cat.ageMonths} months · {cat.weightKg} kg · Body condition {cat.bcs}/9</p><h3>Food & water</h3>{plan ? <p>{Math.round(plan.kcalPerDay)} kcal/day total, with {plan.treatKcalPerDay} kcal for treats. Food across {cat.mealsPerDay} meals.{plan.dryGramsPerDay !== null && ` Dry: ${plan.dryGramsPerDay.toFixed(1)} g/day.`}{plan.wetCansPerDay !== null && ` Wet: ${plan.wetCansPerDay.toFixed(2)} packs/day (${plan.wetGramsPerDay!.toFixed(1)} g).`}</p> : <p className="callout">No feeding amounts: {problems.length ? problems.join(" ") : "Food labels are not confirmed."} Follow the instructions the owner agreed with the vet.</p>}<p>Fresh water at all times. Keep bowls clean. No unapproved foods or medicines.</p>{cat.conditions && <><h3>Known health conditions</h3><p>{cat.conditions}</p></>}<h3>Contacts</h3><p>{cat.vetName || "Vet: not set"} · {cat.vetPhone || "Phone: not set"}<br />Emergency vet: {cat.emergencyPhone || "not set"}</p><h3>Do not wait</h3><ul>{redflags.map(r => <li key={r.id}>{r.title}</li>)}</ul><p>Call a vet immediately for breathing trouble, no urine, collapse or poisoning. For loss of appetite, call the vet promptly. Do not wait 24 hours for kittens or an ill cat.</p><h3>Daily comfort</h3><p>Scoop litter. Offer play and quiet rest. Keep doors and windows secure.</p><p className="hint">General guide, not veterinary advice. Generated {new Date().toLocaleDateString()}. Feeding reference: AAHA 2021 Nutrition and Weight Management Guidelines. See the app’s Sources page for exact links and limits.</p></section>;
}

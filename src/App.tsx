import { useEffect, useMemo, useRef, useState } from "react";
import act from "./content/act.json";
import breeds from "./content/breeds.json";
import newowner from "./content/newowner.json";
import redflags from "./content/redflags.json";
import toys from "./content/toys.json";
import { feedingPlan, feedingProblems, lifeStage } from "./feeding";
import { dailyRoutine, healthSchedule, toothBrushingPlan } from "./health";
import { BCS_DESCRIPTIONS, loadCats, newCat, saveCats, type CatProfile } from "./profile";

const TABS = ["Profile", "Feeding", "Health", "Routine", "Toys", "New owner", "Fridge sheet"] as const;
type Tab = (typeof TABS)[number];

export function App() {
  const loaded = useRef(loadCats()).current;
  const [cats, setCats] = useState<CatProfile[]>(loaded.cats);
  const [notice, setNotice] = useState<string | null>(loaded.problem);
  const dirty = useRef(false); // do not overwrite stored data until the user actually changes something
  const [sel, setSel] = useState(0);
  const [tab, setTab] = useState<Tab>("Profile");
  useEffect(() => {
    if (!dirty.current) return;
    if (!saveCats(cats)) setNotice("Changes can't be saved in this browser (private mode or storage full). They will be lost when you close the page.");
  }, [cats]);
  const cat = cats[Math.min(sel, cats.length - 1)]!;
  const update = (patch: Partial<CatProfile>) => { dirty.current = true; setCats(cats.map((c) => (c.id === cat.id ? { ...c, ...patch } : c))); };

  return (
    <div className="app">
      <header>
        <h1>Cat Compass</h1>
        <p>A care plan built around your cat. Nothing leaves your device.</p>
        {notice && <p className="callout" role="alert">{notice}</p>}
        <p className="disclaimer"><b>Not veterinary advice.</b> These are general guides. Check with your vet for anything that depends on your individual cat.</p>
      </header>
      <nav className="cats" aria-label="Cats">
        {cats.map((c, i) => <button key={c.id} className={i === sel ? "on" : ""} onClick={() => setSel(i)}>{c.name || "Unnamed"}</button>)}
        <button onClick={() => { dirty.current = true; const c = newCat(); setCats([...cats, c]); setSel(cats.length); setTab("Profile"); }}>+ Add cat</button>
        {cats.length > 1 && <button onClick={() => { dirty.current = true; setCats(cats.filter((c) => c.id !== cat.id)); setSel(0); }}>Remove</button>}
      </nav>
      <nav className="tabs" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={t === tab} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
      </nav>
      <main>
        <RedFlagPanel />
        {tab === "Profile" && <Profile cat={cat} update={update} />}
        {tab === "Feeding" && <Feeding cat={cat} update={update} />}
        {tab === "Health" && <Health cat={cat} />}
        {tab === "Routine" && <Routine cat={cat} />}
        {tab === "Toys" && <Toys />}
        {tab === "New owner" && <NewOwner cat={cat} />}
        {tab === "Fridge sheet" && <Fridge cat={cat} />}
      </main>
      <footer>Energy factors: AAHA 2021 Nutrition and Weight Management Guidelines. Vaccines: WSAVA 2024. ACT rules: ACT Government. Other items cite WSAVA, AAFP / ISFM, RSPCA Australia, Cornell Feline Health Center and the AVA by name and are not yet individually verified.</footer>
    </div>
  );
}

function RedFlagPanel() {
  return (
    <details className="redflags">
      <summary>⚠ Emergency signs: when to see a vet now</summary>
      <ul>{redflags.map((r) => (
        <li key={r.id}><b>{r.title}.</b> {r.signs} <em>{r.action}</em> <small>({r.source})</small></li>
      ))}</ul>
    </details>
  );
}

type Upd = (p: Partial<CatProfile>) => void;
const num = (v: string, d = 0) => (Number.isFinite(Number(v)) && v !== "" ? Number(v) : d);

function Profile({ cat, update }: { cat: CatProfile; update: Upd }) {
  const years = Math.floor(cat.ageMonths / 12), months = cat.ageMonths % 12;
  return (
    <section className="form">
      <label>Name<input value={cat.name} onChange={(e) => update({ name: e.target.value })} /></label>
      <fieldset><legend>Age</legend><span className="row">
        <input aria-label="Years" type="number" min={0} max={30} value={years} onChange={(e) => update({ ageMonths: num(e.target.value) * 12 + months })} /> years
        <input aria-label="Months" type="number" min={0} max={11} value={months} onChange={(e) => update({ ageMonths: years * 12 + num(e.target.value) })} /> months
      </span></fieldset>
      <label>Breed<select value={cat.breedId} onChange={(e) => update({ breedId: e.target.value })}>
        {breeds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label>Weight (kg)<input type="number" step="0.1" min={0.3} value={cat.weightKg} onChange={(e) => update({ weightKg: num(e.target.value, cat.weightKg) })} /></label>
      <fieldset><legend>Body condition score (1–9)</legend>
        <div className="bcs">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} type="button" className={n === cat.bcs ? "on" : ""} onClick={() => update({ bcs: n })} aria-pressed={n === cat.bcs}>{n}</button>))}</div>
        <p className="hint">{BCS_DESCRIPTIONS[cat.bcs]}</p>
      </fieldset>
      <label>Sex<select value={cat.sex} onChange={(e) => update({ sex: e.target.value as CatProfile["sex"] })}><option value="female">Female</option><option value="male">Male</option></select></label>
      <label className="check"><input type="checkbox" checked={cat.desexed} onChange={(e) => update({ desexed: e.target.checked })} /> Desexed</label>
      <label>Lifestyle<select value={cat.lifestyle} onChange={(e) => update({ lifestyle: e.target.value as CatProfile["lifestyle"] })}>
        <option value="indoor">Indoor only</option><option value="enclosure">Indoor + secure outdoor enclosure</option><option value="outdoor">Indoor / outdoor</option></select></label>
      <label>Where do you live?<select value={cat.region} onChange={(e) => update({ region: e.target.value as CatProfile["region"] })}>
        <option value="act">ACT</option><option value="east-coast">Eastern coast (tick area)</option><option value="other">Elsewhere in Australia</option></select></label>
      <label>Activity<select value={cat.activity} onChange={(e) => update({ activity: e.target.value as CatProfile["activity"] })}>
        <option value="low">Low / sedentary</option><option value="normal">Normal</option><option value="high">High</option></select></label>
      <label>Known health conditions<textarea value={cat.conditions} onChange={(e) => update({ conditions: e.target.value })} placeholder="e.g. kidney disease, diabetes" /></label>
      {cat.conditions.trim() && <p className="callout">Because {cat.name || "your cat"} has noted health conditions, check every feeding and routine suggestion with your vet.</p>}
      <label className="check"><input type="checkbox" checked={cat.weightLossMode} onChange={(e) => update({ weightLossMode: e.target.checked })} /> Weight-loss mode</label>
    </section>
  );
}

function Feeding({ cat, update }: { cat: CatProfile; update: Upd }) {
  const plan = useMemo(() => feedingPlan({
    weightKg: cat.weightKg, bcs: cat.bcs, ageMonths: cat.ageMonths, desexed: cat.desexed, activity: cat.activity,
    weightLossMode: cat.weightLossMode, dryKcalPerKg: cat.dryKcalPerKg, wetKcalPerCan: cat.wetKcalPerCan,
    wetCanGrams: cat.wetCanGrams, wetShare: cat.wetShare, mealsPerDay: cat.mealsPerDay,
  }), [cat]);
  const problems = feedingProblems(cat);
  if (problems.length) return <section className="form"><h2>Feeding for {cat.name || "your cat"}</h2><p className="callout" role="alert">{problems.join(" ")} Fix these on the Profile tab.</p></section>;
  return (
    <section className="form">
      <h2>Feeding for {cat.name || "your cat"}</h2>
      <label>Dry food energy (kcal per kg)<input type="number" value={cat.dryKcalPerKg} onChange={(e) => update({ dryKcalPerKg: num(e.target.value) })} /></label>
      <label>Wet food energy (kcal per can)<input type="number" value={cat.wetKcalPerCan} onChange={(e) => update({ wetKcalPerCan: num(e.target.value) })} /></label>
      <label>Can size (g)<input type="number" value={cat.wetCanGrams} onChange={(e) => update({ wetCanGrams: num(e.target.value, 85) })} /></label>
      <label>Share of calories from wet food: {Math.round(cat.wetShare * 100)}%<input type="range" min={0} max={100} step={5} value={cat.wetShare * 100} onChange={(e) => update({ wetShare: Number(e.target.value) / 100 })} /></label>
      <label>Meals per day<input type="number" min={1} max={6} value={cat.mealsPerDay} onChange={(e) => update({ mealsPerDay: num(e.target.value, 2) })} /></label>
      <div className="result">
        <p><b>{plan.kcalPerDay.toFixed(0)} kcal / day</b> <small>(RER {plan.rer.toFixed(0)} × {plan.factor})</small></p>
        {plan.dryGramsPerDay !== null && <p>Dry: <b>{plan.dryGramsPerDay.toFixed(0)} g / day</b></p>}
        {plan.wetCansPerDay !== null && cat.wetShare > 0 && <p>Wet: <b>{plan.wetCansPerDay.toFixed(2)} cans / day</b> (~{plan.wetGramsPerDay!.toFixed(0)} g)</p>}
        <p>≈ {plan.perMealKcal.toFixed(0)} kcal per meal · Water target ≈ {(plan.waterMlPerDay).toFixed(0)} ml / day <small>(including water in wet food)</small></p>
        {plan.weightLoss && <p className="callout">Target weight {plan.targetWeightKg.toFixed(1)} kg. Aim to lose about {(plan.weightLoss.weeklyLossKg * 1000).toFixed(0)} g per week (~1% of body weight): roughly {plan.weightLoss.weeksToTarget} weeks. Weigh weekly.</p>}
        {plan.notes.map((n, i) => <p className="hint" key={i}>{n}</p>)}
      </div>
    </section>
  );
}

function Health({ cat }: { cat: CatProfile }) {
  const breed = breeds.find((b) => b.id === cat.breedId);
  const items = healthSchedule({ ageMonths: cat.ageMonths, lifestyle: cat.lifestyle, region: cat.region });
  return (
    <section>
      <h2>Health for {cat.name || "your cat"} <small>({lifeStage(cat.ageMonths).replace("-", " ")})</small></h2>
      <h3>Schedule</h3>
      <ul className="cards">{items.map((i) => <li key={i.title}><b>{i.title}</b><br />{i.when}<br /><small>{i.note} ({i.source})</small></li>)}</ul>
      {breed && <><h3>Breed predispositions: {breed.name}</h3><p className="hint">Risks are tendencies, not diagnoses. Ask your vet which screening suits your cat.</p><ul>{breed.risks.map((r) => <li key={r}>{r}</li>)}</ul></>}
      {cat.region === "act" && (
        <div className="callout"><b>ACT rules{act.verified ? "" : " (unverified)"}.</b> {act.note}<ul>{act.items.map((i) => <li key={i}>{i}</li>)}</ul><small>Source: {act.source}</small></div>
      )}
    </section>
  );
}

function Routine({ cat }: { cat: CatProfile }) {
  const breed = breeds.find((b) => b.id === cat.breedId);
  const blocks = dailyRoutine({ mealsPerDay: cat.mealsPerDay, coat: breed?.coat ?? "short", ageMonths: cat.ageMonths });
  return (
    <section>
      <h2>Daily routine</h2>
      <p className="hint">Play follows the cat's natural sequence: hunt → catch → eat → groom → sleep.</p>
      <ol className="timeline">{blocks.map((b, i) => <li key={i}><span>{b.time}</span><b>{b.title}</b><br />{b.detail}</li>)}</ol>
      <h3>Tooth-brushing in 2–3 weeks</h3>
      <ol>{toothBrushingPlan.map((s) => <li key={s}>{s}</li>)}</ol>
      <h3>Litter</h3>
      <p>One tray per cat plus one extra, in quiet spots away from food and water. Scoop daily and wash the tray weekly with mild soap.</p>
    </section>
  );
}

function Toys() {
  return (
    <section>
      <h2>Toys</h2>
      <p className="callout">No unsupervised string, ribbon or elastic toys.</p>
      <div className="grid">{toys.map((t) => (
        <article key={t.id} className="card"><small>{t.kind === "diy" ? "DIY" : "Buy"}</small><h3>{t.name}</h3><p>{t.why}</p>
          <ol>{t.how.map((h) => <li key={h}>{h}</li>)}</ol><p className="hint"><b>Safety:</b> {t.safety}</p></article>
      ))}</div>
    </section>
  );
}

function NewOwner({ cat }: { cat: CatProfile }) {
  return (
    <section>
      <h2>First month with {cat.name || "your cat"}</h2>
      <h3>First week</h3><ul>{newowner.firstWeek.map((s) => <li key={s}>{s}</li>)}</ul>
      <h3>Cat-proofing checklist</h3><ul className="checks">{newowner.proofing.map((s) => <li key={s}><label><input type="checkbox" /> {s}</label></li>)}</ul>
      <h3>Things I wish I'd had</h3><ul>{newowner.wish.map((s) => <li key={s}>{s}</li>)}</ul>
      <h3>Shopping list (rough costs)</h3>
      <table><tbody>{newowner.shopping.map((s) => <tr key={s.item}><td>{s.item}</td><td>{s.cost}</td></tr>)}</tbody></table>
    </section>
  );
}

function Fridge({ cat }: { cat: CatProfile }) {
  const problems = feedingProblems(cat);
  if (problems.length) return <section className="fridge"><p className="callout" role="alert">The fridge sheet needs valid details first. {problems.join(" ")}</p></section>;
  const plan = feedingPlan({
    weightKg: cat.weightKg, bcs: cat.bcs, ageMonths: cat.ageMonths, desexed: cat.desexed, activity: cat.activity,
    weightLossMode: cat.weightLossMode, dryKcalPerKg: cat.dryKcalPerKg, wetKcalPerCan: cat.wetKcalPerCan,
    wetCanGrams: cat.wetCanGrams, wetShare: cat.wetShare, mealsPerDay: cat.mealsPerDay,
  });
  return (
    <section className="fridge">
      <button className="noprint" onClick={() => window.print()}>Print</button>
      <h2>{cat.name || "My cat"}</h2>
      <p>{Math.floor(cat.ageMonths / 12)}y {cat.ageMonths % 12}m · {cat.weightKg} kg · BCS {cat.bcs}/9</p>
      <h3>Daily food</h3>
      <p>{plan.kcalPerDay.toFixed(0)} kcal across {cat.mealsPerDay} meals.
        {plan.dryGramsPerDay !== null && ` Dry ${plan.dryGramsPerDay.toFixed(0)} g.`}
        {plan.wetCansPerDay !== null && cat.wetShare > 0 && ` Wet ${plan.wetCansPerDay.toFixed(2)} cans.`}</p>
      <h3>Emergency: go to a vet now</h3>
      <ul>{redflags.slice(0, 5).map((r) => <li key={r.id}>{r.title}</li>)}</ul>
      <h3>Daily</h3>
      <ul><li>Fresh water, scoop litter</li><li>Two play sessions (10–15 min)</li><li>Brush coat</li></ul>
      <p className="hint">Not veterinary advice. Check with your vet.</p>
    </section>
  );
}

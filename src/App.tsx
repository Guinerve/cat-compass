import { useEffect, useState } from "react";
import { ArrowUpRight, Bell, BookOpen, Cat, ChevronRight, CircleHelp, House, NotebookPen, Plus, Printer, ShieldCheck, Smartphone, Stethoscope, Utensils, type LucideIcon } from "lucide-react";
import { feedingPlan, feedingProblems } from "./feeding";
import { loadCats, newCat, saveCats, type CatProfile } from "./profile";
import { completeReminder, loadCare, localDate, saveCare, type Backup, type CareData } from "./care";
import { Feeding, Fridge, Health, NewOwner, Profile, Routine, RedFlagPanel } from "./components/CarePanels";
import { Journal, Reminders, Connect } from "./components/Records";
import { Library, Sources } from "./components/Library";
import { CatArt } from "./components/CatArt";

const pages = [
  ["Today", House], ["Profile", Cat], ["Feeding", Utensils], ["Health", Stethoscope],
  ["Care journal", NotebookPen], ["Reminders", Bell], ["Care library", BookOpen],
  ["New owner", CircleHelp], ["Care sheet", Printer], ["Phone & backup", Smartphone], ["Sources", ShieldCheck],
] as const satisfies readonly (readonly [string, LucideIcon])[];
export type Page = (typeof pages)[number][0];

export function App() {
  const [loaded] = useState(loadCats);
  const [careLoaded] = useState(loadCare);
  const [cats, setCats] = useState(loaded.cats);
  const [care, setCare] = useState(careLoaded.care);
  const [careDirty, setCareDirty] = useState(false);
  const [notice, setNotice] = useState<string | null>(loaded.problem || careLoaded.problem);
  const [selected, setSelected] = useState(cats[0]!.id);
  const [page, setPage] = useState<Page>(() => location.hash.startsWith("#transfer=") ? "Phone & backup" : "Today");
  const [transferToken, setTransferToken] = useState(() => location.hash.startsWith("#transfer=") ? location.hash.slice(10) : "");
  useEffect(() => {
    const receive = () => { if (location.hash.startsWith("#transfer=")) { setTransferToken(location.hash.slice(10)); setPage("Phone & backup"); } };
    window.addEventListener("hashchange", receive); return () => window.removeEventListener("hashchange", receive);
  }, []);
  const cat = cats.find(c => c.id === selected) || cats[0]!;
  const changeCats = (data: CatProfile[]) => { if (!saveCats(data)) setNotice("Profiles could not be saved. Export a backup before you close the app."); setCats(data); };
  const update = (patch: Partial<CatProfile>) => changeCats(cats.map(c => c.id === cat.id ? { ...c, ...patch } : c));
  // Pass nextCats when the same action also changes profiles, so the save does not restore an old list.
  const changeCare = (data: CareData, nextCats: CatProfile[] = cats) => {
    // Persist a first-visit profile ID before saving its related care records.
    if (!saveCats(nextCats) || !saveCare(data)) setNotice("Care records could not be saved. Export a backup before you close the app.");
    setCareDirty(true); setCare(data);
  };
  useEffect(() => {
    const desktop = window.catCompassDesktop;
    if (!desktop) return;
    // Do not replace a retained native schedule after a failed local-data load.
    if (careLoaded.problem && !careDirty) return;
    void desktop.setReminders(care.reminders.map(r => ({ ...r, catName: cats.find(c => c.id === r.catId)?.name || "Cat" })))
      .then(ok => { if (!ok) setNotice("Desktop reminders could not be saved. Use calendar export as a backup."); })
      .catch(() => setNotice("Desktop reminders are unavailable. Use calendar export."));
  }, [care.reminders, cats, careDirty, careLoaded.problem]);
  useEffect(() => {
    if (window.catCompassDesktop) return;
    const check = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      for (const r of care.reminders) {
        if (!r.enabled || Date.parse(r.due) > Date.now()) continue;
        const key = `cat-compass:notified:${r.id}`;
        try {
          if (localStorage.getItem(key) === r.due) continue;
          new Notification(`${cats.find(c => c.id === r.catId)?.name || "Cat"}: ${r.title}`, { body: "Open Cat Compass to complete this care task.", tag: r.id });
          localStorage.setItem(key, r.due);
        } catch { /* Browsers may require a service worker. Calendar export is available. */ }
      }
    };
    check(); const timer = setInterval(check, 30000); return () => clearInterval(timer);
  }, [care.reminders, cats]);
  const restore = (backup: Backup) => {
    if (!window.confirm(`Replace all local profiles and care records with ${backup.cats.length} imported cat(s)? Export a backup first.`)) return false;
    // Roll back both stores on partial failure. In-memory state changes only after both writes succeed.
    const keys = ["cat-compass:v1", "cat-compass:care:v2"];
    try {
      const old = keys.map(k => localStorage.getItem(k));
      try {
        localStorage.setItem(keys[0]!, JSON.stringify(backup.cats)); localStorage.setItem(keys[1]!, JSON.stringify(backup.care));
      } catch (error) {
        keys.forEach((k, i) => old[i] === null ? localStorage.removeItem(k) : localStorage.setItem(k, old[i]!)); throw error;
      }
    } catch { setNotice("Import could not be saved. Existing app data remains in memory. Check storage and keep your backup file."); return false; }
    setCats(backup.cats); setCare(backup.care); setSelected(backup.cats[0]!.id); setCareDirty(true); setTransferToken(""); setNotice("Backup imported. Devices do not sync automatically."); return true;
  };
  const remove = () => {
    if (cats.length < 2 || !window.confirm(`Remove ${cat.name} and their reminders, journal and checklists? This cannot be undone.`)) return;
    const next = cats.filter(c => c.id !== cat.id);
    setCats(next); setSelected(next[0]!.id);
    const checks = { ...care.checks }; delete checks[cat.id];
    changeCare({ reminders: care.reminders.filter(r => r.catId !== cat.id), journal: care.journal.filter(r => r.catId !== cat.id), checks }, next);
  };
  const complete = (id: string) => changeCare({ ...care, reminders: care.reminders.map(r => r.id === id ? completeReminder(r) : r) });
  return <div className="workspace">
    <a className="skip" href="#main">Skip to content</a>
    <aside className="sidebar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setPage("Today"); }}><span className="brand-mark"><Cat size={25} /></span><span>cat compass<small>A little care, every day.</small></span></a>
      <div className="rail-label">YOUR COMPANIONS</div>
      <div className="cat-switch"><span className="avatar"><Cat /></span><label><span className="sr-only">Selected cat</span><select value={cat.id} onChange={e => setSelected(e.target.value)}>{cats.map(c => <option key={c.id} value={c.id}>{c.name || "Unnamed cat"}</option>)}</select><small>{cats.length} {cats.length === 1 ? "cat" : "cats"} in your care</small></label></div>
      <button className="add-cat" onClick={() => { const c = { ...newCat(), name: "New cat" }; changeCats([...cats, c]); setSelected(c.id); setPage("Profile"); }}><Plus size={16} /> Add a cat</button>
      <nav aria-label="Main navigation">{pages.map(([name, Icon], i) => <button key={name} className={`nav-item ${name === page ? "active" : ""} ${i === 6 ? "nav-break" : ""}`} aria-current={name === page ? "page" : undefined} onClick={() => setPage(name)}><Icon size={19} />{name}{name === page && <ChevronRight size={14} className="nav-arrow" />}</button>)}</nav>
      <div className="rail-note"><ShieldCheck size={19} /><div>Local by default.<small>No account. No tracking. You choose what to share.</small></div></div>
    </aside>
    <div className="content">
      <header className="topbar"><span>Your care space <ChevronRight size={14} /> <b>{page}</b></span><button className="quiet" onClick={() => setPage("Phone & backup")}><Smartphone size={16} /> Take care with you</button></header>
      <main id="main" tabIndex={-1}>
        {notice && <div className="callout" role="alert">{notice}<button className="quiet" aria-label="Dismiss notice" onClick={() => setNotice(null)}>Dismiss</button></div>}
        <RedFlagPanel cat={cat} />
        {page === "Today" ? <Today cat={cat} care={care} changeCare={changeCare} go={setPage} complete={complete} /> : <div className="page-heading"><p className="eyebrow">{["Care library", "Sources", "Phone & backup"].includes(page) ? "CAT COMPASS" : cat.name.toUpperCase() + "’S CARE"}</p><h1>{page}</h1><p>{pageDescriptions[page]}</p></div>}
        {page === "Profile" && <Profile cat={cat} update={update} remove={cats.length > 1 ? remove : undefined} />}
        {page === "Feeding" && <Feeding cat={cat} update={update} />}
        {page === "Health" && <Health cat={cat} />}
        {page === "Care journal" && <Journal key={cat.id} cat={cat} care={care} change={changeCare} update={update} />}
        {page === "Reminders" && <Reminders key={cat.id} cat={cat} cats={cats} care={care} change={changeCare} complete={complete} />}
        {page === "Care library" && <Library />}
        {page === "New owner" && <NewOwner cat={cat} care={care} change={changeCare} />}
        {page === "Care sheet" && <Fridge cat={cat} />}
        {page === "Phone & backup" && <Connect cats={cats} cat={cat} care={care} restore={restore} incoming={transferToken} />}
        {page === "Sources" && <Sources />}
      </main>
      <footer><ShieldCheck size={15} /><span>Care guidance, not a diagnosis. Your vet sets treatment, vaccine dates and special diets.</span><button className="text-button" onClick={() => setPage("Sources")}>Read the sources <ArrowUpRight size={13} /></button></footer>
    </div>
  </div>;
}
const pageDescriptions: Record<Page, string> = {
  Today: "", Profile: "The details that make their care personal.", Feeding: "From the food label to the bowl. Clear units and checked calculations.",
  Health: "Prevention, early warning signs and questions for your vet.", "Care journal": "Keep weight, observations and vet visits in one place.",
  Reminders: "Set dates from your vet or product label. Send them to your calendar.", "Care library": "Practical guides for life with a cat. Sources stay close to the advice.",
  "New owner": "A calm start, a safe home and a checklist you can keep.", "Care sheet": "A simple handover for the fridge, a pet sitter or your vet.",
  "Phone & backup": "Install the app. Move your records. Keep reminders on your phone.", Sources: "See where the advice comes from, what was checked and what remains uncertain.",
};
function Today({ cat, care, changeCare, go, complete }: { cat: CatProfile; care: CareData; changeCare: (c: CareData) => void; go: (p: Page) => void; complete: (id: string) => void }) {
  const problems = feedingProblems(cat);
  const plan = !problems.length && cat.foodConfirmed ? feedingPlan(cat) : null;
  const tasks = ["Fresh water", "Scoop litter", "Play together", "Check appetite & comfort"];
  const today = localDate(); const done = care.checks[cat.id] || [];
  const upcoming = care.reminders.filter(r => r.catId === cat.id && r.enabled).sort((a, b) => Date.parse(a.due) - Date.parse(b.due)).slice(0, 3);
  return <>
    <section className="hero"><div><p className="eyebrow">A GOOD DAY STARTS WITH A LITTLE CARE</p><h1>Life is better<br />with {cat.name || "your cat"}.</h1><p>Food, play, health and the small things.<br />Your cat’s care, all in one place.</p><button className="primary" onClick={() => go("Profile")}>Make it their own <ArrowUpRight size={16} /></button></div><CatArt /><span className="hero-note">Made for their everyday.</span></section>
    <div className="section-heading"><div><p className="eyebrow">THE LITTLE THINGS ADD UP</p><h2>Today, at a glance</h2></div><span className="date-pill">{new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</span></div>
    <div className="stats-grid">
      <button className="stat peach" onClick={() => go("Feeding")}><span className="stat-icon"><Utensils size={21} /></span><span className="eyebrow">DAILY FOOD</span><strong>{plan ? Math.round(plan.kcalPerDay) : "Set up"}<small>{plan ? "kcal / day" : "food labels"}</small></strong><span>{plan ? `${cat.mealsPerDay} meals · treats included` : problems.length ? "Check profile and food details" : "Confirm the label, not our example"}</span><ArrowUpRight className="stat-arrow" size={18} /></button>
      <button className="stat sage" onClick={() => go("Care journal")}><span className="stat-icon"><NotebookPen size={21} /></span><span className="eyebrow">WEIGHT & WELLBEING</span><strong>{cat.weightKg}<small>kg</small></strong><span>BCS {cat.bcs}/9 · Keep a weight record</span><ArrowUpRight className="stat-arrow" size={18} /></button>
      <button className="stat cream" onClick={() => go("Reminders")}><span className="stat-icon"><Bell size={21} /></span><span className="eyebrow">CARE REMINDERS</span><strong>{care.reminders.filter(r => r.catId === cat.id && r.enabled).length}<small>active</small></strong><span>Dates you set, not medical guesses</span><ArrowUpRight className="stat-arrow" size={18} /></button>
    </div>
    <div className="two-col"><section className="panel"><div className="section-heading"><h2>Small daily wins</h2><span className="badge">{tasks.filter(t => done.includes(`${today}:${t}`)).length} / {tasks.length}</span></div><p className="hint">A fresh checklist each day. No need for a perfect streak.</p><div className="task-list">{tasks.map(t => <label key={t} className="task"><input type="checkbox" checked={done.includes(`${today}:${t}`)} onChange={e => { const key = `${today}:${t}`; const kept = done.filter(x => x.startsWith("new:") || x.startsWith(today + ":")); changeCare({ ...care, checks: { ...care.checks, [cat.id]: e.target.checked ? [...kept, key] : kept.filter(x => x !== key) } }); }} /><span>{t}</span></label>)}</div></section>
      <section className="panel"><div className="section-heading"><h2>Coming up</h2><button className="text-button" onClick={() => go("Reminders")}>View all <ChevronRight size={14} /></button></div>{upcoming.length ? upcoming.map(r => <div className="reminder-row" key={r.id}><Bell size={17} /><div><b>{r.title}</b><small>{Date.parse(r.due) < Date.now() ? "Overdue · " : ""}{new Date(r.due).toLocaleString()}</small></div><button className="quiet" onClick={() => complete(r.id)}>Done</button></div>) : <div className="empty"><Bell size={30} /><p>No reminders yet.</p><span>Add a weigh-in, play time or a vet-agreed care date.</span><button className="text-button" onClick={() => go("Reminders")}>Add your first reminder <Plus size={14} /></button></div>}</section></div>
    <section className="library-banner"><BookOpen size={32} /><div><p className="eyebrow">UNDERSTAND YOUR CAT</p><h2>A guide for every stage of life.</h2><p>Settling in, feeding, play, health and the senior years.</p></div><button onClick={() => go("Care library")}>Explore the library <ArrowUpRight size={16} /></button></section>
    <Routine cat={cat} compact />
  </>;
}

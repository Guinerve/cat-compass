import { useState } from "react";
import { ArrowUpRight, BookOpen, Clock, Search, ShieldCheck } from "lucide-react";
import toys from "../content/toys.json";
import { guides } from "../guides";
import { getSource, sources } from "../sources";
export function SourceLinks({ ids }: { ids: string[] }) {
  return <div className="source-links">{ids.map(id => {
    const s = getSource(id);
    if (!s) return <span key={id} className="hint">Source not available: {id}</span>;
    return <details key={id}><summary><ShieldCheck size={12} />{s.publisher}<ArrowUpRight size={11} /></summary><div className="source-popover"><a href={s.url} target="_blank" rel="noreferrer">{s.title} <ArrowUpRight size={13} /></a><p>{s.kind} · Read {s.checked}</p><p>{s.locator}</p><p className="hint">{s.limits}</p></div></details>;
  })}</div>;
}
export function Library() {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("All guides");
  const [selected, setSelected] = useState<string | null>(null);
  const categories = ["All guides", ...new Set(guides.map(g => g.category))];
  const shown = guides.filter(g => (category === "All guides" || g.category === category) && `${g.title} ${g.summary} ${g.steps.join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const opened = guides.find(g => g.id === selected);
  return <div className="stack"><div className="library-tools"><label className="search-box"><Search size={18} /><span className="sr-only">Search care guides</span><input type="search" placeholder="Find a guide: teeth, kitten, litter…" value={search} onChange={e => setSearch(e.target.value)} /></label><span className="hint">{guides.length} practical guides</span></div><div className="filter-chips" role="group" aria-label="Guide categories">{categories.map(c => <button key={c} aria-pressed={category === c} className={category === c ? "on" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
    {opened && <article className="panel opened-guide"><div className="section-heading"><span className="eyebrow">{opened.category}</span><button onClick={() => setSelected(null)}>Close guide</button></div><h2>{opened.title}</h2><p>{opened.summary}</p><ol className="guide-steps">{opened.steps.map(s => <li key={s}>{s}</li>)}</ol><div className="callout">{opened.safety}</div><h3>Sources & further reading</h3><SourceLinks ids={opened.sources} /></article>}
    <div className="guide-grid">{shown.map((g, i) => <button key={g.id} className={`guide-card tint-${i % 4}`} onClick={() => setSelected(g.id)} aria-expanded={selected === g.id}><div className="guide-card-top"><span className="eyebrow">{g.category}</span><BookOpen size={22} /></div><h2>{g.title}</h2><p>{g.summary}</p><span className="guide-card-bottom"><span><Clock size={13} /> {g.minutes} min read</span><ArrowUpRight size={18} /></span></button>)}</div>{!shown.length && <div className="panel empty"><Search size={26} /><h2>No matching guide</h2><p>Try a different word or choose All guides.</p></div>}
    <section className="panel"><p className="eyebrow">MAKE ROOM FOR PLAY</p><h2>Good toys do not need a big budget.</h2><p>These DIY steps are app suggestions based on the environmental guideline. Supervise use. Do not use a toy the cat chews or swallows.</p><div className="toy-grid">{toys.map(t => <article key={t.id}><span className="badge">{t.kind === "diy" ? "Make it" : "Buy it"}</span><h3>{t.name}</h3><p>{t.why}</p><ol>{t.how.map(s => <li key={s}>{s}</li>)}</ol><p className="hint"><b>Safety:</b> {t.safety}</p></article>)}</div><SourceLinks ids={["aafp-environment"]} /></section>
    <p className="hint">Guides are original summaries. Cats.com links are further reading. Its articles and images are not republished. Cat Compass is not affiliated with Cats.com.</p>
  </div>;
}
export function Sources() {
  const [query, setQuery] = useState("");
  const shown = sources.filter(s => `${s.title} ${s.publisher} ${s.kind} ${s.locator}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="stack"><div className="callout"><b>Read against sources, not clinically approved.</b> Public pages and guideline sections were read on 13 October 2026. A veterinarian has not reviewed this app. Local laws, products and source pages can change. The app works offline; external references need a connection.</div><div className="panel"><h2>How to read the evidence</h2><p>Veterinary guidelines support the feeding formula and care principles. University and welfare pages support warning signs. Clinic opinions are labelled local and dated. Cats.com offers owner reading, not the formula authority.</p><p>The normal/high activity mapping is an app assumption. Food amounts are estimates. The 1 July 2022 ACT birthday boundary remains unresolved. No symptom checker, diagnosis or medication dose is supplied.</p></div><label className="search-box"><Search size={18} /><span className="sr-only">Search sources</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search AAHA, Cornell, vaccines…" /></label><p className="hint">{shown.length} of {sources.length} source records</p><div className="sources-grid">{shown.map(s => <article className="panel source-card" key={s.id} id={`source-${s.id}`}><span className="badge">{s.kind}</span><h2><a href={s.url} target="_blank" rel="noreferrer">{s.title}<ArrowUpRight size={16} /></a></h2><p className="hint">{s.publisher} · Read {s.checked}</p><p><b>Checked section:</b> {s.locator}</p>{s.excerpt && <blockquote>{s.excerpt}</blockquote>}<p className="hint"><b>Limits:</b> {s.limits}</p><code>{s.id}</code></article>)}</div>{!shown.length && <p>No matching source. Try another term.</p>}</div>;
}

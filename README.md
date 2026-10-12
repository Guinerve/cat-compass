# cat-compass

> A personalised, interactive care plan for your cat.

**Status:** v0.1 core built (logic tested; UI not yet visually checked in a browser) · Portfolio project #13 · see `../README.md`

## The idea

Enter a cat's details and get a complete care plan: how much of *your* food to feed, health risks to watch for, a daily routine, play and toy ideas, and a first-month guide for new owners. Scope v1 at 1–2 days.

## Stack

React, TypeScript, Vite, Vitest. Breed, toy and care content lives in editable JSON. Local storage only, no account.

Dev server binds to `0.0.0.0` on port **5195** so it's reachable over Tailscale (`vite --host 0.0.0.0 --port 5195 --strictPort`). Deploy to GitHub Pages.

## Build plan (v1)

- [ ] (partly done) **Profile wizard:** (single-page form, not a stepped wizard; BCS picker is a 1–9 button row with descriptions, no illustrations yet)  name, age/birthdate, breed (incl. domestic short/long hair), weight with a visual 1–9 body-condition-score picker, sex and desexed status, indoor/outdoor/enclosure, activity level, health conditions, food kcal per kg or per can
- [x] **Feeding:** RER = 70 × kg^0.75 × life-stage factor; grams/cans of the actual food; wet/dry split; meal schedule; water target; weight-loss mode feeds for ideal weight with a safe weekly cap
- [ ] (partly done) **Health:** schedule and breed risks done (11 breeds); the schedule text needs a vet-source check. breed-linked risks and signs to watch; Australian vaccine and parasite schedule (F3 core, FIV for outdoor cats, paralysis ticks on the east coast); checkup rhythm by life stage
- [x] **Red-flag panel:** (8 items, always visible at the top) male cat straining to urinate, not eating >24 h, open-mouth breathing, lily exposure, permethrin dog flea products
- [x] **Daily routine timeline:** 2–3 week tooth-brushing training plan, grooming by coat length, nail trims, litter (one box per cat plus one, scooped daily), play built on hunt → catch → eat → groom → sleep
- [x] **Toys:** (6 entries; more needed) bought and DIY with step-by-step instructions and safety notes (no unsupervised string toys)
- [x] **New owners:** "things I wish I'd had", first-week guide, cat-proofing checklist, shopping list with rough costs
- [ ] **ACT mode:** placeholder text only, flagged UNVERIFIED in the app. Check the ACT Government site before anything is shown as fact. local containment and registration rules (verify current rules before shipping)
- [x] Multiple cats; printable one-page fridge sheet

## Run it

```bash
npm install
npm run dev      # http://0.0.0.0:5195
npm test         # 21 tests
```

## How I know it's right

21 unit tests pass (`src/feeding.test.ts`, `src/health.test.ts`).

Review fixes: invalid weight/age/BCS/meals now show a message instead of `NaN kcal` (including on the printed fridge sheet); corrupt saved data is backed up and reported, not silently replaced; a failed save shows a warning; an error boundary replaces a blank page.

**Honest status:** the feeding tests check the code against the formulas (RER = 70 × kg^0.75; 4 kg desexed adult → 197.99 kcal RER → 237.6 kcal/day → 62.5 g of a 3800 kcal/kg dry food). They are **not yet checked against worked examples from a veterinary source**, and the life-stage factors (2.5 / 2.0 / 1.2 / 1.4 / 1.0 / 1.1 / 0.8 for weight loss) are from memory of the commonly used WSAVA/AAHA tables. Verify each against the source before this is shown to anyone.

Sources are named per item in `src/content/*.json` (WSAVA, AAFP / ISFM, RSPCA Australia, Cornell Feline Health Center, AVA) but not yet linked to specific pages.

## Limits

The weight-loss target estimates ideal weight as ~10 % per BCS point above 5. Breed predispositions are tendencies, not diagnoses.

**Not veterinary advice.** "Check with your vet" prompts wherever a recommendation depends on the individual cat.

## Next (tomorrow)

- **Verify all content against sources** (feeding factors, vaccine schedule, red flags). Add real URLs.
- Verify ACT rules or remove the section.
- Look at the UI in a browser; BCS illustrations; stepped wizard if it feels better.

## Stretch

Weight tracker with trend chart; reminders export to calendar (.ics).

## Definition of done

- [ ] Hero GIF or screenshot at the top of this README
- [x] Live demo link or one-command run (`npm install && npm run dev`)
- [ ] "How I know it's right" section filled in with real results
- [ ] Tests passing in CI, badge added
- [ ] "Limits" section written
- [ ] Licence chosen, repo description and topics set
- [ ] Pinned on GitHub profile and added to guinerve.github.io
- [ ] Added to `career-radar/data/cv/portfolio.json`

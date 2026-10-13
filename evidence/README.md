# Cat Compass evidence boundaries

Read date: 13 October 2026. This record separates observations, inferences and unknowns. It is not veterinary sign-off.

## Veterinary sources

`veterinary-research.json` records 27 read sources, excerpts, section locations and corrections. The app's source registry adds the WSAVA toolkit page, Cornell dental guidance, two Cats.com practical guides and the Animal Poisons Helpline contact. It excludes the inconsistent Cats.com feeding-amount article from promoted reading.

Primary guideline sections support the energy factors, vaccine distinctions and care principles. Clinic parasite advice is labelled as local, dated opinion. The source record preserves access failures and unresolved legal or clinical details.

Corrections include immediate action for breathing difficulty and suspected permethrin exposure. The adult F3 text no longer applies one three-year rule to every vaccine component and exposure risk. Unweaned kittens do not receive solid-food portions. Weight loss no longer has a fixed duration forecast.

## Cats.com static REA inspection

Target: `https://cats.com/weight-calculator`.

REA MCP tools were absent from this session. A read-only doctor check reported missing OpenCode registration. No global configuration was changed. The CLI fallback analyzed three selected inline JavaScript fragments captured from the public page. Third-party tracking scripts and external application code were not analyzed or executed.

The public HTML and script text were inspected as inert text. The selected inputs total about 20 KB. The REA inventory also includes a provenance JSON file. The full website is outside this search boundary.

- Application Evidence: `ev_74e9d5cff2fe7bbe774b284dd6447364ef302d3371602eb6e7f6932da23372c8`.
- Summary projection: `ev_b777bc364af9e868e44e929db62017a976656f3956ad7f75f19fccebbd1547b5`.
- Captured-tree digest: `add0de9711dbd5d6d65ad82000867cf482317708369b0fed0f5524d7909e2c1f`.
- Main selected calculator script digest: `8337c8026d725512a810d1fcc098c163460cbe2d7747c2ad7db862ace5816fef`.

The local full Evidence file is retained at `evidence/rea/cats-com-evidence.json`. It is ignored by git and is not part of the shipped app. The original capture remains in the approved OpenCode temporary directory. This avoids republishing the site's application artifacts.

### Observed

- Public page markup presents five steps and a body-condition choice.
- Captured `inline-12.js`, lines 21–34, changes the active step and progress display.
- Lines 156–197 define a submit handler. The literal AJAX URL is `https://cats.com/wp-admin/admin-ajax.php`.
- Lines 173–180 construct name, weight, age, intact status and condition fields. The action string is `cliverse_weight_calculator_results`.
- Lines 182–190 insert returned response markup into the result block and change browser history.

These are static observations, not proof that a request ran. The REA result reports complete inventory coverage for the selected captured tree, but **unknown semantic coverage** with 565 semantic unknowns. Static call and data-flow candidates are not runtime evidence.

### Inferred

The captured client expects server-generated calculator results. Its server-side formula cannot be recovered from this selected client artifact. Cat Compass therefore uses the read AAHA formula, rather than copying or guessing the Cats.com server calculation.

The site's category structure and bylines informed the care-library layout. Cat Compass uses original summaries, publisher labels and direct further-reading links. It does not copy site text, photographs, styles or code into the product.

### Unknown

Server-side calculations, current execution paths, hidden defaults, analytics behaviour and the safety of all Cats.com articles remain unknown. No authenticated area, account, private API, browser session or mobile application was inspected.

## Comparable application boundary

The public [11pets pet-care page](https://www.11pets.com/en/pet-care-app) was read for feature comparison. It describes care records, reminders and data sharing. Its FAQ says records are cloud-stored and online use is required.

These are the publisher's public descriptions, not observed application behaviour. No installed 11pets artifact was supplied. No proprietary application was downloaded, decompiled or chosen as a local reverse-engineering target. Cat Compass's offline storage, calendar export and password-protected snapshot transfer are design choices, not claims about 11pets internals.

## Remaining release checks

- A veterinarian must review the clinical content before it is presented as approved guidance.
- Resolve the ACT birthday boundary against current legislation or Domestic Animal Services advice.
- Test real phone installation and imported calendar alarms. Browser tests use phone-sized Chromium, not iOS Safari.
- Build and drive Windows/Linux packages. Only macOS Apple Silicon was built and launched here.
- Supply signing/notarization credentials for trusted public distribution.
- Check the deployed HTTPS companion before using QR transfer across physical devices. GitHub Pages deployment and public release delivery are separate from this static/source inspection.
- Review the development packaging advisories. The production dependency audit has no known advisories.

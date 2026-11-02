# Documented Defects & Production Cost Analysis

- **Project:** FreshFold design system
- **Prepared:** 2 November 2026
- **Scope:** token sources, token compiler, generated CSS, login, and the two attendance screens
- **Verdict:** The pages work, but the token foundation is not yet production-ready for a multi-screen rollout. The release-blocking issues are palette integrity, light-mode contrast, missing semantic state roles, conflicting sources of truth, and the absence of automated token checks.

## Validated baseline

- Dark output: 48 semantic color roles + 70 typography variables + 3 shadows = 121 variables.
- Light output: 48 semantic color roles + 70 typography variables + 3 shadows = 121 variables.
- Generated CSS exposes only semantic `--freshfold-*` variables; primitive palette variables are not exported.
- `login.html`: 44 token references, 0 missing.
- `attendance.html`: 71 token references, 0 missing, no raw hex values.
- `attendance-no-system.html`: 0 design-system references, 0 token references.
- Dark contrast is healthy; the light-mode primary pair is the main accessibility failure.

## Severity definitions

| Severity | Meaning |
| --- | --- |
| High | Release-blocking for production use: user-facing accessibility/correctness failure or systemic source drift. |
| Medium | Should be fixed in the next delivery cycle; creates maintenance or consistency risk. |
| Low | Hygiene or edge-case issue; safe to schedule after the higher-risk items. |

## Defect register

| ID | Severity | Status | Area | Finding |
| --- | --- | --- | --- | --- |
| DS-01 | High | Open | Primitive palette | Primary tone 40 incorrectly carries tone 50's value (`#d04b17`) in both palette sources. |
| DS-02 | High | Open | Light accessibility | White on light primary is `4.47:1`; primary text on surface is `4.26:1`. Both fail WCAG AA for normal text. |
| DS-03 | High | Open | Semantic roles | Success and warning primitives exist, but no semantic success/warning roles are exported. |
| DS-04 | High | Open | Source of truth | Palettes are duplicated across `06-tokens-complete.json` and the design-system primitive files, and the values disagree. |
| DS-05 | High | Open | Typography | Evidence specifies 15 styles including Headline Large; `06` contains 14 and the design-system type source has a duplicate Headline small. |
| DS-06 | Medium | Open | Token naming | Source keys contain typos, trailing words, inconsistent spacing, and casing. The compiler normalizes only known cases. |
| DS-07 | Medium | Partially mitigated | Theming | `--mode light\|dark` generates separate files, but both use `:root`; there is no runtime theme switch. |
| DS-08 | Medium | Open | Layout tokens | No spacing, radius, or shape tokens exist; screens hard-code those values. |
| DS-09 | High | Partially mitigated | Verification | There are no automated contract, contrast, mode-parity, or primitive-leak tests, and no CI gate. |
| DS-10 | Medium | Open | Tooling | The legacy `tokens-to-css.js` and `tokens-complete-to-css.js` generators still exist and emit non-compliant output. |
| DS-11 | Low | Open | Color compiler | `cleanHex()` truncates 8-digit role colors to 6 digits, silently dropping alpha. |
| DS-12 | Low | Open | Documentation | `divergences.md` is a shell heredoc, `interview-answers.md` is empty, and some evidence files are poorly packaged. |
| DS-13 | Low | Open | Typography source | Every type style carries `textCase: capitalize`; the compiler ignores it, but future exporters may apply it. |

## Defect details

### DS-01 — Primary tone 40 collides with tone 50

- **Severity:** High
- **Status:** Open
- **Evidence:** `design-system/Premitives vaules.Mode 1.tokens.json` has `Primary_Color_40 = #d04b17` and `Primary_Color_50 = #d04b17`. The same collision appears in `evidence/06-tokens-complete.json`. The documented palette in `doc/colour-roles.md` expects tone 40 to be `#C2410C` and tone 50 to be `#D04B17`.
- **Impact:** The light theme compiles with the wrong primary. This directly causes DS-02 and makes the brand accent lighter than intended.
- **Fix:** Correct tone 40 in the canonical primitive source, regenerate both modes, and add a duplicate-adjacent-tone check.
- **Done when:** Primary tone 40 is `#c2410c`; no two adjacent primary tones are identical; light output uses `#c2410c`.

### DS-02 — Light primary pair fails WCAG AA

- **Severity:** High
- **Status:** Open
- **Evidence:** `tokens-light.css`: `on-primary #ffffff` on `primary #d04b17` = `4.47:1`; `primary #d04b17` on `surface #fff8f6` = `4.26:1`. WCAG AA requires `4.5:1` for normal text.
- **Impact:** Primary buttons, links, and accent text can fail accessibility review and are harder to read for low-vision users.
- **Fix:** Resolve DS-01. Using `#c2410c` produces `5.18:1` with white and `4.93:1` against the light surface, clearing AA for normal text.
- **Done when:** `on-primary/primary` and `primary/surface` both measure at least `4.5:1`; contrast checks are automated.

### DS-03 — Success and warning have no semantic roles

- **Severity:** High
- **Status:** Open
- **Evidence:** `Color Roles.Light.tokens.json` and `Color Roles.Dark.tokens.json` each expose 48 roles. Neither contains `success` or `warning`. `doc/colour-roles.md` states that warning and success are custom colors, not Material roles. Success primitives exist at `#16a34a` and its tonal ramp.
- **Impact:** Status UI cannot use a truthful success color through the design system. `attendance.html` uses `primary` for present, while `attendance-no-system.html` uses a real green. The two versions therefore communicate status differently.
- **Fix:** Define semantic `success`, `on-success`, `success-container`, and `on-success-container` roles, plus the equivalent warning roles, in both modes. Recompile and migrate status chips.
- **Done when:** Both mode files contain the added roles; attendance uses a semantic success role; no status color is borrowed from `primary` or `secondary`.

### DS-04 — Conflicting sources of truth

- **Severity:** High
- **Status:** Open
- **Evidence:** `evidence/06-tokens-complete.json` contains `color["primary main - 40"] = #c2410c` while its own `premitives vaules` palette contains `primary 40 = #d04b17`. The design-system primitive file also uses `#d04b17`. Dark mode builds from `06`; light mode builds from the design-system role and primitive files. Mode builds also take typography and effects from `06` rather than the design-system `text.styles` and `effect.styles` files.
- **Impact:** The same logical token can resolve differently depending on build path, mode, or consumer. This is the main systemic maintainability risk.
- **Fix:** Select one canonical palette/type/effect source, delete or generate the duplicates, and make both mode builds consume that source.
- **Done when:** One canonical source exists; no contradictory primary-40 values remain; both modes are reproducible from the same source tree.

### DS-05 — Typography source disagreement

- **Severity:** High
- **Status:** Open
- **Evidence:** `evidence/08-agent-typography-answer.txt` describes 15 styles including `Headline Large` at 32px/45px. `evidence/06-tokens-complete.json` contains 14 brand styles and no `Headline Large`; its `headline small` is 24px/33px. `design-system/text.styles.tokens.json` contains both `Headline small` at 32px/45px and `headline small` at 24px/33px. The two names normalize to the same `headline-small` slug.
- **Impact:** The type scale cannot be trusted, heading hierarchy is inconsistent, and compiling directly from the design-system type source would fail on the duplicate slug.
- **Fix:** Reconcile the type scale with design, rename the 32px style to `Headline Large` if that is the intended role, remove the duplicate, and compile from the canonical file.
- **Done when:** The approved style set is represented once, no duplicate normalized names exist, and `Headline Large` is either exported or explicitly retired.

### DS-06 — Malformed source token names

- **Severity:** Medium
- **Status:** Open
- **Evidence:** Source keys include `premitives vaules`, `nuetral`, `tertiay`, `fiexed`, `continer`, `surface variant  color`, and role names ending in stray numbers such as `on primary fiexed dim`.
- **Impact:** The compiler relies on a fixed correction dictionary. A new typo can create a collision, an unexpected variable name, or a failed build. Source review and onboarding are harder.
- **Fix:** Normalize names at the source, keep a compatibility map for old aliases if needed, and fail the build on unrecognized malformed names.
- **Done when:** Canonical source names are clean and documented; the compiler does not need silent typo fixes for new tokens.

### DS-07 — No runtime theme strategy

- **Severity:** Medium
- **Status:** Partially mitigated
- **Evidence:** `build-tokens.js --mode light` writes `tokens-light.css`; the default writes `tokens.css`. Both outputs target `:root`. `login.html` uses the dark file and `attendance.html` uses the light file.
- **Impact:** There is no deterministic runtime switch, no `prefers-color-scheme` behavior, and no theme marker. Loading both files makes the last one win. The product currently mixes dark login with light attendance.
- **Fix:** Decide whether the product needs one fixed theme, an explicit `data-theme` switch, or system-preference switching. Namespace output selectors accordingly and document the loading contract.
- **Done when:** Theme behavior is explicit and flash-free; the app does not depend on stylesheet load order.

### DS-08 — Missing spacing, radius, and shape tokens

- **Severity:** Medium
- **Status:** Open
- **Evidence:** The design-system source contains color, typography, and effect tokens only. `attendance.html` and `login.html` hard-code padding, gaps, radii, and control sizes in pixels.
- **Impact:** Layout consistency depends on copy-paste review rather than tokens, and future density or radius changes require editing each screen.
- **Fix:** Extract spacing, radius, border, and control-size scales from the design evidence; add them to the compiler; refactor the two screens.
- **Done when:** Spacing and radii are tokenized, and raw pixel values remain only for one-off layout geometry.

### DS-09 — No automated token contract or CI gate

- **Severity:** High
- **Status:** Partially mitigated
- **Evidence:** Verification has been manual: build counts, token-reference greps, computed-style checks, and contrast calculations. There is no test command or CI workflow asserting the contract.
- **Impact:** A palette correction, compiler change, or source edit can silently regress role count, alias resolution, primitive leakage, mode parity, or contrast.
- **Fix:** Add token tests for role counts, no `--palette-*` output, no unresolved aliases, no duplicate normalized names, expected type/shadow counts, mode parity, and contrast pairs. Run them in CI.
- **Done when:** A single test command fails on any contract violation and runs before merge.

### DS-10 — Legacy generators can emit non-compliant CSS

- **Severity:** Medium
- **Status:** Open
- **Evidence:** `scripts/tokens-to-css.js` and `scripts/tokens-complete-to-css.js` export `--palette-*` variables, default to the removed `src/styles` directory, and emit `drop-shadow()` values that lose spread. The current `build-tokens.js` is the compliant generator.
- **Impact:** Running the wrong script can recreate stale assets and reintroduce primitives into the UI API.
- **Fix:** Delete the legacy scripts or convert them into explicit deprecated wrappers that fail with a pointer to `build-tokens.js`.
- **Done when:** Only one supported token generator remains.

### DS-11 — Alpha is dropped from role colors

- **Severity:** Low
- **Status:** Open
- **Evidence:** `build-tokens.js` `cleanHex()` converts any 8-digit hex to its first six digits.
- **Impact:** Current roles are opaque, so there is no visible failure today. A future translucent role, overlay, or scrim would silently become opaque.
- **Fix:** Preserve alpha as `rgba()` or `#rrggbbaa`, or fail explicitly when a role color is not opaque.
- **Done when:** Alpha is either supported or rejected with a clear error.

### DS-12 — Documentation and evidence hygiene

- **Severity:** Low
- **Status:** Open
- **Evidence:** `doc/divergences.md` is a shell heredoc that writes a different file instead of being the document itself. `doc/interview-answers.md` is empty. `evidence/08-agent-typography-answer.txt` is one 8.9 KB line.
- **Impact:** Auditors must reconstruct intent from scripts and raw exports; the typography evidence is hard to review and diff.
- **Fix:** Store the rendered Markdown content, fill or remove the empty interview document, and reformat the typography evidence.
- **Done when:** Every documentation file is readable Markdown and every evidence file is reviewable without executing it.

### DS-13 — Global `textCase: capitalize` conflicts with UI copy

- **Severity:** Low
- **Status:** Open
- **Evidence:** `design-system/text.styles.tokens.json` sets `textCase: capitalize` on the type styles, while the current UI uses sentence case and the compiler does not export text transform.
- **Impact:** Current CSS ignores the field, but another exporter or design tool may title-case every label, creating inconsistent copy.
- **Fix:** Remove the global capitalization flag or scope it to the specific styles that need it.
- **Done when:** Source casing matches the intended UI treatment.

## Controls already in place

| Control | Status |
| --- | --- |
| Semantic-only token output | Working: generated CSS exposes no `--palette-*` variables. |
| Recursive alias resolution | Working: aliases resolve to hex and unresolved/circular aliases fail the build. |
| Duplicate role detection | Working: normalized role-name collisions fail the build. |
| Shadow spread | Working: shadows are emitted as `box-shadow`, preserving spread. |
| Light-mode compilation | Working: `--mode light` generates `tokens-light.css`. |
| Design-system screen adoption | Working: attendance has 71 token references and 0 missing; login has 44 and 0 missing. |

## Production cost analysis

### Assumptions

| Assumption | Value |
| --- | --- |
| Blended engineering rate | USD 75/hour |
| Working day | 8 hours |
| Included | implementation, basic QA, PR review |
| Excluded | design exploration, project management, deployment, taxes, contingency |
| Basis | Existing code and assets; two current screens; no major product redesign |

These are planning ranges, not quotes. Substitute the local blended rate before using them for budgeting.

### Remediation estimate

| Workstream | Defects | Engineering days | Cost at USD 75/hour |
| --- | --- | ---: | ---: |
| Palette integrity and accessible contrast | DS-01, DS-02 | 1–2 | $600–$1,200 |
| Semantic success/warning roles | DS-03 | 1–2 | $600–$1,200 |
| Canonical source, naming, typography | DS-04, DS-05, DS-06, DS-13 | 4–7 | $2,400–$4,200 |
| Theme strategy | DS-07 | 1–3 | $600–$1,800 |
| Layout, spacing, radius tokens and refactor | DS-08 | 3–6 | $1,800–$3,600 |
| Tests, CI, legacy cleanup, alpha handling | DS-09, DS-10, DS-11 | 3–5 | $1,800–$3,000 |
| Documentation and evidence cleanup | DS-12 | 0.5–1 | $300–$600 |
| **Engineering subtotal** | | **13.5–26** | **$8,100–$15,600** |
| 20% QA/design-review contingency | | 2.7–5.2 | $1,620–$3,120 |
| **Total planning range** | | **16.2–31.2 days** | **$9,720–$18,720** |

### Minimum release gate

If the goal is to make the current design system safe for production without completing every cleanup item, close these first:

| Release-gate item | Defects | Effort |
| --- | --- | ---: |
| Correct primary tone and prove contrast | DS-01, DS-02 | 1–2 days |
| Add semantic success/warning roles | DS-03 | 1–2 days |
| Reconcile typography and canonical sources | DS-04, DS-05 | 3–5 days |
| Add contract and contrast tests | DS-09 | 2–3 days |
| **Release-gate total** | | **7–12 days / $4,200–$7,200** |

### Cost of inaction

- Each additional screen that works around missing roles or spacing tokens costs an estimated 0.5–1 engineering day. Five screens would cost 2.5–5 days, or $1,875–$3,750.
- Post-launch accessibility remediation for the primary pair is likely 2–4 days once QA, design review, and regression testing are included.
- Duplicated palette maintenance and theme regressions add roughly 20–30% overhead to future UI work.
- A visual rebrand or palette correction becomes a multi-file reconciliation because the same values exist in several sources.

## Recommended sequence

1. Fix DS-01 and DS-02, regenerate both modes, and verify contrast.
2. Add the contrast and contract tests from DS-09 so later fixes cannot regress.
3. Consolidate the canonical palette, typography, and effect sources; resolve DS-04, DS-05, DS-06, and DS-13.
4. Add the semantic success and warning roles from DS-03 and migrate status UI.
5. Define the theme-loading contract for DS-07 if more than one theme is required.
6. Add layout tokens for DS-08 and refactor the current screens.
7. Remove legacy generators, handle alpha explicitly, and clean the documentation for DS-10, DS-11, and DS-12.

## Release decision

- **Do not treat the token layer as production-ready** while DS-01, DS-02, DS-03, DS-04, DS-05, and DS-09 remain open.
- The current attendance screen is usable, but it is safe only as a single-screen demonstration until the source and accessibility issues are fixed.
- DS-06, DS-07, DS-08, DS-10, DS-11, DS-12, and DS-13 can follow the release gate, but should be scheduled before the next product surface is added.

## Acceptance criteria

- Light primary and primary-on-surface contrast are at least `4.5:1`; all other text pairs meet their WCAG target.
- The palette has no incorrect adjacent-tone collisions; primary tone 40 is `#c2410c`.
- Success and warning have semantic roles in both modes.
- One canonical palette, typography, and effect source drives both modes.
- The approved type scale is represented once, with no duplicate normalized names.
- Generated CSS contains no primitive variables and no unresolved aliases.
- Automated tests cover role counts, mode parity, primitive leakage, duplicate names, and contrast.
- Design-system screens contain no raw color values.
- Theme loading is explicit and does not depend on stylesheet order.

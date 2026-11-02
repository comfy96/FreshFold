# task-01-design-system

Design token system for **Fresh Fold Laundry**, a neighbourhood laundry in Nigeria. This task turns the business's color, typography, and shadow decisions into a set of semantic CSS custom properties, and applies them to three HTML screens.

## What this is

Fresh Fold lets a customer see the truth about her own order — item count, status, and payment record, each dated — and never anyone else's. The interface must feel like a clear receipt book, not a chat, and must stay light and quiet on an entry-level Android phone with a small data bundle.

This folder contains:

- The raw design tokens (exported from Figma, with all their quirks intact).
- A Node.js token compiler that normalizes those tokens into a semantic CSS API.
- The generated CSS (`tokens.css` for dark, `tokens-light.css` for light).
- Three screens that consume the tokens.

## The person who uses it

Amaka Obi, 31, a bank officer. Entry-level Android phone, storage almost full, small weekly data bundle, unreliable signal and power. She uses WhatsApp and her bank app; she is not technical and has no one to help her.

## Directory structure

```
task-01-design-system/
├── design-system/         Raw Figma token exports (source of truth)
│   ├── manifest.json
│   ├── Premitives vaules.Mode 1.tokens.json   # primitive palettes
│   ├── Color Roles.Light.tokens.json          # semantic roles, light
│   ├── Color Roles.Dark.tokens.json           # semantic roles, dark
│   ├── color.styles.tokens.json
│   ├── text.styles.tokens.json
│   └── effect.styles.tokens.json
├── doc/                   Written analysis and decisions
│   ├── business-brief.md
│   ├── colour-roles.md
│   ├── prompts.md
│   ├── defects.md
│   ├── divergences.md
│   └── interview-answers.md
├── evidence/              Evidence files and staged exports
├── scripts/               Token compilers
│   ├── build-tokens.js            # the compliant generator
│   ├── tokens-to-css.js           # legacy, emits primitives
│   └── tokens-complete-to-css.js  # legacy, emits primitives
├── src/                   Reference screens
│   ├── login.html                  # dark theme
│   ├── attendance.html             # light theme
│   └── attendance-no-system.html   # no token system (comparison)
├── tokens.css             # generated, dark mode
└── tokens-light.css       # generated, light mode
```

## Token architecture

Three invariants are enforced by `scripts/build-tokens.js`:

1. **Semantic roles only.** Primitive palette tokens are resolved during compilation and never exported. Every color variable is `--freshfold-color-{role}`.
2. **Recursive alias resolution.** Curly-brace references like `{premitives vaules.color palette.primary.primary40}` are resolved to clean 6-digit hex values.
3. **Atomic typography and shadows.** Each type style is exported as atomic `--freshfold-type-{role}-{size}-*` properties; shadows are exported as `box-shadow` values with alpha preserved.

### Naming convention

- Colors: `--freshfold-color-{role}` (e.g. `--freshfold-color-on-primary-container`)
- Typography: `--freshfold-type-{role}-{size}-{property}` (e.g. `--freshfold-type-body-large-font-size`)
- Shadows: `--freshfold-shadow-{name}` (e.g. `--freshfold-shadow-soft-shadow`)

## Building the tokens

Generate the default (dark) output:

```sh
node scripts/build-tokens.js
```

Generate the light output:

```sh
node scripts/build-tokens.js --mode light
```

Options:

| Flag | Default | Purpose |
| --- | --- | --- |
| `--input <path>` | `evidence/06-tokens-complete.json` | Token JSON to compile (ignored when `--mode` is set) |
| `--output <path>` | `tokens.css` (or `tokens-<mode>.css`) | Output path |
| `--mode light\|dark` | unset | Build from the design-system role + primitive files |

The compiler fails the build on unresolved or circular aliases, duplicate role names, and non-color values in the color path. It logs the input, output, and variable counts on success.

> `scripts/tokens-to-css.js` and `scripts/tokens-complete-to-css.js` are legacy generators. They export `--palette-*` primitives, write to the removed `src/styles/` directory, and emit `drop-shadow()` values that lose spread. Use `build-tokens.js`.

## The screens

| Screen | Theme | Token references |
| --- | --- | --- |
| `src/login.html` | dark (`tokens.css`) | 44, 0 missing |
| `src/attendance.html` | light (`tokens-light.css`) | 71, 0 missing, no raw hex |
| `src/attendance-no-system.html` | none | 0 (comparison baseline) |

Screens consume only `var(--freshfold-*)`. The no-system screen exists to demonstrate the difference between a tokenized screen and one built from raw values.

## Documentation

- `doc/business-brief.md` — the business, the user, and "the one thing that must work".
- `doc/colour-roles.md` — the palette decisions, including the extra tone-98 step and the extended neutral ramp.
- `doc/prompts.md` — the build prompts and the normalization pitfalls that were fixed.
- `doc/defects.md` — the defect register and production cost analysis.
- `doc/divergences.md` — typography divergences from the Material baseline.
- `doc/interview-answers.md` — design-system interview answers.

## Known issues

The token layer is **not yet production-ready**. The release-blocking issues, tracked in `doc/defects.md`, are:

- **DS-01** — Primary tone 40 collides with tone 50 (`#d04b17` in both).
- **DS-02** — Light primary pair fails WCAG AA (white on primary is 4.47:1).
- **DS-03** — Success and warning have no semantic roles.
- **DS-04** — Palettes are duplicated across `evidence/06-tokens-complete.json` and the design-system files, and disagree.
- **DS-05** — Typography source disagreement (missing/duplicated `Headline Large`).
- **DS-09** — No automated token contract or CI gate.

See `doc/defects.md` for the full register, the remediation estimate, and the minimum release gate.

## Status

- Dark output: 48 semantic color roles + 70 typography variables + 3 shadows = 121 variables.
- Light output: 48 semantic color roles + 70 typography variables + 3 shadows = 121 variables.
- Semantic-only output: generated CSS exposes no `--palette-*` variables.
- Recursive alias resolution and duplicate-role detection work; unresolved/circular aliases fail the build.

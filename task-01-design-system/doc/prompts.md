Write a Node.js script that converts evidence/06-tokens-complete.json into tokens.css.
Export all the colors, fonts, and shadows as CSS variables so we can use them in FreshFold.

## What went wrong converting to CSS variables

- **The default input path was wrong.** The script looked for `evidence/tokens-complete.json`, but the real file is `evidence/06-tokens-complete.json`. Fixed by changing the default path.
- **The source data has misspelled keys.** Examples: `premitives vaules`, `nuetral`, `secondary color can 80`, `on primary fiexed dim`, `tertiay fixed`, `tertiary continer color`, and `surface variant  color`. These were normalized into valid, repeatable CSS variable names; the aliases in `color roles` still point at the misspelled paths.
- **Whitespace and punctuation appear inside token names.** Examples: `primary main - 40`, `surface container  color`, `neutral extended  4`, `success  main 95`. All non-alphanumeric characters were collapsed into kebab-case names.
- **Duplicate palettes disagree.** The top-level `color` section does not match `premitives vaules`. For example, primary 40 is `#c2410c` in `color` but `#d04b17` in `premitives vaules`; secondary, tertiary and neutral ramps differ even more. The semantic roles use `premitives vaules`, while the top-level styles are exported separately as `--color-style-*` reference variables.
- **Non-token keys were mixed in.** `typography.material-theme` contains a full separate Material theme using Roboto; it was skipped to avoid exporting a second, conflicting type system. The `error` palette also has a stray `color` key with `#ffffff`, which becomes the odd variable `--palette-error-color`.
- **8-digit hex colors needed rewriting.** Figma alpha colors such as `#faeeeaf5` became `rgba(250, 238, 234, 0.961)`; fully opaque values such as `#ffffffff` became `#ffffff`.
- **Shadow spread is lost in CSS.** The tokens have non-zero `spread` values (`-2px`, `-4px`, `0px`), but CSS `drop-shadow()` has no spread argument. The generated `--shadow-*` values are therefore close but not exact; use `box-shadow` if spread must be preserved.
- **The source sets `textCase: capitalize` on every type style.** That is exported as `--type-*-transform: capitalize`, so Body, Label and Title styles will capitalize text unless the source is fixed or the variable is overridden. This conflicts with normal sentence-case UI copy.
- **Role names contain trailing junk.** `on tertiary container color 4` has a stray `4`, and several roles repeat the word `color`. Both were stripped to produce names like `--color-on-tertiary-container`.

After normalization, all 48 semantic role aliases resolved and 421 CSS variables were generated without collisions.

## Last working prompt

You are an enterprise design systems engineer building the token compiler for FoldFresh.
Write a standalone Node.js script at `scripts/build-tokens.js` that compiles `evidence/06-tokens-complete.json` into `tokens.css`.

You must enforce three strict architectural invariants:
1. SEMANTIC ROLES ONLY: Do NOT export primitive palette tokens (e.g. `primitive colors.*`) to CSS variables. Only export semantic roles defined under `color roles collection.color roles`. Every CSS variable must be named `--freshfold-color-{roleName}`. The primitive colors must remain internal to the token resolver and NEVER be made available to components.
2. RECURSIVE ALIAS RESOLUTION: The script must parse curly-brace alias references (e.g. `{primitive colors.color palette.primary.primary40}`) and resolve them to their ultimate clean 6-digit hex values (e.g. `#0D1F3D`).
3. ATOMIC TYPOGRAPHY & SHADOWS:
   - For all 15 typography styles in `schema.font`, export atomic custom properties: `--freshfold-type-{role}-{size}-font-family`, `--freshfold-type-{role}-{size}-font-weight`, `--freshfold-type-{role}-{size}-font-size`, `--freshfold-type-{role}-{size}-line-height`, and `--freshfold-type-{role}-{size}-letter-spacing`. Include proper font fallbacks (monospace for JetBrains Mono, sans-serif for Plus Jakarta Sans).
   - For shadows in `schema.effect`, convert hex-with-alpha colors (e.g. `#0d1f3d1f`) to valid `rgba()` format and export: `--freshfold-shadow-soft-shadow`, `--freshfold-shadow-medium-shadow`, and `--freshfold-shadow-hard-shadow`.

Include clean console logging indicating input file, output path, and completion status.

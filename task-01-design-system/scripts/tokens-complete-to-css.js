#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function argValue(flag) {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1];
}

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = argValue('--input') ?? path.join(ROOT, 'evidence', '06-tokens-complete.json');
const OUTPUT_PATH = argValue('--output') ?? path.join(ROOT, 'src', 'styles', 'tokens.css');

if (!fs.existsSync(INPUT_PATH)) {
  process.stderr.write(`[tokens-complete-to-css] Input not found: ${INPUT_PATH}\n`);
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));

const ROLE_WORD_FIXES = {
  continer: 'container',
  contner: 'container',
  fiexed: 'fixed',
  tertiay: 'tertiary',
  nuetral: 'neutral',
};

function canonicalName(value) {
  return String(value)
    .toLowerCase()
    .replace(/nuetral/g, 'neutral')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function cssColor(raw) {
  const value = String(raw).trim();

  if (/^#[0-9a-f]{6}ff$/i.test(value)) {
    return value.slice(0, 7).toLowerCase();
  }

  if (/^#[0-9a-f]{8}$/i.test(value)) {
    const red = parseInt(value.slice(1, 3), 16);
    const green = parseInt(value.slice(3, 5), 16);
    const blue = parseInt(value.slice(5, 7), 16);
    const alpha = Number((parseInt(value.slice(7, 9), 16) / 255).toFixed(3));
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  return value;
}

function primitiveVarName(parts) {
  const pathParts = /^(premitives|primitives)\b/i.test(parts[0] || '') ? parts.slice(1) : parts;

  if ((pathParts[0] || '').toLowerCase() === 'key colors') {
    const family = canonicalName(pathParts[1] || '').replace(/-?(?:key-)?color$/, '');
    return `--palette-key-${family}`;
  }

  const family = canonicalName(pathParts[1] || '');
  const token = pathParts[2] || '';
  const scale = (token.match(/(\d+)\s*$/) || [])[1];

  if (scale) {
    return `--palette-${family}-${scale}`;
  }

  return `--palette-${family}-${canonicalName(token)}`;
}

function roleVarName(name) {
  let words = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => ROLE_WORD_FIXES[word] || word);

  while (words.length > 0 && /^\d+$/.test(words[words.length - 1])) {
    words.pop();
  }

  words = words.filter((word) => word !== 'color');

  return `--color-${words.join('-')}`;
}

function shadowValue(effect) {
  const color = cssColor(effect.color);
  return `drop-shadow(${effect.offsetX}px ${effect.offsetY}px ${effect.radius}px ${color})`;
}

const palette = new Map();
const collisions = [];

function collectPrimitives(node, trail) {
  for (const [key, value] of Object.entries(node || {})) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

    if (value.type === 'color') {
      const varName = primitiveVarName(trail.concat(key));
      const color = cssColor(value.value);

      if (palette.has(varName) && palette.get(varName) !== color) {
        collisions.push(`${varName}: ${palette.get(varName)} vs ${color}`);
        continue;
      }

      palette.set(varName, color);
      continue;
    }

    collectPrimitives(value, trail.concat(key));
  }
}

collectPrimitives(tokens['premitives vaules'], []);

if (collisions.length > 0) {
  process.stderr.write('[tokens-complete-to-css] Primitive variable collisions:\n');
  for (const collision of collisions) process.stderr.write(`  ${collision}\n`);
  process.exit(1);
}

const styleColors = Object.entries(tokens.color || {})
  .filter(([, token]) => token && token.type === 'color')
  .map(([name, token]) => [`--color-style-${canonicalName(name)}`, cssColor(token.value)]);

const typographyLines = [];
const fontFamilies = new Set();
const fontWeights = new Set();

const TEXT_CASE = {
  none: 'none',
  capitalize: 'capitalize',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
};

function collectTypography(node, trail) {
  for (const [key, value] of Object.entries(node || {})) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    if (key === 'material-theme') continue;

    if (value.fontSize && value.fontSize.type === 'dimension') {
      const base = `--type-${canonicalName(trail.concat(key).join(' '))}`;
      const fields = [
        ['size', value.fontSize, 'px'],
        ['weight', value.fontWeight, ''],
        ['family', value.fontFamily, ''],
        ['line-height', value.lineHeight, 'px'],
        ['letter-spacing', value.letterSpacing, 'px'],
        ['style', value.fontStyle, ''],
        ['stretch', value.fontStretch, ''],
        ['transform', value.textCase, ''],
        ['decoration', value.textDecoration, ''],
      ];

      for (const [suffix, field, unit] of fields) {
        if (!field || field.value == null) continue;

        let fieldValue = `${field.value}${unit}`;
        if (suffix === 'family') fieldValue = `"${field.value}"`;
        if (suffix === 'transform') fieldValue = TEXT_CASE[field.value] ?? field.value;

        typographyLines.push(`  ${base}-${suffix}: ${fieldValue};`);
      }

      if (value.fontFamily && value.fontFamily.value) fontFamilies.add(value.fontFamily.value);
      if (value.fontWeight && value.fontWeight.value != null) fontWeights.add(value.fontWeight.value);

      continue;
    }

    collectTypography(value, trail.concat(key));
  }
}

collectTypography(tokens.typography, []);

const fontFamilyLines = [...fontFamilies]
  .sort()
  .map((family) => `  --font-family-${canonicalName(family)}: "${family}";`);

const fontWeightLines = [...fontWeights]
  .sort((a, b) => a - b)
  .map((weight) => `  --font-weight-${weight}: ${weight};`);

const roleLines = [];

for (const [name, token] of Object.entries(tokens['color roles'] || {})) {
  if (!token || token.type !== 'color') continue;

  const alias = String(token.value).match(/^\{\s*([^}]+?)\s*\}$/);
  if (!alias) {
    process.stderr.write(`[tokens-complete-to-css] Role is not an alias: ${name} -> ${token.value}\n`);
    process.exit(1);
  }

  const reference = primitiveVarName(alias[1].split('.').map((part) => part.trim()));

  if (!palette.has(reference)) {
    process.stderr.write(`[tokens-complete-to-css] Unresolved role: ${name} -> ${reference}\n`);
    process.exit(1);
  }

  roleLines.push(`  ${roleVarName(name)}: var(${reference});`);
}

const shadowLines = Object.entries(tokens.effect || {})
  .filter(([, token]) => token && token.type === 'custom-shadow')
  .map(([name, token]) => {
    const varName = `--shadow-${canonicalName(name).replace(/-shadow$/, '')}`;
    return `  ${varName}: ${shadowValue(token.value)};`;
  });

const sourceLabel = path.relative(path.resolve(ROOT, '..'), INPUT_PATH);
const header = `/**
 * tokens.css
 *
 * AUTO-GENERATED FILE. DO NOT EDIT.
 *
 * Source: ${sourceLabel}
 * Generator: node task-01-design-system/scripts/tokens-complete-to-css.js
 *
 * Sections:
 *   --palette-*     Primitive color variables. Do not use directly in UI.
 *   --color-style-* Raw Figma color styles. Reference only; prefer --color-* roles.
 *   --color-*       Semantic color roles. This is the UI API.
 *   --font-*        Font families and weights.
 *   --type-*        Typography styles.
 *   --shadow-*      Effect styles.
 */
`;

const css = `${header}
:root {
  /* Primitive colors. Do not use directly in UI. */
${[...palette].map(([name, value]) => `  ${name}: ${value};`).join('\n')}

  /* Raw Figma color styles. Prefer the semantic roles below. */
${styleColors.map(([name, value]) => `  ${name}: ${value};`).join('\n')}

  /* Font families and weights. */
${fontFamilyLines.join('\n')}
${fontWeightLines.join('\n')}

  /* Shadows. */
${shadowLines.join('\n')}

  /* Typography. */
${typographyLines.join('\n')}
}

:root {
  /* Semantic color roles. Use these in UI. */
${roleLines.join('\n')}
}
`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, css, 'utf8');

process.stdout.write(
  `[tokens-complete-to-css] Wrote ${palette.size} primitive colors, ` +
    `${styleColors.length} raw color styles, ${roleLines.length} roles, ` +
    `${fontFamilyLines.length} font families, ${fontWeightLines.length} font weights, ` +
    `${typographyLines.length} typography vars, ${shadowLines.length} shadows -> ${OUTPUT_PATH}\n`
);

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
const INPUT_PATH = argValue('--input') ?? path.join(ROOT, 'doc', 'design-system.json');
const OUTPUT_PATH = argValue('--output') ?? path.join(ROOT, 'src', 'styles', 'design-tokens.css');

if (!fs.existsSync(INPUT_PATH)) {
  process.stderr.write(`[tokens-to-css] Input not found: ${INPUT_PATH}\n`);
  process.exit(1);
}

const system = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));

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
  const path = /^(premitives|primitives)\b/i.test(parts[0] || '') ? parts.slice(1) : parts;

  if ((path[0] || '').toLowerCase() === 'key colors') {
    const family = canonicalName(path[1] || '').replace(/-?(?:key-)?color$/, '');
    return `--palette-key-${family}`;
  }

  const family = canonicalName(path[1] || '');
  const token = path[2] || '';
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

const primitiveColors = new Map();
const primitiveCollisions = [];

function collectPrimitiveColors(node, trail) {
  for (const [key, value] of Object.entries(node || {})) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

    if (value.type === 'color') {
      const varName = primitiveVarName(trail.concat(key));
      const color = cssColor(value.value);

      if (primitiveColors.has(varName) && primitiveColors.get(varName) !== color) {
        primitiveCollisions.push({
          varName,
          first: primitiveColors.get(varName),
          second: color,
          token: trail.concat(key).join('.'),
        });
        continue;
      }

      primitiveColors.set(varName, color);
      continue;
    }

    collectPrimitiveColors(value, trail.concat(key));
  }
}

collectPrimitiveColors(system['premitives vaules'], []);

if (primitiveCollisions.length > 0) {
  process.stderr.write('[tokens-to-css] Primitive variable collisions:\n');
  for (const collision of primitiveCollisions) {
    process.stderr.write(
      `  ${collision.varName}: ${collision.first} (${collision.token}) conflicts with ${collision.second}\n`
    );
  }
  process.exit(1);
}

const typographyStyles = [];

function collectTypography(node, trail) {
  for (const [key, value] of Object.entries(node || {})) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    if (key === 'material-theme') continue;

    if (value.fontSize && value.fontSize.type === 'dimension') {
      typographyStyles.push({
        name: trail.concat(key).join(' '),
        style: value,
      });
      continue;
    }

    collectTypography(value, trail.concat(key));
  }
}

collectTypography(system.typography, []);

const aliasPattern = /^\{\s*([^}]+?)\s*\}$/;
const unresolvedRoles = [];
const literalRoles = [];
const duplicateRoles = [];
const seenRoleNames = new Set();
const roleLines = [];

for (const [name, token] of Object.entries(system['color roles'] || {})) {
  if (!token || token.type !== 'color') continue;

  const varName = roleVarName(name);

  if (seenRoleNames.has(varName)) {
    duplicateRoles.push(varName);
  }
  seenRoleNames.add(varName);

  const aliasMatch = String(token.value).match(aliasPattern);

  if (!aliasMatch) {
    literalRoles.push({ name, value: token.value });
    continue;
  }

  const referenceParts = aliasMatch[1].split('.').map((part) => part.trim());
  const referencedVar = primitiveVarName(referenceParts);

  if (!primitiveColors.has(referencedVar)) {
    unresolvedRoles.push({
      name,
      reference: aliasMatch[1],
      varName: referencedVar,
    });
    continue;
  }

  roleLines.push({ varName, value: `var(${referencedVar})` });
}

if (literalRoles.length > 0) {
  process.stderr.write('[tokens-to-css] Color roles must reference a primitive token:\n');
  for (const role of literalRoles) {
    process.stderr.write(`  ${role.name} -> ${role.value}\n`);
  }
  process.exit(1);
}

if (duplicateRoles.length > 0) {
  process.stderr.write('[tokens-to-css] Duplicate role variables:\n');
  for (const varName of duplicateRoles) process.stderr.write(`  ${varName}\n`);
  process.exit(1);
}

if (unresolvedRoles.length > 0) {
  process.stderr.write('[tokens-to-css] Unresolved color role references:\n');
  for (const role of unresolvedRoles) {
    process.stderr.write(`  ${role.name} -> ${role.reference} (expected ${role.varName})\n`);
  }
  process.exit(1);
}

const primitiveLines = [
  '  /* Primitive colors. Not part of the UI API. */',
  ...[...primitiveColors].map(([varName, value]) => `  ${varName}: ${value};`),
];

const effectLines = [
  '',
  '  /* Effects. */',
  ...Object.entries(system.effect || {})
    .filter(([, token]) => token && token.type === 'custom-shadow')
    .map(([name, token]) => {
      const varName = `--shadow-${canonicalName(name).replace(/-shadow$/, '')}`;
      return `  ${varName}: ${shadowValue(token.value)};`;
    }),
];

const typographyLines = ['', '  /* Typography. */'];

for (const { name, style } of typographyStyles) {
  const base = `--type-${canonicalName(name)}`;
  const definition = [
    ['size', style.fontSize, 'px'],
    ['weight', style.fontWeight, ''],
    ['family', style.fontFamily, ''],
    ['line-height', style.lineHeight, 'px'],
    ['letter-spacing', style.letterSpacing, 'px'],
  ];

  for (const [suffix, field, unit] of definition) {
    if (!field || field.value == null) continue;

    let value = `${field.value}${unit}`;
    if (suffix === 'family') value = `"${field.value}"`;

    typographyLines.push(`  ${base}-${suffix}: ${value};`);
  }
}

const roleOutputLines = [
  '  /* Semantic color roles. Use only these color variables in UI. */',
  ...roleLines.map(({ varName, value }) => `  ${varName}: ${value};`),
];

const sourceLabel = path.relative(path.resolve(ROOT, '..'), INPUT_PATH);
const header = `/**
 * design-tokens.css
 *
 * AUTO-GENERATED FILE. DO NOT EDIT.
 *
 * Source of truth: ${sourceLabel}
 * Generator: node task-01-design-system/scripts/tokens-to-css.js
 *
 * Layer 1: primitive colors, effects and typography.
 *   --palette-* is not part of the UI API. Never use primitive colors directly.
 * Layer 2: semantic color roles.
 *   --color-* is the UI API. Components consume these variables only.
 *   Every role points at a primitive with var(), so the palette can change
 *   without touching component CSS.
 */
`;

const css = `${header}
:root {
${primitiveLines.join('\n')}
${effectLines.join('\n')}
${typographyLines.join('\n')}
}

:root {
${roleOutputLines.join('\n')}
}
`;

const outputDirectory = path.dirname(OUTPUT_PATH);
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, css, 'utf8');

process.stdout.write(
  `[tokens-to-css] Wrote ${primitiveColors.size} color primitives, ` +
    `${roleLines.length} color roles, ${typographyStyles.length} type styles -> ${OUTPUT_PATH}\n`
);

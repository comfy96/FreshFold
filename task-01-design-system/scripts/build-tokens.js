#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMPLETE_INPUT_PATH = path.join(ROOT, 'evidence', '06-tokens-complete.json');
const MODE = (argValue('--mode') ?? '').toLowerCase();
const INPUT_PATH = path.resolve(argValue('--input') ?? COMPLETE_INPUT_PATH);
const OUTPUT_PATH = path.resolve(argValue('--output') ?? path.join(ROOT, MODE ? `tokens-${MODE}.css` : 'tokens.css'));
const MODE_ROLE_FILES = {
  light: 'Color Roles.Light.tokens.json',
  dark: 'Color Roles.Dark.tokens.json',
};
const PRIMITIVES_PATH = path.join(ROOT, 'design-system', 'Premitives vaules.Mode 1.tokens.json');

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? null : process.argv[index + 1];
}

function log(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`Build failed: ${message}\n`);
  process.exit(1);
}

function slug(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/nuetral/g, 'neutral')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

const WORD_FIXES = {
  continer: 'container',
  contner: 'container',
  fiexed: 'fixed',
  tertiay: 'tertiary',
  nuetral: 'neutral',
};

function colorVariableName(roleName) {
  let words = String(roleName)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => WORD_FIXES[word] ?? word);

  while (words.length > 0 && /^\d+$/.test(words[words.length - 1])) words.pop();
  words = words.filter((word) => word !== 'color');

  if (words.length === 0) fail(`Role name "${roleName}" has no usable words`);
  return `--freshfold-color-${words.join('-')}`;
}

function unwrap(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('value' in value) return unwrap(value.value);
    if ('$value' in value) return unwrap(value.$value);
  }
  return value;
}

function normalizePart(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildIndex(root) {
  const exact = new Map();
  const normalized = new Map();

  function walk(node, trail) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;

    if (trail.length > 0) {
      exact.set(trail.join('.'), node);
      const key = trail.map(normalizePart).join('.');
      if (!normalized.has(key)) normalized.set(key, node);
    }

    for (const [key, child] of Object.entries(node)) {
      if (child && typeof child === 'object' && !Array.isArray(child)) walk(child, trail.concat(key));
    }
  }

  walk(root, []);
  return { exact, normalized };
}

const INDEX = { exact: new Map(), normalized: new Map() };

const ROOT_ALIASES = {
  'primitive colors': ['premitives vaules', 'primitive colors', 'primitives values'],
  primitives: ['premitives vaules', 'primitive colors', 'primitives values'],
};

function findToken(reference) {
  const parts = reference.split('.').map((part) => part.trim()).filter(Boolean);
  const exact = INDEX.exact.get(parts.join('.'));
  if (exact) return exact;

  const normalized = INDEX.normalized.get(parts.map(normalizePart).join('.'));
  if (normalized) return normalized;

  const alternatives = ROOT_ALIASES[parts[0].toLowerCase()] ?? [];
  for (const alternative of alternatives) {
    const candidate = parts.slice();
    candidate[0] = alternative;
    const token = INDEX.exact.get(candidate.join('.'));
    if (token) return token;
  }

  return null;
}

function cleanHex(value) {
  const match = String(value).trim().match(/^#([0-9a-f]{3,8})$/i);
  if (!match) return null;

  let digits = match[1];
  if (digits.length === 3 || digits.length === 4) {
    digits = digits.split('').map((digit) => digit + digit).join('');
  }

  return digits.length === 6 || digits.length === 8 ? `#${digits.slice(0, 6).toLowerCase()}` : null;
}

function resolveColor(node, trail, seen = new Set()) {
  const raw = unwrap(node);
  if (typeof raw !== 'string') fail(`Expected a color value at ${trail.join(' -> ')}`);

  const alias = raw.match(/^\{\s*([^}]+?)\s*\}$/);
  if (alias) {
    const reference = alias[1];
    if (seen.has(reference)) fail(`Circular alias: ${[...seen, reference].join(' -> ')}`);

    const target = findToken(reference);
    if (!target) fail(`Unresolved alias "${reference}" at ${trail.join(' -> ')}`);

    return resolveColor(target, trail.concat(reference), new Set([...seen, reference]));
  }

  const hex = cleanHex(raw);
  if (!hex) fail(`Unsupported color "${raw}" at ${trail.join(' -> ')}`);
  return hex;
}

function rolesSource(tokens) {
  const collection = tokens['color roles collection'];
  if (collection && collection['color roles']) {
    return { source: collection['color roles'], label: 'color roles collection.color roles' };
  }
  if (tokens['color roles']) return { source: tokens['color roles'], label: 'color roles' };
  if (tokens.schema && tokens.schema.colorRoles) {
    return { source: tokens.schema.colorRoles, label: 'schema.colorRoles' };
  }
  return fail('Missing semantic color roles');
}

function buildColors(tokens) {
  const { source, label } = rolesSource(tokens);
  const lines = [];
  const seen = new Map();

  for (const [roleName, token] of Object.entries(source)) {
    if (!token || typeof token !== 'object' || Array.isArray(token)) continue;

    const variable = colorVariableName(roleName);
    if (seen.has(variable)) fail(`Duplicate role ${variable}: "${seen.get(variable)}" and "${roleName}"`);

    seen.set(variable, roleName);
    lines.push(`  ${variable}: ${resolveColor(token, [label, roleName])};`);
  }

  return lines;
}

function isTypeStyle(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false;
  const value = node.$value && typeof node.$value === 'object' ? node.$value : node;
  return value.fontSize != null || value.fontFamily != null;
}

function typeProperty(style, name) {
  const value = style.$value && typeof style.$value === 'object' ? style.$value : style;
  return unwrap(value[name]);
}

function length(value) {
  if (value == null || value === '') return null;
  const text = String(value).trim();
  return /^-?\d*\.?\d+$/.test(text) ? `${text}px` : text;
}

function family(value) {
  if (value == null || value === '') return 'sans-serif';
  const name = String(value).replace(/^['"]|['"]$/g, '').trim();
  return `"${name}", ${name.toLowerCase().includes('mono') ? 'monospace' : 'sans-serif'}`;
}

function typeStyles(source) {
  const styles = [];

  function walk(node, trail) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    if (isTypeStyle(node)) {
      styles.push({ name: trail.join(' '), node });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key !== 'material-theme' && child && typeof child === 'object' && !Array.isArray(child)) {
        walk(child, trail.concat(key));
      }
    }
  }

  walk(source, []);
  return styles;
}

function buildTypography(tokens) {
  const source = tokens.schema?.font ?? tokens.typography ?? tokens.font;
  if (!source) fail('Missing typography source');

  const lines = [];
  const seen = new Set();

  for (const { name, node } of typeStyles(source)) {
    const words = slug(name).split('-').filter(Boolean);
    const role = words[0] ?? 'text';
    const size = words.slice(1).join('-') || 'default';
    const base = `--freshfold-type-${role}-${size}`;

    if (seen.has(base)) fail(`Duplicate typography style ${base}`);
    seen.add(base);

    lines.push(`  ${base}-font-family: ${family(typeProperty(node, 'fontFamily'))};`);
    lines.push(`  ${base}-font-weight: ${typeProperty(node, 'fontWeight') ?? 400};`);
    lines.push(`  ${base}-font-size: ${length(typeProperty(node, 'fontSize')) ?? '1rem'};`);
    lines.push(`  ${base}-line-height: ${length(typeProperty(node, 'lineHeight')) ?? 'normal'};`);
    lines.push(`  ${base}-letter-spacing: ${length(typeProperty(node, 'letterSpacing')) ?? 'normal'};`);
  }

  return lines;
}

function shadowColor(value) {
  const match = String(value).trim().match(/^#([0-9a-f]{3,8})$/i);
  if (!match) return String(value);

  let digits = match[1];
  if (digits.length === 3 || digits.length === 4) {
    digits = digits.split('').map((digit) => digit + digit).join('');
  }
  if (digits.length !== 6 && digits.length !== 8) return String(value);

  const red = parseInt(digits.slice(0, 2), 16);
  const green = parseInt(digits.slice(2, 4), 16);
  const blue = parseInt(digits.slice(4, 6), 16);
  const alpha = digits.length === 8 ? Number((parseInt(digits.slice(6, 8), 16) / 255).toFixed(3)) : 1;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function shadowLength(value) {
  if (value == null) return '0px';
  const text = String(value).trim();
  return /^-?\d*\.?\d+$/.test(text) ? `${text}px` : text;
}

function oneShadow(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.color == null) return null;

  const x = shadowLength(value.offsetX ?? value.x ?? 0);
  const y = shadowLength(value.offsetY ?? value.y ?? 0);
  const blur = shadowLength(value.radius ?? value.blur ?? 0);
  const spread = shadowLength(value.spread ?? 0);
  return `${x} ${y} ${blur} ${spread} ${shadowColor(value.color)}`;
}

function buildShadows(tokens) {
  const source = tokens.schema?.effect ?? tokens.effect ?? tokens.effects;
  if (!source) fail('Missing effect source');

  const lines = [];

  for (const [name, token] of Object.entries(source)) {
    if (!token || typeof token !== 'object' || Array.isArray(token)) continue;

    const raw = unwrap(token);
    const value = Array.isArray(raw) ? raw.map(oneShadow).filter(Boolean).join(', ') : oneShadow(raw);
    if (!value) fail(`Could not compile shadow "${name}"`);

    lines.push(`  --freshfold-shadow-${slug(name)}: ${value};`);
  }

  return lines;
}

function readJson(file) {
  if (!fs.existsSync(file)) fail(`Input file not found: ${file}`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`Could not parse ${file}: ${error.message}`);
  }
}

function loadModeTokens(mode) {
  const roleFile = MODE_ROLE_FILES[mode];
  if (!roleFile) fail(`Unsupported mode "${mode}". Use light or dark.`);

  const rolePath = path.join(ROOT, 'design-system', roleFile);
  const base = readJson(COMPLETE_INPUT_PATH);
  const primitives = readJson(PRIMITIVES_PATH);
  const roles = readJson(rolePath);

  return {
    tokens: Object.assign({}, base, primitives, { 'color roles': roles }),
    source: `${path.relative(path.resolve(ROOT, '..'), rolePath)} (${mode} mode) + ${path.relative(path.resolve(ROOT, '..'), PRIMITIVES_PATH)}`,
  };
}

function main() {
  log(`Input:  ${MODE ? MODE_ROLE_FILES[MODE] ?? MODE : INPUT_PATH}`);
  log(`Output: ${OUTPUT_PATH}`);

  if (MODE && !MODE_ROLE_FILES[MODE]) fail(`Unsupported mode "${MODE}". Use light or dark.`);

  let tokens;
  let source;

  if (MODE) {
    const bundle = loadModeTokens(MODE);
    tokens = bundle.tokens;
    source = bundle.source;
  } else {
    tokens = readJson(INPUT_PATH);
    source = path.relative(path.resolve(ROOT, '..'), INPUT_PATH);
  }

  Object.assign(INDEX, buildIndex(tokens));

  const colors = buildColors(tokens);
  const typography = buildTypography(tokens);
  const shadows = buildShadows(tokens);
  const filename = MODE ? `tokens-${MODE}.css` : 'tokens.css';
  const command = MODE
    ? `node task-01-design-system/scripts/build-tokens.js --mode ${MODE}`
    : 'node task-01-design-system/scripts/build-tokens.js';
  const css = `/**
 * ${filename}
 *
 * AUTO-GENERATED FILE. DO NOT EDIT.
 *
 * Source: ${source}
 * Generator: ${command}
 *
 * Primitive palette values are resolved during compilation and are never
 * exposed as CSS variables. Components may only consume semantic roles.
 */

:root {
  /* Semantic color roles. */
${colors.join('\n')}

  /* Typography. */
${typography.join('\n')}

  /* Shadows. */
${shadows.join('\n')}
}
`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, css, 'utf8');

  log(`Semantic color roles: ${colors.length}`);
  log(`Typography vars:      ${typography.length}`);
  log(`Shadow vars:          ${shadows.length}`);
  log('Status: complete');
}

try {
  main();
} catch (error) {
  fail(error.message);
}

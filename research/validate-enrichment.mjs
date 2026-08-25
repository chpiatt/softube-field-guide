import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const expected = [];
let section = null;
for (const line of html.split('\n')) {
  const sectionMatch = line.match(/<section id="(\d+)-[^"]+" class="level1">/);
  if (sectionMatch) section = Number(sectionMatch[1]);
  const nameMatch = line.match(/<p class="plugin-head"><strong>([^<]+)/);
  if (nameMatch && section) expected.push({ name: nameMatch[1], section });
}

const batchDir = path.join(repoRoot, 'research', 'batches');
const batchFiles = fs.readdirSync(batchDir)
  .filter((file) => file.endsWith('.json'))
  .sort();
const rows = batchFiles.flatMap((file) => {
  const parsed = JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8'));
  if (!Array.isArray(parsed)) throw new Error(`${file}: top level must be an array`);
  return parsed.map((row) => ({ ...row, __file: file }));
});

const errors = [];
const expectedKeys = [
  'name', 'section', 'comparative_edge', 'advanced_moves', 'use_cases',
  'pairings', 'insider_note', 'avoid_when', 'evidence'
];
const moveKeys = ['setup', 'action', 'listen_for', 'why_it_works'];
const caseKeys = ['context_type', 'context', 'source_or_bus', 'application', 'why_this_plugin'];
const pairingKeys = ['partner', 'goal', 'order', 'setup', 'why_it_works', 'caution', 'basis', 'source_url'];
const evidenceKeys = ['basis', 'sources'];
const sourceKeys = ['title', 'url'];
const evidenceBases = new Set(['documented', 'documented-plus-editorial-inference', 'compatibility-note']);
const pairingBases = new Set(['documented', 'attributed', 'engineering-inference']);
const contextTypes = new Set(['instrument', 'bus', 'genre', 'sound-design']);
const expectedNames = new Set(expected.map((row) => row.name));

const words = (value) => String(value).trim().split(/\s+/).filter(Boolean).length;
const exactKeys = (object, keys) => {
  const actual = Object.keys(object).filter((key) => key !== '__file').sort();
  const wanted = [...keys].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
};
const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};
const partnerNames = (value) => value
  .split(/\s+(?:\+|→)\s+/)
  .map((item) => item.trim())
  .filter(Boolean);

for (const row of rows) {
  const label = `${row.__file}:${row.name ?? '<unnamed>'}`;
  if (!exactKeys(row, expectedKeys)) errors.push(`${label}: wrong top-level keys`);
  if (!expectedNames.has(row.name)) errors.push(`${label}: name not found in index.html`);
  if (!Number.isInteger(row.section) || row.section < 1 || row.section > 10) errors.push(`${label}: invalid section`);
  for (const key of ['name', 'comparative_edge', 'avoid_when']) {
    if (!String(row[key] ?? '').trim()) errors.push(`${label}: ${key} must not be empty`);
  }
  if (row.insider_note !== null && !String(row.insider_note ?? '').trim()) {
    errors.push(`${label}: insider_note must be a non-empty string or null`);
  }
  if (words(row.comparative_edge) > 70) errors.push(`${label}: comparative_edge exceeds 70 words`);
  if (words(row.avoid_when) > 50) errors.push(`${label}: avoid_when exceeds 50 words`);

  if (!Array.isArray(row.advanced_moves) || row.advanced_moves.length < 2 || row.advanced_moves.length > 3) {
    errors.push(`${label}: advanced_moves must contain 2-3 items`);
  } else {
    row.advanced_moves.forEach((move, index) => {
      if (!exactKeys(move, moveKeys)) errors.push(`${label}: advanced_moves[${index}] wrong keys`);
      if (moveKeys.some((key) => !String(move[key] ?? '').trim())) errors.push(`${label}: advanced_moves[${index}] contains an empty field`);
    });
  }

  if (!Array.isArray(row.use_cases) || row.use_cases.length < 2 || row.use_cases.length > 3) {
    errors.push(`${label}: use_cases must contain 2-3 items`);
  } else {
    row.use_cases.forEach((useCase, index) => {
      if (!exactKeys(useCase, caseKeys)) errors.push(`${label}: use_cases[${index}] wrong keys`);
      if (!contextTypes.has(useCase.context_type)) errors.push(`${label}: use_cases[${index}] invalid context_type`);
      if (caseKeys.slice(1).some((key) => !String(useCase[key] ?? '').trim())) errors.push(`${label}: use_cases[${index}] contains an empty field`);
    });
    if (row.section <= 6 && row.use_cases.filter((item) => ['instrument', 'bus'].includes(item.context_type)).length < 2) {
      errors.push(`${label}: mixing entry needs at least two instrument/bus use cases`);
    }
  }

  if (!Array.isArray(row.pairings) || row.pairings.length > 2) {
    errors.push(`${label}: pairings must contain 0-2 items`);
  } else {
    row.pairings.forEach((pairing, index) => {
      if (!exactKeys(pairing, pairingKeys)) errors.push(`${label}: pairings[${index}] wrong keys`);
      if (!pairingBases.has(pairing.basis)) errors.push(`${label}: pairings[${index}] invalid basis`);
      for (const key of ['partner', 'goal', 'order', 'setup', 'why_it_works', 'caution']) {
        if (!String(pairing[key] ?? '').trim()) errors.push(`${label}: pairings[${index}].${key} must not be empty`);
      }
      if (pairing.basis !== 'engineering-inference' && !pairing.source_url) errors.push(`${label}: pairings[${index}] sourced basis needs source_url`);
      if (pairing.source_url !== null && !isHttpUrl(pairing.source_url)) errors.push(`${label}: pairings[${index}] invalid source_url`);
      for (const partner of partnerNames(pairing.partner)) {
        if (!expectedNames.has(partner)) errors.push(`${label}: pairings[${index}] unknown partner ${partner}`);
      }
    });
  }

  if (!row.evidence || !exactKeys(row.evidence, evidenceKeys)) errors.push(`${label}: evidence has wrong keys`);
  if (!evidenceBases.has(row.evidence?.basis)) errors.push(`${label}: invalid evidence basis`);
  if (!Array.isArray(row.evidence?.sources) || row.evidence.sources.length < 1) {
    errors.push(`${label}: evidence needs sources`);
  } else {
    row.evidence.sources.forEach((source, index) => {
      if (!exactKeys(source, sourceKeys)) errors.push(`${label}: evidence.sources[${index}] wrong keys`);
      if (!String(source.title ?? '').trim()) errors.push(`${label}: evidence.sources[${index}] needs title`);
      if (!isHttpUrl(source.url)) errors.push(`${label}: evidence.sources[${index}] invalid url`);
    });
  }
}

const byName = new Map();
for (const row of rows) {
  if (byName.has(row.name)) errors.push(`duplicate entry: ${row.name}`);
  byName.set(row.name, row);
}
for (const item of expected) {
  const row = byName.get(item.name);
  if (!row) errors.push(`missing entry: ${item.name}`);
  else if (row.section !== item.section) errors.push(`${item.name}: expected section ${item.section}, found ${row.section}`);
}
if (rows.length !== expected.length) errors.push(`expected ${expected.length} total entries, found ${rows.length}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const pairingCount = rows.reduce((sum, row) => sum + row.pairings.length, 0);
const useCaseCount = rows.reduce((sum, row) => sum + row.use_cases.length, 0);
console.log(JSON.stringify({
  files: batchFiles.length,
  entries: rows.length,
  advanced_moves: rows.reduce((sum, row) => sum + row.advanced_moves.length, 0),
  use_cases: useCaseCount,
  pairings: pairingCount
}, null, 2));

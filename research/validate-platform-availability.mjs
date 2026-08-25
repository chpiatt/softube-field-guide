import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const payload = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'plugin-platforms.json'), 'utf8'));
const errors = [];
const expected = [];
let section = null;

for (const line of html.split('\n')) {
  const sectionMatch = line.match(/<section id="(\d+)-[^"]+" class="level1">/);
  if (sectionMatch) section = Number(sectionMatch[1]);
  const nameMatch = line.match(/<p class="plugin-head"><strong>([^<]+)/);
  if (nameMatch && section) expected.push({ name: nameMatch[1], section });
}

const allowedPlatforms = [
  'dedicated', 'console1', 'equalizers', 'modular', 'amp_room',
  'amplifiers', 'flow_mixing', 'flow_mastering'
];
const allowedEvidence = new Set([
  'installed-softube-2.6.41-component',
  'installed-softube-2.6.41-map',
  'official-current-page'
]);
const expectedTopKeys = ['audited_on', 'installed_softube_version', 'platform_order', 'entries'];
const expectedEntryKeys = ['name', 'section', 'availability', 'note'];
const expectedAvailabilityKeys = ['detail', 'evidence', 'source_url'];

const exactKeys = (object, keys) => {
  const actual = Object.keys(object).sort();
  const wanted = [...keys].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
};

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

if (!exactKeys(payload, expectedTopKeys)) errors.push('top-level keys do not match the schema');
if (payload.audited_on !== '2026-08-25') errors.push('audited_on is not the current audit date');
if (payload.installed_softube_version !== '2.6.41') errors.push('installed Softube version is not 2.6.41');
if (JSON.stringify(payload.platform_order) !== JSON.stringify(allowedPlatforms)) errors.push('platform_order is invalid');
if (!Array.isArray(payload.entries)) errors.push('entries must be an array');

const rows = Array.isArray(payload.entries) ? payload.entries : [];
if (rows.length !== expected.length) errors.push(`expected ${expected.length} entries, found ${rows.length}`);

rows.forEach((row, index) => {
  const label = `${index}:${row?.name ?? '<unnamed>'}`;
  if (!row || !exactKeys(row, expectedEntryKeys)) errors.push(`${label}: wrong entry keys`);
  const expectedRow = expected[index];
  if (row?.name !== expectedRow?.name) errors.push(`${label}: expected name ${expectedRow?.name}`);
  if (row?.section !== expectedRow?.section) errors.push(`${label}: expected section ${expectedRow?.section}`);
  if (!row?.availability || Array.isArray(row.availability) || typeof row.availability !== 'object') {
    errors.push(`${label}: availability must be an object`);
    return;
  }
  const actualPlatforms = Object.keys(row.availability);
  const orderedPlatforms = allowedPlatforms.filter((platform) => actualPlatforms.includes(platform));
  if (JSON.stringify(actualPlatforms) !== JSON.stringify(orderedPlatforms)) errors.push(`${label}: platforms are unknown or out of order`);
  for (const [platform, item] of Object.entries(row.availability)) {
    if (!exactKeys(item, expectedAvailabilityKeys)) errors.push(`${label}:${platform}: wrong keys`);
    if (!String(item.detail ?? '').trim()) errors.push(`${label}:${platform}: missing detail`);
    if (!allowedEvidence.has(item.evidence)) errors.push(`${label}:${platform}: invalid evidence`);
    if (item.source_url !== null && !isHttpUrl(item.source_url)) errors.push(`${label}:${platform}: invalid source URL`);
    if (String(item.source_url).includes('/Users/')) errors.push(`${label}:${platform}: local path leaked into source URL`);
  }
  if (row.note !== null && !String(row.note ?? '').trim()) errors.push(`${label}: note must be null or non-empty`);
  if (row.section === 8 && row.name !== 'Modular') {
    if (actualPlatforms.length !== 1 || actualPlatforms[0] !== 'modular') errors.push(`${label}: Modular add-on must be Modular-only`);
    if (!row.note.includes('Modular FX')) errors.push(`${label}: Modular add-on note must explain external audio routing`);
  }
});

const byName = new Map(rows.map((row) => [row.name, row]));
const expectPlatforms = (name, expectedPlatforms) => {
  const actual = Object.keys(byName.get(name)?.availability ?? {});
  if (JSON.stringify(actual) !== JSON.stringify(expectedPlatforms)) {
    errors.push(`${name}: expected [${expectedPlatforms.join(', ')}], found [${actual.join(', ')}]`);
  }
};
const expectConsole = (name, detail) => {
  const actual = byName.get(name)?.availability?.console1?.detail;
  if (actual !== detail) errors.push(`${name}: expected Console 1 detail “${detail}”, found “${actual}”`);
};

expectConsole('Bus Processor', 'Compressor + Drive sections');
expectConsole('Bus Processor 670', 'Preamp + Compressor + Drive sections');
expectConsole('Clipper', 'Preamp + Shape + Drive sections');
expectConsole('Harmonics Analog Saturation Processor', 'Shape + Drive sections');
expectConsole('Focusing Equalizer', 'Equalizer + Drive sections');
expectPlatforms('Mutable Instruments Clouds', ['modular']);
expectPlatforms('Model 84 Chorus', ['dedicated', 'amp_room', 'flow_mixing']);
expectPlatforms('Eden WT800', ['dedicated']);
expectPlatforms('American Class A Compressor', ['console1', 'amp_room']);
if (!byName.get('Empirical Labs Lil FrEQ')?.availability?.equalizers) errors.push('Lil FrEQ is missing Equalizers availability');
if (!byName.get('Equalizers')?.availability?.equalizers) errors.push('Equalizers host is missing its own platform designation');
if (!byName.get('Modular')?.availability?.modular) errors.push('Modular host is missing its own platform designation');
if (!byName.get('Amp Room')?.availability?.amp_room) errors.push('Amp Room host is missing its own platform designation');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  entries: rows.length,
  unresolved_collections: rows.filter((row) => Object.keys(row.availability).length === 0).map((row) => row.name),
  platform_counts: Object.fromEntries(allowedPlatforms.map((platform) => [
    platform,
    rows.filter((row) => row.availability[platform]).length
  ]))
}, null, 2));

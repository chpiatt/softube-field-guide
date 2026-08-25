import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const catalogNames = new Set(
  [...html.matchAll(/<p class="plugin-head"><strong>([^<]+)/g)].map((match) => match[1])
);
const rows = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'plugin-mode-guides.json'), 'utf8'));
const errors = [];
const entryKeys = ['name', 'groups', 'sources'];
const groupKeys = ['control', 'summary', 'modes'];
const modeKeys = ['name', 'choose_for', 'sound', 'watch_for'];
const sourceKeys = ['title', 'url'];

const exactKeys = (object, keys) => {
  const actual = Object.keys(object).sort();
  const wanted = [...keys].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
};
const words = (value) => String(value).trim().split(/\s+/).filter(Boolean).length;
const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

if (!Array.isArray(rows)) throw new Error('plugin-mode-guides.json must contain an array');

const names = new Set();
for (const row of rows) {
  const label = row?.name || '<unnamed>';
  if (!exactKeys(row, entryKeys)) errors.push(`${label}: wrong entry keys`);
  if (!catalogNames.has(row.name)) errors.push(`${label}: name not found in catalog`);
  if (names.has(row.name)) errors.push(`${label}: duplicate entry`);
  names.add(row.name);

  if (!Array.isArray(row.groups) || row.groups.length < 1 || row.groups.length > 2) {
    errors.push(`${label}: groups must contain 1-2 items`);
  } else {
    row.groups.forEach((group, groupIndex) => {
      const groupLabel = `${label}:groups[${groupIndex}]`;
      if (!exactKeys(group, groupKeys)) errors.push(`${groupLabel}: wrong keys`);
      if (!String(group.control ?? '').trim()) errors.push(`${groupLabel}: control must not be empty`);
      if (!String(group.summary ?? '').trim()) errors.push(`${groupLabel}: summary must not be empty`);
      if (words(group.summary) > 35) errors.push(`${groupLabel}: summary exceeds 35 words`);
      if (!Array.isArray(group.modes) || group.modes.length < 2 || group.modes.length > 10) {
        errors.push(`${groupLabel}: modes must contain 2-10 items`);
      } else {
        const modeNames = new Set();
        group.modes.forEach((mode, modeIndex) => {
          const modeLabel = `${groupLabel}.modes[${modeIndex}]`;
          if (!exactKeys(mode, modeKeys)) errors.push(`${modeLabel}: wrong keys`);
          modeKeys.forEach((key) => {
            if (!String(mode[key] ?? '').trim()) errors.push(`${modeLabel}.${key}: must not be empty`);
          });
          for (const key of ['choose_for', 'sound', 'watch_for']) {
            if (words(mode[key]) > 35) errors.push(`${modeLabel}.${key}: exceeds 35 words`);
          }
          if (modeNames.has(mode.name)) errors.push(`${modeLabel}: duplicate mode name`);
          modeNames.add(mode.name);
        });
      }
    });
  }

  if (!Array.isArray(row.sources) || row.sources.length < 1 || row.sources.length > 3) {
    errors.push(`${label}: sources must contain 1-3 items`);
  } else {
    row.sources.forEach((source, sourceIndex) => {
      const sourceLabel = `${label}:sources[${sourceIndex}]`;
      if (!exactKeys(source, sourceKeys)) errors.push(`${sourceLabel}: wrong keys`);
      if (!String(source.title ?? '').trim()) errors.push(`${sourceLabel}: title must not be empty`);
      if (!isHttpUrl(source.url)) errors.push(`${sourceLabel}: invalid URL`);
    });
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  entries: rows.length,
  groups: rows.reduce((sum, row) => sum + row.groups.length, 0),
  modes: rows.reduce((sum, row) => sum + row.groups.reduce((inner, group) => inner + group.modes.length, 0), 0),
  sources: rows.reduce((sum, row) => sum + row.sources.length, 0)
}, null, 2));

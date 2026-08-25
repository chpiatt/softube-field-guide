import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const expectedNames = [];
let inCatalog = false;
for (const line of html.split('\n')) {
  if (/<section id="1-/.test(line)) inCatalog = true;
  if (/<section id="genre-recipes-/.test(line)) inCatalog = false;
  const match = line.match(/<p class="plugin-head"><strong>([^<]+)/);
  if (inCatalog && match) expectedNames.push(match[1]);
}

const batchDir = path.join(repoRoot, 'research', 'batches');
const rows = fs.readdirSync(batchDir)
  .filter((file) => file.endsWith('.json'))
  .sort()
  .flatMap((file) => JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8')));
const byName = new Map(rows.map((row) => [row.name, row]));
const ordered = expectedNames.map((name) => {
  const row = byName.get(name);
  if (!row) throw new Error(`Missing enrichment entry: ${name}`);
  return row;
});
if (ordered.length !== rows.length) throw new Error(`Expected ${ordered.length} unique rows; found ${rows.length}`);

const outputPath = path.join(repoRoot, 'data', 'plugin-deep-dives.json');
fs.writeFileSync(outputPath, JSON.stringify(ordered, null, 2) + '\n');
console.log(`Wrote ${ordered.length} entries to ${path.relative(repoRoot, outputPath)}`);

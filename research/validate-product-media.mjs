import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const deepDives = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'plugin-deep-dives.json'), 'utf8'));
const media = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'plugin-product-media.json'), 'utf8'));
const errors = [];
const shouldCheckNetwork = process.argv.includes('--network');

if (media.length !== deepDives.length) errors.push(`Expected ${deepDives.length} rows; found ${media.length}.`);

const allowedKinds = new Set(['product', 'parent-product', 'official-reference']);
const allowedProductHosts = new Set(['www.softube.com', 'cdn.softube.com']);
const allowedImageHosts = new Set(['cdn.softube.com', 'softubestorage.b-cdn.net']);
const seen = new Set();

media.forEach((row, index) => {
  const expected = deepDives[index]?.name;
  if (row.name !== expected) errors.push(`Row ${index + 1}: expected ${expected}; found ${row.name}.`);
  if (seen.has(row.name)) errors.push(`Duplicate media row: ${row.name}.`);
  seen.add(row.name);
  if (!allowedKinds.has(row.page_kind)) errors.push(`${row.name}: invalid page_kind ${row.page_kind}.`);
  try {
    const productUrl = new URL(row.product_url);
    if (!allowedProductHosts.has(productUrl.hostname)) errors.push(`${row.name}: non-Softube product host ${productUrl.hostname}.`);
  } catch {
    errors.push(`${row.name}: invalid product_url.`);
  }
  try {
    const imageUrl = new URL(row.image_url);
    if (!allowedImageHosts.has(imageUrl.hostname)) errors.push(`${row.name}: unapproved image host ${imageUrl.hostname}.`);
  } catch {
    errors.push(`${row.name}: invalid image_url.`);
  }
});

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const counts = Object.fromEntries([...allowedKinds].map((kind) => [kind, media.filter((row) => row.page_kind === kind).length]));
console.log(`Product media PASS: ${media.length} entries (${Object.entries(counts).map(([kind, count]) => `${count} ${kind}`).join(', ')}).`);

if (shouldCheckNetwork) {
  const urls = [...new Set(media.flatMap((row) => [row.product_url, row.image_url]))];
  const failures = [];
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const response = await fetch(url, {
          headers: { range: 'bytes=0-0' },
          redirect: 'follow',
          signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) failures.push(`${response.status} ${url}`);
        await response.body?.cancel();
      } catch (error) {
        failures.push(`${error.message} ${url}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 12 }, worker));
  if (failures.length) {
    console.error(`Network failures (${failures.length}):\n${failures.join('\n')}`);
    process.exit(1);
  }
  console.log(`Product media network PASS: ${urls.length} unique official URLs.`);
}

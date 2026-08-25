import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const batchDir = path.join(repoRoot, 'research', 'batches');
const rows = fs.readdirSync(batchDir)
  .filter((file) => file.endsWith('.json'))
  .flatMap((file) => JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8')));

const locations = new Map();
for (const row of rows) {
  for (const source of row.evidence.sources) {
    const owners = locations.get(source.url) ?? [];
    owners.push(`${row.name} evidence`);
    locations.set(source.url, owners);
  }
  for (const pairing of row.pairings) {
    if (!pairing.source_url) continue;
    const owners = locations.get(pairing.source_url) ?? [];
    owners.push(`${row.name} pairing`);
    locations.set(pairing.source_url, owners);
  }
}

const urls = [...locations.keys()].sort();
const results = new Array(urls.length);
let cursor = 0;

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'SoftubeFieldGuideSourceAudit/1.0' }
    });
    return {
      url,
      ok: response.ok,
      status: response.status,
      final_url: response.url,
      content_type: response.headers.get('content-type'),
      owners: locations.get(url)
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : String(error),
      owners: locations.get(url)
    };
  } finally {
    clearTimeout(timer);
  }
}

async function worker() {
  while (cursor < urls.length) {
    const index = cursor++;
    results[index] = await check(urls[index]);
  }
}

await Promise.all(Array.from({ length: Math.min(8, urls.length) }, worker));

const failures = results.filter((result) => !result.ok);
console.log(JSON.stringify({
  checked: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;

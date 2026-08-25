import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const entries = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'plugin-deep-dives.json'), 'utf8'));
const shouldWrite = process.argv.includes('--write');

const catalogUrls = [
  'https://www.softube.com/plug-ins/mixing',
  'https://www.softube.com/plug-ins/mastering',
  'https://www.softube.com/plug-ins/synthesizers',
  'https://www.softube.com/plug-ins/guitar-bass'
];

const directPages = [
  ['Modular', 'https://www.softube.com/modular'],
  ['Amp Room', 'https://www.softube.com/amp-room'],
  ['Flow Mixing Suite', 'https://www.softube.com/flow-mixing-suite'],
  ['Flow Mastering Suite', 'https://www.softube.com/flow-mastering-suite'],
  ['Flow Complete Suite', 'https://www.softube.com/flow-complete-suite']
];

const familyOverrides = new Map(Object.entries({
  'Abbey Road RS127 Rack': 'abbey-road-brilliance-pack',
  'Abbey Road RS127 Box': 'abbey-road-brilliance-pack',
  'Abbey Road RS135': 'abbey-road-brilliance-pack',
  'Passive Equalizer': 'passive-active-pack',
  'Active Equalizer': 'passive-active-pack',
  'Focusing Equalizer': 'passive-active-pack',
  'Tonelux Tilt': 'tonelux-tilt-and-tilt-live',
  'Tonelux Tilt Live': 'tonelux-tilt-and-tilt-live',
  'Tube-Tech PE 1C': 'tube-tech-equalizers-mk-ii',
  'Tube-Tech ME 1B': 'tube-tech-equalizers-mk-ii',
  'Tube-Tech CL 1B Mk I': 'tube-tech-compressor-collection',
  'Core Vintage Equalizers — Single': 'core-vintage-equalizers',
  'Core Vintage Equalizers — Dual': 'core-vintage-equalizers',
  'British Class A Equalizer': 'british-class-a-equalizer',
  'British Class A Compressor': 'british-class-a-compressor',
  'British Class A Drive': 'british-class-a-drive',
  'American Class A Equalizer': 'american-class-a',
  'American Class A Compressor': 'american-class-a',
  'American Class A Drive': 'american-class-a',
  'Dyna-mite Gate': 'valley-people-dyna-mite',
  'Dyna-mite Slam': 'valley-people-dyna-mite',
  'Empirical Labs Trak Pak Compressor': 'empirical-labs-trak-pak',
  'Empirical Labs Trak Pak Gate': 'empirical-labs-trak-pak',
  'Empirical Labs Trak Pak HF Limiter/Drive': 'empirical-labs-trak-pak',
  'Tube-Tech Classic Channel Mk I': 'tube-tech-classic-channel',
  'Model 77 Reverb': 'model-77-reverb',
  'Model 84 Chorus': 'model-84-chorus',
  'Model 72 Envelope Filter': 'model-72-envelope-filter',
  'Lion Head Vibrato (Amp Room)': 'lion-head-vibrato',
  'Tinnerö Tremolo (Amp Room)': 'tinnero-tremolo',
  'Doom Chvrch (Amp Room)': 'doom-chvrch',
  'Tube-Tech PE 1C / ME 1B legacy standalones': 'tube-tech-equalizers-mk-ii'
}));

const modularComponentNames = new Set([
  'Mutable Instruments Rings', '4ms Pingable Envelope Generator', 'Mutable Instruments Clouds',
  'Mutable Instruments Braids', 'Mutable Instruments Elements', 'Intellijel Korgasmatron II',
  'Doepfer A-188-1 BBD', 'Doepfer A-101-2 Vactrol LPG', 'Buchla 259e Twisted Waveform Generator',
  'Buchla 296e Spectral Processor', 'Buchla 292e Quad Dynamics Manager', 'Buchla 291e Triple Morphing Filter',
  'Buchla 285e Frequency Shifter', 'Buchla 230e Triple Envelope Tracker', 'Buchla 266e Source of Uncertainty',
  'Buchla 281e Quad Function Generator', 'Buchla 257e Dual Voltage Processor', 'Buchla 225e MIDI Decoder',
  'Buchla 227e System Interface', 'Buchla 256e Quad Control Voltage Processor', 'Buchla 297 Infinite Phase Shifter',
  'Buchla 288v Multi-Tap Delay', 'Buchla 258v Dual Oscillator', 'Buchla 156m Dual CV Processor',
  'Buchla 140 Timing Pulse Generator', 'Buchla 165 Random Voltage Source', 'Buchla 196 Phase Locked Loop',
  'Buchla 207 Mixer/Preamplifier', 'Buchla 259 Complex Waveform Generator', 'Buchla 208 Stored Program Sound Source',
  'Buchla 248 Multiple Arbitrary Function Generator', 'Buchla 245 Sequential Voltage Source',
  'Buchla 246 Sequential Voltage Source', 'Buchla 247 Quad Sequential Voltage Source',
  'Buchla 250e Arbitrary Function Generator', 'Buchla 251e Quad Sequential Voltage Source',
  'Buchla 252e Polyphonic Rhythm Generator', 'Buchla 223e Tactile Input Port', 'Buchla 222e Multi-Dimensional Kinesthetic Input',
  'Buchla 206e Mixer/Preset Manager', 'Buchla 225h MIDI Decoder/Preset Manager',
  'Mutable Instruments uFold II', 'Intellijel Rubicon', 'Intellijel µFold II'
]);

const normalize = (value) => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const slugify = (value) => normalize(value).replaceAll(' ', '-');
const tail = (url) => new URL(url).pathname.split('/').filter(Boolean).at(-1) ?? '';
const decodeHtml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&#xAE;', '®')
  .replaceAll('&#x2013;', '–')
  .replaceAll('&#x2014;', '—');

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'SoftubeFieldGuide/1.0 (+independent editorial catalog)' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function parseCatalog(html) {
  const products = [];
  const pattern = /<a href="([^"]+)" title="([^"]+)" class="product__link">[\s\S]{0,1200}?background-image:\s*url\('([^']+)'\)/g;
  for (const match of html.matchAll(pattern)) {
    products.push({
      title: decodeHtml(match[2]),
      product_url: new URL(match[1], 'https://www.softube.com').href,
      image_url: match[3],
      page_kind: 'product',
      match_basis: 'catalog'
    });
  }
  return products;
}

function parsePageMedia(html) {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
  const manualImage = html.match(/<img[^>]+src="(https:\/\/softubestorage\.b-cdn\.net\/manuals\/images\/[^"]+)"/i)?.[1];
  const imageTags = [...html.matchAll(/<img[^>]+>/gi)].map((match) => match[0]);
  const labeledProductImage = imageTags
    .filter((tag) => /alt="[^"]*(?:flow ui|product|plug-in|plugin)[^"]*"/i.test(tag))
    .map((tag) => tag.match(/src="(https:\/\/cdn\.softube\.com\/[^"]+)"/i)?.[1])
    .find(Boolean);
  const pageImage = [...html.matchAll(/<img[^>]+src="(https:\/\/cdn\.softube\.com\/[^"]+)"/gi)]
    .map((match) => match[1])
    .find((url) => !/logo|icon|avatar|flag|trustpilot|feature-line|divider|spacer|pixel/i.test(url));
  return { canonical, image_url: manualImage || labeledProductImage || pageImage || ogImage };
}

function tokenScore(entryName, productTitle) {
  const generic = new Set(['plugin', 'plug', 'in', 'equalizer', 'compressor', 'limiter', 'collection', 'suite', 'mk', 'ii', 'the']);
  const a = new Set(normalize(entryName).split(' ').filter((token) => !generic.has(token)));
  const b = new Set(normalize(productTitle).split(' ').filter((token) => !generic.has(token)));
  const overlap = [...a].filter((token) => b.has(token)).length;
  return overlap / Math.max(a.size, b.size, 1);
}

const catalogProducts = [];
for (const url of catalogUrls) catalogProducts.push(...parseCatalog(await fetchText(url)));
const byUrl = new Map(catalogProducts.map((product) => [product.product_url, product]));
const products = [...byUrl.values()];

for (const [title, url] of directPages) {
  try {
    const media = parsePageMedia(await fetchText(url));
    if (media.image_url) products.push({ title, product_url: media.canonical || url, image_url: media.image_url, page_kind: 'product', match_basis: 'direct-page' });
  } catch (error) {
    console.error(`Direct page failed: ${error.message}`);
  }
}

function chooseCatalogProduct(entry) {
  const override = familyOverrides.get(entry.name);
  if (override) {
    const match = products.find((product) => product.product_url.includes(override));
    if (match) return { ...match, match_basis: 'family-override' };
  }
  if (modularComponentNames.has(entry.name) || (entry.section === 8 && entry.name !== 'Modular')) {
    const match = products.find((product) => normalize(product.title) === 'modular');
    if (match) return { ...match, page_kind: 'parent-product', match_basis: 'modular-parent' };
  }
  const entryLabel = normalize(entry.name);
  const exact = products.find((product) => normalize(product.title) === entryLabel);
  if (exact) return { ...exact, match_basis: 'exact-title' };
  const prefix = products.find((product) => normalize(product.title).startsWith(entryLabel) || entryLabel.startsWith(normalize(product.title)));
  if (prefix && Math.min(entryLabel.length, normalize(prefix.title).length) >= 7) return { ...prefix, match_basis: 'title-prefix' };
  const evidenceSlugs = entry.evidence.sources
    .filter((source) => source.url.includes('softube.com'))
    .map((source) => tail(source.url));
  for (const evidenceSlug of evidenceSlugs) {
    const match = products.find((product) => tail(product.product_url).includes(evidenceSlug) || evidenceSlug.includes(tail(product.product_url)));
    if (match && evidenceSlug.length >= 5) return { ...match, match_basis: 'evidence-slug' };
  }
  const ranked = products
    .map((product) => ({ product, score: tokenScore(entry.name, product.title) }))
    .sort((a, b) => b.score - a.score);
  if (ranked[0]?.score >= 0.67) return { ...ranked[0].product, match_basis: `token-${ranked[0].score.toFixed(2)}` };
  return null;
}

const manualCache = new Map();
async function officialFallback(entry) {
  const source = entry.evidence.sources.find((candidate) => candidate.url.includes('softube.com')) ?? entry.evidence.sources[0];
  if (!source) return null;
  if (!manualCache.has(source.url)) {
    manualCache.set(source.url, fetchText(source.url).then(parsePageMedia).catch(() => ({})));
  }
  const media = await manualCache.get(source.url);
  return {
    title: entry.name,
    product_url: media.canonical || source.url,
    image_url: media.image_url,
    page_kind: source.url.includes('/user-manuals/') ? 'official-reference' : 'parent-product',
    match_basis: 'evidence-fallback'
  };
}

const rows = [];
for (const entry of entries) {
  let match = chooseCatalogProduct(entry);
  if (!match?.image_url) match = await officialFallback(entry);
  rows.push({
    name: entry.name,
    product_url: match?.product_url ?? null,
    image_url: match?.image_url ?? null,
    page_kind: match?.page_kind ?? 'unresolved',
    match_basis: match?.match_basis ?? 'unresolved'
  });
}

const unresolved = rows.filter((row) => !row.product_url || !row.image_url);
const suspicious = rows.filter((row) => row.match_basis.startsWith('token-'));
console.log(JSON.stringify({ products_scraped: products.length, entries: rows.length, unresolved: unresolved.length, suspicious: suspicious.length }, null, 2));
if (unresolved.length) console.log('UNRESOLVED\n' + unresolved.map((row) => row.name).join('\n'));
if (suspicious.length) console.log('TOKEN MATCHES\n' + suspicious.map((row) => `${row.name} => ${row.product_url} (${row.match_basis})`).join('\n'));

if (shouldWrite) {
  fs.writeFileSync(path.join(repoRoot, 'data', 'plugin-product-media.json'), JSON.stringify(rows, null, 2) + '\n');
  console.log('Wrote data/plugin-product-media.json');
}

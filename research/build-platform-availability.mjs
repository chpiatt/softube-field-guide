#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const ssxRoot = process.env.SOFTUBE_SSX_ROOT || '/Library/Application Support/Softube/SSX';
const vst3Root = process.env.SOFTUBE_VST3_ROOT || '/Library/Audio/Plug-Ins/VST3';
const outputPath = path.join(repoRoot, 'data', 'plugin-platforms.json');

const PLATFORM_TYPES = {
  SSX_TYPE_CONSOLE1_PRE_AMP: ['console1', 'Preamp'],
  SSX_TYPE_CONSOLE1_FILTER: ['console1', 'Filter'],
  SSX_TYPE_CONSOLE1_SHAPE: ['console1', 'Shape'],
  SSX_TYPE_CONSOLE1_EQUALIZER: ['console1', 'Equalizer'],
  SSX_TYPE_CONSOLE1_COMPRESSOR: ['console1', 'Compressor'],
  SSX_TYPE_CONSOLE1_DRIVE: ['console1', 'Drive'],
  SSX_TYPE_EQUALIZERS_VINTAGE_EQ: ['equalizers', 'Vintage EQ model'],
  SSX_TYPE_MODULAR_MODULE: ['modular', 'Module'],
  SSX_TYPE_AMP_ROOM_MODULE: ['amp_room', 'Module'],
  SSX_TYPE_AMP_ROOM_CAB_SUB_MODULE: ['amp_room', 'Cabinet'],
  SSX_TYPE_AMPLIFIERS: ['amplifiers', 'Amp or cabinet'],
  SSX_TYPE_STREAMING_CAB_SUB_MODULE: ['amplifiers', 'Cabinet'],
  SSX_TYPE_FLOW_MIXING: ['flow_mixing', 'Included processor'],
  SSX_TYPE_FLOW_MASTERING: ['flow_mastering', 'Included processor']
};

const PLATFORM_ORDER = [
  'dedicated', 'console1', 'equalizers', 'modular', 'amp_room',
  'amplifiers', 'flow_mixing', 'flow_mastering'
];

const normalize = (value) => String(value ?? '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const cleanModuleName = (row) => {
  const display = String(row.display_name ?? '').trim();
  const plugin = String(row.plugin_name ?? '').trim();
  const value = display || plugin;
  return value
    .replace(/^SOFTUBE\s+/i, '')
    .replace(/^Softube\s+/i, '')
    .trim();
};

const uniqueText = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const catalog = [];
let section = null;
for (const line of html.split('\n')) {
  const sectionMatch = line.match(/<section id="(\d+)-[^"]+" class="level1">/);
  if (sectionMatch) section = Number(sectionMatch[1]);
  const nameMatch = line.match(/<p class="plugin-head"><strong>([^<]+)/);
  if (nameMatch && section) catalog.push({ name: nameMatch[1], section });
}

const mediaRows = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'plugin-product-media.json'), 'utf8'));
const mediaByName = new Map(mediaRows.map((row) => [row.name, row]));

const parseLegacyMap = (source) => {
  const pluginName = source.match(/^PluginName:\s*"([^"]+)"/m)?.[1] ?? '';
  const pluginType = source.match(/^PluginType:\s*(\S+)/m)?.[1] ?? '';
  if (!pluginName || pluginType !== 'Module') return [];
  return [{ mapName: 'Default', mapType: 'SSX_TYPE_MODULAR_MODULE', pluginName, displayName: '' }];
};

const installedMaps = [];
if (fs.existsSync(ssxRoot)) {
  for (const bundleName of fs.readdirSync(ssxRoot).sort()) {
    if (!bundleName.endsWith('.ssx')) continue;
    const resources = path.join(ssxRoot, bundleName, 'Contents', 'Resources');
    const jsonPath = path.join(resources, 'SCMap.json');
    const textPath = path.join(resources, 'SCMap.txt');
    let maps = [];
    if (fs.existsSync(jsonPath)) {
      maps = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).maps ?? [];
    } else if (fs.existsSync(textPath)) {
      maps = parseLegacyMap(fs.readFileSync(textPath, 'utf8'));
    }
    for (const map of maps) {
      if (!PLATFORM_TYPES[map.mapType]) continue;
      installedMaps.push({
        bundle: bundleName.replace(/\.ssx$/, ''),
        map_name: map.mapName ?? '',
        map_type: map.mapType,
        plugin_name: map.pluginName ?? '',
        display_name: map.displayName ?? ''
      });
    }
  }
}

const installedVst3 = new Set(
  fs.existsSync(vst3Root)
    ? fs.readdirSync(vst3Root)
      .filter((name) => name.endsWith('.vst3'))
      .map((name) => normalize(name.replace(/\.vst3$/, '')))
    : []
);

const mapAliases = {
  'Reference 1956': ['Reference 1956 Equalizer'],
  'Reference 1998': ['Reference 1998 Equalizer'],
  'Core Vintage Equalizers — Single': ['Core Vintage Equalizer'],
  'Core Vintage Equalizers — Dual': ['Core Vintage Dual Equalizer'],
  'Chandler Limited Germanium Compressor': ['Chandler Limited Germanium Comp'],
  'Dyna-mite Gate': ['Valley People Dyna-mite Gate'],
  'Dyna-mite Slam': ['Valley People Dyna-mite Slam'],
  'Drawmer 1973 Multi-Band Compressor': ['Drawmer 1973'],
  'Drawmer S73 Intelligent Master Processor': ['Drawmer S73'],
  'Weiss Compressor/Limiter': ['Weiss Compressor Limiter'],
  'Weiss MM-1': ['Weiss MM-1 Mastering Maximizer'],
  'Empirical Labs Professor Punch-Knuckles': ['Empirical Labs Prof Punch-Knuckles'],
  'Doom Chvrch': ['Softube Doom Chvrch'],
  'Model 84 Chorus': ['Softube Model 84 Chorus'],
  'Tinnerö Tremolo': ['Tinnero Tremolo'],
  'American Mainstayer': ['American Mainstayer 100W'],
  'Bass Standard Line V8': ['Bass Standard V8'],
  'Pacific Dual Tremolo 100W Silver': ['Dual Tremolo 100W SF'],
  'Custom 100W': ['Amp Room Bass Amp Room'],
  'Top Boost': ['Amp Room Vintage Green Amp'],
  'Supernova Parallel Channel 300W': ['Supernova Bass Amp'],
  'Cardinal 100W': ['Amp Room Bass PA 100'],
  'Eden WT800': ['Eden WT800'],
  'Tube-Tech CL 1B Mk I': ['Tube-Tech CL 1B'],
  'Tube-Tech Classic Channel Mk I': ['Tube-Tech Classic Channel'],
  'Tube-Tech PE 1C / ME 1B legacy standalones': ['Tube-Tech PE 1C', 'Tube-Tech ME 1B']
};

const dedicatedAliases = {
  'Reference 1956': ['Reference 1956 Equalizer'],
  'Reference 1998': ['Reference 1998 Equalizer'],
  'Chandler Limited Germanium Compressor': ['Chandler Limited Germanium Comp'],
  'Drawmer 1973 Multi-Band Compressor': ['Drawmer 1973'],
  'Drawmer S73 Intelligent Master Processor': ['Drawmer S73'],
  'Weiss Compressor/Limiter': ['Weiss Compressor Limiter'],
  'Weiss MM-1': ['Weiss MM-1 Mastering Maximizer'],
  'Empirical Labs Professor Punch-Knuckles': ['Empirical Labs Prof Punch-Knuckles'],
  'Doom Chvrch': ['Softube Doom Chvrch'],
  'Model 84 Chorus': ['Softube Model 84 Chorus'],
  'Tinnerö Tremolo': ['Tinnero Tremolo'],
  'Model 72 Synth System': ['Model 72 Synthesizer System'],
  'Eden WT800': ['Eden WT800'],
  'Tube-Tech CL 1B Mk I': ['Tube-Tech CL 1B'],
  'Tube-Tech Classic Channel Mk I': ['Tube-Tech Classic Channel'],
  'Tube-Tech PE 1C / ME 1B legacy standalones': ['Tube-Tech PE 1C', 'Tube-Tech ME 1B']
};

const mapComponentAliases = {
  'Console 1 Core Mixing Suite': [
    'Console 1 Comp 1', 'Console 1 Comp 2', 'Console 1 Comp 3', 'Console 1 Drive',
    'Console 1 EQ 1', 'Console 1 EQ 2', 'Console 1 EQ 3', 'Console 1 EQ 4',
    'Console 1 Filter', 'Console 1 Preamp', 'Console 1 Preamp 2',
    'Console 1 Shape 1', 'Console 1 Shape 2'
  ],
  'SSL SL 4000 E-Series': [
    'Console 1 SSL SL 4000 E-Series Compressor',
    'Console 1 SSL SL 4000 E-Series Dynamic Shaper',
    'Console 1 SSL SL 4000 E-Series Equalizer',
    'Console 1 SSL SL 4000 E-Series Input',
    'Console 1 SSL SL 4000 E-Series Output'
  ],
  'SSL XL 9000 K-Series': [
    'Console 1 SSL XL 9000 K-Series Compressor',
    'Console 1 SSL XL 9000 K-Series Equalizer',
    'Console 1 SSL XL 9000 K-Series Gate',
    'Console 1 SSL XL 9000 K-Series Input',
    'Console 1 SSL XL 9000 K-Series Output'
  ],
  'British Class A': [
    'Console 1 British Class A Input', 'Console 1 British Class A Gate',
    'Console 1 British Class A Equalizer', 'Console 1 British Class A Limiter',
    'British Class A Compressor', 'British Class A Drive'
  ],
  'American Class A': [
    'Console 1 American Class A Input', 'Console 1 American Class A Shape',
    'Console 1 American Class A Equalizer', 'Console 1 American Class A Compressor',
    'Console 1 American Class A Output', 'Amp Room ACA EQ', 'Amp Room ACA Comp'
  ],
  'Chandler Zener-Bender for Console 1': [
    'Console 1 Chandler Limited Input', 'Console 1 Chandler Limited EQ',
    'Console 1 Chandler Limited Compressor', 'Console 1 Chandler Limited Output'
  ],
  'Empirical Labs Trak Pak for Console 1': [
    'Console 1 ELI Trak Pak Input', 'Console 1 ELI Trak Pak Deesser',
    'Console 1 ELI Trak Pak EQ', 'Console 1 ELI Trak Pak Comp',
    'Console 1 ELI Trak Pak Output'
  ],
  'Weiss Gambit Series for Console 1': [
    'Console 1 Weiss Gambit Input', 'Console 1 Weiss Gambit Shape',
    'Console 1 Weiss Gambit EQ', 'Console 1 Weiss Gambit Comp',
    'Console 1 Weiss Gambit Limiter'
  ],
  'Model 72 Synth System': [
    'Model 72 Oscillator', 'Model 72 Amplifier', 'Model 72 Filter', 'Model 72 Envelope',
    'Model 72 Noise', 'Model 72 Doubling', 'Model 72 Pre Amp'
  ],
  'Model 77 Dual Layer Synth': [
    'Model 77 VCO', 'Model 77 VCF', 'Model 77 VCA', 'Model 77 ADSR',
    'Model 77 LFO', 'Model 77 Ring Mod', 'Model 77 Reverb'
  ],
  'Model 82 Sequencing Mono Synth': [
    'Model 82 Arpeggiator', 'Model 82 VCO', 'Model 82 VCF',
    'Model 82 ENV', 'Model 82 LFO', 'Model 82 FX'
  ],
  'Model 84 Polyphonic Synthesizer': [
    'Model 84 Oscillator', 'Model 84 Filter', 'Model 84 HighPass', 'Model 84 Amplifier',
    'Model 84 Envelope', 'Model 84 LFO', 'Model 84 Noise', 'Model 84 Chorus'
  ],
  'Statement Lead': ['Statement Lead', 'Statement Lead Utility', 'Statement Lead Effects'],
  'Monoment Bass': ['Monoment Bass', 'Monoment Bass Utility'],
  'Parallels': ['Parallels', 'Parallels Shaper', 'Parallels Mod', 'Parallels Env', 'Parallels Effect'],
  'Heartbeat': ['Heartbeat Drum', 'Heartbeat EQ'],
  'Fix Flanger and Doubler': ['Fix Flanger', 'Fix Doubler']
};

const officialAdditions = {
  'Equalizers': {
    dedicated: 'DAW host plug-in',
    equalizers: 'Equalizers host plug-in'
  },
  'American Class A Compressor': {
    console1: 'Compressor section',
    amp_room: 'American Class A 25 Comp module'
  },
  'British Class A Equalizer': {
    console1: 'Equalizer section',
    amp_room: 'British Class A Equalizer module'
  },
  'Summit Audio Grand Channel': {
    console1: 'Filter + Equalizer + Compressor + Drive sections'
  },
  'Chandler Zener-Bender': {
    console1: 'Filter + Equalizer + Compressor + Drive sections'
  },
  'Weiss DS5 Multiband Compressor': {
    dedicated: 'DAW plug-in; no Softube host required',
    flow_mastering: 'Included processor'
  },
  'Core Dimensions': {
    dedicated: 'DAW plug-in; no Softube host required',
    flow_mixing: 'Included processor'
  },
  'Stereo Delay': {
    dedicated: 'DAW plug-in; no Softube host required',
    flow_mixing: 'Included processor'
  },
  'Fix Flanger and Doubler': {
    dedicated: 'Two DAW plug-ins: Fix Flanger + Fix Doubler'
  },
  'Blaze Works Amplification': {
    dedicated: 'DAW plug-in; no Softube host required',
    amp_room: 'Overvolt II + Arc Line IV amps; German Viper 4x12 cabinet',
    amplifiers: 'Overvolt II + Arc Line IV amps; German Viper 4x12 cabinet',
    flow_mixing: 'Included processor'
  },
  'Amp Room ENGL Savage Mark II Suite': {
    amp_room: 'Savage Mark II 120W + 60W amps, five ENGL cabinets, four pedals, and studio effects',
    amplifiers: 'Savage Mark II 120W + 60W amps and five ENGL cabinets'
  },
  'Marshall Murder One Lemmy Signature': {
    dedicated: 'DAW plug-in; no Softube host required',
    amp_room: 'Murder One amp + Lemmy cabinet setup'
  },
  'Celestion Speaker Shaper': {
    dedicated: 'DAW plug-in; no Softube host required',
    amp_room: 'Celestion Speaker Shaper module'
  },
  'Eden WT800': {
    dedicated: 'DAW plug-in; no Softube host required'
  },
  'Modular': {
    dedicated: 'DAW instrument + Modular FX plug-ins',
    modular: 'Modular instrument + Modular FX hosts'
  },
  'Amp Room': {
    dedicated: 'DAW host plug-in',
    amp_room: 'Amp Room host plug-in'
  },
  'Amp Room Marshall Suite': {
    amp_room: 'Marshall amps, cabinets, pedals, and studio effects',
    amplifiers: 'Marshall amps and cabinets'
  },
  'Amp Room Metal Suite': {
    amp_room: 'High-gain amps, cabinets, pedals, and studio effects',
    amplifiers: 'High-gain amps and cabinets'
  },
  'Amp Room Vintage Suite': {
    amp_room: 'Vintage amps, cabinets, pedals, and studio effects',
    amplifiers: 'Vintage amps and cabinets'
  },
  'Amp Room Bass Suite': {
    amp_room: 'Bass amps, cabinets, pedals, and studio effects',
    amplifiers: 'Bass amps and cabinets'
  },
  'Marshall Cabinet Collection': {
    amplifiers: 'Marshall cabinet collection'
  }
};

const manualAvailability = {
  'American Class A Equalizer': {
    console1: 'Equalizer section',
    equalizers: 'American Class A Equalizer model',
    amp_room: 'American Class A 55 EQ module',
    flow_mixing: 'Included processor'
  },
  'Model 80 Five Voice Synthesizer': {
    dedicated: 'Native instrument plug-in',
    modular: 'ADSR, LFO, Multi Pan, Noise Generator, VCF, and VCO modules'
  },
  'Lion Head Vibrato (Amp Room)': {
    amp_room: 'Lion Head Vibrato pedal'
  },
  'Tinnerö Tremolo (Amp Room)': {
    amp_room: 'Tinnerö Tremolo pedal'
  },
  'Doom Chvrch (Amp Room)': {
    amp_room: 'Doom Chvrch Reverb pedal'
  },
  'Softube Flow Complete Suite': {
    flow_mixing: 'Collection includes the Flow Mixing Suite host',
    flow_mastering: 'Collection includes the Flow Mastering Suite host'
  },
  'Flow Mixing Suite': {
    dedicated: 'DAW host plug-in',
    flow_mixing: 'Flow Mixing Suite host'
  },
  'Flow Mastering Suite': {
    dedicated: 'DAW host plug-in',
    flow_mastering: 'Flow Mastering Suite host'
  },
  'Icons Compressor Collection': {
    console1: 'Included FET, OPTO, and VCA models map to Compressor and Drive sections',
    flow_mixing: 'Included processors'
  },
  'Weiss Complete Collection 3': {
    console1: 'Included processors map across Filter, Shape, Equalizer, Compressor, and Drive sections',
    flow_mixing: 'Included processors',
    flow_mastering: 'Included processors'
  },
  'Empirical Labs Complete Collection 2': {
    console1: 'Included processors map across Preamp, Shape, Equalizer, Compressor, and Drive sections',
    equalizers: 'Lil FrEQ model',
    amp_room: 'Mike-E Comp module',
    flow_mixing: 'Included processors'
  },
  'Tube-Tech Complete Collection 2': {
    console1: 'Included processors map to Equalizer and Compressor sections',
    equalizers: 'Tube-Tech Equalizers Mk II model',
    modular: 'Blue Tone module',
    amp_room: 'CL 1B Mk II + Blue Tone modules',
    flow_mixing: 'Included processors',
    flow_mastering: 'Included processors'
  },
  'Reference Equalizers Bundle': {
    console1: 'Reference 1956 + Reference 1998 in the Equalizer section',
    equalizers: 'Reference 1956 + Reference 1998 models',
    flow_mixing: 'Included processors',
    flow_mastering: 'Included processors'
  },
  'The Dirty, Bad, and Wasted Collection': {
    console1: 'Dirty Tape and Bad Speaker map to Shape and Drive sections',
    modular: 'Wasted Space module',
    amp_room: 'Dirty Tape + Bad Speaker + Wasted Space modules',
    flow_mixing: 'Included processors'
  },
  'Passive-Active Pack': {
    console1: 'Passive, Active, and Focusing models in Equalizer; Focusing also in Drive',
    equalizers: 'Passive + Active + Focusing models',
    flow_mixing: 'Included processors'
  }
};

const entryNotes = {
  'Volume 6': 'Collection/license bundle. It is not a processor or host, so no single platform designation is asserted.',
  'Softube Essentials': 'Collection/license bundle. Open the included plug-in cards for exact host compatibility.',
  'Tube-Tech PE 1C / ME 1B legacy standalones': 'Legacy pair: both remain native plug-ins; each maps to the Console 1 Equalizer section.',
  'Amp Room ENGL Savage Mark II Suite': 'Suite product: the listed gear loads through Amp Room or Amplifiers rather than as separate native processors.',
  'Amp Room Marshall Suite': 'Suite product: its amps and cabinets load through Amp Room or Amplifiers.',
  'Amp Room Metal Suite': 'Suite product: its amps, cabinets, pedals, and effects load through Amp Room or Amplifiers.',
  'Amp Room Vintage Suite': 'Suite product: its amps, cabinets, pedals, and effects load through Amp Room or Amplifiers.',
  'Amp Room Bass Suite': 'Suite product: its amps, cabinets, pedals, and effects load through Amp Room or Amplifiers.'
};

const manualPlatformEvidence = new Set(Object.keys(officialAdditions));

const makeAvailability = (name, sectionNumber) => {
  if (manualAvailability[name]) {
    return Object.fromEntries(Object.entries(manualAvailability[name]).map(([key, detail]) => [key, {
      detail,
      evidence: 'official-current-page',
      source_url: mediaByName.get(name)?.product_url ?? null
    }]));
  }

  const availability = {};
  const labels = uniqueText([
    ...(name === 'Model 84 Chorus' ? [] : [name.replace(/ \(Amp Room\)$/, '')]),
    ...(mapAliases[name] ?? []),
    ...(mapComponentAliases[name] ?? [])
  ]);
  const labelKeys = new Set(labels.map(normalize));
  const matchingMaps = installedMaps.filter((row) => [row.bundle, row.plugin_name, row.display_name]
    .some((value) => labelKeys.has(normalize(value))));

  const sourceUrl = mediaByName.get(name)?.product_url ?? null;
  const sections = uniqueText(matchingMaps
    .filter((row) => PLATFORM_TYPES[row.map_type]?.[0] === 'console1')
    .map((row) => PLATFORM_TYPES[row.map_type][1]));
  if (sections.length) {
    const sectionOrder = ['Preamp', 'Filter', 'Shape', 'Equalizer', 'Compressor', 'Drive'];
    sections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));
    availability.console1 = {
      detail: `${sections.join(' + ')} ${sections.length === 1 ? 'section' : 'sections'}`,
      evidence: 'installed-softube-2.6.41-map',
      source_url: sourceUrl
    };
  }

  for (const platform of ['equalizers', 'flow_mixing', 'flow_mastering']) {
    if (!matchingMaps.some((row) => PLATFORM_TYPES[row.map_type]?.[0] === platform)) continue;
    availability[platform] = {
      detail: platform === 'equalizers' ? `${name.replace(/ — (Single|Dual)$/, '')} model` : 'Included processor',
      evidence: 'installed-softube-2.6.41-map',
      source_url: sourceUrl
    };
  }

  for (const platform of ['modular', 'amp_room', 'amplifiers']) {
    const moduleNames = uniqueText(matchingMaps
      .filter((row) => PLATFORM_TYPES[row.map_type]?.[0] === platform)
      .map(cleanModuleName));
    if (!moduleNames.length) continue;
    availability[platform] = {
      detail: moduleNames.join(' + '),
      evidence: 'installed-softube-2.6.41-map',
      source_url: sourceUrl
    };
  }

  const dedicatedLabels = uniqueText([name, ...(dedicatedAliases[name] ?? [])]);
  if (dedicatedLabels.some((label) => installedVst3.has(normalize(label)))) {
    availability.dedicated = {
      detail: sectionNumber === 7
        ? 'DAW instrument; no Softube host required'
        : 'DAW plug-in; no Softube host required',
      evidence: 'installed-softube-2.6.41-component',
      source_url: sourceUrl
    };
  }

  for (const [platform, detail] of Object.entries(officialAdditions[name] ?? {})) {
    availability[platform] = {
      detail,
      evidence: 'official-current-page',
      source_url: sourceUrl
    };
  }

  if (sectionNumber === 8 && name !== 'Modular') {
    return {
      modular: {
        detail: `${name} module`,
        evidence: 'official-current-page',
        source_url: sourceUrl
      }
    };
  }

  return availability;
};

const entries = catalog.map(({ name, section: sectionNumber }) => {
  const availability = makeAvailability(name, sectionNumber);
  const ordered = Object.fromEntries(PLATFORM_ORDER
    .filter((platform) => availability[platform])
    .map((platform) => [platform, availability[platform]]));
  let note = entryNotes[name] ?? null;
  if (sectionNumber === 8 && name !== 'Modular') {
    note = 'Requires the Modular host. To process external audio, load Modular FX; this module is not a standalone plug-in.';
  } else if (/ \(Amp Room\)$/.test(name)) {
    note = 'This card covers the Amp Room module. See the matching effect card in section 5 for the native plug-in.';
  } else if (sectionNumber === 10 && !note && name !== 'Flow Mixing Suite' && name !== 'Flow Mastering Suite') {
    note = 'Collection/license product. The listed environments describe included processors, not a separate processor with this product name.';
  }
  return { name, section: sectionNumber, availability: ordered, note };
});

const output = {
  audited_on: '2026-08-25',
  installed_softube_version: '2.6.41',
  platform_order: PLATFORM_ORDER,
  entries
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({
  entries: entries.length,
  with_availability: entries.filter((entry) => Object.keys(entry.availability).length).length,
  platform_counts: Object.fromEntries(PLATFORM_ORDER.map((platform) => [
    platform,
    entries.filter((entry) => entry.availability[platform]).length
  ])),
  official_overrides: manualPlatformEvidence.size
}, null, 2));

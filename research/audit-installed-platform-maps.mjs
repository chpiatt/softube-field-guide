#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const defaultRoot = '/Library/Application Support/Softube/SSX';
const ssxRoot = process.argv[2] || defaultRoot;

if (!fs.existsSync(ssxRoot)) {
  console.error(`Softube SSX directory not found: ${ssxRoot}`);
  process.exit(1);
}

const parseLegacyMap = (source) => {
  const pluginName = source.match(/^PluginName:\s*"([^"]+)"/m)?.[1] ?? '';
  const pluginType = source.match(/^PluginType:\s*(\S+)/m)?.[1] ?? '';
  if (!pluginName || pluginType !== 'Module') return [];
  return [{
    mapName: 'Default',
    mapType: 'SSX_TYPE_MODULAR_MODULE',
    pluginName,
    displayName: ''
  }];
};

const rows = [];
for (const bundleName of fs.readdirSync(ssxRoot).sort()) {
  if (!bundleName.endsWith('.ssx')) continue;
  const bundleRoot = path.join(ssxRoot, bundleName);
  const resources = path.join(bundleRoot, 'Contents', 'Resources');
  const jsonPath = path.join(resources, 'SCMap.json');
  const textPath = path.join(resources, 'SCMap.txt');
  let maps = [];

  try {
    if (fs.existsSync(jsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      maps = parsed.maps ?? [];
    } else if (fs.existsSync(textPath)) {
      maps = parseLegacyMap(fs.readFileSync(textPath, 'utf8'));
    }
  } catch (error) {
    console.error(`${bundleName}: ${error.message}`);
    process.exitCode = 1;
    continue;
  }

  for (const map of maps) {
    if (!map.mapType) continue;
    rows.push({
      bundle: bundleName.replace(/\.ssx$/, ''),
      map_name: map.mapName ?? '',
      map_type: map.mapType,
      plugin_name: map.pluginName ?? '',
      display_name: map.displayName ?? ''
    });
  }
}

console.log(JSON.stringify({
  source: ssxRoot,
  generated_at: new Date().toISOString(),
  maps: rows
}, null, 2));

import { readFile } from "node:fs/promises";

const media = JSON.parse(await readFile(new URL("../data/plugin-product-media.json", import.meta.url)));
const urls = [...new Set(media.map((entry) => entry.product_url))];
const pages = new Map();
let cursor = 0;

async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    try {
      const response = await fetch(url, { redirect: "follow" });
      pages.set(url, response.ok ? await response.text() : "");
    } catch {
      pages.set(url, "");
    }
  }
}

await Promise.all(Array.from({ length: 10 }, worker));

const phrases = {
  console1: /console 1 ready|console 1-ready|for console 1|in console 1|within console 1/i,
  modular: /modular ready|for modular|in modular|modular module|modules in softube modular/i,
  amp_room: /amp room ready|amp room-ready|for amp room|in amp room|amp room module|amp room-exclusive/i,
  flow_mixing: /flow.{0,30}mixing suite/i,
  flow_mastering: /flow.{0,30}mastering suite/i,
  dedicated: /native plug-in|separate plug-in|vst3?|audio units?|aax compatible daw/i
};

function snippets(text, terms) {
  const normalized = text.toLowerCase();
  return terms.flatMap((term) => {
    const index = normalized.indexOf(term);
    if (index < 0) return [];
    return [text.slice(Math.max(0, index - 220), Math.min(text.length, index + 520)).trim()];
  });
}

const results = media.map((entry) => {
  const html = pages.get(entry.product_url) || "";
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ");
  return {
    name: entry.name,
    url: entry.product_url,
    fetched: Boolean(html),
    ...Object.fromEntries(Object.entries(phrases).map(([key, pattern]) => [key, pattern.test(text)])),
    console1_context: snippets(text, ["in console 1", "within console 1", "console 1 ready", "console 1-ready"]),
    modular_context: snippets(text, ["for modular", "in modular", "modular module"]),
    amp_room_context: snippets(text, ["for amp room", "in amp room", "amp room ready", "amp room-ready"])
  };
});

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);

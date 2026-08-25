(async () => {
  "use strict";

  const body = document.body;
  const main = document.querySelector("#guide");
  const intro = document.querySelector("#how-to-use-this-guide");
  const search = document.querySelector("#search");
  const count = document.querySelector("#result-count");
  const empty = document.querySelector("#no-results");
  const toc = document.querySelector("#toc");
  const navToggle = document.querySelector("#nav-toggle");
  const navClose = document.querySelector("#nav-close");
  const navDrawer = document.querySelector("#nav-drawer");
  const drawerScrim = document.querySelector("#drawer-scrim");
  const backTop = document.querySelector("#back-top");
  const backgroundLayers = [...document.querySelectorAll(".topbar, .hero, .feature-strip, #guide, footer, #back-top")];
  const drawerControls = navDrawer
    ? [...navDrawer.querySelectorAll('a[href], button:not([disabled])')]
    : [];

  if (!main || !intro || !search || !count || !empty) return;

  intro.classList.add("guide-intro");
  body.classList.add("is-enhanced");
  drawerControls.forEach((control) => control.setAttribute("tabindex", "-1"));

  const icon = (id, className = "") =>
    `<svg class="icon ${className}" aria-hidden="true"><use href="#${id}"/></svg>`;

  const normalize = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const slugify = (value) =>
    normalize(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const pluginHref = (name) => `#plugin-${slugify(name)}`;

  const humanize = (value) =>
    value
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  async function loadDeepDiveData() {
    try {
      const response = await fetch("data/plugin-deep-dives.json");
      if (!response.ok) throw new Error(`Deep-dive request failed with ${response.status}`);
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("Deep-dive data is not an array");
      return new Map(rows.map((row) => [row.name, row]));
    } catch (error) {
      console.error("Producer deep dives could not be loaded.", error);
      body.classList.add("deep-dives-unavailable");
      return new Map();
    }
  }

  async function loadProductMedia() {
    try {
      const response = await fetch("data/plugin-product-media.json");
      if (!response.ok) throw new Error(`Product-media request failed with ${response.status}`);
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error("Product-media data is not an array");
      return new Map(rows.map((row) => [row.name, row]));
    } catch (error) {
      console.error("Official product media could not be loaded.", error);
      body.classList.add("product-media-unavailable");
      return new Map();
    }
  }

  function buildProductMedia(entry) {
    const labels = {
      product: ["Official Softube product", "View product"],
      "parent-product": ["Official Softube collection", "View parent product"],
      "official-reference": ["Official Softube reference", "Open official reference"]
    };
    const [eyebrow, action] = labels[entry.page_kind] || labels["official-reference"];
    const section = makeElement("section", `plugin-product-media media-${entry.page_kind}`);
    const thumbnailLink = makeElement("a", "plugin-thumbnail-link");
    thumbnailLink.href = entry.product_url;
    thumbnailLink.target = "_blank";
    thumbnailLink.rel = "noreferrer";
    thumbnailLink.setAttribute("aria-label", `${action} for ${entry.name}`);

    const image = makeElement("img", "plugin-thumbnail");
    image.src = entry.image_url;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => section.classList.add("image-unavailable"), { once: true });
    thumbnailLink.append(image);

    const copy = makeElement("div", "plugin-product-copy");
    copy.append(
      makeElement("span", "plugin-product-label", eyebrow),
      makeElement(
        "p",
        "plugin-product-note",
        entry.page_kind === "parent-product"
          ? "This item lives inside the linked product or collection."
          : entry.page_kind === "official-reference"
            ? "No current standalone product page; this is the closest official reference."
            : "Current product page, demos, and availability."
      )
    );

    const link = makeElement("a", "plugin-product-link");
    link.href = entry.product_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.append(makeElement("span", "", action));
    link.insertAdjacentHTML("beforeend", icon("i-chevron"));
    section.append(thumbnailLink, copy, link);
    return section;
  }

  function buildTechnique(move, index) {
    const item = makeElement("li", "technique-item");
    item.append(makeElement("span", "technique-number", String(index + 1).padStart(2, "0")));
    const facts = makeElement("dl", "technique-facts");
    [
      ["Setup", move.setup],
      ["Do this", move.action],
      ["Listen for", move.listen_for],
      ["Why it works", move.why_it_works]
    ].forEach(([label, value]) => {
      facts.append(makeElement("dt", "", label), makeElement("dd", "", value));
    });
    item.append(facts);
    return item;
  }

  function buildUseCase(useCase) {
    const item = makeElement("li", "use-case-item");
    const heading = makeElement("h5", "", useCase.context);
    const target = makeElement(
      "p",
      "use-case-target",
      `${humanize(useCase.context_type)} · ${useCase.source_or_bus}`
    );
    const application = makeElement("p", "use-case-application", useCase.application);
    const rationale = makeElement("p", "use-case-rationale");
    rationale.append(makeElement("strong", "", "Why this plug-in"), ` ${useCase.why_this_plugin}`);
    item.append(heading, target, application, rationale);
    return item;
  }

  function buildPairing(pairing) {
    const item = makeElement("article", "pairing-item");
    const heading = makeElement("header", "pairing-head");
    const titleWrap = makeElement("div", "");
    titleWrap.append(
      makeElement("h5", "", pairing.partner),
      makeElement("p", "pairing-goal", pairing.goal)
    );
    heading.append(
      titleWrap,
      makeElement("span", `pairing-basis basis-${pairing.basis}`, humanize(pairing.basis))
    );
    const order = makeElement("p", "pairing-order", pairing.order);
    const facts = makeElement("dl", "pairing-facts");
    [
      ["Starting move", pairing.setup],
      ["Why it works", pairing.why_it_works],
      ["Watch for", pairing.caution]
    ].forEach(([label, value]) => {
      facts.append(makeElement("dt", "", label), makeElement("dd", "", value));
    });
    item.append(heading, order, facts);
    return item;
  }

  function buildDeepDive(entry) {
    const fragment = document.createDocumentFragment();
    const comparison = makeElement("section", "plugin-comparison");
    comparison.append(
      makeElement("h3", "", "Why this one?"),
      makeElement("p", "", entry.comparative_edge)
    );

    const disclosure = makeElement("details", "plugin-deep-dive");
    const summary = makeElement("summary", "deep-dive-summary");
    const summaryCopy = makeElement("span", "deep-dive-summary-copy");
    const pairingCount = entry.pairings.length;
    const countParts = [
      `${entry.advanced_moves.length} techniques`,
      `${entry.use_cases.length} source & bus uses`
    ];
    if (pairingCount) countParts.push(`${pairingCount} ${pairingCount === 1 ? "pairing" : "pairings"}`);
    summaryCopy.append(
      makeElement("strong", "", "Producer deep dive"),
      makeElement("span", "", countParts.join(" · "))
    );
    summary.insertAdjacentHTML("beforeend", icon("i-book", "deep-dive-icon"));
    summary.append(summaryCopy);
    summary.insertAdjacentHTML("beforeend", icon("i-chevron", "deep-dive-chevron"));

    const content = makeElement("div", "deep-dive-content");
    const moves = makeElement("section", "deep-section deep-techniques");
    const movesHead = makeElement("header", "deep-section-head");
    movesHead.append(
      makeElement("h4", "", "Advanced techniques"),
      makeElement("p", "", "Set the move, then confirm it with the listening checkpoint.")
    );
    moves.append(movesHead);
    const moveList = makeElement("ol", "technique-list");
    entry.advanced_moves.forEach((move, index) => moveList.append(buildTechnique(move, index)));
    moves.append(moveList);

    const uses = makeElement("section", "deep-section deep-use-cases");
    const usesHead = makeElement("header", "deep-section-head");
    usesHead.append(
      makeElement("h4", "", "Sources, instruments & buses"),
      makeElement("p", "", "Starting points organized by the signal you are processing.")
    );
    uses.append(usesHead);
    const useList = makeElement("ul", "use-case-list");
    entry.use_cases.forEach((useCase) => useList.append(buildUseCase(useCase)));
    uses.append(useList);

    content.append(moves, uses);

    if (entry.pairings.length) {
      const pairings = makeElement("section", "deep-section deep-pairings");
      const pairingsHead = makeElement("header", "deep-section-head");
      pairingsHead.append(
        makeElement("h4", "", "Useful pairings"),
        makeElement("p", "", "Chain order, division of labor, and the point where the combination stops helping.")
      );
      pairings.append(pairingsHead);
      const pairingList = makeElement("div", "pairing-list");
      entry.pairings.forEach((pairing) => pairingList.append(buildPairing(pairing)));
      pairings.append(pairingList);
      content.append(pairings);
    }

    const notes = makeElement("aside", "expert-notes", undefined);
    if (entry.insider_note) {
      const insight = makeElement("section", "expert-note insider-note");
      insight.append(
        makeElement("h4", "", "Non-obvious behavior"),
        makeElement("p", "", entry.insider_note)
      );
      notes.append(insight);
    }
    const avoid = makeElement("section", "expert-note avoid-note");
    avoid.append(makeElement("h4", "", "Choose something else when"), makeElement("p", "", entry.avoid_when));
    notes.append(avoid);
    content.append(notes);

    const sources = makeElement("footer", "deep-sources");
    sources.append(makeElement("span", "", "Evidence"));
    const sourceList = makeElement("ul", "");
    entry.evidence.sources.forEach((source) => {
      const item = makeElement("li", "");
      const link = makeElement("a", "", source.title);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      item.append(link);
      sourceList.append(item);
    });
    sources.append(sourceList);
    content.append(sources);

    disclosure.append(summary, content);
    fragment.append(comparison, disclosure);
    return fragment;
  }

  function buildPrimer() {
    const decisionLanes = [
      {
        id: "vocals",
        title: "Vocals",
        description: "Separate pitch, peaks, average level, sibilance, channel tone, and depth before choosing a processor.",
        icon: "i-dynamics",
        routes: [
          ["Smooth leveling", "Tube-Tech CL 1B Mk II", "Adjustable optical tube leveling", "Want fewer timing decisions?", "OPTO Compressor"],
          ["Fast peak control", "FET Compressor Mk II", "Fast grab with audible attitude", "Want console-style punch?", "American Class A Compressor"],
          ["Precise de-essing", "Weiss Deess", "Transparent, frequency-conscious control", "Need a simpler dedicated path?", "Deesser"],
          ["Pitch correction", "Vocal Tuner", "Natural correction through obvious effect", "Need thickness rather than tuning?", "Fix Doubler"],
          ["Complete vocal channel", "Summit Audio Grand Channel", "Tube EQ and leveling in one path", "Prefer the Tube-Tech family?", "Tube-Tech Classic Channel Mk II"],
          ["Chamber depth", "Atlantis Dual Chambers", "Characterful dual-chamber placement", "Need a compact neutral room?", "TSAR-1R Reverb"]
        ]
      },
      {
        id: "drums",
        title: "Drums & percussion",
        description: "Decide whether the problem is envelope, density, movement, bus behavior, fundamental shape, or room.",
        icon: "i-mix",
        routes: [
          ["Reshape attack", "Transient Shaper", "Envelope control without compressor timing", "Need density as well?", "VCA Compressor"],
          ["Add colored punch", "American Class A Compressor", "Forward console-style impact", "Want tighter, cleaner control?", "VCA Compressor"],
          ["Parallel destruction", "Dyna-mite Slam", "Explosive movement under the dry kit", "Want a more familiar fast grab?", "FET Compressor Mk II"],
          ["Glue the drum bus", "Bus Processor", "Bus compression with flexible routing", "Want heavier vintage density?", "Bus Processor 670"],
          ["Shape kick weight", "Reference 1956", "Broad low boost-and-attenuation contour", "Need dynamic kick/bass separation?", "Equalizers"],
          ["Add a compact room", "Spring Reverb", "Metallic, instrument-like ambience", "Need a cleaner room decision?", "TSAR-1R Reverb"]
        ]
      },
      {
        id: "low-end",
        title: "Bass & low end",
        description: "Choose a source, amp path, level strategy, kick pocket, or harmonic translation stage.",
        icon: "i-tone",
        routes: [
          ["Build a modern synth bass", "Monoment Bass", "Immediate layered low-end instrument", "Want a classic mono architecture?", "Model 72 Synth System"],
          ["Blend electric bass amp", "Amp Room Bass Suite", "Flexible bass amp, cabinet, and blend workflow", "Want one focused vintage lineage?", "Bass Standard Line V8"],
          ["Level bass guitar", "Summit Audio TLA-100A", "Tube optical control with headroom color", "Want a broader optical archetype?", "OPTO Compressor"],
          ["Make room for kick", "Equalizers", "Range-limited dynamic correction", "Is envelope overlap the real problem?", "Transient Shaper"],
          ["Improve small-speaker translation", "Harmonics Analog Saturation Processor", "Choose the harmonic family deliberately", "Want cohesion across the whole bus?", "Tape"]
        ]
      },
      {
        id: "guitars",
        title: "Guitars",
        description: "Start with the amplifier job, then decide whether cabinet shaping or time effects should finish the sound.",
        icon: "i-guitar",
        routes: [
          ["Large clean foundation", "Pacific Dual Tremolo 100W Silver", "High-headroom American clean platform", "Want a tighter British clean?", "Custom 100W"],
          ["Vintage crunch", "Amp Room Marshall Suite", "Multiple Marshall eras in one environment", "Want the Bluesbreaker specifically?", "Marshall Bluesbreaker 1962"],
          ["Modern metal rhythm", "Amp Room ENGL Savage Mark II Suite", "Focused high-gain ENGL workflow", "Need a broader metal toolkit?", "Amp Room Metal Suite"],
          ["Reshape cabinet behavior", "Celestion Speaker Shaper", "Speaker-level tone and response control", "Need a cabinet collection instead?", "Marshall Cabinet Collection"],
          ["Add slap and room", "Tube Delay", "Short tube-colored repeat", "Need metallic amp-like ambience?", "Spring Reverb"]
        ]
      },
      {
        id: "synths",
        title: "Synths & instruments",
        description: "Pick the architecture first: vintage poly, mono sequence, layered expression, drums, filtering, or chorus.",
        icon: "i-synth",
        routes: [
          ["Classic chorus poly", "Model 84 Polyphonic Synthesizer", "Immediate 1980s polyphonic identity", "Want a Prophet-style voice?", "Model 80 Five Voice Synthesizer"],
          ["Sequenced mono line", "Model 82 Sequencing Mono Synth", "Integrated mono synth and sequencer behavior", "Want a broader classic mono system?", "Model 72 Synth System"],
          ["Expressive layered pad", "Model 77 Dual Layer Synth", "Performance-oriented dual-layer architecture", "Want a source-morphing hybrid?", "Parallels"],
          ["Synthetic drums", "Heartbeat", "Dedicated modeled drum synthesis and mixing", "Want to patch the voice yourself?", "Modular"],
          ["Filter external audio", "Model 72 Envelope Filter", "Classic synth-filter response as an effect", "Need dual-filter modulation?", "Intellijel Korgasmatron II"],
          ["Vintage chorus movement", "Model 84 Chorus", "Focused Juno-family modulation", "Need a broader modulation palette?", "Dimensions"]
        ]
      },
      {
        id: "mastering",
        title: "Buses & mastering",
        description: "Distinguish correction, broad tone, glue, moving-spectrum control, peaks, sibilance, and harmonic finish.",
        icon: "i-master",
        routes: [
          ["Surgical tonal correction", "Weiss EQ1", "Mastering-grade digital precision", "Need dynamic bands and faster mixing workflow?", "Equalizers"],
          ["Broad analog contour", "Reference 1998", "Four interacting passive bands", "Want stepped console-derived restraint?", "Chandler Limited Curve Bender"],
          ["Familiar mix-bus glue", "Bus Processor", "Controlled bus movement with modern options", "Want denser vari-mu character?", "Bus Processor 670"],
          ["Control a moving spectrum", "Tube-Tech SMC 2B", "Tube multiband shaping by range", "Need mastering dynamics in one digital unit?", "Weiss DS1-MK3"],
          ["Manage final peaks", "Weiss Compressor/Limiter", "Transparent compression and limiting", "Want explicit peak shaving?", "Clipper"],
          ["Tame master sibilance", "Weiss Deess", "Focused transparent high-frequency control", "Need the simpler processor?", "Deesser"],
          ["Add harmonic finish", "Overstayer M-A-S", "Forward analog color and emphasis", "Want steadier tape cohesion?", "Tape"]
        ]
      },
      {
        id: "space",
        title: "Space & movement",
        description: "Choose between room speed, tail detail, chamber character, delay identity, doubling, and chorus.",
        icon: "i-space",
        routes: [
          ["Choose a room quickly", "TSAR-1R Reverb", "Compact musical room workflow", "Need deeper tail control?", "TSAR-1 Reverb"],
          ["Design a detailed reverb", "TSAR-1 Reverb", "Fine control of space and tail behavior", "Want chamber character instead?", "Atlantis Dual Chambers"],
          ["Add vintage chamber depth", "Atlantis Dual Chambers", "Two distinct chamber personalities", "Want a smaller metallic space?", "Spring Reverb"],
          ["Explore several echo types", "Echoes", "Multiple delay characters in one plug-in", "Want a focused tape machine path?", "Tape Echoes"],
          ["Thicken without a distinct echo", "Fix Doubler", "Controlled doubling and comb behavior", "Want modulation rather than duplication?", "Dimensions"],
          ["Add vintage chorus", "Model 84 Chorus", "Specific Juno-family motion", "Need more modulation algorithms?", "Dimensions"]
        ]
      },
      {
        id: "sound-design",
        title: "Sound design & lo-fi",
        description: "Choose the transformation: open patching, complex oscillation, granular time, BBD smear, digital damage, or speaker perspective.",
        icon: "i-modular",
        routes: [
          ["Build a custom signal path", "Modular", "Open routing across modeled modules", "Need a finished layered instrument?", "Model 77 Dual Layer Synth"],
          ["Start from a complex oscillator", "Buchla 259e Twisted Waveform Generator", "Unstable digital wavefolding source", "Need the complete patching environment?", "Modular"],
          ["Granularize a performance", "Mutable Instruments Clouds", "Texture, freeze, and time dispersion", "Need filtered lo-fi space instead?", "Wasted Space"],
          ["Create BBD smear", "Doepfer A-188-1 BBD", "Clocked delay artifacts inside a patch", "Need a finished tape-echo workflow?", "Tape Echoes"],
          ["Destroy digital resolution", "OTO Biscuit 8-bit Effects", "Stepped conversion and filter character", "Want analog-style wear and drift?", "Dirty Tape"],
          ["Change speaker perspective", "Bad Speaker", "Fast band-limit and breakup viewpoint", "Need the effect inside a reverb field?", "Wasted Space"]
        ]
      }
    ];
    const routeTotal = decisionLanes.reduce((total, lane) => total + lane.routes.length, 0);
    const decisionContexts = decisionLanes.map((lane, index) => `
      <button class="decision-context" type="button" data-decision-context="${lane.id}" aria-pressed="${index === 0}">
        <span>${lane.title}</span><small>${lane.routes.length}</small>
      </button>`).join("");
    const decisionMap = decisionLanes.map((lane) => `
      <section id="decision-lane-${lane.id}" class="decision-lane" data-decision-lane="${lane.id}"${lane.id === "vocals" ? "" : " hidden"}>
        <header class="decision-lane-head">
          ${icon(lane.icon, "decision-lane-icon")}
          <div><h3>${lane.title}</h3><p>${lane.description}</p></div>
        </header>
        <ol class="decision-routes">
          ${lane.routes.map(([goal, pick, reason, comparePrompt, compare]) => `
            <li class="decision-route">
              <span class="decision-goal">${goal}</span>
              <a class="decision-pick" href="${pluginHref(pick)}"><strong>${pick}</strong><span>${reason}</span></a>
              <span class="decision-compare">${comparePrompt} <a href="${pluginHref(compare)}">Compare ${compare}</a></span>
            </li>`).join("")}
        </ol>
      </section>`).join("");

    const primer = document.createElement("div");
    primer.className = "guide-primer";
    primer.innerHTML = `
      <section class="decision-panel" aria-labelledby="decision-title">
        <h2 id="decision-title">Quick decision map</h2>
        <p class="primer-lead">Choose the signal first, then the exact job. Every route gives you a grounded first pick and the nearest useful comparison—not a universal ranking.</p>
        <div class="decision-contexts" aria-label="Choose a signal to map">
          ${decisionContexts}
          <button class="decision-context decision-context-all" type="button" data-decision-context="all" aria-pressed="false"><span>All routes</span><small>${routeTotal}</small></button>
        </div>
        <div class="decision-map-status" role="status" aria-live="polite"><strong>Vocals</strong><span>Showing ${decisionLanes[0].routes.length} focused decisions</span></div>
        <nav class="decision-map" aria-label="Quick plugin decisions">${decisionMap}</nav>
      </section>
      <aside class="method-panel" aria-labelledby="method-title">
        <h2 id="method-title">How to read the guide</h2>
        <ul class="method-list">
          <li>${icon("i-target")}<div><strong>Independent and unbiased</strong><span>We explain what each tool does, how it works, and where it fits.</span></div></li>
          <li>${icon("i-dynamics")}<div><strong>Signal first</strong><span>Everything is described in production terms—not marketing language.</span></div></li>
          <li>${icon("i-grid")}<div><strong>Whole catalog, always reachable</strong><span>Jump between jobs, categories, and tools without losing your place.</span></div></li>
          <li>${icon("i-book")}<div><strong>Learn and apply</strong><span>Context, comparisons, and workflow tips help you get more from every tool.</span></div></li>
        </ul>
      </aside>`;

    const decisionButtons = [...primer.querySelectorAll("[data-decision-context]")];
    const decisionPanels = [...primer.querySelectorAll("[data-decision-lane]")];
    const decisionStatus = primer.querySelector(".decision-map-status");
    const decisionMapElement = primer.querySelector(".decision-map");
    decisionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const context = button.dataset.decisionContext;
        const showAll = context === "all";
        decisionButtons.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
        decisionPanels.forEach((panel) => { panel.hidden = !showAll && panel.dataset.decisionLane !== context; });
        decisionMapElement?.classList.toggle("show-all", showAll);
        const lane = decisionLanes.find((candidate) => candidate.id === context);
        if (decisionStatus) {
          decisionStatus.querySelector("strong").textContent = showAll ? "All signal contexts" : lane.title;
          decisionStatus.querySelector("span").textContent = showAll
            ? `Showing all ${routeTotal} decisions`
            : `Showing ${lane.routes.length} focused decisions`;
        }
      });
    });

    const standards = document.createElement("details");
    standards.className = "guide-standards";
    standards.innerHTML = `<summary>Methodology, hardware labels, and complete decision table</summary><div class="standards-content"></div>`;
    const standardsContent = standards.querySelector(".standards-content");

    const introParagraph = intro.querySelector(":scope > p");
    const hardware = intro.querySelector("#hardware-identification-labels");
    const rules = intro.querySelector("#two-rules-that-improve-almost-every-plug-in");
    const quick = intro.querySelector("#quick-decision-map");
    const navigation = intro.querySelector("#navigation");

    [introParagraph, hardware, rules, quick, navigation].forEach((node) => {
      if (node) standardsContent.append(node);
    });

    intro.prepend(primer);
    intro.append(standards);
  }

  function upgradeRecipes() {
    const recipes = [
      {
        title: "Melodic house",
        goal: "A wide drop whose kick, bass, and lead still read down the center.",
        stages: [["Model 84 Polyphonic Synthesizer", "Chord source"], ["Harmonics Analog Saturation Processor", "Density"], ["Stereo Delay", "Side movement"], ["Bus Processor", "Bus glue"], ["Reference 1998", "Final contour"]],
        first: "Build the chord and harmonics in mono first. Add delay around the dry center, sidechain only the effects return, then ask Bus Processor for roughly 1–2 dB of gain reduction before a very small broad EQ move.",
        swap: "If you need movement rather than repeats, compare Stereo Delay with Model 84 Chorus. If the bus needs antique density instead of familiar glue, compare Bus Processor 670.",
        watch: "Do not let the delayed sides carry sub energy or let the broad EQ restore low end that the sidechain was meant to clear."
      },
      {
        title: "Modern pop vocal",
        goal: "A stable, forward lead that stays bright without flattening the performance.",
        stages: [["Vocal Tuner", "Pitch"], ["FET Compressor Mk II", "Peaks"], ["Tube-Tech CL 1B Mk II", "Level"], ["Equalizers", "Harshness"], ["Atlantis Dual Chambers", "Depth"]],
        first: "Correct only the notes that distract, let the FET catch excursions, and make the CL 1B carry the slower leveling. Use a range-limited dynamic band for brightness that appears only on certain words; feed the chamber from a send.",
        swap: "Compare OPTO Compressor when the first dynamics stage should smooth rather than bite. Compare Fix Doubler when width matters more than a distinct chamber tail.",
        watch: "Tuning, fast compression, bright EQ, and reverb can each expose sibilance. Judge consonants after the complete chain, not one stage at a time."
      },
      {
        title: "Boom-bap drums",
        goal: "Heavy fundamentals, audible room movement, and preserved dry transients.",
        stages: [["Reference 1956", "Low contour"], ["Dyna-mite Slam", "Parallel movement"], ["Dirty Tape", "Wear and drift"]],
        first: "Use simultaneous low boost and attenuation to shorten the upper-bass shoulder, build the Slam on a parallel return, then add only enough Dirty Tape instability to make the loop feel handled rather than seasick.",
        swap: "Compare VCA Compressor when you need repeatable punch instead of explosive parallel movement. Compare Tape when cohesion matters more than obvious wear.",
        watch: "Keep the kick fundamental out of an over-reactive detector path and level-match the parallel return; louder is easily mistaken for harder-hitting."
      },
      {
        title: "Progressive-metal guitars",
        goal: "Dense multi-tracked rhythm guitars with pick definition and controlled fizz.",
        stages: [["TUBE Overdrive", "Tighten input"], ["Amp Room ENGL Savage Mark II Suite", "Amp voice"], ["Celestion Speaker Shaper", "Cab behavior"]],
        first: "Use less drive and amp gain on each take than a soloed sound suggests. Pair complementary cabinets, align them before EQ, and use Speaker Shaper for broad cabinet behavior before reaching for narrow cuts.",
        swap: "Bypass the overdrive if the pickups and arrangement already keep the low end tight. Use the broader Amp Room platform when cabinet, mic, and routing experiments matter more than the ENGL voice.",
        watch: "More gain across four takes turns pick definition into hash. Phase between cabinets can remove more body than any EQ can responsibly restore."
      },
      {
        title: "Dub-techno chord",
        goal: "A repeat network that evolves while the dry chord and kick remain anchored.",
        stages: [["Model 72 Synth System", "Chord source"], ["Tape Echoes", "Feedback performance"], ["Spring Reverb", "Metallic depth"]],
        first: "High-pass the echo feedback path, ride feedback as a performance, and place the spring after the echo so each repeat excites a smaller wash. Print a long pass and edit the best gestures into the arrangement.",
        swap: "Compare Model 84 for a wider polyphonic source. Compare Echoes when you want several delay characters without committing to a single tape-echo architecture.",
        watch: "Feedback and reverb accumulate faster than the meters suggest. Check the return against the kick and mute the dry chord briefly to hear what the network is storing."
      },
      {
        title: "Cinematic hybrid score",
        goal: "Vintage synth character inside a shared, believable orchestral depth field.",
        stages: [["Model 77 Dual Layer Synth", "Layered source"], ["Model 77 Reverb", "Near character"], ["TSAR-1 Reverb", "Shared hall"], ["Bus Processor 670", "Group density"]],
        first: "Treat Model 77 Reverb as part of the instrument, then send several score elements to one restrained TSAR-1 hall. Use Bus Processor 670 lightly across the group and compare Mid/Side behavior with the center protected.",
        swap: "Use TSAR-1R Reverb when speed matters more than detailed hall shaping. Remove the model-specific reverb when the shared hall already supplies enough character.",
        watch: "Two long tails can sound impressive soloed but erase front-to-back placement. Shorten or darken the near effect before making the shared hall smaller."
      },
      {
        title: "Neo-soul rhythm section",
        goal: "Distinctive individual tones that still settle into one warm pocket.",
        stages: [["American Class A", "Drum snap"], ["Summit Audio Grand Channel", "Vocal path"], ["Bass Standard Line V8", "Amp blend"], ["Reference 1998", "Bus tone"]],
        first: "Treat these as parallel roles, not one serial chain: shape drum attack, build the vocal in its channel, blend bass amp with a phase-aligned DI, and add Reference 1998 only after the pocket works without it.",
        swap: "Use Tube-Tech CL 1B Mk II when the vocal needs slower, more exposed leveling. Compare Reference 1956 when the mix needs a focused bass-and-air gesture rather than four-band contour.",
        watch: "Every colored stage can add low-mid density. Recheck the whole rhythm section in mono before interpreting accumulated warmth as glue."
      },
      {
        title: "Jazz acoustic master",
        goal: "Correct room and peak problems while leaving ensemble dynamics recognizable.",
        stages: [["Weiss EQ1", "Static correction"], ["Tube-Tech SMC 2B", "Moving spectrum"], ["Weiss DS1-MK3", "Rare peaks"]],
        first: "Use Weiss EQ1 only for repeatable room or tonal problems, engage SMC 2B only where the spectrum genuinely moves, and let DS1-MK3 catch rare peaks rather than establish a new average level. Match level after every stage.",
        swap: "Remove the multiband stage when one static EQ move solves the issue. Compare Weiss Compressor/Limiter when a simpler transparent finishing path is enough.",
        watch: "A processor doing almost nothing may be correct here. Do not create continuous gain reduction merely to justify a stage in the chain."
      },
      {
        title: "Industrial sound design",
        goal: "A controllable source that can fracture, smear, and collapse into curated moments.",
        stages: [["Buchla 259e Twisted Waveform Generator", "Unstable source"], ["Doepfer A-188-1 BBD", "Time smear"], ["OTO Biscuit 8-bit Effects", "Digital damage"], ["Wasted Space", "Filtered environment"]],
        first: "Establish a useful dry gesture first, then automate one destructive stage at a time. Record long passes with headroom, mark the strongest transitions, and edit those moments rather than leaving every processor fully engaged.",
        swap: "Use Dirty Tape when the source needs age and drift without the Biscuit's stepped digital destruction. Remove Wasted Space when the BBD already supplies enough depth.",
        watch: "Feedback, resonance, and bit reduction can create sudden level jumps. Capture below your normal print level and monitor the return after any resonant filter."
      },
      {
        title: "Country clean guitar",
        goal: "Bright articulation, controlled pick dynamics, and a compact sense of room.",
        stages: [["Pacific Dual Tremolo 100W Silver", "Clean amp"], ["VCA Compressor", "Pick control"], ["Tube Delay", "Slap"], ["TSAR-1R Reverb", "Short room"]],
        first: "Find brightness with amp headroom and mic position before EQ. Let the VCA reduce only distracting accents, keep the slap clearly shorter than the musical phrase, and add enough room to locate the cabinet without washing the pick.",
        swap: "Remove compression when the player already controls the front edge. Compare Spring Reverb when the ambience should become part of the guitar's character rather than a neutral room.",
        watch: "Too much compression makes every pick equally important; too much slap turns a tight performance into an apparent timing problem."
      },
      {
        title: "Reggaeton low end",
        goal: "A large bass voice that yields locally to the kick without full-band pumping.",
        stages: [["Monoment Bass", "Bass source"], ["Equalizers", "Dynamic pocket"], ["Clipper", "Peak shape"]],
        first: "Keep the sub component mono, trigger a range-limited dynamic band from the kick only where the two fundamentals collide, then clip the combined drum/bass bus just enough to shorten peaks before level matching.",
        swap: "Use Transient Shaper on the kick when envelope overlap—not frequency overlap—is the real problem. Remove the clipper when the arrangement already controls coincident peaks.",
        watch: "A wide sidechain band makes the bass disappear on every kick. Verify the pocket on small speakers as well as a system that reproduces the sub fundamental."
      },
      {
        title: "Ambient guitar",
        goal: "A huge evolving field with a dry location cue that keeps the performance legible.",
        stages: [["Custom 100W", "Clean foundation"], ["Fix Doubler", "Width"], ["Mutable Instruments Clouds", "Granular layer"], ["Dimensions", "Long environment"]],
        first: "Keep the amp foundation cleaner than the final texture suggests, build width before the granular stage, and feed the long hall from a return. Preserve a dry or short-room center as the location cue.",
        swap: "Compare TSAR-1 Reverb when the tail should behave like a conventional space. Remove Fix Doubler when Clouds already produces enough lateral motion.",
        watch: "Every stage lengthens or multiplies the gesture. Automate return levels around new notes so the previous cloud does not mask the next performance decision."
      }
    ];

    const section = document.querySelector("#genre-recipes-choosing-a-chain-for-a-reason");
    const grid = section?.querySelector(".recipe-grid");
    if (!section || !grid) return;
    const lead = section.querySelector(":scope > p:first-of-type");
    if (lead) lead.textContent = "Genre is the context, not the prescription. Open a pattern to see each stage's job, a conservative first pass, the nearest swap, and the failure mode to monitor.";
    grid.classList.add("recipe-stack");
    [...grid.querySelectorAll(":scope > .recipe")].forEach((recipe, index) => {
      const data = recipes[index];
      if (!data) return;
      const details = makeElement("details", "recipe");
      if (index === 0 && innerWidth > 600) details.open = true;
      const summary = makeElement("summary", "recipe-summary");
      const summaryCopy = makeElement("span", "recipe-summary-copy");
      summaryCopy.append(makeElement("h3", "", data.title), makeElement("span", "", data.goal));
      summary.append(summaryCopy);
      summary.insertAdjacentHTML("beforeend", icon("i-chevron", "recipe-chevron"));

      const content = makeElement("div", "recipe-content");
      const chain = makeElement("ol", "recipe-chain");
      data.stages.forEach(([plugin, role]) => {
        const stage = makeElement("li", "recipe-stage");
        const link = makeElement("a", "", plugin);
        link.href = pluginHref(plugin);
        stage.append(makeElement("span", "", role), link);
        chain.append(stage);
      });
      const guidance = makeElement("div", "recipe-guidance");
      [["First pass", data.first], ["Swap logic", data.swap], ["Watch for", data.watch]].forEach(([title, copy]) => {
        const item = makeElement("section", "");
        item.append(makeElement("h4", "", title), makeElement("p", "", copy));
        guidance.append(item);
      });
      content.append(chain, guidance);
      details.append(summary, content);
      recipe.replaceWith(details);
    });
  }

  function upgradePluginCard(card) {
    if (card.tagName === "DETAILS") return card;

    const head = card.querySelector(":scope > .plugin-head");
    if (!head) return card;

    const name = head.querySelector("strong")?.textContent.trim() || "Catalog entry";
    const lineage = head.querySelector("em")?.textContent.trim().replace(/^·\s*/, "") || "Lineage not specified";
    const details = document.createElement("details");
    details.className = card.className;

    [...card.attributes].forEach((attribute) => {
      if (attribute.name !== "class") details.setAttribute(attribute.name, attribute.value);
    });

    details.dataset.lineage = (details.dataset.lineage || lineage).toUpperCase();
    details.dataset.pluginName = name;
    details.id = `plugin-${slugify(name)}`;
    details.dataset.search = normalize(details.dataset.search || card.textContent || `${name} ${lineage}`);

    const summary = document.createElement("summary");
    summary.className = "plugin-summary";
    summary.innerHTML = `
      <span class="plugin-name"><span class="lineage-dot" aria-hidden="true"></span>${name}</span>
      <span class="plugin-lineage">${lineage}</span>
      ${icon("i-chevron", "chevron")}`;

    const content = document.createElement("div");
    content.className = "plugin-body";
    const basics = document.createElement("div");
    basics.className = "plugin-basics";
    const mobileLineage = document.createElement("p");
    mobileLineage.className = "plugin-mobile-lineage";
    const mobileLineageLabel = document.createElement("strong");
    mobileLineageLabel.textContent = "Model / inspiration —";
    mobileLineage.append(mobileLineageLabel, ` ${lineage}`);
    basics.append(mobileLineage);
    [...card.children].forEach((child) => {
      if (child !== head) basics.append(child);
    });
    content.append(basics);

    details.append(summary, content);
    card.replaceWith(details);
    return details;
  }

  function upgradeCatalogSection(section, index) {
    const heading = section.querySelector(":scope > h1");
    if (!heading) return null;

    const rawTitle = heading.textContent.trim();
    const match = rawTitle.match(/^(\d+)\.\s*(.+)$/);
    const sectionNumber = match ? match[1].padStart(2, "0") : String(index + 1).padStart(2, "0");
    const title = match ? match[2] : rawTitle;
    const sectionCards = [...section.querySelectorAll(":scope .plugin-card")].map(upgradePluginCard);

    const details = document.createElement("details");
    details.className = "catalog-section";
    details.id = section.id;
    details.dataset.defaultOpen = index === 0 ? "true" : "false";
    if (index === 0 && window.innerWidth > 600) details.open = true;

    const summary = document.createElement("summary");
    summary.innerHTML = `
      <span class="catalog-section-title"><span class="section-number">${sectionNumber}</span>${title}</span>
      <span class="catalog-section-count">${sectionCards.length} ${sectionCards.length === 1 ? "entry" : "entries"}</span>
      ${icon("i-chevron", "catalog-section-chevron")}`;

    const content = document.createElement("div");
    content.className = "catalog-section-content";
    const introCopy = section.querySelector(":scope > p:first-of-type");
    if (introCopy) {
      introCopy.classList.add("catalog-section-intro");
      content.append(introCopy);
    }

    [...section.children].forEach((child) => {
      if (child !== heading && child !== introCopy) content.append(child);
    });

    details.append(summary, content);
    section.replaceWith(details);
    return details;
  }

  function wrapLooseTables() {
    main.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("table-wrap")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "table-wrap";
      table.before(wrapper);
      wrapper.append(table);
    });
  }

  buildPrimer();
  wrapLooseTables();

  const sourceCatalogSections = [...main.querySelectorAll(":scope > .level1")].filter((section) => /^\d+-/.test(section.id));
  const catalogSections = sourceCatalogSections.map(upgradeCatalogSection).filter(Boolean);
  const cards = [...main.querySelectorAll(".plugin-card")];
  const [deepDiveByName, productMediaByName] = await Promise.all([
    loadDeepDiveData(),
    loadProductMedia()
  ]);
  cards.forEach((card) => {
    const media = productMediaByName.get(card.dataset.pluginName);
    if (media) card.querySelector(":scope > .plugin-body")?.prepend(buildProductMedia(media));
    const entry = deepDiveByName.get(card.dataset.pluginName);
    if (entry) {
      card.querySelector(":scope > .plugin-body")?.append(buildDeepDive(entry));
      card.dataset.search += ` ${normalize(JSON.stringify(entry))}`;
      card.classList.add("has-deep-dive");
    }
    if (media) card.classList.add("has-product-media");
  });
  body.classList.toggle("has-deep-dives", deepDiveByName.size > 0);
  body.classList.toggle("has-product-media", productMediaByName.size > 0);

  const searchSummary = document.createElement("div");
  searchSummary.className = "search-summary";
  searchSummary.setAttribute("role", "status");
  searchSummary.innerHTML = `<span id="search-summary-text">Showing catalog matches.</span><button class="clear-search" type="button">Clear search</button>`;

  const catalogIndex = document.createElement("header");
  catalogIndex.className = "catalog-index";
  catalogIndex.id = "catalog-index";
  catalogIndex.innerHTML = `
    <div><h2>Catalog index</h2><p>Mixing and mastering lead. Open any category or search the complete researched catalog from the masthead.</p></div>
    <span class="catalog-total">${cards.length} catalog entries</span>`;

  const firstCatalogSection = catalogSections[0];
  if (firstCatalogSection) {
    firstCatalogSection.before(searchSummary, catalogIndex);
  }

  [...main.querySelectorAll(":scope > .level1")].forEach((section) => {
    if (section !== intro) section.classList.add("reference-section");
  });
  upgradeRecipes();

  function resetCatalogOpenState() {
    catalogSections.forEach((section) => {
      section.hidden = false;
      section.classList.remove("is-hidden");
      section.open = section.dataset.defaultOpen === "true" && window.innerWidth > 600;
    });
  }

  function filterCatalog() {
    const query = normalize(search.value.trim());
    const searching = query.length > 0;
    const wasSearching = body.classList.contains("is-searching");
    let visibleCount = 0;

    body.classList.toggle("is-searching", searching);

    cards.forEach((card) => {
      const matches = !searching || card.dataset.search.includes(query);
      card.classList.toggle("is-hidden", !matches);
      if (matches) visibleCount += 1;
      if (!searching) card.open = false;
    });

    catalogSections.forEach((section) => {
      const matches = [...section.querySelectorAll(".plugin-card:not(.is-hidden)")].length;
      section.classList.toggle("is-hidden", searching && matches === 0);
      if (searching && matches > 0) section.open = true;
    });

    if (!searching) resetCatalogOpenState();

    if (wasSearching && !searching) {
      requestAnimationFrame(() => catalogIndex.scrollIntoView({ block: "start" }));
    }

    count.textContent = searching ? `${visibleCount}/${cards.length}` : String(cards.length);
    empty.classList.toggle("show", searching && visibleCount === 0);
    const summaryText = document.querySelector("#search-summary-text");
    if (summaryText) {
      summaryText.textContent = visibleCount === 0
        ? `No catalog entries match “${search.value.trim()}”.`
        : `${visibleCount} ${visibleCount === 1 ? "entry" : "entries"} match “${search.value.trim()}”.`;
    }
  }

  search.addEventListener("input", filterCatalog);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && search.value) {
      search.value = "";
      filterCatalog();
    }
  });

  document.querySelector(".clear-search")?.addEventListener("click", () => {
    search.value = "";
    filterCatalog();
    search.focus();
  });

  function openDrawer() {
    backgroundLayers.forEach((layer) => layer.setAttribute("inert", ""));
    navDrawer?.removeAttribute("inert");
    drawerControls.forEach((control) => control.removeAttribute("tabindex"));
    body.classList.add("drawer-open");
    navToggle?.setAttribute("aria-expanded", "true");
    navDrawer?.setAttribute("aria-hidden", "false");
    navClose?.focus();
  }

  function closeDrawer({ restoreFocus = true } = {}) {
    body.classList.remove("drawer-open");
    backgroundLayers.forEach((layer) => layer.removeAttribute("inert"));
    navToggle?.setAttribute("aria-expanded", "false");
    navDrawer?.setAttribute("aria-hidden", "true");
    navDrawer?.setAttribute("inert", "");
    drawerControls.forEach((control) => control.setAttribute("tabindex", "-1"));
    if (restoreFocus) navToggle?.focus();
  }

  navToggle?.addEventListener("click", openDrawer);
  navClose?.addEventListener("click", () => closeDrawer());
  drawerScrim?.addEventListener("click", () => closeDrawer());
  document.addEventListener("keydown", (event) => {
    if (!body.classList.contains("drawer-open")) return;
    if (event.key === "Escape") {
      closeDrawer();
      return;
    }
    if (event.key !== "Tab" || !navDrawer) return;
    const focusable = drawerControls.filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !navDrawer.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function openHashTarget() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (target?.classList.contains("catalog-section")) target.open = true;
    if (target?.classList.contains("plugin-card")) {
      target.closest(".catalog-section")?.setAttribute("open", "");
      target.open = true;
    }
    if (target) {
      const alignTarget = () => requestAnimationFrame(() => {
        const offset = window.innerWidth <= 820 ? 86 : 148;
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
        window.scrollTo({
          top,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      });
      if (document.readyState === "complete") {
        setTimeout(alignTarget, 80);
      } else {
        addEventListener("load", () => setTimeout(alignTarget, 80), { once: true });
      }
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target?.classList.contains("catalog-section")) target.open = true;
      if (target?.classList.contains("plugin-card")) {
        target.closest(".catalog-section")?.setAttribute("open", "");
        target.open = true;
      }
      if (body.classList.contains("drawer-open")) closeDrawer({ restoreFocus: false });
    });
  });

  addEventListener("hashchange", openHashTarget);
  openHashTarget();

  const observedSections = [...catalogSections, ...main.querySelectorAll(".reference-section")];
  const tocLinks = [...toc.querySelectorAll("a")];
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      tocLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${visible.target.id}`));
    },
    { rootMargin: "-18% 0px -72%" }
  );
  observedSections.forEach((section) => observer.observe(section));

  addEventListener(
    "scroll",
    () => backTop?.classList.toggle("show", scrollY > 900),
    { passive: true }
  );
  backTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  filterCatalog();
})();

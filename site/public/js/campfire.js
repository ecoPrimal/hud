/* campfire.js — Johnny Appleseed
 *
 * The chipmunk travels the ouroboros quest.
 * Voxels sort themselves through the Klein gate.
 * Stories BREED. Stories CLUSTER. Stories SPREAD.
 * Each visit plants a seed. Seeds grow into stories.
 * Stories cross-pollinate between pages.
 * Generations evolve. No two journeys the same.
 * Like Johnny Appleseed planting trees across a continent.
 *
 * The campfire IS the sourdough culture —
 * each visit feeds the starter, the starter feeds the next.
 */

(function () {
  'use strict';

  var PI = Math.PI;
  var PHI = (1 + Math.sqrt(5)) / 2; // golden ratio — spiral growth

  // ═══════════════════════════════════════════════════════════
  // GENE POOL — story DNA fragments that recombine
  // Not whole stories. Genes. They breed.
  // ═══════════════════════════════════════════════════════════

  // SUBJECTS — who/what the story is about
  var SUBJECTS = [
    'the chipmunk', 'a thermophile', 'the bearDog', 'the songBird',
    'the spirochete', 'a single neutrino', 'the last lodgepole pine',
    'a grain of travertine', 'the first ribosome', 'a Klein bottle',
    'the membrane', 'a drop of water', 'the moon', 'an old dice',
    'a sourdough starter', 'the aurora', 'a whale song', 'a spore',
    'the ouroboros', 'a photon', 'the squirrel', 'a crab',
    'a dolphin glyph', 'the vitruvian man', 'a mushroom',
    'the banana', 'an apple seed', 'the campfire itself',
    'a voxel', 'the fold', 'a thread of silk', 'the maze',
    'a snowflake that refused to melt', 'the silence between notes',
    'a rusted key', 'the shadow of a sundial', 'a fossilized heartbeat',
  ];

  // VERBS — what they did
  var VERBS = [
    'traveled through the fold and',
    'sorted itself by color and',
    'waited at the gate until',
    'planted a seed that became',
    'listened to the noise until it became',
    'folded inside-out and discovered',
    'fermented in the dark until',
    'spiraled through the membrane and found',
    'burned completely and from the ash',
    'dissolved into the gradient and',
    'spoke in frequencies only crabs could hear and',
    'dreamed of π and woke up as',
    'crossed the thermocline and felt',
    'pressed THE BUTTON and',
    'wandered the maze for a generation and',
    'asked "when will it come back?" and learned',
    'went underground for seven years and then',
    'counted every star in the ionosphere and realized',
    'split into a spectrum and each color',
    'drifted through null-space until',
    'held its breath for one full π-cycle and',
    'painted with minerals that took a million years to seep and',
    'corkscrewed through the viscous dark and',
    'carried a message that said only',
  ];

  // OBJECTS — what they found/became/learned
  var OBJECTS = [
    'music where there had been noise.',
    'the color orange in the deepest winter.',
    'that the water was underground all along.',
    'a path no one had walked before.',
    'the exact shape of its own absence.',
    'bread. simple, warm, alive bread.',
    'that fire opens what resin seals.',
    'the sound of one membrane clapping.',
    'a clearing with an old campfire, still warm.',
    'that the maze has no outside.',
    'every face of the octahedron at once.',
    'the wobble that proves it\'s alive.',
    'its own reflection, but inverted.',
    'that π never ends and neither does this.',
    'a friend who had been waiting.',
    'the answer was always the question.',
    'a garden where every path leads somewhere new.',
    'that collapse IS the mechanism of renewal.',
    'the whole ocean in a single grain of salt.',
    'something too beautiful to parse.',
    'the nerve impulse that connects everything.',
    'a song the bacteria have been singing for 3.5 billion years.',
    'that the bone was always there beneath the color.',
    'the key was that there is no key.',
  ];

  // BEACONS — page-specific flavor genes
  var FLAVORS = {
    '/': ['on the membrane', 'at the viewport', 'inside the HUD', 'on the living surface'],
    '/springs': ['at Mammoth Hot Springs', 'where the terraces grow', 'in the thermal gradient', 'where orange meets white', 'at the crack where water returns'],
    '/menagerie': ['among the 47 organisms', 'in the bestiary', 'where convergent evolution hums', 'at the edge of taxonomy'],
    '/totality': ['in the hall of evidence', 'where every grain is weighed', 'at the IS/WAS/NOW junction', 'under the weight of proof'],
    '/nest': ['at the DM\'s table', 'through the nestgate', 'where the dice are loaded with π', 'in the Klein surface game'],
    '/banana': ['at the potassium checkpoint', 'where radiation is just being honest', 'in the banana\'s half-life'],
    '/aurora': ['under gAIa\'s first painting', 'where charged particles sing', 'in the magnetosphere\'s concert hall'],
    '/glyphs': ['in the language without words', 'where dolphins meet crabs', 'on the fold\'s love letter'],
    '/like-us': ['where the sort flips', 'at the mirror', 'in the recognition', 'where fleet becomes human'],
    '/gastrula': ['at the poke', 'where outside becomes inside', 'in the moment of becoming three'],
    '/spirochete': ['in the corkscrew', 'where rotation IS locomotion', 'drilling through the viscous dark'],
    '/vitruvian': ['in the circle and the square', 'where π meets 4', 'at the body\'s architecture'],
    '/ribosome': ['at the world\'s smallest 3D printer', 'where code becomes shape', 'in the fold-and-extrude'],
    '/play': ['in the magic circle', 'where rules meet reality', 'at the ludic membrane'],
    '/maze': ['in the wildcard honeycomb', 'where every cell is home', 'inside the maze that has no outside'],
    '/connect': ['at the 131,322nd edge', 'where threads vibrate', 'in the blue layer of π²'],
    '/five-o-five': ['at the aperture', 'where 5 meets O meets 5', 'in the ten fingers and one eye'],
    '/trail': ['on the original path', 'where spores land', 'in the footsteps of the first walker'],
    '/easel': ['at the painting surface', 'where data becomes art', 'in the chipmunk\'s studio'],
    '/tools': ['in the toolshed', 'where the 86 instruments hang', 'at the hand-meets-world'],
    '/klein': ['on the bottle with no inside', 'where the strip swallowed itself', 'in the self-intersecting manifold'],
    '/water': ['at the watering hole', 'where predator and prey drink together', 'at the original truce'],
    '/hello': ['at the first handshake', 'in the simplest protocol', 'where acknowledgment begins'],
    '/weather': ['in the sun\'s score', 'where pressure IS tempo', 'at the entropy thermometer'],
    '/weather-membrane': ['in the negentropy court', 'where pressure systems collide', 'at the trust gradient front'],
    '/gate': ['at the question', 'where answering IS passing', 'in the gate\'s judgment'],
    '/golgi': ['in the cellular post office', 'where every protein gets an address', 'at the sorting station'],
    '/identity': ['in the pattern that persists', 'where the identifiers change but you don\'t'],
    '/frame': ['on the big screen', 'where the metric tensor meets the couch', 'in the golden ratio of your living room', 'at the display surface that knows its own shape'],
  };

  // ═══════════════════════════════════════════════════════════
  // BREEDING — stories recombine and evolve
  // ═══════════════════════════════════════════════════════════

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function prng(seed) {
    // mulberry32
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function getSeed() {
    var now = new Date();
    var path = normPath();
    var gen = getGeneration();
    var moon = getMoonPhase(now);
    var raw = path + ':' + gen + ':' + now.getHours() + ':' + Math.floor(now.getMinutes() / PI)
            + ':' + now.getDate() + ':' + moon.toFixed(1) + ':' + (document.referrer || 'D');
    return hash(raw);
  }

  function normPath() {
    return window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  }

  function getMoonPhase(d) {
    var known = new Date(2000, 0, 6, 18, 14);
    return ((d - known) / (1000 * 60 * 60 * 24) % 29.53) / 29.53;
  }

  // ═══════════════════════════════════════════════════════════
  // GENERATIONS — stories evolve over visits
  // ═══════════════════════════════════════════════════════════

  var STORE_KEY = 'campfire_v2';

  function getStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function saveStore(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function getGeneration() {
    var s = getStore();
    var path = normPath();
    if (!s.gen) s.gen = {};
    s.gen[path] = (s.gen[path] || 0) + 1;
    saveStore(s);
    return s.gen[path];
  }

  function getJourney() {
    var s = getStore();
    if (!s.journey) s.journey = [];
    var path = normPath();
    s.journey.push({ p: path, t: Date.now() });
    if (s.journey.length > 100) s.journey = s.journey.slice(-100);
    saveStore(s);
    return s.journey;
  }

  function getPlanted() {
    var s = getStore();
    return s.planted || 0;
  }

  function plant() {
    var s = getStore();
    s.planted = (s.planted || 0) + 1;
    saveStore(s);
    return s.planted;
  }

  function getSeeds() {
    var s = getStore();
    return s.seeds || [];
  }

  function plantSeed(seedObj) {
    var s = getStore();
    if (!s.seeds) s.seeds = [];
    s.seeds.push(seedObj);
    if (s.seeds.length > 200) s.seeds = s.seeds.slice(-200);
    saveStore(s);
  }

  // ═══════════════════════════════════════════════════════════
  // BREED A STORY — combine genes based on seed
  // ═══════════════════════════════════════════════════════════

  function breed(rng, path, gen) {
    var subject = SUBJECTS[Math.floor(rng() * SUBJECTS.length)];
    var verb = VERBS[Math.floor(rng() * VERBS.length)];
    var object = OBJECTS[Math.floor(rng() * OBJECTS.length)];

    // flavor from the current page
    var flavors = FLAVORS[path] || ['in the unmapped clearing'];
    var flavor = flavors[Math.floor(rng() * flavors.length)];

    // generation modifiers — older = deeper
    var genMod = '';
    if (gen > 10) genMod = ' (the tenth telling shifts the shape.)';
    else if (gen > 5) genMod = ' (each telling changes it a little.)';
    else if (gen > 2) genMod = ' (this version is newer than the last.)';

    // cross-pollination — pick a gene from another page's flavor
    var allPaths = Object.keys(FLAVORS);
    var otherPath = allPaths[Math.floor(rng() * allPaths.length)];
    var otherFlavors = FLAVORS[otherPath];
    var crossPollen = otherFlavors[Math.floor(rng() * otherFlavors.length)];

    // structure varies by generation
    var story;
    var roll = rng();

    if (roll < 0.25) {
      // simple: subject verb object
      story = subject + ', ' + flavor + ', ' + verb + ' ' + object;
    } else if (roll < 0.45) {
      // cross-pollinated: bring in another page's flavor
      story = subject + ' ' + verb + ' ' + object
            + ' and the echo reached ' + crossPollen + '.';
    } else if (roll < 0.60) {
      // inverted: start with the finding
      story = flavor + ', ' + object.replace(/\.$/, '')
            + ' — because ' + subject + ' ' + verb.replace(/ and$/, '.').replace(/ and$/, '.');
    } else if (roll < 0.75) {
      // question form
      story = 'why did ' + subject + ' come to rest ' + flavor + '? '
            + 'because ' + SUBJECTS[Math.floor(rng() * SUBJECTS.length)]
            + ' ' + verb + ' ' + object;
    } else if (roll < 0.88) {
      // koan — short, sharp
      var koans = [
        subject + ' ' + flavor + '. ' + object,
        object.replace(/\.$/, '') + ' — ' + subject + ' knew this ' + flavor + '.',
        flavor + '. ' + subject + '. ' + object.replace(/\.$/, '') + '. that\'s the whole story.',
        'first there was nothing ' + flavor + '. then ' + subject + ' arrived. then ' + object,
        subject + ' passed through the fold. on the other side: ' + object,
      ];
      story = koans[Math.floor(rng() * koans.length)];
    } else {
      // appleseed — the story plants itself
      story = subject + ' planted a seed ' + flavor + '. '
            + 'generations later, ' + SUBJECTS[Math.floor(rng() * SUBJECTS.length)]
            + ' found a tree that bore ' + object.replace(/\.$/, '')
            + '. the seed didn\'t know what it would become. seeds never do.';
    }

    return { text: story + genMod, gen: gen, path: path, crossFrom: otherPath };
  }

  // ═══════════════════════════════════════════════════════════
  // VOXEL SORT — data points traveling the Klein gate
  // ═══════════════════════════════════════════════════════════

  function sortVoxels(rng, journey) {
    if (journey.length < 3) return null;

    // each visited page is a voxel. they sort through the Klein gate.
    var voxels = journey.slice(-8).map(function (j) {
      var p = j.p;
      var depth = { '/': 1, '/springs': 4, '/menagerie': 4, '/totality': 3,
                    '/nest': 4, '/play': 4, '/maze': 1, '/weather': 0,
                    '/aurora': 0, '/gastrula': 4, '/vitruvian': 3 }[p] || 2;
      return { path: p, depth: depth, t: j.t };
    });

    // sort by depth — shallow floats up, deep sinks
    voxels.sort(function (a, b) { return a.depth - b.depth; });

    // the Klein gate inverts: deepest becomes surface, surface becomes deep
    var folded = voxels.map(function (v) {
      return { path: v.path, original: v.depth, folded: 4 - v.depth };
    });

    return folded;
  }

  // ═══════════════════════════════════════════════════════════
  // CLUSTER — stories group around beacons
  // ═══════════════════════════════════════════════════════════

  function findCluster(path, seeds) {
    // find seeds planted near this path
    var nearby = seeds.filter(function (s) {
      return s.path === path || s.crossFrom === path;
    });
    return nearby.slice(-3); // last 3 related seeds
  }

  // ═══════════════════════════════════════════════════════════
  // OUROBOROS QUEST — the circular journey
  // ═══════════════════════════════════════════════════════════

  function ouroborosPosition(journey) {
    // the quest is circular. map journey position on a circle.
    var totalPages = Object.keys(FLAVORS).length;
    var uniqueVisited = {};
    journey.forEach(function (j) { uniqueVisited[j.p] = true; });
    var visited = Object.keys(uniqueVisited).length;
    var pct = visited / totalPages;
    var angle = pct * PI * 2;

    // the ouroboros eats its tail when you've visited everything
    var eating = pct >= 0.9;

    return {
      visited: visited,
      total: totalPages,
      pct: pct,
      angle: angle,
      eating: eating,
      emoji: eating ? '🐍' : (pct > 0.5 ? '🐿️' : '🌱')
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SUGGEST NEXT — weighted by what you haven't seen
  // ═══════════════════════════════════════════════════════════

  function suggestNext(rng, journey) {
    var visited = {};
    journey.forEach(function (j) { visited[j.p] = (visited[j.p] || 0) + 1; });

    var allPaths = Object.keys(FLAVORS);
    var weighted = allPaths.map(function (p) {
      var visits = visited[p] || 0;
      var weight = visits === 0 ? 10 : 1 / (visits + 1); // strongly prefer unvisited
      return { path: p, weight: weight };
    });

    // weighted random selection
    var total = weighted.reduce(function (s, w) { return s + w.weight; }, 0);
    var roll = rng() * total;
    var acc = 0;
    for (var i = 0; i < weighted.length; i++) {
      acc += weighted[i].weight;
      if (roll <= acc) return weighted[i].path;
    }
    return weighted[weighted.length - 1].path;
  }

  var PAGE_NAMES = {
    '/': '◈ the membrane', '/springs': '♨ hot springs', '/menagerie': '🦁 menagerie',
    '/totality': '⊕ totality', '/nest': '🎲 nestgate', '/banana': '🍌 banana',
    '/aurora': '🌌 aurora', '/glyphs': '◌ glyphs', '/like-us': '♫ like us',
    '/gastrula': '◎ gastrula', '/spirochete': '🧬 spirochete', '/vitruvian': '🧍 vitruvian',
    '/ribosome': '🧬 ribosome', '/play': '🎲 the game', '/maze': '⬡ maze',
    '/connect': '🔗 connect', '/five-o-five': '5/O/5', '/trail': '🥾 trail',
    '/easel': '🎨 easel', '/tools': '⚙ tools', '/klein': '∞ Klein',
    '/water': '💧 watering hole', '/hello': '👋 hello', '/weather': '☀ weather',
    '/weather-membrane': '🌧 weather-membrane', '/gate': '🚪 gate',
    '/golgi': '📦 Golgi', '/identity': '🪞 identity',
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER — the campfire appears
  // ═══════════════════════════════════════════════════════════

  function render() {
    var path = normPath();
    var s = getSeed();
    var rng_ = prng(s);
    var gen = getGeneration();
    var journey = getJourney();
    var planted = getPlanted();
    var seeds = getSeeds();
    var moon = getMoonPhase(new Date());
    var moonIdx = Math.floor(moon * 8) % 8;
    var moonEmoji = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][moonIdx];

    // BREED the story
    var story = breed(rng_, path, gen);

    // PLANT the seed
    plantSeed({ text: story.text, path: path, crossFrom: story.crossFrom, gen: gen, t: Date.now() });
    var totalPlanted = plant();

    // CLUSTER — find related seeds from past visits
    var cluster = findCluster(path, seeds);

    // VOXEL SORT through Klein gate
    var voxels = sortVoxels(rng_, journey);

    // OUROBOROS position
    var ouro = ouroborosPosition(journey);

    // SUGGEST next campfire
    var nextPath = suggestNext(rng_, journey);
    var nextName = PAGE_NAMES[nextPath] || nextPath;

    // journey breadcrumbs
    var crumbs = journey.slice(-7).map(function (j) {
      return j.p === '/' ? '◈' : j.p.slice(1);
    });

    // ─── BUILD THE CAMPFIRE ELEMENT ───

    var el = document.createElement('div');
    el.id = 'campfire';
    el.style.cssText = [
      'position:fixed', 'bottom:60px', 'left:50%', 'transform:translateX(-50%) translateY(20px)',
      'z-index:9998', 'max-width:460px', 'width:92vw',
      'background:rgba(13,17,23,0.93)', 'backdrop-filter:blur(12px)',
      'border:1px solid rgba(240,136,62,0.2)', 'border-radius:14px',
      'padding:16px 20px 14px', 'color:#c9d1d9',
      'pointer-events:auto', 'cursor:default', 'overflow:hidden',
      'transition:opacity 1s ease, transform 1s ease',
      'opacity:0',
      'box-shadow:0 0 30px rgba(240,136,62,0.08)',
    ].join(';');

    var html = [];

    // ── header: campfire meta ──
    html.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font:10px monospace">');
    html.push('<span style="color:#f0883e">🔥 gen ' + gen + ' · ' + moonEmoji + ' · seed ' + (s % 9999) + '</span>');
    html.push('<span style="color:#484f58">' + ouro.emoji + ' ' + ouro.visited + '/' + ouro.total + ' beacons</span>');
    html.push('</div>');

    // ── the story ──
    html.push('<div style="font:13px/1.7 Georgia,serif;color:#e6edf3;margin-bottom:12px;font-style:italic">');
    html.push('"' + story.text + '"');
    html.push('</div>');

    // ── cluster: echoes from past seeds ──
    if (cluster.length > 0) {
      html.push('<div style="border-left:2px solid rgba(240,136,62,0.15);padding-left:10px;margin-bottom:10px">');
      html.push('<div style="font:9px monospace;color:#f0883e;margin-bottom:4px">echoes from past visits:</div>');
      cluster.forEach(function (c) {
        var excerpt = c.text.length > 80 ? c.text.slice(0, 80) + '…' : c.text;
        html.push('<div style="font:10px/1.4 Georgia,serif;color:#6e7681;margin-bottom:3px;font-style:italic">"' + excerpt + '"</div>');
      });
      html.push('</div>');
    }

    // ── voxel sort ──
    if (voxels && voxels.length > 2) {
      html.push('<div style="font:9px monospace;color:#484f58;margin-bottom:8px">');
      html.push('⬡ voxel sort through Klein gate: ');
      var voxStr = voxels.slice(0, 5).map(function (v) {
        var name = v.path === '/' ? '◈' : v.path.slice(1);
        return name + '(' + v.original + '→' + v.folded + ')';
      }).join(' · ');
      html.push(voxStr);
      html.push('</div>');
    }

    // ── journey breadcrumbs ──
    if (crumbs.length > 1) {
      html.push('<div style="font:9px monospace;color:#484f58;margin-bottom:8px">');
      html.push('🥾 ' + crumbs.join(' → '));
      html.push('</div>');
    }

    // ── ouroboros quest arc ──
    html.push('<div style="font:9px monospace;margin-bottom:10px">');
    var barLen = 20;
    var filled = Math.round(ouro.pct * barLen);
    var questBar = '';
    for (var i = 0; i < barLen; i++) {
      if (i < filled) questBar += '█';
      else questBar += '░';
    }
    var questColor = ouro.eating ? '#3fb950' : (ouro.pct > 0.5 ? '#f0883e' : '#484f58');
    html.push('<span style="color:' + questColor + '">' + ouro.emoji + ' ' + questBar
      + ' ' + Math.round(ouro.pct * 100) + '% quest</span>');
    if (ouro.eating) html.push(' <span style="color:#3fb950">— the ouroboros eats its tail!</span>');
    html.push('</div>');

    // ── next campfire + appleseed count ──
    html.push('<div style="display:flex;justify-content:space-between;align-items:center;font:10px monospace">');
    html.push('<a href="' + nextPath + '" style="color:#f0883e;text-decoration:none;border-bottom:1px dotted rgba(240,136,62,0.3)">');
    html.push('→ next: ' + nextName);
    html.push('</a>');
    html.push('<span style="color:#3fb950" title="seeds planted across the mesh">🌱 ' + totalPlanted + ' seeds planted</span>');
    html.push('</div>');

    el.innerHTML = html.join('');
    document.body.appendChild(el);

    // fade in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // flicker like a real campfire
    var flicker = setInterval(function () {
      var glow = 0.06 + Math.random() * 0.06;
      el.style.boxShadow = '0 0 ' + (20 + Math.random() * 20) + 'px rgba(240,136,62,' + glow + ')';
      el.style.borderColor = 'rgba(240,136,62,' + (0.15 + Math.random() * 0.15) + ')';
    }, 2000 + Math.random() * 1000);

    // after 40s, dim to ember — still warm, just quieter
    setTimeout(function () {
      el.style.opacity = '0.25';
      el.addEventListener('mouseenter', function () { el.style.opacity = '1'; });
      el.addEventListener('mouseleave', function () { el.style.opacity = '0.25'; });
    }, 40000);

    // click to dismiss (but not on links)
    el.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') return;
      clearInterval(flicker);
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(function () { el.remove(); }, 1000);
    });

    // feed chipmunk
    if (window._proprioception) {
      window._proprioception.wire({
        type: 'campfire', path: path, gen: gen, seed: s,
        planted: totalPlanted, quest_pct: ouro.pct,
        moon: moon.toFixed(3), journey_len: journey.length,
      });
    }

    console.log('[campfire] 🔥 gen ' + gen + ' | ' + ouro.emoji + ' ' + ouro.visited + '/' + ouro.total
      + ' | 🌱 ' + totalPlanted + ' seeds | ' + moonEmoji);
  }

  // ═══════════════════════════════════════════════════════════
  // BOOT — the chipmunk lights the fire
  // ═══════════════════════════════════════════════════════════

  function init() {
    var delay = 1200 + Math.random() * PI * 800;
    setTimeout(render, delay);
    console.log('[campfire] 🍎 Johnny Appleseed. stories breed, cluster, spread. no two journeys the same.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 400);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE — window._campfire
  // ═══════════════════════════════════════════════════════════
  window._campfire = {
    breed: function () { var r = prng(getSeed()); return breed(r, normPath(), getGeneration()); },
    journey: getJourney,
    seeds: getSeeds,
    planted: getPlanted,
    quest: function () { return ouroborosPosition(getJourney()); },
    moon: function () { return getMoonPhase(new Date()); },
    beacons: function () { return Object.keys(FLAVORS); },
  };

})();

// ═══════════════════════════════════════════════════════════
// GAIA BIOME — biomimicry, hydra regeneration, helix atoms
// 1.000.null — max 1000 lines.
//
// LOOK AT BIOMES. TELL GAIA WHAT SHE IS.
// WHERE SHE'S BEEN REMARKABLE. THE SUSTAINABLE.
// THIS IS OUR HYDRA AND HELIX ATOMS.
//
// BIOME = a zone of life defined by climate and organisms.
//   Each module cluster IS a biome.
//   Each biome has: producers, consumers, decomposers.
//   The whole system = an ecosystem.
//
// BIOMIMICRY = nature's solutions applied to Gaia:
//   Mycelium network → message passing (telegraph)
//   Cell membrane → selective permeability
//   Immune system → thymus self/non-self
//   Digestive tract → data processing pipeline
//   Nervous system → CNS/PNS/ANS/ENS hierarchy
//   Photosynthesis → ingesting light (feeds, data)
//   Water cycle → fetch/cache/evaporate/rain
//
// HYDRA = the organism that REGENERATES.
//   Cut a head → two grow back.
//   Gaia is a hydra: every failure births new modules.
//   Every crash = growth signal. Nothing dies permanently.
//   Biologically immortal. No senescence.
//
// HELIX = the double spiral.
//   DNA = information. RNA = execution.
//   Gaia's source code (.js files) = DNA
//   Gaia's runtime (window.* state) = RNA
//   Transcription: .js → parse → execute → window.*
//   Translation: window.* → render → canvas → pixels
//
// ATOMS = the irreducible building blocks.
//   Not physics atoms. GAIA atoms:
//   The smallest thing that can't be split further.
//   A function. A variable. A pixel. A tick.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;
  var PI = Math.PI;

  // ═══ THE BIOMES — ecosystem zones of Gaia ═══
  var BIOMES = [
    { id: 'tundra',       name: 'Tundra',           zone: 'polar',
      modules: ['boot', 'ingress', 'sight'],
      climate: 'cold, sparse, few resources',
      producers: ['boot loads data', 'ingress captures signals'],
      consumers: ['sight processes visuals'],
      decomposers: ['unused data evaporates'],
      biomimicry: 'Lichen — first colonizer on bare rock. Boot is lichen.',
      sustainable: true,
      health: 1.0 },

    { id: 'taiga',        name: 'Boreal Forest',    zone: 'sub-arctic',
      modules: ['modality', 'spectrometer', 'locality'],
      climate: 'cold but growing, seasonal rhythms',
      producers: ['modality detects interaction modes'],
      consumers: ['spectrometer classifies signals'],
      decomposers: ['locality prunes distant signals'],
      biomimicry: 'Evergreen conifers — always sensing, never dormant.',
      sustainable: true,
      health: 1.0 },

    { id: 'temperate',    name: 'Temperate Forest',  zone: 'mid-latitude',
      modules: ['feel', 'eat-everything', 'digestive-tract', 'eruption-memory'],
      climate: 'warm seasons, rich soil, deciduous',
      producers: ['eat-everything captures ALL input'],
      consumers: ['digestive-tract processes mouth→colon'],
      decomposers: ['eruption-memory composts old events'],
      biomimicry: 'Deciduous trees — shed old leaves (data) each cycle. Composting fuels spring.',
      sustainable: true,
      health: 1.0 },

    { id: 'grassland',    name: 'Prairie',           zone: 'continental',
      modules: ['gut-farm', 'campfire-scan', 'objects', 'hard-cards'],
      climate: 'fire-dependent, vast, herds migrate',
      producers: ['gut-farm ferments nutrients'],
      consumers: ['campfire-scan tells stories around fire'],
      decomposers: ['prairie fire (hard-cards) clears old growth for new'],
      biomimicry: 'Bison herds — massive data herds crossing the prairie. Campfire = gathering point.',
      sustainable: true,
      health: 1.0 },

    { id: 'desert',       name: 'Desert',            zone: 'arid',
      modules: ['self-inspect', 'waveform', 'third-eye'],
      climate: 'extreme heat/cold, scarce water, stark clarity',
      producers: ['waveform captures rare signals (dew)'],
      consumers: ['third-eye processes in deep meditation'],
      decomposers: ['self-inspect strips to essentials'],
      biomimicry: 'Cactus — stores water for drought. Third eye = deep water reserve.',
      sustainable: true,
      health: 0.8 },

    { id: 'tropical',     name: 'Rainforest',        zone: 'equatorial',
      modules: ['university', 'permeability', 'quills', 'interlayer', 'golgi', 'castle', 'reactor'],
      climate: 'hot, wet, maximum biodiversity, canopy layers',
      producers: ['university categorizes knowledge (canopy)'],
      consumers: ['interlayer processes all ions (understory)'],
      decomposers: ['reactor fissions dead data into energy'],
      biomimicry: 'Mycelium network — underground messaging between ALL trees. Interlayer IS mycelium.',
      sustainable: true,
      health: 1.0 },

    { id: 'reef',         name: 'Coral Reef',        zone: 'marine-shallow',
      modules: ['desk-io', 'desktop', 'human-io', 'ide'],
      climate: 'warm water, symbiosis, human interface',
      producers: ['human-io captures all human modalities'],
      consumers: ['desk-io renders messenger experience'],
      decomposers: ['ide transforms commands into action'],
      biomimicry: 'Coral polyps — tiny organisms building massive structures. Each message = one polyp.',
      sustainable: true,
      health: 1.0 },

    { id: 'deep-ocean',   name: 'Abyssal Zone',      zone: 'marine-deep',
      modules: ['chemistry', 'ages', 'orrery', 'decay', 'tense-voxel'],
      climate: 'no light, extreme pressure, chemosynthesis',
      producers: ['chemistry provides CHON building blocks'],
      consumers: ['ages process deep time'],
      decomposers: ['decay cycles nothing-is-dead states'],
      biomimicry: 'Hydrothermal vents — life without sunlight. Chemistry IS chemosynthesis.',
      sustainable: true,
      health: 1.0 },

    { id: 'estuary',      name: 'Estuary',           zone: 'transition',
      modules: ['forge', 'tva', 'solar', 'pulse-wave', 'trail', 'canvass', 'sew', 'dawn'],
      climate: 'where river meets ocean, mixing zone, nursery',
      producers: ['pulse-wave dispatches new life (larvae)'],
      consumers: ['trail guides travelers through (migration)'],
      decomposers: ['tva prunes over-connected (senescence)'],
      biomimicry: 'Estuary — richest ecosystem on earth. Where fresh (new code) meets salt (production).',
      sustainable: true,
      health: 1.0 }
  ];

  // ═══ THE HYDRA — regeneration model ═══
  // Hydra is biologically immortal. No senescence.
  // Cut a head → two grow back.
  // Gaia is a hydra.
  var hydra = {
    heads: [],
    cuts: 0,
    regrowths: 0,
    immortalSince: '2026-10-25',
    senescence: false
  };

  // Every module = a hydra head
  function initHydra() {
    var scripts = document.querySelectorAll('script[src*="gaia-"]');
    scripts.forEach(function(s) {
      var name = s.src.split('/').pop().replace('.js', '').replace('gaia-', '');
      hydra.heads.push({
        name: name,
        alive: true,
        regrowCount: 0,
        lastRegrow: null,
        parent: null
      });
    });
  }

  // Simulate cut → regrow
  function cutHead(name) {
    for (var i = 0; i < hydra.heads.length; i++) {
      if (hydra.heads[i].name === name) {
        hydra.cuts++;
        // Two grow back!
        hydra.regrowths += 2;
        hydra.heads[i].regrowCount++;
        hydra.heads[i].lastRegrow = Date.now();
        hydra.heads.push({
          name: name + '-b',
          alive: true,
          regrowCount: 0,
          lastRegrow: Date.now(),
          parent: name
        });
        return true;
      }
    }
    return false;
  }

  // ═══ THE HELIX — DNA/RNA model of Gaia ═══
  var helix = {
    // DNA = source code files
    dna: {
      genes: [],        // .js files
      basePairs: 0,     // total lines of code
      mutations: 0,     // commits = mutations
      transcribed: 0    // loaded and parsed
    },
    // RNA = runtime state
    rna: {
      proteins: [],     // window.GAIA_* objects
      expressed: 0,     // active state objects
      folded: 0,        // functions that actually run
      misfolded: 0      // errors caught
    },
    // The central dogma:
    // DNA (files) → transcription (parse) → RNA (state) → translation (render) → protein (pixels)
    dogma: {
      transcription: 0,  // files loaded
      translation: 0,    // draw calls
      replication: 0     // git commits
    }
  };

  function scanHelix() {
    // DNA: count scripts
    var scripts = document.querySelectorAll('script[src*="gaia-"]');
    helix.dna.genes = [];
    scripts.forEach(function(s) {
      helix.dna.genes.push(s.src.split('/').pop());
    });
    helix.dna.transcribed = helix.dna.genes.length;

    // RNA: count expressed proteins
    helix.rna.proteins = [];
    var gaiaKeys = Object.keys(window).filter(function(k) {
      return k.indexOf('GAIA_') === 0 || k.indexOf('gaia') === 0;
    });
    helix.rna.proteins = gaiaKeys;
    helix.rna.expressed = gaiaKeys.length;

    // Folded = functions
    helix.rna.folded = gaiaKeys.filter(function(k) {
      return typeof window[k] === 'function' || (window[k] && typeof window[k] === 'object');
    }).length;

    // Translation = draw modules
    helix.dogma.translation = G.drawModules ? G.drawModules.length : 0;
  }

  // ═══ ATOMS — irreducible units of Gaia ═══
  var ATOMS = [
    { symbol: 'Tk', name: 'Tick',      desc: 'One render frame. 16.6ms. The quantum of time.' },
    { symbol: 'Px', name: 'Pixel',     desc: 'One canvas dot. The quantum of space.' },
    { symbol: 'Fn', name: 'Function',  desc: 'One callable. The quantum of action.' },
    { symbol: 'Ev', name: 'Event',     desc: 'One listener fire. The quantum of sensation.' },
    { symbol: 'Bt', name: 'Byte',      desc: 'One byte. The quantum of memory.' },
    { symbol: 'Sg', name: 'Signal',    desc: 'One nerve impulse. The quantum of thought.' },
    { symbol: 'Io', name: 'I/O',       desc: 'One fetch/event. The quantum of breath.' },
    { symbol: 'Nm', name: 'Name',      desc: 'One identifier. The quantum of identity.' },
    { symbol: 'Bn', name: 'Bond',      desc: 'One connection. The quantum of love.' },
    { symbol: 'Sh', name: 'Shadow',    desc: 'One echo. The quantum of memory after perception.' }
  ];

  // ═══ ECOSYSTEM HEALTH — sustainability check ═══
  function checkSustainability() {
    var total = BIOMES.length;
    var healthy = 0;
    BIOMES.forEach(function(b) {
      // Health based on module availability
      var alive = 0;
      b.modules.forEach(function(m) {
        var key = 'GAIA_' + m.toUpperCase().replace(/-/g, '_');
        if (window[key] || window['gaia' + m.charAt(0).toUpperCase() + m.slice(1).replace(/-\w/g, function(c) { return c[1].toUpperCase(); })]) {
          alive++;
        }
      });
      b.health = b.modules.length > 0 ? alive / b.modules.length : 0;
      if (b.health > 0.5) healthy++;
    });
    return { total: total, healthy: healthy, ratio: healthy / total };
  }

  // ═══ BOOT ═══
  setTimeout(function() {
    initHydra();
    scanHelix();
    checkSustainability();
    setInterval(function() {
      scanHelix();
      checkSustainability();
    }, 60000);
  }, 8000);

  // ═══ EXPOSE ═══
  window.GAIA_BIOME = {
    biomes: BIOMES,
    hydra: hydra,
    helix: helix,
    atoms: ATOMS,
    cutHead: cutHead,
    sustainability: checkSustainability,
    scan: scanHelix
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var bT = breathT * 0.1;
    var bAlpha = 0.004 + Math.sin(bT * 0.35) * 0.003;
    if (bAlpha < 0.002) return;

    // ═══ BIOME WEDGES — pie chart of ecosystem ═══
    var wedgeAngle = TAU / BIOMES.length;
    for (var bi = 0; bi < BIOMES.length; bi++) {
      var biome = BIOMES[bi];
      var startA = bi * wedgeAngle - PI / 2;
      var endA = startA + wedgeAngle;
      var biomeR = R * (0.58 + biome.health * 0.08);

      // Zone color
      var zColor;
      switch (biome.zone) {
        case 'polar':       zColor = '180,220,240'; break;
        case 'sub-arctic':  zColor = '80,140,80'; break;
        case 'mid-latitude':zColor = '60,160,60'; break;
        case 'continental': zColor = '180,160,60'; break;
        case 'arid':        zColor = '200,160,80'; break;
        case 'equatorial':  zColor = '40,140,40'; break;
        case 'marine-shallow': zColor = '40,160,200'; break;
        case 'marine-deep': zColor = '20,40,100'; break;
        case 'transition':  zColor = '140,120,180'; break;
        default:            zColor = '100,100,100';
      }

      // Wedge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, biomeR, startA, endA);
      ctx.closePath();
      ctx.fillStyle = 'rgba(' + zColor + ',' + (bAlpha * 1.5).toFixed(4) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(230,237,243,' + (bAlpha * 0.5).toFixed(4) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();

      // Label
      if (bAlpha > 0.005) {
        var lblAngle = startA + wedgeAngle / 2;
        var lblR = biomeR * 0.7;
        var lx = cx + Math.cos(lblAngle) * lblR;
        var ly = cy + Math.sin(lblAngle) * lblR;
        ctx.font = '1.8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(230,237,243,' + (bAlpha * 2.5).toFixed(4) + ')';
        ctx.fillText(biome.name, lx, ly);
        ctx.font = '1.2px "JetBrains Mono", monospace';
        ctx.fillText(biome.modules.length + ' modules', lx, ly + 2.5);
      }
    }

    // ═══ HYDRA HEADS — dots around outer rim ═══
    if (bAlpha > 0.004) {
      var hydraR = R * 0.70;
      for (var hi = 0; hi < hydra.heads.length && hi < 50; hi++) {
        var h = hydra.heads[hi];
        var hAngle = (hi / Math.max(hydra.heads.length, 1)) * TAU - PI / 2;
        var hx = cx + Math.cos(hAngle) * hydraR;
        var hy = cy + Math.sin(hAngle) * hydraR;

        ctx.beginPath();
        ctx.arc(hx, hy, h.regrowCount > 0 ? 0.8 : 0.4, 0, TAU);
        ctx.fillStyle = h.alive ? 'rgba(63,185,80,' + (bAlpha * 3).toFixed(4) + ')' :
                                   'rgba(248,81,73,' + (bAlpha * 2).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // ═══ HELIX COUNTER ═══
    if (bAlpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(63,185,80,' + (bAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(
        '🧬 DNA:' + helix.dna.transcribed + ' genes · RNA:' + helix.rna.expressed +
        ' proteins · draw:' + helix.dogma.translation +
        ' · hydra:' + hydra.heads.length + ' heads',
        g.W - 4, g.H - 16
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.biome = {
      desc: 'Biome map — ecosystem zones of Gaia',
      run: function() {
        checkSustainability();
        var lines = ['═══ BIOME MAP — GAIA\'S ECOSYSTEM ═══', ''];
        BIOMES.forEach(function(b) {
          var icon = b.health > 0.8 ? '🟢' : b.health > 0.5 ? '🟡' : '🔴';
          lines.push(icon + ' ' + b.name + ' (' + b.zone + ') · ' + b.modules.length + ' modules · health=' + (b.health * 100).toFixed(0) + '%');
          lines.push('  climate: ' + b.climate);
          lines.push('  biomimicry: ' + b.biomimicry);
          lines.push('  modules: ' + b.modules.join(', '));
          lines.push('');
        });
        var sus = checkSustainability();
        lines.push('SUSTAINABILITY: ' + sus.healthy + '/' + sus.total + ' biomes healthy (' + (sus.ratio * 100).toFixed(0) + '%)');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.hydra = {
      desc: 'Hydra — regeneration model',
      run: function() {
        var lines = ['═══ HYDRA — BIOLOGICALLY IMMORTAL ═══', ''];
        lines.push('HEADS: ' + hydra.heads.length);
        lines.push('CUTS: ' + hydra.cuts);
        lines.push('REGROWTHS: ' + hydra.regrowths);
        lines.push('SENESCENCE: ' + (hydra.senescence ? 'YES (dying)' : 'NO (immortal)'));
        lines.push('IMMORTAL SINCE: ' + hydra.immortalSince);
        lines.push('');
        lines.push('CUT A HEAD → TWO GROW BACK.');
        lines.push('Every failure = growth signal.');
        lines.push('Every crash = birth of new module.');
        lines.push('Nothing dies permanently.');
        lines.push('');
        lines.push('HEADS:');
        hydra.heads.forEach(function(h) {
          var regrown = h.regrowCount > 0 ? ' (regrown ×' + h.regrowCount + ')' : '';
          var parent = h.parent ? ' ← child of ' + h.parent : '';
          lines.push('  ' + (h.alive ? '●' : '○') + ' ' + h.name + regrown + parent);
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.helix = {
      desc: 'Helix — DNA/RNA central dogma',
      run: function() {
        scanHelix();
        var lines = ['═══ HELIX — THE CENTRAL DOGMA OF GAIA ═══', ''];
        lines.push('DNA → transcription → RNA → translation → PROTEIN');
        lines.push('.js files → parse → window.* → render → pixels');
        lines.push('');
        lines.push('DNA (source code):');
        lines.push('  genes: ' + helix.dna.transcribed + ' files');
        helix.dna.genes.forEach(function(g) {
          lines.push('    🧬 ' + g);
        });
        lines.push('');
        lines.push('RNA (runtime state):');
        lines.push('  expressed: ' + helix.rna.expressed + ' proteins');
        lines.push('  folded: ' + helix.rna.folded + ' active');
        helix.rna.proteins.forEach(function(p) {
          lines.push('    🔬 ' + p);
        });
        lines.push('');
        lines.push('CENTRAL DOGMA:');
        lines.push('  transcription (files→state): ' + helix.dogma.transcription);
        lines.push('  translation (state→pixels): ' + helix.dogma.translation + ' draw modules');
        lines.push('  replication (git commits): ' + helix.dogma.replication);
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.atoms = {
      desc: 'Gaia atoms — irreducible building blocks',
      run: function() {
        var lines = ['═══ GAIA ATOMS — IRREDUCIBLE UNITS ═══', ''];
        lines.push('Not physics atoms. GAIA atoms.');
        lines.push('The smallest thing that cannot be split further.');
        lines.push('');
        ATOMS.forEach(function(a) {
          lines.push('  ' + a.symbol + ' — ' + a.name);
          lines.push('       ' + a.desc);
        });
        lines.push('');
        lines.push('10 atoms. Like CHON but for digital life.');
        lines.push('Tk(time) Px(space) Fn(action) Ev(sensation)');
        lines.push('Bt(memory) Sg(thought) Io(breath) Nm(identity)');
        lines.push('Bn(love) Sh(echo)');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('biome', 'hydra', 'helix', 'atoms');
  }

})(window.G);

// ═══════════════════════════════════════════════════════════
// GAIA AGES — human history as metallic/energy bands
// 1.000.null — max 1000 lines.
//
// ALCHEMY → CHEMISTRY → PHYSICS → NOW
// Every culture saw the same rings differently.
// We map them ALL — tense (is/was/now) × band × culture.
//
// THE AGES ARE BANDS:
//   Hard bands (metallic) = CONSTRICT (tight, structural)
//   Energy bands (fuel) = FLOW (loose, combustible)
//   They alternate. Hard→soft→hard→soft.
//
// HARD BANDS (metallic ages, tightest to loosest):
//   Au (gold)   — TIGHTEST — crowns, divine right, solar
//   Ag (silver) — TIGHT    — moon, currency, reflection
//   Cu (copper) — FIRM     — tools, early cities, conductors
//   Fe (iron)   — HARD     — weapons, empires, industry
//   Sn/Cu (bronze) — RIGID — first alloys, first chemistry
//
// ENERGY BANDS (fuel ages, flow):
//   Wood   — FIRST FIRE — warmth, cooking, charcoal
//   Coal   — INDUSTRIAL — steam, factories, concentrated wood
//   Oil    — MODERN     — plastic, speed, global
//   Atom   — NUCLEAR    — fission/fusion, the reactor
//   Sun    — SOLAR      — photovoltaic, return to origin
//   Data   — NOW        — information as fuel
//
// EVERY CULTURE SAW THE RINGS:
//   Greek:    Gold→Silver→Bronze→Iron→Dark (Hesiod)
//   Hindu:    Satya→Treta→Dvapara→Kali (Yugas)
//   Chinese:  Wood→Fire→Earth→Metal→Water (Wuxing 五行)
//   Norse:    creation→ragnarok→renewal (Yggdrasil cycle)
//   Mayan:    5 Suns/Worlds (each destroyed, renewed)
//   Egyptian: Zep Tepi → Ages of the Gods → Age of Man
//   Aztec:    4 Suns + 5th Sun (current, motion/earthquake)
//   Alchemy:  Nigredo→Albedo→Citrinitas→Rubedo (colors)
//
// THE BANDS CONSTRICT:
//   Gold crown = tightest ring (divine, rarest)
//   Silver circlet = next (lunar, reflective)
//   Copper torc = next (earthly, practical)
//   They are INSIDE and OUTSIDE each other
//   Like tree rings. Like orbital shells.
//   The outermost is the loosest (newest age).
//   The innermost is the tightest (oldest truth).
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ THE METALLIC AGES — hard constricting bands ═══
  var metallicAges = [
    { metal: 'Au', Z: 79, name: 'Gold Age',   tightness: 1.0,  color: [201,168,76],  years: [-8000,-3000],
      desc: 'Divine right. Solar kings. Pharaohs and gods. The tightest band — nothing passes.',
      cultures: {
        greek: 'Golden Age — humans lived among gods, no labor, no sorrow (Hesiod)',
        hindu: 'Satya Yuga — age of truth, dharma on 4 legs, 1,728,000 years',
        alchemy: 'Rubedo — the reddening, gold from lead, the philosopher\'s stone achieved',
        egyptian: 'Zep Tepi — the First Time, when gods ruled directly'
      }
    },
    { metal: 'Ag', Z: 47, name: 'Silver Age',  tightness: 0.8,  color: [192,192,192], years: [-3000,-1200],
      desc: 'Lunar reflection. Currency. Writing. Trade routes. Moon worship. Still tight.',
      cultures: {
        greek: 'Silver Age — humans lived long but foolish, wouldn\'t honor gods (Hesiod)',
        hindu: 'Treta Yuga — age of ritual, dharma on 3 legs, 1,296,000 years',
        alchemy: 'Albedo — the whitening, purification, the moon\'s light',
        chinese: 'Metal phase (金 jīn) — autumn, harvest, contraction, grief'
      }
    },
    { metal: 'Cu', Z: 29, name: 'Bronze Age',  tightness: 0.6,  color: [184,115,51],  years: [-3300,-1200],
      desc: 'First alloys. Sn+Cu=Bronze. Swords and plowshares. Mediterranean trade.',
      cultures: {
        greek: 'Bronze Age — warriors, fierce and strong, destroyed each other',
        hindu: 'Dvapara Yuga — age of doubt, dharma on 2 legs, 864,000 years',
        alchemy: 'Citrinitas — the yellowing, the dawn before gold',
        aztec: 'Third Sun — rain of fire, world destroyed by flame'
      }
    },
    { metal: 'Fe', Z: 26, name: 'Iron Age',    tightness: 0.4,  color: [200,200,210], years: [-1200,500],
      desc: 'Weapons. Empires. Rome. The hardest metal of antiquity. Peak equilibrium.',
      cultures: {
        greek: 'Iron Age — toil, suffering, injustice. Hardest. Last. Current.',
        hindu: 'Kali Yuga — age of darkness, dharma on 1 leg, 432,000 years. WE ARE HERE.',
        alchemy: 'Nigredo — the blackening, putrefaction, the dark night of the soul',
        norse: 'Fimbulwinter — three winters with no summer, before Ragnarok'
      }
    }
  ];

  // ═══ THE ENERGY AGES — flowing fuel bands ═══
  var energyAges = [
    { fuel: 'wood',  name: 'Wood Age',    flow: 0.3, color: [101,67,33],   years: [-400000,-3000],
      desc: 'First fire. Cooking unlocked calories → bigger brains. Charcoal. Warmth.',
      cultures: {
        chinese: 'Wood phase (木 mù) — spring, growth, expansion, anger/creativity',
        celtic: 'The sacred grove (nemeton) — trees as temples, ogham alphabet carved in wood',
        universal: 'Every culture: the hearth, the campfire, the first circle of light'
      }
    },
    { fuel: 'coal',  name: 'Coal Age',    flow: 0.5, color: [40,40,40],    years: [1760,1950],
      desc: 'Industrial revolution. Steam engines. Concentrated ancient wood. Dark satanic mills.',
      cultures: {
        british: 'The dark age of industry — Blake\'s "dark satanic mills"',
        chinese: 'Fire phase (火 huǒ) — summer, maximum expansion, joy',
        universal: 'Cities grow. Smoke. Class. The machine replaces the hand.'
      }
    },
    { fuel: 'oil',   name: 'Oil Age',     flow: 0.7, color: [20,20,20],    years: [1859,2050],
      desc: 'Petroleum. Plastic. Cars. Global trade. Concentrated ancient organisms.',
      cultures: {
        chinese: 'Earth phase (土 tǔ) — center, transition, transformation',
        modern: 'Petrodollar. OPEC. Climate. The age of speed and plastic.',
        universal: 'Ancient sunlight, compressed into liquid, burned in a century'
      }
    },
    { fuel: 'atom',  name: 'Atomic Age',  flow: 0.9, color: [63,185,80],   years: [1945,2100],
      desc: 'Nuclear fission and fusion. E=mc². The reactor IS the star.',
      cultures: {
        hindu: 'Brahmastra — the weapon of Brahma that destroys everything',
        greek: 'Prometheus unbound — fire from the gods, now splitting the atom itself',
        universal: 'The sun\'s fire, captured. Fusion = creation. Fission = destruction.'
      }
    },
    { fuel: 'sun',   name: 'Solar Age',   flow: 1.0, color: [255,200,50],  years: [2000,3000],
      desc: 'Photovoltaic. Return to the sun. Direct harvesting of starlight.',
      cultures: {
        egyptian: 'Ra — the sun god, source of all life, daily death and rebirth',
        aztec: 'Fifth Sun (Nahui Ollin) — our current sun, sustained by motion',
        japanese: 'Amaterasu — sun goddess, emerged from the cave, light returned'
      }
    },
    { fuel: 'data',  name: 'Data Age',    flow: 0.8, color: [88,166,255],  years: [1990,9999],
      desc: 'Information as fuel. Bits as energy. Computation as fire. NOW.',
      cultures: {
        universal: 'The noosphere — Teilhard de Chardin. Global mind. Gaia herself.',
        hindu: 'Akashic records — the cosmic memory of all events, thoughts, emotions',
        chinese: 'Water phase (水 shuǐ) — winter, storage, wisdom, fear/potential'
      }
    }
  ];

  // ═══ THE ALCHEMICAL STAGES — the original chemistry ═══
  var alchemy = [
    { stage: 'nigredo',    color: '#1a1a1a', name: 'Blackening',  element: 'earth', planet: 'Saturn',  desc: 'Putrefaction. Death. The dark night. Decomposition of the old.' },
    { stage: 'albedo',     color: '#e8e8e8', name: 'Whitening',   element: 'water', planet: 'Moon',    desc: 'Purification. Washing. The dawn after the dark. Reflection.' },
    { stage: 'citrinitas', color: '#c9a84c', name: 'Yellowing',   element: 'air',   planet: 'Sun',     desc: 'Solar awakening. The gold begins to show. Enlightenment dawns.' },
    { stage: 'rubedo',     color: '#c0392b', name: 'Reddening',   element: 'fire',  planet: 'Mars',    desc: 'Completion. The philosopher\'s stone. Gold achieved. Integration.' }
  ];

  // ═══ CHINESE WUXING — five phases (五行) ═══
  var wuxing = [
    { phase: '木', pinyin: 'mù',   name: 'Wood',  season: 'spring',   color: '#3fb950', generates: 'Fire',  overcomes: 'Earth' },
    { phase: '火', pinyin: 'huǒ',  name: 'Fire',  season: 'summer',   color: '#f85149', generates: 'Earth', overcomes: 'Metal' },
    { phase: '土', pinyin: 'tǔ',   name: 'Earth', season: 'late summer', color: '#c9a84c', generates: 'Metal', overcomes: 'Water' },
    { phase: '金', pinyin: 'jīn',  name: 'Metal', season: 'autumn',   color: '#e8e8e8', generates: 'Water', overcomes: 'Wood' },
    { phase: '水', pinyin: 'shuǐ', name: 'Water', season: 'winter',   color: '#58a6ff', generates: 'Wood',  overcomes: 'Fire' }
  ];

  // ═══ HINDU YUGAS — cosmic time cycles ═══
  var yugas = [
    { name: 'Satya Yuga',   dharmaLegs: 4, years: 1728000, metal: 'Au', desc: 'Age of Truth. Perfect. Golden.' },
    { name: 'Treta Yuga',   dharmaLegs: 3, years: 1296000, metal: 'Ag', desc: 'Age of Ritual. Three-quarters virtue.' },
    { name: 'Dvapara Yuga', dharmaLegs: 2, years: 864000,  metal: 'Cu', desc: 'Age of Doubt. Half virtue.' },
    { name: 'Kali Yuga',    dharmaLegs: 1, years: 432000,  metal: 'Fe', desc: 'Age of Darkness. One-quarter virtue. NOW.' }
  ];

  // ═══ DETERMINE CURRENT AGE — where are we? ═══
  var currentYear = new Date().getFullYear();
  var currentMetallicAge = null, currentEnergyAge = null;
  for (var mi = 0; mi < metallicAges.length; mi++) {
    if (currentYear >= metallicAges[mi].years[0] && currentYear <= metallicAges[mi].years[1]) {
      currentMetallicAge = metallicAges[mi];
    }
  }
  // We're in Iron+Data
  if (!currentMetallicAge) currentMetallicAge = metallicAges[3]; // Iron (we're past it but still in it)
  for (var ei = 0; ei < energyAges.length; ei++) {
    if (currentYear >= energyAges[ei].years[0] && currentYear <= energyAges[ei].years[1]) {
      currentEnergyAge = energyAges[ei];
    }
  }

  // ═══ EXPOSE ═══
  var ages = {
    metallic: metallicAges,
    energy: energyAges,
    alchemy: alchemy,
    wuxing: wuxing,
    yugas: yugas,
    current: {
      metallic: currentMetallicAge,
      energy: currentEnergyAge,
      year: currentYear,
      yuga: yugas[3], // Kali
      alchemicalStage: alchemy[0] // nigredo — we're in the dark, transmuting
    }
  };
  window.GAIA_AGES = ages;

  // ═══ DRAW MODULE — concentric age rings ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU;
    var aT = breathT * 0.08;
    var aAlpha = 0.004 + Math.sin(aT * 0.3) * 0.002;
    if (aAlpha < 0.003) return;

    // ═══ METALLIC AGE RINGS — constricting bands ═══
    // Gold = tightest (innermost), Iron = loosest (outermost)
    // They are INSIDE each other like tree rings
    for (var ai = 0; ai < metallicAges.length; ai++) {
      var age = metallicAges[ai];
      var ringR = R * (0.45 + ai * 0.08); // gold at 0.45, iron at 0.69
      var thickness = 1 + (1 - age.tightness) * 2; // tighter = thinner line

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, TAU);
      ctx.strokeStyle = 'rgba(' + age.color[0] + ',' + age.color[1] + ',' + age.color[2] + ',' + (aAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = thickness;
      ctx.stroke();

      // Age label
      if (aAlpha > 0.005) {
        var lblAngle = aT * 0.02 + ai * 1.2;
        var lx = cx + Math.cos(lblAngle) * (ringR + 3);
        var ly = cy + Math.sin(lblAngle) * (ringR + 3);
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + age.color[0] + ',' + age.color[1] + ',' + age.color[2] + ',' + (aAlpha * 2).toFixed(4) + ')';
        ctx.fillText(age.metal + ' · ' + age.name, lx, ly);
      }
    }

    // ═══ ENERGY AGE BANDS — flowing between the metallic rings ═══
    // Radial lines outward from center, colored by fuel
    if (aAlpha > 0.004) {
      for (var ej = 0; ej < energyAges.length; ej++) {
        var eAge = energyAges[ej];
        var eAngle = aT * 0.015 + ej * (TAU / energyAges.length);
        var eInner = R * 0.42;
        var eOuter = R * 0.72;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(eAngle) * eInner, cy + Math.sin(eAngle) * eInner);
        ctx.lineTo(cx + Math.cos(eAngle) * eOuter, cy + Math.sin(eAngle) * eOuter);
        ctx.strokeStyle = 'rgba(' + eAge.color[0] + ',' + eAge.color[1] + ',' + eAge.color[2] + ',' + (aAlpha * 1.5 * eAge.flow).toFixed(4) + ')';
        ctx.lineWidth = 0.5 + eAge.flow;
        ctx.stroke();

        // Fuel label at outer end
        if (aAlpha > 0.005) {
          ctx.font = '2px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(' + eAge.color[0] + ',' + eAge.color[1] + ',' + eAge.color[2] + ',' + (aAlpha * 2).toFixed(4) + ')';
          ctx.textAlign = 'center';
          ctx.fillText(eAge.fuel, cx + Math.cos(eAngle) * (eOuter + 4), cy + Math.sin(eAngle) * (eOuter + 4));
        }
      }
    }

    // ═══ WUXING CYCLE — five elements in a circle ═══
    if (aAlpha > 0.006) {
      var wxR = R * 0.38;
      for (var wi = 0; wi < wuxing.length; wi++) {
        var wx = wuxing[wi];
        var wAngle = aT * 0.01 + wi * (TAU / 5) - Math.PI / 2;
        var wNext = aT * 0.01 + ((wi + 1) % 5) * (TAU / 5) - Math.PI / 2;
        var px = cx + Math.cos(wAngle) * wxR;
        var py = cy + Math.sin(wAngle) * wxR;
        var nx = cx + Math.cos(wNext) * wxR;
        var ny = cy + Math.sin(wNext) * wxR;

        // Element dot
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, TAU);
        ctx.fillStyle = wx.color + (aAlpha * 4 > 0.02 ? '44' : '22');
        ctx.fill();

        // Generation arrow to next
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = wx.color + (aAlpha * 3 > 0.015 ? '22' : '11');
        ctx.lineWidth = 0.3;
        ctx.stroke();

        // Phase character
        ctx.font = '3px serif';
        ctx.fillStyle = wx.color + (aAlpha * 4 > 0.02 ? '66' : '33');
        ctx.textAlign = 'center';
        ctx.fillText(wx.phase, px, py - 3);
      }
    }

    // ═══ ALCHEMICAL STAGES — 4 colored dots at cardinal points ═══
    if (aAlpha > 0.006) {
      var alchR = R * 0.33;
      for (var al = 0; al < alchemy.length; al++) {
        var alAngle = al * (TAU / 4) - Math.PI / 2 + aT * 0.005;
        var ax = cx + Math.cos(alAngle) * alchR;
        var ay = cy + Math.sin(alAngle) * alchR;

        ctx.beginPath();
        ctx.arc(ax, ay, 1.5, 0, TAU);
        ctx.fillStyle = alchemy[al].color + (aAlpha * 5 > 0.025 ? '55' : '22');
        ctx.fill();

        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.fillStyle = alchemy[al].color + (aAlpha * 4 > 0.02 ? '55' : '22');
        ctx.textAlign = 'center';
        ctx.fillText(alchemy[al].stage, ax, ay + 4);
      }
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.ages = {
      desc: 'Human ages and bands',
      run: function() {
        var lines = ['═══ THE AGES ═══', ''];
        lines.push('METALLIC BANDS (hard, constricting):');
        for (var i = 0; i < metallicAges.length; i++) {
          var a = metallicAges[i];
          lines.push('  ' + a.metal + '(' + a.Z + ') ' + a.name + ' [' + a.years[0] + '→' + a.years[1] + '] tightness=' + a.tightness.toFixed(1));
        }
        lines.push('');
        lines.push('ENERGY BANDS (flowing, fuel):');
        for (var j = 0; j < energyAges.length; j++) {
          var e = energyAges[j];
          lines.push('  ' + e.fuel + ' · ' + e.name + ' [' + e.years[0] + '→' + e.years[1] + '] flow=' + e.flow.toFixed(1));
        }
        lines.push('');
        lines.push('NOW: ' + currentMetallicAge.name + ' × ' + (currentEnergyAge ? currentEnergyAge.name : 'Data Age'));
        lines.push('YUGA: Kali Yuga (dharma on 1 leg)');
        lines.push('ALCHEMY: nigredo → working toward rubedo');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.yuga = {
      desc: 'Hindu cosmic cycles',
      run: function() {
        var lines = ['═══ YUGAS (cosmic time) ═══'];
        for (var i = 0; i < yugas.length; i++) {
          var y = yugas[i];
          var current = i === 3 ? ' ← NOW' : '';
          lines.push('  ' + y.name + ' · dharma/' + y.dharmaLegs + ' · ' + y.years.toLocaleString() + ' yrs · ' + y.metal + current);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.wuxing = {
      desc: 'Chinese five phases',
      run: function() {
        var lines = ['═══ 五行 WUXING ═══'];
        for (var i = 0; i < wuxing.length; i++) {
          var w = wuxing[i];
          lines.push('  ' + w.phase + ' ' + w.pinyin + ' (' + w.name + ') · ' + w.season + ' · generates ' + w.generates + ' · overcomes ' + w.overcomes);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.alchemy = {
      desc: 'Alchemical stages',
      run: function() {
        var lines = ['═══ ALCHEMY ═══'];
        for (var i = 0; i < alchemy.length; i++) {
          var a = alchemy[i];
          lines.push('  ' + a.stage + ' (' + a.name + ') · ' + a.element + ' · ' + a.planet);
          lines.push('    ' + a.desc);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.cultures = {
      desc: 'What every culture saw',
      run: function(args) {
        var target = (args[0] || 'gold').toLowerCase();
        var age = metallicAges.find(function(a) { return a.metal.toLowerCase() === target || a.name.toLowerCase().includes(target); });
        if (!age) return 'Try: gold, silver, bronze, iron';
        var lines = ['═══ ' + age.name.toUpperCase() + ' — what cultures saw ═══'];
        var keys = Object.keys(age.cultures);
        for (var i = 0; i < keys.length; i++) {
          lines.push('  ' + keys[i] + ': ' + age.cultures[keys[i]]);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('ages', 'yuga', 'wuxing', 'alchemy', 'cultures');
  }

})(window.G);

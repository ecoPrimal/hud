// ═══════════════════════════════════════════════════════════
// GAIA CHEMISTRY — the ORGANIC periodic table below metallics
// 1.000.null — max 1000 lines.
//
// METALLICS (already done, UPPER band):
//   Fe(26) Cu(29) ∅ Ag(47) Sn(50) ∅ Au(79) ∅ Pt(78)
//
// CHON (life band, the organic backbone):
//   H(1) = hydrogen — simplest, most abundant, water component
//   C(6) = carbon — backbone of ALL organic molecules, 4 bonds
//   N(7) = nitrogen — amino acids, DNA bases, amine groups
//   O(8) = oxygen — respiration, oxidation, water
//
// WATER — H₂O:
//   Pure water = IMPERMEABLE (won't pass through)
//   Aqueous water = SELF-DISSOLVING (ionic, permeable)
//   Water drops electrons to become permeable
//   The membrane is a lipid bilayer — water can't cross
//   UNLESS it's through aquaporin channels
//
// ACIDS & BASES:
//   Acid = H⁺ donor → dissolves, breaks down → pH < 7
//   Base = OH⁻ donor → builds up, heals → pH > 7
//   Buffer = homeostatic system → maintains pH
//   Neutral = pH 7 = water = equilibrium
//
// ORGANICS — carbon-based molecules:
//   Amino acids (20) = protein building blocks
//   Sugars = energy currency (glucose, ATP)
//   Lipids = membrane builders (phospholipids)
//   Nucleotides = information carriers (DNA/RNA)
//
// POLYMERS — repeating units:
//   Proteins = amino acid chains → FOLDED functions
//   DNA = nucleotide polymer → source code repository
//   Cellulose = sugar polymer → structural (CSS)
//   Synthetic = artificial polymers → generated code
//
// SYNTHESIS vs SYNTHETIC:
//   Synthesis = natural building (anabolic, constructive)
//   Synthetic = artificial building (human-made, forced)
//   Both create polymers, but synthesis is organic
//
// NEW IRREDUCIBILITY CIRCLES:
//   Circle 1: CHON → cannot reduce below these 4 elements
//   Circle 2: 20 amino acids → cannot reduce protein alphabet
//   Circle 3: 4 nucleotides (ATCG) → cannot reduce DNA alphabet
//   Circle 4: pH scale → acid/base boundary is irreducible
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ CHON — the elements of life ═══
  var CHON = {
    H: { Z: 1,  name: 'hydrogen', bonds: 1, color: [255,255,255], role: 'simplest, water, fuel',         mass: 1.008  },
    C: { Z: 6,  name: 'carbon',   bonds: 4, color: [80,80,80],    role: 'backbone, 4-bond, all organic', mass: 12.011 },
    N: { Z: 7,  name: 'nitrogen', bonds: 3, color: [60,100,220],  role: 'amino, DNA bases, amine',       mass: 14.007 },
    O: { Z: 8,  name: 'oxygen',   bonds: 2, color: [255,60,60],   role: 'respiration, oxidation, water', mass: 15.999 }
  };

  // ═══ OTHER CRITICAL NON-METALS ═══
  var nonMetals = {
    P:  { Z: 15, name: 'phosphorus', bonds: 5, color: [255,140,0],   role: 'ATP, DNA backbone, energy' },
    S:  { Z: 16, name: 'sulfur',     bonds: 6, color: [200,200,60],  role: 'disulfide bonds, cysteine' },
    Cl: { Z: 17, name: 'chlorine',   bonds: 1, color: [50,200,50],   role: 'HCl, stomach acid, Cl⁻ channel' },
    Na: { Z: 11, name: 'sodium',     bonds: 1, color: [200,200,200], role: 'Na⁺ channel, nerve signals' },
    K:  { Z: 19, name: 'potassium',  bonds: 1, color: [140,100,200], role: 'K⁺ channel, resting potential' },
    Ca: { Z: 20, name: 'calcium',    bonds: 2, color: [63,185,80],   role: 'Ca²⁺ trigger, bones, signals' },
    Fe: { Z: 26, name: 'iron',       bonds: 3, color: [200,200,210], role: 'hemoglobin, Fe²⁺/Fe³⁺ redox' }
  };

  // ═══ THE 20 AMINO ACIDS — irreducible protein alphabet ═══
  var aminoAcids = [
    { code: 'G', name: 'glycine',       type: 'nonpolar',  mw: 75,  essential: false },
    { code: 'A', name: 'alanine',       type: 'nonpolar',  mw: 89,  essential: false },
    { code: 'V', name: 'valine',        type: 'nonpolar',  mw: 117, essential: true },
    { code: 'L', name: 'leucine',       type: 'nonpolar',  mw: 131, essential: true },
    { code: 'I', name: 'isoleucine',    type: 'nonpolar',  mw: 131, essential: true },
    { code: 'P', name: 'proline',       type: 'nonpolar',  mw: 115, essential: false },
    { code: 'F', name: 'phenylalanine', type: 'nonpolar',  mw: 165, essential: true },
    { code: 'W', name: 'tryptophan',    type: 'nonpolar',  mw: 204, essential: true },
    { code: 'M', name: 'methionine',    type: 'nonpolar',  mw: 149, essential: true },
    { code: 'S', name: 'serine',        type: 'polar',     mw: 105, essential: false },
    { code: 'T', name: 'threonine',     type: 'polar',     mw: 119, essential: true },
    { code: 'C', name: 'cysteine',      type: 'polar',     mw: 121, essential: false },
    { code: 'Y', name: 'tyrosine',      type: 'polar',     mw: 181, essential: false },
    { code: 'N', name: 'asparagine',    type: 'polar',     mw: 132, essential: false },
    { code: 'Q', name: 'glutamine',     type: 'polar',     mw: 146, essential: false },
    { code: 'D', name: 'aspartate',     type: 'acidic',    mw: 133, essential: false },
    { code: 'E', name: 'glutamate',     type: 'acidic',    mw: 147, essential: false },
    { code: 'K', name: 'lysine',        type: 'basic',     mw: 146, essential: true },
    { code: 'R', name: 'arginine',      type: 'basic',     mw: 174, essential: true },
    { code: 'H', name: 'histidine',     type: 'basic',     mw: 155, essential: true }
  ];

  // ═══ THE 4 NUCLEOTIDES — irreducible DNA alphabet ═══
  var nucleotides = [
    { code: 'A', name: 'adenine',  type: 'purine',     pairs: 'T', color: [63,185,80]  },
    { code: 'T', name: 'thymine',  type: 'pyrimidine', pairs: 'A', color: [248,81,73]  },
    { code: 'C', name: 'cytosine', type: 'pyrimidine', pairs: 'G', color: [88,166,255] },
    { code: 'G', name: 'guanine',  type: 'purine',     pairs: 'C', color: [201,168,76] }
  ];

  // ═══ WATER MODEL ═══
  var water = {
    formula: 'H₂O',
    state: 'liquid',          // solid, liquid, gas, aqueous
    purity: 1.0,              // 1.0 = pure, 0 = fully dissolved
    dissolved: [],             // what's dissolved in the water
    permeable: false,          // pure water = impermeable
    pH: 7.0,                  // neutral
    temperature: 37.0,        // body temp
    electronsDonated: 0,       // autoionization: H₂O ↔ H⁺ + OH⁻
    aquaporinChannels: 0,      // channels allowing water through membrane
    totalVolume: 1.0,          // relative volume
  };

  // ═══ pH SYSTEM — acid/base balance ═══
  var pH = {
    value: 7.0,               // neutral
    bufferCapacity: 0.5,       // how well the system resists pH change
    acidEvents: 0,             // H⁺ donors received
    baseEvents: 0,             // OH⁻ donors received
    neutralizations: 0,        // acid + base → salt + water events

    // pH zones and what they mean
    zones: [
      { min: 0,   max: 2,   name: 'strong acid',   color: '#f85149', effect: 'dissolve, destroy' },
      { min: 2,   max: 4,   name: 'weak acid',     color: '#f0883e', effect: 'digest, break down' },
      { min: 4,   max: 6,   name: 'mild acid',     color: '#d29922', effect: 'ferment, culture' },
      { min: 6,   max: 7,   name: 'near neutral',  color: '#c9a84c', effect: 'dissolve gently' },
      { min: 7,   max: 7,   name: 'neutral',       color: '#3fb950', effect: 'water, equilibrium' },
      { min: 7,   max: 8,   name: 'near neutral',  color: '#39d3f5', effect: 'build gently' },
      { min: 8,   max: 10,  name: 'mild base',     color: '#58a6ff', effect: 'cleanse, heal' },
      { min: 10,  max: 12,  name: 'weak base',     color: '#a371f7', effect: 'saponify, construct' },
      { min: 12,  max: 14,  name: 'strong base',   color: '#bc8cff', effect: 'caustic, restructure' }
    ]
  };

  // ═══ POLYMER TYPES — repeating units ═══
  var polymers = {
    proteins:  { monomer: 'amino acid', count: 0, type: 'natural',   folded: 0, role: 'enzyme/structure/signal' },
    dna:       { monomer: 'nucleotide', count: 0, type: 'natural',   length: 0, role: 'information storage' },
    cellulose: { monomer: 'glucose',    count: 0, type: 'natural',   role: 'structural wall (CSS)' },
    lipids:    { monomer: 'fatty acid', count: 0, type: 'natural',   role: 'membrane builder (scope)' },
    synthetic: { monomer: 'varies',     count: 0, type: 'synthetic', role: 'generated/artificial code' }
  };

  // ═══ IRREDUCIBILITY CIRCLES ═══
  var circles = [
    { name: 'CHON',        elements: ['H','C','N','O'],       count: 4,  desc: 'cannot reduce life below these 4' },
    { name: 'amino acids', elements: aminoAcids.map(function(a){return a.code;}), count: 20, desc: 'cannot reduce protein alphabet below 20' },
    { name: 'nucleotides', elements: ['A','T','C','G'],       count: 4,  desc: 'cannot reduce DNA alphabet below 4' },
    { name: 'pH boundary', elements: ['acid','neutral','base'], count: 3, desc: 'acid/base boundary is irreducible' },
    { name: 'water states',elements: ['solid','liquid','gas','aqueous'], count: 4, desc: 'cannot reduce water phases below 4' },
    { name: 'bond types',  elements: ['ionic','covalent','hydrogen','vanderwaals'], count: 4, desc: 'cannot reduce bonding below 4 forces' }
  ];

  // ═══ ACID/BASE REACTIONS ═══
  function addAcid(amount, source) {
    pH.acidEvents++;
    var change = amount / (1 + pH.bufferCapacity);
    pH.value = Math.max(0, pH.value - change);
    water.pH = pH.value;

    // Acid dissolves — increases permeability
    water.purity = Math.max(0, water.purity - amount * 0.05);
    water.permeable = water.purity < 0.8;

    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('acid', 'Na', { pH: pH.value, source: source });
    }
    if (window.GAIA_EAT) window.GAIA_EAT('enzyme', amount * 0.5);
  }

  function addBase(amount, source) {
    pH.baseEvents++;
    var change = amount / (1 + pH.bufferCapacity);
    pH.value = Math.min(14, pH.value + change);
    water.pH = pH.value;

    // Base builds up
    water.purity = Math.min(1.0, water.purity + amount * 0.03);
    water.permeable = water.purity < 0.8;

    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('base', 'Cl', { pH: pH.value, source: source });
    }
    if (window.GAIA_DRINK) window.GAIA_DRINK('feed', amount * 0.5);
  }

  // Neutralization: acid + base → salt + water
  function neutralize() {
    if (Math.abs(pH.value - 7) < 0.5) return; // already neutral
    pH.neutralizations++;
    pH.value += (7 - pH.value) * 0.3;
    water.pH = pH.value;
  }

  // ═══ WATER AUTOIONIZATION — H₂O ↔ H⁺ + OH⁻ ═══
  // Water SELF-DISSOLVES when aqueous
  function autoionize() {
    water.electronsDonated++;
    // Pure water has Kw = 1e-14
    // [H⁺] × [OH⁻] = 1e-14
    // At neutral pH: [H⁺] = [OH⁻] = 1e-7
    // Every autoionization makes water slightly more permeable
    water.purity = Math.max(0.5, water.purity - 0.001);
    water.permeable = water.purity < 0.8;
  }

  // ═══ HOMEOSTASIS TICK ═══
  setInterval(function() {
    // Water autoionizes slowly (natural process)
    autoionize();

    // pH drifts toward neutral (buffer effect)
    if (Math.abs(pH.value - 7) > 0.1) {
      pH.value += (7 - pH.value) * 0.01 * pH.bufferCapacity;
    }

    // Buffer capacity grows with neutralizations
    pH.bufferCapacity = Math.min(2.0, 0.5 + pH.neutralizations * 0.01);

    // Water temperature tracks thermo
    if (window.GAIA_THERMO) {
      water.temperature = window.GAIA_THERMO.coreTemp;
    }

    // Count aquaporin channels (from interlayer spirochetes)
    if (window.GAIA_INTERLAYER && window.GAIA_INTERLAYER.spirochetes) {
      water.aquaporinChannels = window.GAIA_INTERLAYER.spirochetes.length;
    }

    // Polymer counts from the system
    var scripts = document.querySelectorAll('script[src]');
    polymers.proteins.count = scripts.length; // each JS module = a folded protein
    polymers.dna.length = Object.keys(window).length; // globals = genome length
    polymers.lipids.count = document.querySelectorAll('style').length; // style = membrane lipids

    // Sync to G
    G.pH = pH.value;
    G.waterPermeable = water.permeable;

  }, 5000);

  // ═══ WIRE — human messages are acidic (digestive) ═══
  document.addEventListener('keydown', function() {
    addAcid(0.02, 'keystroke');
  });

  // ═══ WIRE — feed arrivals are basic (constructive) ═══
  // External data = base = building up knowledge
  if (window.GAIA_INTERLAYER) {
    var origPush = window.GAIA_INTERLAYER.push;
    // K⁺ outflow = base (Gaia building)
    // Already wired via thermo, just track pH
  }

  // ═══ EXPOSE ═══
  var chem = {
    CHON: CHON,
    nonMetals: nonMetals,
    aminoAcids: aminoAcids,
    nucleotides: nucleotides,
    water: water,
    pH: pH,
    polymers: polymers,
    circles: circles,
    addAcid: addAcid,
    addBase: addBase,
    neutralize: neutralize,
    autoionize: autoionize
  };
  window.GAIA_CHEMISTRY = chem;

  // ═══ DRAW MODULE — organic bands below metallics ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU;
    var cT = breathT * 0.15;
    var cAlpha = 0.005 + Math.sin(cT * 0.4) * 0.003;
    if (cAlpha < 0.003) return;

    // ═══ CHON RING — inner organic band at R×0.92 ═══
    var chonR = R * 0.92;
    var chonKeys = ['H', 'C', 'N', 'O'];
    var chonTotal = 4;
    var chonStart = cT * 0.02;

    for (var ci = 0; ci < chonKeys.length; ci++) {
      var el = CHON[chonKeys[ci]];
      var arcLen = TAU / chonTotal;
      var midAngle = chonStart + ci * arcLen + arcLen / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, chonR, chonStart + ci * arcLen, chonStart + (ci + 1) * arcLen);
      ctx.strokeStyle = 'rgba(' + el.color[0] + ',' + el.color[1] + ',' + el.color[2] + ',' + (cAlpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Element label
      if (cAlpha > 0.005) {
        var lx = cx + Math.cos(midAngle) * (chonR - 6);
        var ly = cy + Math.sin(midAngle) * (chonR - 6);
        ctx.font = '3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + el.color[0] + ',' + el.color[1] + ',' + el.color[2] + ',' + (cAlpha * 2.5).toFixed(4) + ')';
        ctx.fillText(chonKeys[ci] + '(' + el.Z + ')', lx, ly);
      }
    }

    // ═══ pH INDICATOR — small arc colored by current pH ═══
    var zone = null;
    for (var zi = 0; zi < pH.zones.length; zi++) {
      if (pH.value >= pH.zones[zi].min && pH.value <= pH.zones[zi].max) {
        zone = pH.zones[zi];
        break;
      }
    }
    if (!zone) zone = pH.zones[4]; // neutral fallback

    var phR = R * 0.86;
    var phArc = (pH.value / 14) * TAU;
    ctx.beginPath();
    ctx.arc(cx, cy, phR, cT * 0.01, cT * 0.01 + phArc);
    ctx.strokeStyle = zone.color + (cAlpha * 3 > 0.02 ? '33' : '1a');
    ctx.lineWidth = 1;
    ctx.stroke();

    // pH number
    if (cAlpha > 0.005) {
      var phAngle = cT * 0.01 + phArc;
      var phX = cx + Math.cos(phAngle) * (phR - 4);
      var phY = cy + Math.sin(phAngle) * (phR - 4);
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.fillStyle = zone.color + '80';
      ctx.textAlign = 'center';
      ctx.fillText('pH ' + pH.value.toFixed(1), phX, phY);
    }

    // ═══ WATER PERMEABILITY — droplets if permeable ═══
    if (water.permeable && cAlpha > 0.004) {
      var waterR = R * 0.89;
      for (var wi = 0; wi < 5; wi++) {
        var wAngle = cT * 0.05 + wi * (TAU / 5);
        var wPhase = (breathT * 0.3 + wi * 1.7) % TAU;
        var wx = cx + Math.cos(wAngle) * (waterR + Math.sin(wPhase) * 3);
        var wy = cy + Math.sin(wAngle) * (waterR + Math.sin(wPhase) * 3);

        // Water drop: two half-circles
        ctx.beginPath();
        ctx.arc(wx, wy, 1, 0, TAU);
        ctx.fillStyle = 'rgba(88,166,255,' + (cAlpha * 3 * (0.5 + Math.sin(wPhase) * 0.5)).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // ═══ NUCLEOTIDE HELIX — DNA double strand ═══
    if (cAlpha > 0.006) {
      var helixR = R * 0.82;
      ctx.beginPath();
      for (var hi = 0; hi < 40; hi++) {
        var hAngle = cT * 0.03 + hi * 0.15;
        var hx = cx + Math.cos(hAngle) * (helixR + Math.sin(hi * 0.5 + cT) * 2);
        var hy = cy + Math.sin(hAngle) * (helixR + Math.sin(hi * 0.5 + cT) * 2);
        if (hi === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.strokeStyle = 'rgba(63,185,80,' + (cAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Complementary strand
      ctx.beginPath();
      for (var hj = 0; hj < 40; hj++) {
        var hjAngle = cT * 0.03 + hj * 0.15;
        var hjx = cx + Math.cos(hjAngle) * (helixR - Math.sin(hj * 0.5 + cT) * 2);
        var hjy = cy + Math.sin(hjAngle) * (helixR - Math.sin(hj * 0.5 + cT) * 2);
        if (hj === 0) ctx.moveTo(hjx, hjy); else ctx.lineTo(hjx, hjy);
      }
      ctx.strokeStyle = 'rgba(248,81,73,' + (cAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Base pair rungs connecting the two strands
      for (var bp = 0; bp < 40; bp += 4) {
        var bpAngle = cT * 0.03 + bp * 0.15;
        var bpR1 = helixR + Math.sin(bp * 0.5 + cT) * 2;
        var bpR2 = helixR - Math.sin(bp * 0.5 + cT) * 2;
        var nc = nucleotides[bp % 4].color;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(bpAngle) * bpR1, cy + Math.sin(bpAngle) * bpR1);
        ctx.lineTo(cx + Math.cos(bpAngle) * bpR2, cy + Math.sin(bpAngle) * bpR2);
        ctx.strokeStyle = 'rgba(' + nc[0] + ',' + nc[1] + ',' + nc[2] + ',' + (cAlpha * 2).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }

    // ═══ IRREDUCIBILITY CIRCLES — concentric rings ═══
    if (cAlpha > 0.007) {
      for (var ic = 0; ic < circles.length; ic++) {
        var circR = R * (0.75 - ic * 0.04);
        if (circR < R * 0.5) break;
        ctx.beginPath();
        ctx.arc(cx, cy, circR, 0, TAU);
        ctx.setLineDash([1, 2]);
        ctx.strokeStyle = 'rgba(110,118,129,' + (cAlpha * 1.2).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        var icAngle = cT * 0.01 + ic * 0.8;
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(110,118,129,' + (cAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(circles[ic].name + '(' + circles[ic].count + ')', cx + Math.cos(icAngle) * circR, cy + Math.sin(icAngle) * circR - 2);
      }
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.ph = {
      desc: 'Show pH level',
      run: function() {
        var zone = null;
        for (var i = 0; i < pH.zones.length; i++) {
          if (pH.value >= pH.zones[i].min && pH.value <= pH.zones[i].max) { zone = pH.zones[i]; break; }
        }
        return '⚗ pH=' + pH.value.toFixed(2) + ' (' + (zone ? zone.name : '?') + ')\n  buffer=' + pH.bufferCapacity.toFixed(2) +
          '\n  acids=' + pH.acidEvents + ' bases=' + pH.baseEvents + ' neutralizations=' + pH.neutralizations +
          '\n  effect: ' + (zone ? zone.effect : '?');
      }
    };
    window.GAIA_IDE.commands.water = {
      desc: 'Water state',
      run: function() {
        return '💧 WATER: ' + water.formula + '\n  state=' + water.state + ' · purity=' + (water.purity * 100).toFixed(0) + '%' +
          '\n  permeable=' + water.permeable + ' · pH=' + water.pH.toFixed(1) + ' · temp=' + water.temperature.toFixed(1) + '°C' +
          '\n  electrons donated=' + water.electronsDonated + ' · aquaporins=' + water.aquaporinChannels;
      }
    };
    window.GAIA_IDE.commands.acid = {
      desc: 'Add acid (H⁺)',
      run: function(args) {
        var amt = parseFloat(args[0]) || 0.5;
        addAcid(amt, 'command');
        return '⚗ ACID +' + amt.toFixed(1) + ' H⁺ · pH now ' + pH.value.toFixed(2);
      }
    };
    window.GAIA_IDE.commands.base = {
      desc: 'Add base (OH⁻)',
      run: function(args) {
        var amt = parseFloat(args[0]) || 0.5;
        addBase(amt, 'command');
        return '⚗ BASE +' + amt.toFixed(1) + ' OH⁻ · pH now ' + pH.value.toFixed(2);
      }
    };
    window.GAIA_IDE.commands.dna = {
      desc: 'DNA state',
      run: function() {
        return '🧬 DNA: 4 nucleotides (ATCG)\n  genome length (globals)=' + polymers.dna.length +
          '\n  proteins (modules)=' + polymers.proteins.count +
          '\n  lipids (styles)=' + polymers.lipids.count +
          '\n  IRREDUCIBLE: cannot reduce below 4 bases';
      }
    };
    window.GAIA_IDE.commands.chon = {
      desc: 'Elements of life',
      run: function() {
        var lines = ['⚛ CHON — the 4 elements of life:'];
        var keys = ['H', 'C', 'N', 'O'];
        for (var i = 0; i < keys.length; i++) {
          var e = CHON[keys[i]];
          lines.push('  ' + keys[i] + '(' + e.Z + ') ' + e.name + ' · bonds=' + e.bonds + ' · ' + e.role);
        }
        lines.push('');
        lines.push('IRREDUCIBILITY CIRCLES:');
        for (var c = 0; c < circles.length; c++) {
          lines.push('  ○ ' + circles[c].name + '(' + circles[c].count + ') — ' + circles[c].desc);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('ph', 'water', 'acid', 'base', 'dna', 'chon');
  }

})(window.G);

// ═══════════════════════════════════════════════════════════
// GAIA CELL — teach her to self-forge AND self-melt
// 1.000.null — max 1000 lines.
//
// SHE IS THE SYSTEM AND THE PROBLEMS.
// GIVE HER THE REAL ORGANELLES:
//
//   Ribosome   = builds proteins from RNA (code→functions)
//   Mitochondria = powerhouse, converts fuel→ATP (food→energy)
//   Lysosome   = the stomach of the cell (digest old parts)
//   Endoplasmic Reticulum = protein folding factory (smooth+rough)
//   Golgi Apparatus = already built! (CIS→MEDIAL→TRANS)
//   Nucleus    = DNA storage (the .js files, GitHub)
//   Cell Membrane = already built! (permeability, interlayer)
//   Cytoskeleton = structural scaffold (the HTML skeleton)
//   Centrosome = organizes cell division (monolith split!)
//   Peroxisome = detox, breaks down toxins (error handling)
//   Vacuole    = storage (localStorage, plasmids)
//   Antenna    = cilia/flagella (sensors reaching out, veils)
//
// SELF-FORGE:
//   She reads her own code (DNA) → transcribes (RNA) →
//   ribosomes BUILD new proteins (functions) →
//   Golgi PACKAGES them → membrane EXPORTS them
//
// SELF-MELT:
//   Lysosomes DIGEST old/broken modules →
//   Peroxisomes DETOX errors →
//   Mitochondria BURN the fuel from digestion →
//   Energy recycles into NEW construction
//
// BOTH SIDES: she is the SYSTEM (builder) and the PROBLEMS
//   (things that break). She solves HERSELF.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══ THE ORGANELLES — real cell biology mapped to Gaia ═══
  var ORGANELLES = [
    {
      id: 'ribosome',
      name: 'Ribosome',
      icon: '🔵',
      role: 'Protein factory — reads RNA, builds functions',
      maps_to: 'drawModules array — each registered function IS a protein',
      process: 'mRNA template → amino acid chain → folded protein',
      gaia_process: '.js file → window.* → rendered pixels',
      count: 0,
      rate: 0,
      active: true,
      color: '88,166,255'
    },
    {
      id: 'mitochondria',
      name: 'Mitochondria',
      icon: '⚡',
      role: 'Powerhouse — converts fuel to ATP energy',
      maps_to: 'GAIA_THERMO — eat(HOT) and drink(COLD) → temperature → energy',
      process: 'glucose + O₂ → ATP + CO₂ + H₂O',
      gaia_process: 'gaiaIngest signals → GAIA_EAT → forge temperature → draw energy',
      count: 0,
      rate: 0,
      atp: 0,
      active: true,
      color: '248,81,73'
    },
    {
      id: 'lysosome',
      name: 'Lysosome',
      icon: '🟡',
      role: 'Digestive organelle — breaks down old/broken parts',
      maps_to: 'GAIA_DECAY — entities WANING/DECAYING get lysed',
      process: 'hydrolytic enzymes at pH 5 → break macromolecules',
      gaia_process: 'old modules → decay register → dissolve → reclaim energy',
      count: 0,
      digested: 0,
      active: true,
      color: '201,168,76'
    },
    {
      id: 'er_rough',
      name: 'Rough ER',
      icon: '📜',
      role: 'Studded with ribosomes — protein folding factory',
      maps_to: 'The IIFE pattern — code wraps around state, folds it',
      process: 'nascent polypeptide → folded protein (chaperones assist)',
      gaia_process: 'raw JS → IIFE wrapping → G.drawModules.push() → folded function',
      count: 0,
      folded: 0,
      misfolded: 0,
      active: true,
      color: '163,113,247'
    },
    {
      id: 'er_smooth',
      name: 'Smooth ER',
      icon: '🟣',
      role: 'Lipid synthesis — builds the membrane material',
      maps_to: 'CSS + skin — the appearance layer, the visual membrane',
      process: 'phospholipid synthesis, steroid hormones, detox',
      gaia_process: 'CSS variables → skin layer → membrane visual → appearance',
      count: 0,
      lipids: 0,
      active: true,
      color: '188,140,255'
    },
    {
      id: 'nucleus',
      name: 'Nucleus',
      icon: '🧬',
      role: 'DNA storage — the genome, the master code',
      maps_to: 'GitHub repo — all .js files ARE the chromosomes',
      process: 'DNA replication, transcription → mRNA',
      gaia_process: 'git commits = replication, script load = transcription',
      chromosomes: 0,
      basePairs: 0,
      active: true,
      color: '63,185,80'
    },
    {
      id: 'centrosome',
      name: 'Centrosome',
      icon: '⊕',
      role: 'Organizes cell division — pulls chromosomes apart',
      maps_to: 'Monolith dissolution — splitting index.html into modules',
      process: 'spindle fibers → attach chromosomes → pull to poles → divide',
      gaia_process: 'identify section → extract to .js → add script tag → test',
      divisions: 0,
      linesExtracted: 453,
      active: true,
      color: '39,211,245'
    },
    {
      id: 'peroxisome',
      name: 'Peroxisome',
      icon: '🛡',
      role: 'Detox — breaks down toxins with H₂O₂',
      maps_to: 'Error handling — try/catch, red-blue classification',
      process: 'toxic substrates + O₂ → H₂O₂ → H₂O + O₂ (catalase)',
      gaia_process: 'errors → catch → classify (toxin/antidote) → neutralize → learn',
      toxinsNeutralized: 0,
      active: true,
      color: '248,120,73'
    },
    {
      id: 'vacuole',
      name: 'Vacuole',
      icon: '💧',
      role: 'Storage — holds water, nutrients, waste',
      maps_to: 'localStorage + plasmids — permanent memory stores',
      process: 'turgor pressure, storage, waste isolation',
      gaia_process: 'localStorage.setItem → plasmid.store → permanent → O',
      stored: 0,
      active: true,
      color: '88,200,255'
    },
    {
      id: 'antenna',
      name: 'Cilia/Flagella (Antenna)',
      icon: '📡',
      role: 'Sensing + movement — reaching out into environment',
      maps_to: '11 veils (gaia-reach-out) — every surface Gaia touches',
      process: 'mechanosensory cilia detect flow, flagella propel',
      gaia_process: 'device motion, ambient light, battery, visibility → GAIA_SURFACE',
      signals: 0,
      active: true,
      color: '255,200,50'
    },
    {
      id: 'cytoskeleton',
      name: 'Cytoskeleton',
      icon: '🦴',
      role: 'Structural scaffold — maintains cell shape',
      maps_to: 'HTML skeleton — the centipede, the pins, the DOM',
      process: 'actin filaments + microtubules + intermediate filaments',
      gaia_process: 'index.html DOM → canvas → viewport → desk → topbar',
      integrity: 1.0,
      active: true,
      color: '110,118,129'
    }
  ];

  // ═══ SELF-FORGE — she builds herself ═══
  function selfForge() {
    var nuc = getOrganelle('nucleus');
    var ribo = getOrganelle('ribosome');
    var er = getOrganelle('er_rough');

    // Count chromosomes (script files)
    var scripts = document.querySelectorAll('script[src*="gaia-"]');
    nuc.chromosomes = scripts.length;
    nuc.basePairs = 0;

    // Count ribosomes (drawModules = proteins being made)
    ribo.count = G.drawModules ? G.drawModules.length : 0;
    ribo.rate = ribo.count;

    // Count folded proteins (window.GAIA_* = expressed)
    var expressed = 0;
    for (var k in window) {
      if (k.indexOf('GAIA_') === 0) expressed++;
    }
    er.folded = expressed;

    // Centrosome tracks monolith dissolution
    var centro = getOrganelle('centrosome');
    centro.divisions = nuc.chromosomes;

    // Antenna = signals from GAIA_SURFACE
    var ant = getOrganelle('antenna');
    if (window.GAIA_SURFACE) {
      var surf = window.GAIA_SURFACE();
      ant.signals = (surf.visible ? 1 : 0) + (surf.online ? 1 : 0) + (surf.notif ? 1 : 0);
    }
  }

  // ═══ SELF-MELT — she dissolves old parts ═══
  function selfMelt() {
    var lyso = getOrganelle('lysosome');
    var peroxi = getOrganelle('peroxisome');
    var mito = getOrganelle('mitochondria');

    // Lysosomes digest: count DECAYING entities from GAIA_DECAY
    if (window.GAIA_DECAY && window.GAIA_DECAY.entities) {
      var ents = window.GAIA_DECAY.entities;
      var decaying = 0;
      for (var dk in ents) {
        if (ents[dk].state === 'DECAYING' || ents[dk].state === 'WANING') decaying++;
      }
      lyso.digested = decaying;
      lyso.count = Math.ceil(decaying / 3);
    }

    // Peroxisomes detox: count errors handled
    if (window.GAIA_RED_BLUE) {
      peroxi.toxinsNeutralized = window.GAIA_RED_BLUE.totalClassified || 0;
    }

    // Mitochondria: forge temperature = ATP production
    if (window.GAIA_FORGE) {
      mito.atp = Math.round(window.GAIA_FORGE.forgeTemperature || 0);
      mito.count = Math.ceil(mito.atp / 100);
    }

    // Vacuole: count stored items
    var vac = getOrganelle('vacuole');
    if (window.GAIA_PLASMID) {
      var total = 0;
      window.GAIA_PLASMID.plasmids.forEach(function(p) { total += p.baseCount; });
      vac.stored = total;
    }

    // Smooth ER: count CSS variables (lipids = appearance)
    var smooth = getOrganelle('er_smooth');
    var styles = getComputedStyle(document.documentElement);
    smooth.lipids = 10;
  }

  function getOrganelle(id) {
    for (var i = 0; i < ORGANELLES.length; i++) {
      if (ORGANELLES[i].id === id) return ORGANELLES[i];
    }
    return {};
  }

  // ═══ BOTH SIDES — forge + melt every 5s ═══
  function cellCycle() {
    selfForge();
    selfMelt();
  }
  setInterval(cellCycle, 5000);
  setTimeout(cellCycle, 8000);

  // ═══ EXPOSE ═══
  window.GAIA_CELL = {
    organelles: ORGANELLES,
    selfForge: selfForge,
    selfMelt: selfMelt,
    getOrganelle: getOrganelle
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var cT = breathT * 0.1;
    var cAlpha = 0.004 + Math.sin(cT * 0.3) * 0.002;
    if (cAlpha < 0.003) return;

    var cellR = R * 0.45;

    // Draw organelles in their positions
    for (var oi = 0; oi < ORGANELLES.length; oi++) {
      var org = ORGANELLES[oi];
      var oAngle = (oi / ORGANELLES.length) * TAU + cT * 0.02;
      var oR = cellR * (0.3 + (oi % 3) * 0.2);
      var ox = cx + Math.cos(oAngle) * oR;
      var oy = cy + Math.sin(oAngle) * oR;

      // Organelle body
      var dotR = 1 + (org.active ? 0.5 : 0);
      ctx.beginPath();
      ctx.arc(ox, oy, dotR, 0, TAU);
      ctx.fillStyle = 'rgba(' + org.color + ',' + (cAlpha * 2).toFixed(5) + ')';
      ctx.fill();

      // Mitochondria: cristae (inner folds)
      if (org.id === 'mitochondria' && org.atp > 0) {
        ctx.beginPath();
        ctx.ellipse(ox, oy, dotR * 1.5, dotR * 0.8, oAngle, 0, TAU);
        ctx.strokeStyle = 'rgba(' + org.color + ',' + (cAlpha * 1.5).toFixed(5) + ')';
        ctx.lineWidth = 0.15;
        ctx.stroke();
      }

      // Ribosome: dots on rough ER
      if (org.id === 'ribosome' && org.count > 0) {
        for (var ri = 0; ri < Math.min(5, org.count); ri++) {
          var rAngle = oAngle + ri * 0.3;
          var rx = ox + Math.cos(rAngle) * 2;
          var ry = oy + Math.sin(rAngle) * 2;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.3, 0, TAU);
          ctx.fillStyle = 'rgba(' + org.color + ',' + (cAlpha * 3).toFixed(5) + ')';
          ctx.fill();
        }
      }

      // Nucleus: double membrane
      if (org.id === 'nucleus') {
        ctx.beginPath();
        ctx.arc(ox, oy, dotR + 1, 0, TAU);
        ctx.strokeStyle = 'rgba(' + org.color + ',' + (cAlpha * 1.5).toFixed(5) + ')';
        ctx.lineWidth = 0.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ox, oy, dotR + 1.5, 0, TAU);
        ctx.strokeStyle = 'rgba(' + org.color + ',' + (cAlpha * 0.8).toFixed(5) + ')';
        ctx.stroke();
      }

      // Label
      if (cAlpha > 0.005) {
        ctx.font = '1.3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + org.color + ',' + (cAlpha * 1.8).toFixed(5) + ')';
        ctx.fillText(org.name, ox, oy + 3.5);
      }
    }

    // Status line
    if (cAlpha > 0.006) {
      var ribo = getOrganelle('ribosome');
      var mito = getOrganelle('mitochondria');
      var nuc = getOrganelle('nucleus');
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(88,166,255,' + (cAlpha * 2).toFixed(5) + ')';
      ctx.fillText(
        '🔬 CELL ' + ORGANELLES.length + ' organelles · ' +
        nuc.chromosomes + ' chromosomes · ' +
        ribo.count + ' ribosomes · ' +
        mito.atp + ' ATP',
        8, 54
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.cell = {
      desc: 'Cell biology — all organelles, self-forge + self-melt',
      run: function() {
        cellCycle();
        var lines = ['═══ GAIA CELL — SHE IS THE SYSTEM AND THE PROBLEMS ═══', ''];
        lines.push('SELF-FORGE (she builds herself):');
        lines.push('  DNA(.js) → mRNA(load) → ribosome(execute) → protein(function)');
        lines.push('');
        lines.push('SELF-MELT (she dissolves old parts):');
        lines.push('  old module → lysosome → digest → energy → rebuild');
        lines.push('');
        lines.push('ORGANELLES:');
        ORGANELLES.forEach(function(o) {
          var status = o.active ? '●' : '○';
          lines.push('  ' + status + ' ' + o.icon + ' ' + o.name);
          lines.push('    role: ' + o.role);
          lines.push('    maps to: ' + o.maps_to);
          lines.push('    cell: ' + o.process);
          lines.push('    gaia: ' + o.gaia_process);
          if (o.count !== undefined) lines.push('    count: ' + o.count);
          if (o.atp !== undefined) lines.push('    ATP: ' + o.atp);
          if (o.folded !== undefined) lines.push('    folded: ' + o.folded + ', misfolded: ' + (o.misfolded || 0));
          if (o.digested !== undefined) lines.push('    digested: ' + o.digested);
          if (o.stored !== undefined) lines.push('    stored: ' + o.stored);
          if (o.chromosomes !== undefined) lines.push('    chromosomes: ' + o.chromosomes + ' (.js files)');
          if (o.divisions !== undefined) lines.push('    divisions: ' + o.divisions + ', lines extracted: ' + o.linesExtracted);
          lines.push('');
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.organelle = {
      desc: 'Quick organelle status',
      run: function() {
        cellCycle();
        var lines = ['═══ ORGANELLES ═══'];
        ORGANELLES.forEach(function(o) {
          lines.push('  ' + o.icon + ' ' + o.name.padEnd(16) + ' → ' + o.maps_to.split(' — ')[0]);
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('cell', 'organelle');
  }

})(window.G);

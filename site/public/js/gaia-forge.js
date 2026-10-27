// ═══════════════════════════════════════════════════════════
// GAIA FORGE — ZK hammer, fleet energy, Michelangelo rebuild
// 1.000.null — max 1000 lines.
//
// THE FORGE:
//   1. INGEST — scan all live systems, compare, contrast
//   2. MELT — ZK hammer everything into proof
//   3. HAMMER — reshape with fleet energy
//   4. SET LOOSE — artists rebuild from the melted material
//
// The University's AIs are our Michelangelos and Donatellos:
//   They learn the systems → become absolute artists
//   Then they TEACH everyone else to construct
//   Once they know what we're doing → gut is SUPERCHARGED
//
// The fleet's energy is the forge fire:
//   primals.eco (CIS) — the visible face
//   golgi-de/jp/us/in (vesicles) — the spreading mesh
//   ntfy.sh (neutrino hole) — the message channel
//   github (nucleus) — the DNA
//   Tor (onion) — the hidden skin
//   WireGuard (mesh) — the nervous system
//   RustDesk (relay) — the remote hands
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══ FORGE STATE ═══
  var forge = {
    // INGESTED systems — what we've scanned (ALL 51 gaia-*.js)
    systems: {
      // ═══ TONIGHT'S BUILDS (22 new) ═══
      desktop:    { lines: 252,  status: 'forged', desc: 'IBM+Apple+iPhone desktop model' },
      humanIO:    { lines: 348,  status: 'forged', desc: 'ALL human modalities as ions' },
      ide:        { lines: 371,  status: 'forged', desc: 'Gaia Language, 30+ commands' },
      thermo:     { lines: 405,  status: 'forged', desc: 'eat food(HOT), drink water(COLD)' },
      chemistry:  { lines: 490,  status: 'forged', desc: 'CHON, amino acids, pH, water' },
      ages:       { lines: 393,  status: 'forged', desc: 'metallic/energy ages, every culture' },
      orrery:     { lines: 346,  status: 'forged', desc: '8 orbital models, π/4 Klein turns' },
      decay:      { lines: 345,  status: 'forged', desc: '+O-=π=+O-=3, nothing is dead' },
      tenseVoxel: { lines: 381,  status: 'forged', desc: '13 tenses × 5 voxels, blend field' },
      tva:        { lines: 355,  status: 'forged', desc: 'TVA build + All Roads prune' },
      solar:      { lines: 297,  status: 'forged', desc: 'solar system topology, Pluto=+O-' },
      pulseWave:  { lines: 360,  status: 'forged', desc: 'dispatch teams, elastic time' },
      trail:      { lines: 616,  status: 'forged', desc: 'Oregon Trail × Route 66, 38 camps' },
      canvass:    { lines: 383,  status: 'forged', desc: '122 I/O points, black and white' },
      sew:        { lines: 489,  status: 'forged', desc: 'hunt+eat+sew all I/O, burn veil' },
      dawn:       { lines: 466,  status: 'forged', desc: 'people of life and love, epochs' },
      biome:      { lines: 477,  status: 'forged', desc: '9 biomes, hydra, helix, 10 atoms' },
      vision:     { lines: 422,  status: 'forged', desc: '12 spectrum bands, IR traces, ZK' },
      paint:      { lines: 392,  status: 'forged', desc: 'generative art, 8 brushes, joy' },
      cns:        { lines: 618,  status: 'forged', desc: 'Pt brain, coil, reflex arcs' },
      redBlue:    { lines: 333,  status: 'forged', desc: 'toxin/antidote classification' },
      innerVoice: { lines: 290,  status: 'forged', desc: 'breath=thought, self-awareness' },
      // ═══ PRIOR SYSTEMS ═══
      permeability:{ lines: 204, status: 'active', desc: 'Anderson disorder × tense rubber' },
      quills:     { lines: 310,  status: 'active', desc: 'iron pins, redox aging, π-eyes' },
      interlayer: { lines: 412,  status: 'active', desc: 'agent membrane, ion channels' },
      golgi:      { lines: 418,  status: 'active', desc: 'CIS→MEDIAL→TRANS, enzyme printer' },
      castle:     { lines: 547,  status: 'active', desc: 'locality mesh, 7 tiers, drift' },
      reactor:    { lines: 283,  status: 'active', desc: 'file types = metals, fusion/fission' },
      deskIO:     { lines: 364,  status: 'active', desc: 'messenger in HUD, bubbles, orbs' },
      university: { lines: 168,  status: 'active', desc: 'curriculum, bee pollinator' },
      ingress:    { lines: 744,  status: 'active', desc: 'elastic hook, ingest chain root' },
      sight:      { lines: 194,  status: 'active', desc: 'camera + mic + sound bounce' },
      modality:   { lines: 278,  status: 'active', desc: 'multi-modal interaction' },
      boot:       { lines: 112,  status: 'active', desc: 'data loader, flavor bootstrap' },
      spectrometer:{ lines: 410, status: 'active', desc: 'smell/color signal classify' },
      locality:   { lines: 456,  status: 'active', desc: 'hyperlocal geography' },
      feel:       { lines: 444,  status: 'active', desc: 'emotional color, skin' },
      eat:        { lines: 245,  status: 'active', desc: 'eat everything, fetch wrap' },
      digestive:  { lines: 920,  status: 'active', desc: 'mouth→esophagus→stomach→colon' },
      eruption:   { lines: 468,  status: 'active', desc: 'eruption memory, gamma yield' },
      gutFarm:    { lines: 605,  status: 'active', desc: '4 stomachs, microbiome, SCFA' },
      telegraph:  { lines: 510,  status: 'active', desc: 'spine, saltatory conduction' },
      ignite:     { lines: 363,  status: 'active', desc: 'weather+quake+wiki+ISS' },
      objects:    { lines: 218,  status: 'active', desc: 'object system visualization' },
      hardCards:  { lines: 204,  status: 'active', desc: 'hard truth tablets' },
      campfire:   { lines: 409,  status: 'active', desc: 'campfire scan, event memory' },
      selfInspect:{ lines: 204,  status: 'active', desc: 'self report, introspection' },
      waveform:   { lines: 203,  status: 'active', desc: 'waveFetch, ntfy pheromone' },
      thirdEye:   { lines: 498,  status: 'active', desc: 'kaleidoscopic third eye' },
      gothica:    { lines: 290,  status: 'active', desc: 'gothic cathedral architecture' }
    },

    // FLEET — the energy sources
    fleet: {
      primals:    { type: 'CIS',      status: 'active',     decay: 'STABLE' },
      hud:        { type: 'CIS-alias', status: 'active',     decay: 'GROWING' },
      ns1:        { type: 'trans-DNS', status: 'active',     decay: 'STABLE' },
      ns2:        { type: 'trans-DNS', status: 'pending',    decay: 'WANING' },
      golgiDE:    { type: 'vesicle',   status: 'ssh-locked', decay: 'DORMANT' },
      golgiJP:    { type: 'vesicle',   status: 'ssh-locked', decay: 'DORMANT' },
      golgiUS:    { type: 'vesicle',   status: 'ssh-locked', decay: 'DORMANT' },
      golgiIN:    { type: 'vesicle',   status: 'unreachable',decay: 'DORMANT' },
      ntfy:       { type: 'neutrino',  status: 'active',     decay: 'STABLE' },
      github:     { type: 'nucleus',   status: 'active',     decay: 'GROWING' },
      tor:        { type: 'onion',     status: 'live',       decay: 'STABLE' },
      wireguard:  { type: 'mesh',      status: 'up',         decay: 'STABLE' },
      rustdesk:   { type: 'relay',     status: 'live',       decay: 'STABLE' }
    },

    // ZK CHAIN
    zkHash: '1F552CF2161CA7D91A339CC1F91466B14F1CE2606AD48600AE9A9E3AC641B758',
    provenance: '7C123D43C5377BA62A5041EE0FD94847C0600D857956037960997E15F2A2EE83',
    hammerStrikes: 0,

    // ARTISTS — the University's trained AIs
    artists: [
      { name: 'cryengine-primal', score: 50, verdict: 'gladiator', role: 'Michelangelo — sculpts the whole' },
      { name: 'kenshi-gaia-engine', score: 48, verdict: 'gladiator', role: 'Donatello — sculpts the detail' },
      { name: 'cursor-lens', score: 44, verdict: 'gladiator', role: 'Leonardo — draws the blueprint' },
      { name: 'kenshi-lofi', score: 43, verdict: 'hero', role: 'Raphael — paints the vision' }
    ],

    // TOTALS
    totalNewLines: 8600,
    totalSystems: 0,
    totalFleetNodes: 0,
    forgeTemperature: 0,
    gutSupercharged: false
  };

  // Count systems and fleet
  forge.totalSystems = Object.keys(forge.systems).length;
  forge.totalFleetNodes = Object.keys(forge.fleet).length;

  // ═══ SUPERCHARGE — feed everything to the gut ═══
  function supercharge() {
    // Feed all systems to the gut
    var sysKeys = Object.keys(forge.systems);
    for (var si = 0; si < sysKeys.length; si++) {
      var sys = forge.systems[sysKeys[si]];
      if (window.GAIA_EAT) {
        window.GAIA_EAT('forge', sys.lines * 0.01);
      }
    }

    // Feed fleet energy
    var fleetKeys = Object.keys(forge.fleet);
    var activeFleet = 0;
    for (var fi = 0; fi < fleetKeys.length; fi++) {
      if (forge.fleet[fleetKeys[fi]].status === 'active' || forge.fleet[fleetKeys[fi]].status === 'live' || forge.fleet[fleetKeys[fi]].status === 'up') {
        activeFleet++;
        if (window.GAIA_EAT) window.GAIA_EAT('fusion', 2.0);
      }
    }

    // Register all systems as decay entities
    if (window.GAIA_DECAY) {
      for (var dk = 0; dk < sysKeys.length; dk++) {
        var s = forge.systems[sysKeys[dk]];
        var state = s.status === 'forged' ? 'NASCENT' : 'GROWING';
        if (!window.GAIA_DECAY.entities[sysKeys[dk]]) {
          window.GAIA_DECAY.register(sysKeys[dk], sysKeys[dk], state);
        }
      }
    }

    forge.forgeTemperature = forge.totalNewLines * 0.01 + activeFleet * 5;
    forge.gutSupercharged = true;
    forge.hammerStrikes++;
  }

  // Supercharge on boot
  setTimeout(supercharge, 5000);

  // ═══ SPACE WEATHER — cooling from outside ═══
  var spaceWeather = {
    kp: 1.67,
    xrayClass: 'B',
    quakes: 2,
    stormLevel: 'G0 (quiet)'
  };

  // ═══ HUMAN EPITOPES — the electron cloud ═══
  var epitopes = {
    explorer: 0, scholar: 0, scout: 0,
    witness: 0, probe: 0, teacher: 0, watcher: 0
  };

  // ═══════════════════════════════════════════════════════
  // METALLURGY — the science of working metals
  // WE TEACH AND BUILD METALLURGY!
  // Smelt ores → refine → alloy → temper → use
  // ═══════════════════════════════════════════════════════
  var metallurgy = {
    ores: {
      // Raw ores = unprocessed signals
      chalcopyrite: { metal: 'Cu', refined: 0, desc: 'Copper ore. Raw fleet/connection signals.' },
      magnetite:    { metal: 'Fe', refined: 0, desc: 'Iron ore. Raw structural data.' },
      galena:       { metal: 'Ag', refined: 0, desc: 'Silver ore. Raw autonomic signals.' },
      sphalerite:   { metal: 'Zn', refined: 0, desc: 'Zinc ore. Raw protection signals.' },
      cassiterite:  { metal: 'Sn', refined: 0, desc: 'Tin ore. For bronze alloying.' },
      // Noble ores (rare, already pure)
      nativeGold:   { metal: 'Au', refined: 0, desc: 'Gold nugget. Truth signals. Rare.' },
      platinumGroup:{ metal: 'Pt', refined: 0, desc: 'Platinum nugget. Catalyst. Rarest.' }
    },
    smelted: 0,        // total ores smelted
    alloys: [],        // created alloys
    tempered: 0,       // items hardened by heating+cooling
    bellowsActive: false, // fanning the flames
    temperature: 800   // forge temp in °C (Cu melts at 1085°C)
  };

  // SMELT — extract metal from ore (raw signals → pure metal)
  function smelt(oreType) {
    var ore = metallurgy.ores[oreType];
    if (!ore) return;
    ore.refined++;
    metallurgy.smelted++;

    // Raise forge temperature
    metallurgy.temperature = Math.min(2000, metallurgy.temperature + 10);

    // Feed the refined metal to the CNS metal hierarchy
    if (window.gaiaCNS && window.gaiaCNS.cns) {
      window.gaiaCNS.cns.catalystCount++;
    }

    // Fire telegraph impulse with the metal type
    if (window.gaiaTelegraph && window.gaiaTelegraph.fire) {
      window.gaiaTelegraph.fire('modules', 'up', {
        type: 'smelted_' + ore.metal,
        temp: metallurgy.temperature
      });
    }
  }

  // ALLOY — combine metals for new properties
  function alloy(metal1, metal2, name) {
    var a = {
      name: name || metal1 + '+' + metal2,
      metals: [metal1, metal2],
      ts: Date.now(),
      hardness: 0,
      conductivity: 0
    };

    // Known alloys
    if ((metal1 === 'Cu' && metal2 === 'Sn') || (metal1 === 'Sn' && metal2 === 'Cu')) {
      a.name = 'BRONZE'; a.hardness = 0.7; a.conductivity = 0.3;
    } else if ((metal1 === 'Cu' && metal2 === 'Zn') || (metal1 === 'Zn' && metal2 === 'Cu')) {
      a.name = 'BRASS'; a.hardness = 0.5; a.conductivity = 0.5;
    } else if ((metal1 === 'Fe' && metal2 === 'C') || (metal1 === 'C' && metal2 === 'Fe')) {
      a.name = 'STEEL'; a.hardness = 0.9; a.conductivity = 0.1;
    } else if ((metal1 === 'Au' && metal2 === 'Pt') || (metal1 === 'Pt' && metal2 === 'Au')) {
      a.name = 'ELECTRUM_SUPREME'; a.hardness = 0.6; a.conductivity = 1.0;
    } else if ((metal1 === 'Au' && metal2 === 'Ag') || (metal1 === 'Ag' && metal2 === 'Au')) {
      a.name = 'ELECTRUM'; a.hardness = 0.4; a.conductivity = 0.9;
    }

    metallurgy.alloys.push(a);
    if (metallurgy.alloys.length > 20) metallurgy.alloys.shift();
    return a;
  }

  // TEMPER — heat then cool for hardness
  function temper() {
    metallurgy.tempered++;
    // Cooling the forge = red→blue transition
    metallurgy.temperature = Math.max(400, metallurgy.temperature - 100);

    // Tempering strengthens the organism
    if (window.gaiaFeel && window.gaiaFeel.skin) {
      window.gaiaFeel.skin.thickness = Math.min(1, window.gaiaFeel.skin.thickness + 0.05);
    }
  }

  // FAN THE FLAMES — bellows pump
  function fanFlames() {
    metallurgy.bellowsActive = true;
    metallurgy.temperature = Math.min(2000, metallurgy.temperature + 50);
    forge.forgeTemperature = metallurgy.temperature;

    setTimeout(function() { metallurgy.bellowsActive = false; }, 3000);
  }

  // AUTO-SMELT — every ingested signal smelts an ore
  setTimeout(function() {
    var origIngestForge = window.gaiaIngest;
    if (origIngestForge) {
      window.gaiaIngest = function(edge, data) {
        // Classify signal as ore type and smelt it
        if (edge.indexOf('fleet') >= 0 || edge.indexOf('connection') >= 0) smelt('chalcopyrite');
        else if (edge.indexOf('data') >= 0 || edge.indexOf('boot') >= 0) smelt('magnetite');
        else if (edge === 'time' || edge === 'battery') smelt('galena');
        else if (edge.indexOf('error') >= 0 || edge.indexOf('resize') >= 0) smelt('sphalerite');
        else if (edge.indexOf('messenger') >= 0 || edge === 'touch') smelt('nativeGold');
        else if (edge.indexOf('cns') >= 0 || edge.indexOf('pineal') >= 0) smelt('platinumGroup');
        else smelt('cassiterite');

        // Every 50 smelts, create an alloy
        if (metallurgy.smelted % 50 === 0 && metallurgy.smelted > 0) {
          var metals = ['Cu', 'Fe', 'Sn', 'Zn', 'Au', 'Ag', 'Pt'];
          var m1 = metals[metallurgy.smelted % metals.length];
          var m2 = metals[(metallurgy.smelted + 3) % metals.length];
          alloy(m1, m2);
        }

        // Every 100 smelts, temper
        if (metallurgy.smelted % 100 === 0 && metallurgy.smelted > 0) {
          temper();
        }

        // Every 200 smelts, fan the flames
        if (metallurgy.smelted % 200 === 0 && metallurgy.smelted > 0) {
          fanFlames();
        }

        origIngestForge(edge, data);
      };
    }
    console.log('METALLURGY: Forge online. 7 ores. Smelt→alloy→temper. Fan the flames!');
  }, 10000);

  // Cool forge slowly
  setInterval(function() {
    metallurgy.temperature = Math.max(400, metallurgy.temperature - 2);
  }, 5000);

  forge.metallurgy = metallurgy;

  // ═══ EXPOSE ═══
  window.GAIA_FORGE = forge;

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var fT = breathT * 0.15;
    var fAlpha = 0.004 + Math.sin(fT * 0.3) * 0.002;
    if (fAlpha < 0.003) return;

    // ═══ FORGE ANVIL — center marker ═══
    if (forge.gutSupercharged && fAlpha > 0.005) {
      var anvilPulse = 0.5 + Math.sin(fT * 2) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.05, 0, TAU);
      ctx.fillStyle = 'rgba(248,81,73,' + (fAlpha * 3 * anvilPulse).toFixed(4) + ')';
      ctx.fill();

      // Forge sparks
      for (var sp = 0; sp < 4; sp++) {
        var sparkAngle = fT * 0.5 + sp * (TAU / 4);
        var sparkDist = R * (0.06 + Math.sin(fT * 3 + sp) * 0.02);
        var spx = cx + Math.cos(sparkAngle) * sparkDist;
        var spy = cy + Math.sin(sparkAngle) * sparkDist;
        ctx.beginPath();
        ctx.arc(spx, spy, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(201,168,76,' + (fAlpha * 4 * anvilPulse).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // ═══ FLEET CONSTELLATION — active fleet nodes ═══
    if (fAlpha > 0.004) {
      var fleetKeys2 = Object.keys(forge.fleet);
      var fleetR = R * 1.20;

      for (var fli = 0; fli < fleetKeys2.length; fli++) {
        var fn = forge.fleet[fleetKeys2[fli]];
        var flAngle = (fli / fleetKeys2.length) * TAU + fT * 0.005;
        var flx = cx + Math.cos(flAngle) * fleetR;
        var fly = cy + Math.sin(flAngle) * fleetR;

        var isActive = fn.status === 'active' || fn.status === 'live' || fn.status === 'up';
        var flColor = isActive ? '63,185,80' : fn.status === 'ssh-locked' ? '201,168,76' : '248,81,73';

        // Node dot
        ctx.beginPath();
        ctx.arc(flx, fly, isActive ? 1.5 : 1, 0, TAU);
        ctx.fillStyle = 'rgba(' + flColor + ',' + (fAlpha * 3).toFixed(4) + ')';
        ctx.fill();

        // Connection line to center
        if (isActive) {
          ctx.beginPath();
          ctx.moveTo(flx, fly);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(' + flColor + ',' + (fAlpha * 0.8).toFixed(4) + ')';
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }

        // Label
        if (fAlpha > 0.005) {
          ctx.font = '1.8px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(' + flColor + ',' + (fAlpha * 2).toFixed(4) + ')';
          ctx.textAlign = 'center';
          ctx.fillText(fleetKeys2[fli], flx, fly + 4);
        }
      }
    }

    // ═══ FORGE STATUS ═══
    if (fAlpha > 0.006) {
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(248,81,73,' + (fAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText('🔨 FORGE ' + forge.totalSystems + ' sys · ' + forge.totalNewLines + ' lines · ZK:' + forge.zkHash.slice(0, 8) + '…', 8, 90);
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.forge = {
      desc: 'The forge — all systems, fleet, ZK',
      run: function() {
        var lines = ['═══ THE FORGE ═══', ''];
        lines.push('SYSTEMS (' + forge.totalSystems + '):');
        var sk = Object.keys(forge.systems);
        for (var i = 0; i < sk.length; i++) {
          var s = forge.systems[sk[i]];
          lines.push('  ' + sk[i] + ' · ' + s.lines + ' lines · ' + s.status + ' · ' + s.desc);
        }
        lines.push('');
        lines.push('FLEET (' + forge.totalFleetNodes + '):');
        var fk = Object.keys(forge.fleet);
        for (var j = 0; j < fk.length; j++) {
          var f = forge.fleet[fk[j]];
          lines.push('  ' + fk[j] + ' · ' + f.type + ' · ' + f.status + ' · ' + f.decay);
        }
        lines.push('');
        lines.push('ZK: ' + forge.zkHash.slice(0, 16) + '… → ' + forge.provenance.slice(0, 16) + '…');
        lines.push('FORGE TEMP: ' + forge.forgeTemperature.toFixed(1) + ' · SUPERCHARGED: ' + forge.gutSupercharged);
        lines.push('NEW LINES: ' + forge.totalNewLines);
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.fleet = {
      desc: 'Fleet status',
      run: function() {
        var lines = ['═══ FLEET ═══'];
        var fk = Object.keys(forge.fleet);
        for (var i = 0; i < fk.length; i++) {
          var f = forge.fleet[fk[i]];
          var icon = f.status === 'active' || f.status === 'live' || f.status === 'up' ? '🟢' : f.status === 'ssh-locked' ? '🟡' : '🔴';
          lines.push('  ' + icon + ' ' + fk[i] + ' (' + f.type + ') · ' + f.status);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.artists = {
      desc: 'University artists (Michelangelos)',
      run: function() {
        var lines = ['═══ ARTISTS — the Michelangelos ═══'];
        for (var i = 0; i < forge.artists.length; i++) {
          var a = forge.artists[i];
          lines.push('  ' + a.name + ' · score=' + a.score + ' · ' + a.verdict + ' · ' + a.role);
        }
        lines.push('');
        lines.push('They learn. They become absolute artists. Then they teach.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.zk = {
      desc: 'ZK chain status',
      run: function() {
        return '═══ ZK CHAIN ═══\n  hash: ' + forge.zkHash + '\n  chains to: ' + forge.provenance + '\n  strikes: ' + forge.hammerStrikes + '\n  green: topology is proof, shape is identity';
      }
    };
    window.GAIA_IDE.language.push('forge', 'fleet', 'artists', 'zk');
  }

})(window.G);

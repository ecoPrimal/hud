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
    // INGESTED systems — what we've scanned
    systems: {
      desktop:    { lines: 252,  status: 'forged', desc: 'IBM+Apple+iPhone desktop model' },
      humanIO:    { lines: 348,  status: 'forged', desc: 'ALL human modalities as ions' },
      ide:        { lines: 371,  status: 'forged', desc: 'Gaia Language, 22+ commands' },
      thermo:     { lines: 405,  status: 'forged', desc: 'eat food(HOT), drink water(COLD)' },
      chemistry:  { lines: 490,  status: 'forged', desc: 'CHON, amino acids, pH, water' },
      ages:       { lines: 393,  status: 'forged', desc: 'metallic/energy ages, every culture' },
      orrery:     { lines: 346,  status: 'forged', desc: '8 orbital models, π/4 Klein turns' },
      decay:      { lines: 345,  status: 'forged', desc: '+O-=π=+O-=3, nothing is dead' },
      tenseVoxel: { lines: 381,  status: 'forged', desc: '13 tenses × 5 voxels, blend field' },
      // Previous systems
      permeability:{ lines: 204, status: 'active', desc: 'Anderson disorder × tense rubber' },
      quills:     { lines: 310,  status: 'active', desc: 'iron pins, redox aging, π-eyes' },
      interlayer: { lines: 412,  status: 'active', desc: 'agent membrane, ion channels' },
      golgi:      { lines: 418,  status: 'active', desc: 'CIS→MEDIAL→TRANS, enzyme printer' },
      castle:     { lines: 547,  status: 'active', desc: 'locality mesh, 7 tiers, drift' },
      reactor:    { lines: 283,  status: 'active', desc: 'file types = metals, fusion/fission' },
      deskIO:     { lines: 364,  status: 'active', desc: 'messenger in HUD, bubbles, orbs' },
      university: { lines: 168,  status: 'active', desc: 'curriculum, bee pollinator' }
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
    totalNewLines: 3331,
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

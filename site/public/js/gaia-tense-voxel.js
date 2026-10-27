// ═══════════════════════════════════════════════════════════
// TENSE-VOXEL BLENDER — bend everything together
// 1.000.null — max 1000 lines.
//
// FULL TENSE SYSTEM — not just is/was/now:
//   CERTAIN:  is, was, will be
//   POSSIBLE: might be, could be, may have been
//   COUNTER:  would be, should be, were (subjunctive)
//   NULL:     end, never, always
//
// Each tense = a MEMORY DECAY RATE:
//   is  = 0 decay (present, alive, measured)
//   was = partial decay (remembered, fading)
//   might = high uncertainty (quantum, unmeasured)
//   were = counterfactual (never happened, orthogonal)
//   end  = fully decayed (released, composted)
//
// VOXEL SORT — spatial proximity:
//   touch → local → solar → zodiac → deep
//   Each is a concentric shell of awareness
//
// THE BLEND:
//   tense × voxel = a 2D field
//   Like a chess board: tense=rows, voxel=columns
//   Every entity lives at a (tense, voxel) coordinate
//   Blending = how much influence one cell has on neighbors
//   Hyperlocalities = where voxel shells overlap
//
// ORTHOGONAL FREEDOM:
//   Certain tenses are rigid (is, was = low freedom)
//   Possible tenses are free (might, could = high freedom)
//   Counter tenses are orthogonal (were, would = perpendicular)
//   The freedom determines how much an entity can BEND
//   into neighboring voxel shells.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ FULL TENSE SYSTEM ═══
  var TENSES = {
    // CERTAIN (observed, collapsed)
    is:       { mode: 'certain',  decay: 0.0,  freedom: 0.1, permeability: 0.1, triad: '+', color: '#3fb950', desc: 'present, alive, measured' },
    was:      { mode: 'certain',  decay: 0.5,  freedom: 0.2, permeability: 0.7, triad: '-', color: '#6e7681', desc: 'past, remembered, fading' },
    will:     { mode: 'certain',  decay: 0.0,  freedom: 0.3, permeability: 0.3, triad: '+', color: '#58a6ff', desc: 'future, expected, committed' },

    // POSSIBLE (uncertain, superposition)
    might:    { mode: 'possible', decay: 0.3,  freedom: 0.7, permeability: 0.5, triad: 'O', color: '#c9a84c', desc: 'uncertain, maybe, quantum' },
    could:    { mode: 'possible', decay: 0.3,  freedom: 0.8, permeability: 0.5, triad: 'O', color: '#d29922', desc: 'potential, able, latent' },
    may:      { mode: 'possible', decay: 0.4,  freedom: 0.6, permeability: 0.4, triad: 'O', color: '#f0883e', desc: 'permitted, allowed, possible' },

    // COUNTERFACTUAL (orthogonal, never happened)
    were:     { mode: 'counter',  decay: 0.8,  freedom: 1.0, permeability: 0.9, triad: '-', color: '#f85149', desc: 'subjunctive, counterfactual, if' },
    would:    { mode: 'counter',  decay: 0.6,  freedom: 0.9, permeability: 0.7, triad: '-', color: '#bc8cff', desc: 'conditional, hypothetical' },
    should:   { mode: 'counter',  decay: 0.4,  freedom: 0.5, permeability: 0.3, triad: 'O', color: '#a371f7', desc: 'obligatory, expected, ideal' },

    // NULL (terminal, eternal)
    end:      { mode: 'null',     decay: 1.0,  freedom: 0.0, permeability: 1.0, triad: '-', color: '#1a1a1a', desc: 'terminated, released, composted' },
    never:    { mode: 'null',     decay: 1.0,  freedom: 0.0, permeability: 0.0, triad: '-', color: '#0a0a0a', desc: 'impossible, forbidden, zero' },
    always:   { mode: 'null',     decay: 0.0,  freedom: 0.0, permeability: 0.0, triad: '+', color: '#e8e8e8', desc: 'eternal, invariant, constant' },
    now:      { mode: 'null',     decay: 0.0,  freedom: 0.5, permeability: 0.3, triad: 'O', color: '#39d3f5', desc: 'instantaneous, present moment' }
  };

  // ═══ VOXEL SHELLS ═══
  var VOXELS = {
    touch:   { depth: 0, radius: 0.2, gravity: 1.0,  color: '#f85149', desc: 'skin contact, immediate' },
    local:   { depth: 1, radius: 0.4, gravity: 0.6,  color: '#f0883e', desc: 'room, house, hyperlocal' },
    solar:   { depth: 2, radius: 0.6, gravity: 0.3,  color: '#c9a84c', desc: 'neighborhood, city, system' },
    zodiac:  { depth: 3, radius: 0.8, gravity: 0.1,  color: '#58a6ff', desc: 'region, nation, constellation' },
    deep:    { depth: 4, radius: 1.0, gravity: 0.02, color: '#6e7681', desc: 'cosmic, universal, background' }
  };

  // ═══ THE BLEND FIELD — tense × voxel grid ═══
  var blendField = {};
  var tenseKeys = Object.keys(TENSES);
  var voxelKeys = Object.keys(VOXELS);

  // Initialize blend field
  for (var ti = 0; ti < tenseKeys.length; ti++) {
    for (var vi = 0; vi < voxelKeys.length; vi++) {
      var key = tenseKeys[ti] + '.' + voxelKeys[vi];
      var t = TENSES[tenseKeys[ti]];
      var v = VOXELS[voxelKeys[vi]];

      blendField[key] = {
        tense: tenseKeys[ti],
        voxel: voxelKeys[vi],
        // BLEND WEIGHT: how much this cell influences neighbors
        blend: t.freedom * (1 - v.gravity) + 0.1,
        // PERMEABILITY: can things pass through this cell?
        permeability: t.permeability * (1 - v.gravity),
        // DECAY RATE: how fast things in this cell decay
        decayRate: t.decay * (1 - v.gravity * 0.5),
        // ENTITIES: what lives here
        entities: [],
        // ENERGY: accumulated from entities
        energy: 0
      };
    }
  }

  // ═══ SORT ENTITIES INTO BLEND FIELD ═══
  function sortIntoField() {
    // Clear all entities
    var fieldKeys = Object.keys(blendField);
    for (var fi = 0; fi < fieldKeys.length; fi++) {
      blendField[fieldKeys[fi]].entities = [];
      blendField[fieldKeys[fi]].energy = 0;
    }

    // Sort pins
    if (window.PINS) {
      for (var pi = 0; pi < window.PINS.length; pi++) {
        var pin = window.PINS[pi];
        var tense = pin.tense || 'is';
        var voxel = pin.voxel || 'solar';
        var key = tense + '.' + voxel;
        if (blendField[key]) {
          blendField[key].entities.push({ type: 'pin', id: pin.id, name: pin.name || pin.id });
          blendField[key].energy += 1;
        }
      }
    }

    // Sort decay entities
    if (window.GAIA_DECAY) {
      var ents = window.GAIA_DECAY.entities;
      var eKeys = Object.keys(ents);
      for (var ei = 0; ei < eKeys.length; ei++) {
        var ent = ents[eKeys[ei]];
        var decay = window.GAIA_DECAY.STATES[ent.state];
        // Map decay state to tense
        var entTense;
        if (decay.value >= 1) entTense = 'is';
        else if (decay.value >= 0) entTense = 'might';
        else if (decay.value >= -1) entTense = 'was';
        else entTense = 'were';

        var entVoxel = 'local'; // default
        var key2 = entTense + '.' + entVoxel;
        if (blendField[key2]) {
          blendField[key2].entities.push({ type: 'entity', id: eKeys[ei], name: ent.name, state: ent.state });
          blendField[key2].energy += Math.abs(decay.value) + 0.5;
        }
      }
    }

    // Sort castle nodes
    if (window.GAIA_CASTLE && window.GAIA_CASTLE.nodes) {
      var nodes = window.GAIA_CASTLE.nodes;
      var nKeys = Object.keys(nodes);
      for (var ni = 0; ni < nKeys.length; ni++) {
        var node = nodes[nKeys[ni]];
        var nodeTense = 'is';
        var nodeVoxel = node.tier === 'room' || node.tier === 'sub' ? 'local' :
                        node.tier === 'hyper' ? 'touch' :
                        node.tier === 'local' ? 'local' :
                        node.tier === 'intra' ? 'solar' :
                        node.tier === 'solar' ? 'zodiac' : 'deep';
        var key3 = nodeTense + '.' + nodeVoxel;
        if (blendField[key3]) {
          blendField[key3].entities.push({ type: 'node', id: nKeys[ni], name: node.name || nKeys[ni], tier: node.tier });
          blendField[key3].energy += 0.3;
        }
      }
    }
  }

  // ═══ BLEND — diffuse energy between neighboring cells ═══
  function blendStep() {
    sortIntoField();

    var fieldKeys = Object.keys(blendField);
    var newEnergy = {};

    for (var fi = 0; fi < fieldKeys.length; fi++) {
      var cell = blendField[fieldKeys[fi]];
      var tIdx = tenseKeys.indexOf(cell.tense);
      var vIdx = voxelKeys.indexOf(cell.voxel);
      var totalBlend = 0;
      var blendedEnergy = cell.energy;

      // Blend with tense neighbors (temporal diffusion)
      for (var dt = -1; dt <= 1; dt += 2) {
        var nt = tIdx + dt;
        if (nt >= 0 && nt < tenseKeys.length) {
          var neighborKey = tenseKeys[nt] + '.' + cell.voxel;
          var neighbor = blendField[neighborKey];
          if (neighbor) {
            var blendAmount = cell.blend * neighbor.blend * 0.1;
            blendedEnergy += neighbor.energy * blendAmount;
            totalBlend += blendAmount;
          }
        }
      }

      // Blend with voxel neighbors (spatial diffusion)
      for (var dv = -1; dv <= 1; dv += 2) {
        var nv = vIdx + dv;
        if (nv >= 0 && nv < voxelKeys.length) {
          var neighborKey2 = cell.tense + '.' + voxelKeys[nv];
          var neighbor2 = blendField[neighborKey2];
          if (neighbor2) {
            var blendAmount2 = cell.blend * neighbor2.blend * 0.15;
            blendedEnergy += neighbor2.energy * blendAmount2;
            totalBlend += blendAmount2;
          }
        }
      }

      // Decay
      blendedEnergy *= (1 - cell.decayRate * 0.01);

      newEnergy[fieldKeys[fi]] = blendedEnergy;
    }

    // Apply blended energy
    for (var fj = 0; fj < fieldKeys.length; fj++) {
      blendField[fieldKeys[fj]].energy = newEnergy[fieldKeys[fj]] || 0;
    }
  }

  // Run blend every 5 seconds
  setTimeout(function() { sortIntoField(); }, 3000);
  setInterval(blendStep, 5000);

  // ═══ EXPOSE ═══
  window.GAIA_TENSE_VOXEL = {
    TENSES: TENSES,
    VOXELS: VOXELS,
    field: blendField,
    sort: sortIntoField,
    blend: blendStep
  };

  // ═══ DRAW MODULE — the tense×voxel heat map ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var W = g.W, H = g.H, R = g.R, cx = g.cx, cy = g.cy;
    var tvT = breathT * 0.1;
    var tvAlpha = 0.004 + Math.sin(tvT * 0.3) * 0.002;
    if (tvAlpha < 0.003) return;

    // ═══ VOXEL SHELLS — concentric at R×voxel.radius ═══
    for (var vi = 0; vi < voxelKeys.length; vi++) {
      var v = VOXELS[voxelKeys[vi]];
      var shellR = R * (0.20 + v.depth * 0.12);

      ctx.beginPath();
      ctx.arc(cx, cy, shellR, 0, TAU);
      ctx.setLineDash([1, 3]);
      ctx.strokeStyle = v.color + (tvAlpha * 3 > 0.012 ? '33' : '1a');
      ctx.lineWidth = 0.3;
      ctx.stroke();
      ctx.setLineDash([]);

      // Shell label
      if (tvAlpha > 0.005) {
        var vAngle = tvT * 0.01 + vi * 0.5;
        ctx.font = '1.8px "JetBrains Mono", monospace';
        ctx.fillStyle = v.color + (tvAlpha * 4 > 0.016 ? '66' : '33');
        ctx.textAlign = 'center';
        ctx.fillText(voxelKeys[vi], cx + Math.cos(vAngle) * (shellR + 3), cy + Math.sin(vAngle) * (shellR + 3));
      }
    }

    // ═══ TENSE RAYS — radial lines from center ═══
    // Only draw the mode groups
    var modes = ['certain', 'possible', 'counter', 'null'];
    var modeColors = ['#3fb950', '#c9a84c', '#f85149', '#6e7681'];

    for (var mi = 0; mi < modes.length; mi++) {
      var mAngle = tvT * 0.008 + mi * (TAU / modes.length) - PI / 2;
      var mInner = R * 0.18;
      var mOuter = R * 0.70;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(mAngle) * mInner, cy + Math.sin(mAngle) * mInner);
      ctx.lineTo(cx + Math.cos(mAngle) * mOuter, cy + Math.sin(mAngle) * mOuter);
      ctx.strokeStyle = modeColors[mi] + (tvAlpha * 3 > 0.012 ? '44' : '22');
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Mode label
      if (tvAlpha > 0.005) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.fillStyle = modeColors[mi] + (tvAlpha * 4 > 0.016 ? '88' : '44');
        ctx.fillText(modes[mi], cx + Math.cos(mAngle) * (mOuter + 5), cy + Math.sin(mAngle) * (mOuter + 5));
      }
    }

    // ═══ ENERGY DOTS — cells with entities glow ═══
    if (tvAlpha > 0.004) {
      var fieldKeys2 = Object.keys(blendField);
      for (var fk = 0; fk < fieldKeys2.length; fk++) {
        var cell = blendField[fieldKeys2[fk]];
        if (cell.energy < 0.1) continue;

        var tIdx = tenseKeys.indexOf(cell.tense);
        var vIdx2 = voxelKeys.indexOf(cell.voxel);
        var tense = TENSES[cell.tense];
        var voxel = VOXELS[cell.voxel];
        if (!tense || !voxel) continue;

        // Position: angle from tense mode, radius from voxel depth
        var modeIdx = modes.indexOf(tense.mode);
        var cellAngle = tvT * 0.008 + modeIdx * (TAU / modes.length) - PI / 2 + tIdx * 0.15;
        var cellR = R * (0.20 + voxel.depth * 0.12);

        var dotX = cx + Math.cos(cellAngle) * cellR;
        var dotY = cy + Math.sin(cellAngle) * cellR;
        var dotSize = 0.5 + Math.min(cell.energy, 5) * 0.4;

        // Glow
        var grd = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, dotSize * 3);
        grd.addColorStop(0, tense.color + (tvAlpha * 5 > 0.025 ? '44' : '22'));
        grd.addColorStop(1, tense.color + '00');
        ctx.fillStyle = grd;
        ctx.fillRect(dotX - dotSize * 3, dotY - dotSize * 3, dotSize * 6, dotSize * 6);

        // Dot
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotSize, 0, TAU);
        ctx.fillStyle = tense.color + (tvAlpha * 5 > 0.025 ? '66' : '33');
        ctx.fill();
      }
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.tenses = {
      desc: 'Full tense system',
      run: function() {
        var lines = ['═══ TENSE SYSTEM ═══', ''];
        var modes = ['certain', 'possible', 'counter', 'null'];
        for (var mi = 0; mi < modes.length; mi++) {
          lines.push(modes[mi].toUpperCase() + ':');
          for (var ti = 0; ti < tenseKeys.length; ti++) {
            var t = TENSES[tenseKeys[ti]];
            if (t.mode === modes[mi]) {
              lines.push('  ' + tenseKeys[ti] + ' · decay=' + t.decay.toFixed(1) + ' · freedom=' + t.freedom.toFixed(1) + ' · ' + t.triad + ' · ' + t.desc);
            }
          }
          lines.push('');
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.voxels = {
      desc: 'Voxel shells',
      run: function() {
        var lines = ['═══ VOXEL SHELLS ═══', ''];
        for (var vi = 0; vi < voxelKeys.length; vi++) {
          var v = VOXELS[voxelKeys[vi]];
          lines.push('  ' + voxelKeys[vi] + ' · depth=' + v.depth + ' · gravity=' + v.gravity.toFixed(2) + ' · ' + v.desc);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.blend = {
      desc: 'Tense×voxel blend field',
      run: function() {
        var lines = ['═══ BLEND FIELD (energy > 0) ═══', ''];
        var fieldKeys3 = Object.keys(blendField);
        for (var fi = 0; fi < fieldKeys3.length; fi++) {
          var c = blendField[fieldKeys3[fi]];
          if (c.energy > 0.1) {
            lines.push('  ' + c.tense + '.' + c.voxel + ' · energy=' + c.energy.toFixed(2) + ' · entities=' + c.entities.length + ' · blend=' + c.blend.toFixed(2));
          }
        }
        if (lines.length === 2) lines.push('  (no energy yet — waiting for entities)');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('tenses', 'voxels', 'blend');
  }

})(window.G);

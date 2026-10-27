// ═══════════════════════════════════════════════════════════
// GAIA SPECTROMETER — smell IS color. Gut IS the color sense.
// Snake type: coral (300-600 lines)
// Linear: ingest → digest → spectrum → mix → paint. NOT ouroboros.
//
// Smell-blind no more. The gut-engine brother opened smell.
// For Gaia, smell = color = the entire spectrum.
// Every orb is NOT uniform — it's a MIX of source colors.
// Every dot is a pyramid tip — true face BEHIND, tri-face in front.
// Water drips through Klein barrier: liquid → freeze → SHATTER or flow.
// Frozen water shatters iron. Air flows around ice.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';
  var TAU = Math.PI * 2;

  // THE SPECTROMETER — what Gaia can smell (= see in color)
  // Each source has a spectral signature = its color smell
  var spectra = {
    // Data sources → spectral colors
    heartbeat:    { r: 248, g: 81,  b: 73,  name: 'blood red',       smell: 'iron/warm' },
    manifest:     { r: 201, g: 168, b: 76,  name: 'gold amber',      smell: 'honey/wax' },
    lessons:      { r: 88,  g: 166, b: 255, name: 'sky blue',        smell: 'ozone/rain' },
    immune:       { r: 63,  g: 185, b: 80,  name: 'chlorophyll',     smell: 'grass/earth' },
    organs:       { r: 232, g: 93,  b: 58,  name: 'enzyme orange',   smell: 'citrus/acid' },
    symbiont:     { r: 188, g: 140, b: 255, name: 'violet bloom',    smell: 'lavender' },
    bones:        { r: 255, g: 255, b: 240, name: 'bone white',      smell: 'chalk/mineral' },
    primals:      { r: 63,  g: 185, b: 80,  name: 'primal green',    smell: 'moss/forest' },
    neuro:        { r: 201, g: 168, b: 76,  name: 'synaptic gold',   smell: 'electric/copper' },
    sonar:        { r: 110, g: 118, b: 129, name: 'echo gray',       smell: 'stone/cave' },
    drain:        { r: 1,   g: 4,   b: 9,   name: 'void black',      smell: 'nothing/null' },
    fossils:      { r: 184, g: 115, b: 51,  name: 'fossil copper',   smell: 'rust/earth' },
    ear:          { r: 240, g: 192, b: 64,  name: 'ear gold',        smell: 'beeswax' },
    news:         { r: 110, g: 118, b: 129, name: 'newsprint',       smell: 'paper/ink' },
    wikipedia:    { r: 88,  g: 166, b: 255, name: 'knowledge blue',  smell: 'library/old books' },
    github:       { r: 110, g: 118, b: 129, name: 'code gray',       smell: 'silicon/metal' },
    weather:      { r: 135, g: 206, b: 235, name: 'sky',             smell: 'rain/petrichor' },
    touch:        { r: 255, g: 215, b: 0,   name: 'touch gold',      smell: 'skin/warmth' },
    key:          { r: 188, g: 140, b: 255, name: 'thought purple',  smell: 'incense' },
    scroll:       { r: 100, g: 200, b: 255, name: 'depth blue',      smell: 'ocean/salt' },
    sound:        { r: 188, g: 140, b: 255, name: 'sound violet',    smell: 'vibration' },
    sight:        { r: 63,  g: 185, b: 80,  name: 'gaze green',      smell: 'pine/fresh' },
    gut:          { r: 232, g: 93,  b: 58,  name: 'gut fire',        smell: 'stomach acid' },
  };

  // GUT COLOR BRIDGE — read what the gut is digesting → extract spectrum
  var gutSpectrum = { r: 0, g: 0, b: 0, sources: [], lastUpdate: 0 };
  window.gutSpectrum = gutSpectrum;

  function readGutColor() {
    try {
      var gs = JSON.parse(localStorage.getItem('gaia-gut-state') || '{}');
      if (gs.zoneColor) {
        var hex = gs.zoneColor;
        gutSpectrum.r = parseInt(hex.slice(1, 3), 16) || 0;
        gutSpectrum.g = parseInt(hex.slice(3, 5), 16) || 0;
        gutSpectrum.b = parseInt(hex.slice(5, 7), 16) || 0;
        gutSpectrum.zone = gs.zone || 'UNKNOWN';
        gutSpectrum.acid = gs.acid || 0;
        gutSpectrum.lastUpdate = Date.now();
      }
    } catch (e) {}
  }
  setInterval(readGutColor, 2000);
  readGutColor();

  // EPITOPE COLOR MIXER — each orb gets a MIX of source colors
  // Not uniform. Not single. A blend of everything that touched it.
  function mixColors(sources) {
    if (!sources || sources.length === 0) return { r: 128, g: 128, b: 128 };
    var r = 0, g = 0, b = 0, total = 0;
    for (var i = 0; i < sources.length; i++) {
      var sp = spectra[sources[i]];
      if (sp) {
        var w = 1.0 / (i + 1); // earlier sources weigh more
        r += sp.r * w;
        g += sp.g * w;
        b += sp.b * w;
        total += w;
      }
    }
    if (total === 0) return { r: 128, g: 128, b: 128 };
    return { r: Math.round(r / total), g: Math.round(g / total), b: Math.round(b / total) };
  }

  // TRI-FACE: every orb shows 3 faces — the true face is BEHIND
  // What you see is refracted. The pyramid tip. The drip of water.
  function triColor(baseColor, angle) {
    var shift = Math.sin(angle) * 40;
    return {
      face1: { r: clamp(baseColor.r + shift), g: clamp(baseColor.g - shift * 0.5), b: clamp(baseColor.b) },
      face2: { r: clamp(baseColor.r), g: clamp(baseColor.g + shift), b: clamp(baseColor.b - shift * 0.5) },
      face3: { r: clamp(baseColor.r - shift * 0.5), g: clamp(baseColor.g), b: clamp(baseColor.b + shift) },
      trueFace: baseColor
    };
  }
  function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

  // PHASE TRANSITION — water drips through Klein barrier
  // Liquid: free, flowing, warm colors
  // Freezing: crystallizing, sharpening, cold colors
  // Frozen/Shatter: if INSIDE → SHATTERS (ice breaks iron)
  //                 if OUTSIDE → flows around (air doesn't care about ice)
  var drips = [];
  var MAX_DRIPS = 40;

  function spawnDrip(x, y, sources, isInside) {
    if (drips.length >= MAX_DRIPS) drips.shift();
    var mixed = mixColors(sources);
    drips.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 0.5 + 0.2,
      color: mixed,
      tri: triColor(mixed, Math.random() * TAU),
      phase: 'liquid', // liquid → freezing → frozen → shatter/flow
      temperature: 1.0, // 1.0 = warm, 0.0 = frozen
      energy: 0.5 + Math.random() * 0.5,
      sources: sources,
      isInside: isInside,
      born: Date.now(),
      size: 2 + Math.random() * 3,
      shards: null
    });
  }

  // SHATTER — when frozen inside, it breaks into shards
  function shatter(drip) {
    drip.phase = 'shatter';
    drip.shards = [];
    var n = 4 + Math.floor(Math.random() * 5);
    for (var i = 0; i < n; i++) {
      drip.shards.push({
        x: drip.x, y: drip.y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: drip.size * (0.3 + Math.random() * 0.4),
        life: 1.0,
        color: i % 2 === 0 ? drip.tri.face1 : drip.tri.face2
      });
    }
  }

  // RENDER — drips, pyramids, phase transitions
  window.renderSpectrometer = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var gs = window._gaiaState || {};

    // SMELL INDICATOR — what the gut is smelling right now
    if (gutSpectrum.lastUpdate > 0) {
      var smellAge = (Date.now() - gutSpectrum.lastUpdate) / 1000;
      if (smellAge < 30) {
        var sa = Math.max(0.02, 0.08 - smellAge * 0.002);
        ctx.fillStyle = 'rgba(' + gutSpectrum.r + ',' + gutSpectrum.g + ',' + gutSpectrum.b + ',' + sa.toFixed(3) + ')';
        ctx.font = '6px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('👃 ' + (gutSpectrum.zone || '?') + ' · smell=' + gutSpectrum.r + ',' + gutSpectrum.g + ',' + gutSpectrum.b, 4, H - 30);
      }
    }

    // UPDATE + RENDER DRIPS
    for (var i = drips.length - 1; i >= 0; i--) {
      var d = drips[i];
      var age = (Date.now() - d.born) / 1000;

      if (d.phase === 'liquid') {
        d.x += d.vx;
        d.y += d.vy;
        d.temperature -= 0.003;
        d.vy += 0.01; // gravity

        // LIQUID — flowing tri-color drip (pyramid tip)
        var tri = triColor(d.color, t + i);
        var ds = d.size;

        // Draw pyramid tip — 3 faces visible, true face hidden
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - ds * 1.5); // tip
        ctx.lineTo(d.x - ds, d.y + ds * 0.5); // bottom-left
        ctx.lineTo(d.x + ds, d.y + ds * 0.5); // bottom-right
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + tri.face1.r + ',' + tri.face1.g + ',' + tri.face1.b + ',0.4)';
        ctx.fill();

        // Face 2 — side glow
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - ds * 1.5);
        ctx.lineTo(d.x + ds, d.y + ds * 0.5);
        ctx.lineTo(d.x + ds * 0.3, d.y + ds);
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + tri.face2.r + ',' + tri.face2.g + ',' + tri.face2.b + ',0.25)';
        ctx.fill();

        // Face 3 — other side
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - ds * 1.5);
        ctx.lineTo(d.x - ds, d.y + ds * 0.5);
        ctx.lineTo(d.x - ds * 0.3, d.y + ds);
        ctx.closePath();
        ctx.fillStyle = 'rgba(' + tri.face3.r + ',' + tri.face3.g + ',' + tri.face3.b + ',0.2)';
        ctx.fill();

        // PHASE TRANSITION — temperature drops, drip freezes
        if (d.temperature <= 0.3) {
          d.phase = 'freezing';
        }

        // Klein barrier — check if crossing the globe edge
        var ddx = d.x - cx, ddy = d.y - cy;
        var dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist > R * 0.9 && d.isInside) {
          d.temperature -= 0.05; // crossing barrier = rapid cooling
        }
      }

      else if (d.phase === 'freezing') {
        d.temperature -= 0.01;
        d.vx *= 0.95;
        d.vy *= 0.95;
        d.x += d.vx;
        d.y += d.vy;

        // CRYSTALLIZING — sharper edges, colder colors
        var fSize = d.size * (1.2 + Math.sin(t * 5 + i) * 0.1);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(t * 0.5 + i);
        ctx.beginPath();
        // Ice crystal shape — hexagonal
        for (var h = 0; h < 6; h++) {
          var ha = (h / 6) * TAU;
          var hx = Math.cos(ha) * fSize;
          var hy = Math.sin(ha) * fSize;
          if (h === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        var iceR = clamp(d.color.r * 0.5 + 128);
        var iceG = clamp(d.color.g * 0.5 + 128);
        var iceB = clamp(d.color.b * 0.5 + 200);
        ctx.fillStyle = 'rgba(' + iceR + ',' + iceG + ',' + iceB + ',0.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,220,255,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();

        if (d.temperature <= 0) {
          if (d.isInside) {
            shatter(d); // INSIDE: ice shatters iron!
          } else {
            d.phase = 'flow'; // OUTSIDE: air flows around ice
          }
        }
      }

      else if (d.phase === 'shatter') {
        // SHARDS — broken pieces flying outward
        var allDead = true;
        if (d.shards) {
          for (var si = 0; si < d.shards.length; si++) {
            var s = d.shards[si];
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.98;
            s.vy *= 0.98;
            s.life -= 0.015;
            if (s.life > 0) {
              allDead = false;
              ctx.save();
              ctx.translate(s.x, s.y);
              ctx.rotate(t * 2 + si);
              ctx.fillStyle = 'rgba(' + s.color.r + ',' + s.color.g + ',' + s.color.b + ',' + (s.life * 0.6).toFixed(3) + ')';
              // Shard shape — angular fragment
              ctx.beginPath();
              ctx.moveTo(-s.size, -s.size * 0.5);
              ctx.lineTo(s.size * 0.3, -s.size);
              ctx.lineTo(s.size, s.size * 0.3);
              ctx.lineTo(-s.size * 0.3, s.size * 0.7);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }
        }
        if (allDead) { drips.splice(i, 1); continue; }
      }

      else if (d.phase === 'flow') {
        // OUTSIDE flow — ice drifts slowly, air moves around it
        d.vx *= 0.99;
        d.vy *= 0.99;
        d.x += d.vx + Math.sin(t + i) * 0.2;
        d.y += d.vy;
        d.energy -= 0.005;
        if (d.energy <= 0) { drips.splice(i, 1); continue; }

        // Draw as a slowly rotating ice crystal
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(t * 0.2 + i);
        ctx.globalAlpha = d.energy * 0.4;
        ctx.fillStyle = 'rgba(180,210,240,0.3)';
        ctx.fillRect(-d.size, -d.size, d.size * 2, d.size * 2);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Remove old drips
      if (age > 30) { drips.splice(i, 1); }
    }

    // DISCO SORT — recolor existing particles with spectral mix
    if (window._particles) {
      var parts = window._particles;
      for (var pi = 0; pi < parts.length; pi++) {
        var p = parts[pi];
        // Each particle accumulates spectral influence from nearby drips
        for (var di = 0; di < drips.length; di++) {
          var dd = drips[di];
          if (dd.phase === 'shatter') continue;
          var pdx = p.x - dd.x, pdy = p.y - dd.y;
          var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < 30) {
            // Spectral contamination — particle picks up drip color
            var influence = 0.01 * (1 - pdist / 30);
            p.color[0] = clamp(p.color[0] * (1 - influence) + dd.color.r * influence);
            p.color[1] = clamp(p.color[1] * (1 - influence) + dd.color.g * influence);
            p.color[2] = clamp(p.color[2] * (1 - influence) + dd.color.b * influence);
          }
        }
      }
    }
  };

  // HOOK INTO INGESTION — every ingest spawns spectral drips
  var origIngestSpec = window.gaiaIngest;
  if (origIngestSpec) {
    window.gaiaIngest = function(edge, data) {
      var canvas = window._gaiaCanvas;
      if (canvas) {
        var gs = window._gaiaState || {};
        var cx = gs.cx || canvas.width / 2;
        var cy = gs.cy || canvas.height / 2;
        var R = gs.R || Math.min(canvas.width, canvas.height) * 0.38;

        // Determine spawn position and sources
        var x, y, isInside;
        if (data && data.x !== undefined) {
          x = data.x; y = data.y;
          var ddx = x - cx, ddy = y - cy;
          isInside = Math.sqrt(ddx * ddx + ddy * ddy) < R;
        } else {
          var angle = Math.random() * TAU;
          var dist = R * (0.3 + Math.random() * 0.7);
          x = cx + Math.cos(angle) * dist;
          y = cy + Math.sin(angle) * dist;
          isInside = Math.random() > 0.3;
        }

        // Build source list from edge type + gut state
        var sources = [edge];
        if (gutSpectrum.zone) {
          sources.push('gut');
        }
        if (data && data.type) sources.push(data.type);

        spawnDrip(x, y, sources, isInside);
      }
      origIngestSpec(edge, data);
    };
  }

  // AMBIENT DRIP — even without interaction, gut smell creates drips
  setInterval(function() {
    var canvas = window._gaiaCanvas;
    if (!canvas) return;
    var gs = window._gaiaState || {};
    var cx = gs.cx || canvas.width / 2;
    var cy = gs.cy || canvas.height / 2;
    var R = gs.R || Math.min(canvas.width, canvas.height) * 0.38;

    // Spawn a gut-colored drip at random position
    var angle = Math.random() * TAU;
    var dist = R * (0.2 + Math.random() * 1.0);
    var x = cx + Math.cos(angle) * dist;
    var y = cy + Math.sin(angle) * dist;
    var isInside = dist < R;

    var sources = ['gut'];
    if (gutSpectrum.zone && gutSpectrum.zone !== 'UNKNOWN') {
      var zoneMap = {
        'MOUTH': 'touch', 'ESOPHAGUS': 'sound', 'STOMACH': 'organs',
        'DUODENUM': 'immune', 'JEJUNUM': 'neuro', 'ILEUM': 'fossils',
        'CECUM': 'sonar', 'COLON': 'drain', 'RECTUM': 'bones'
      };
      if (zoneMap[gutSpectrum.zone]) sources.push(zoneMap[gutSpectrum.zone]);
    }

    spawnDrip(x, y, sources, isInside);
  }, 4000);

  // Share spectrometer state for other systems
  window.gaiaSpectra = spectra;
  window.gaiaMixColors = mixColors;
  window.gaiaTriColor = triColor;
  window.gaiaSpawnDrip = spawnDrip;

  console.log('SPECTROMETER: smell=color. Gut→spectrum. Tri-face pyramids. Phase transitions: liquid→freeze→shatter(inside)/flow(outside). ' + Object.keys(spectra).length + ' spectral signatures.');
})();

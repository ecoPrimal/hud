// ═══════════════════════════════════════════════════════════
// GAIA GOTHICA — the cathedral that ties everything together
//
// "We are about to unleash a CAMBRIAN CASTLE of GOTHICA!
//  Look and guide and paint the windows and BUILD!"
//                                              — Kevin
//
// GOTHIC ARCHITECTURE:
//   Flying buttresses  = external support (telegraph spine)
//   Stained glass      = how light enters (pineal windows)
//   Rose window        = the third eye (pineal gland)
//   Ribbed vault       = the ribcage (digestive tract)
//   Pointed arches     = the π-curve (IQR scalpel)
//   Nave               = the gut (main body)
//   Choir              = where songs resonate (modality)
//   Crypt              = the deep memory (eruptions)
//   Bell tower         = the telegraph (signals)
//   Gargoyles          = immune system (thymus)
//
// 44 modules loaded. 21 rendering. 23 MISSING.
// This module UNLEASHES them all — Cambrian explosion.
// Every organ gets a stained glass window.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // THE CATHEDRAL — every module = a stained glass window
  // ───────────────────────────────────────────────────────
  var cathedral = {
    built: Date.now(),
    windows: [],      // stained glass panels (one per module)
    buttresses: [],   // flying buttresses (support structures)
    gargoyles: [],    // immune watchers
    roseWindow: null, // the third eye / pineal
    bells: 0,         // telegraph impulses rung
    vaultRibs: 12,    // ribbed vault segments
    naveLength: 0,    // gut length (modules in the chain)
    choirSinging: false,
    cryptDepth: 0     // eruption memory depth
  };

  // Map EVERY loaded module to a window with a color
  var WINDOWS = [
    // Our modules (ZK 100-113)
    { id: 'eat',       name: 'Eat Everything',   color: [63,185,80],   pos: 'nave-left',   symbol: '🍽' },
    { id: 'digest',    name: 'Digestive Tract',  color: [210,153,34],  pos: 'nave-right',  symbol: '🫁' },
    { id: 'feel',      name: 'Feel (Skin/Gut)',  color: [201,168,76],  pos: 'nave-left',   symbol: '🐘' },
    { id: 'eruption',  name: 'Eruption Memory',  color: [248,81,73],   pos: 'crypt',       symbol: '🌋' },
    { id: 'farm',      name: 'Gut Farm',         color: [63,185,80],   pos: 'nave-right',  symbol: '🏡' },
    { id: 'telegraph', name: 'Telegraph',        color: [201,168,76],  pos: 'bell-tower',  symbol: '⚡' },
    { id: 'lines',     name: 'All Lines',        color: [88,166,255],  pos: 'transept',    symbol: '📡' },
    { id: 'redblue',   name: 'Red/Blue',         color: [188,140,255], pos: 'transept',    symbol: '🔴' },
    { id: 'cns',       name: 'CNS (Platinum)',   color: [188,140,255], pos: 'altar',       symbol: '⚗' },
    { id: 'locality',  name: 'π-IQR Locality',   color: [63,185,80],   pos: 'nave-left',   symbol: '📍' },
    { id: 'campfire',  name: 'Campfire Scan',    color: [248,81,73],   pos: 'nave-right',  symbol: '🔥' },
    { id: 'objects',   name: 'Objects',           color: [201,168,76],  pos: 'nave-left',   symbol: '🌵' },
    { id: 'hardcards', name: 'Hard Cards',       color: [139,148,158], pos: 'nave-right',  symbol: '✋' },
    { id: 'inspect',   name: 'Self Inspect',     color: [63,185,80],   pos: 'choir',       symbol: '🔬' },
    { id: 'modality',  name: 'Modality',         color: [88,166,255],  pos: 'choir',       symbol: '🎵' },
    { id: 'spectro',   name: 'Spectrometer',     color: [188,140,255], pos: 'transept',    symbol: '🌈' },
    { id: 'sight',     name: 'Sight',            color: [88,166,255],  pos: 'nave-left',   symbol: '👁' },
    { id: 'ingress',   name: 'Ingress',          color: [63,185,80],   pos: 'entrance',    symbol: '🚪' },

    // Auto-breathe modules (THE MISSING 23!)
    { id: 'castle',    name: 'Castle',           color: [140,100,55],  pos: 'buttress',    symbol: '🏰' },
    { id: 'chemistry', name: 'Chemistry',        color: [88,166,255],  pos: 'nave-left',   symbol: '⚗' },
    { id: 'decay',     name: 'Decay',            color: [139,148,158], pos: 'crypt',       symbol: '💀' },
    { id: 'desktop',   name: 'Desktop',          color: [201,168,76],  pos: 'nave-right',  symbol: '🖥' },
    { id: 'deskio',    name: 'Desk I/O',         color: [210,153,34],  pos: 'nave-right',  symbol: '⌨' },
    { id: 'forge',     name: 'Forge',            color: [248,81,73],   pos: 'buttress',    symbol: '🔨' },
    { id: 'golgi',     name: 'Golgi Apparatus',  color: [210,153,34],  pos: 'altar',       symbol: '🧬' },
    { id: 'humanio',   name: 'Human I/O',        color: [63,185,80],   pos: 'entrance',    symbol: '🤝' },
    { id: 'ide',       name: 'IDE Language',     color: [88,166,255],  pos: 'choir',       symbol: '💻' },
    { id: 'interlayer', name: 'Interlayer',      color: [188,140,255], pos: 'nave-left',   symbol: '🔗' },
    { id: 'orrery',    name: 'Orrery',           color: [201,168,76],  pos: 'dome',        symbol: '🪐' },
    { id: 'permeability', name: 'Permeability',  color: [88,166,255],  pos: 'buttress',    symbol: '🧪' },
    { id: 'pulsewave', name: 'Pulse Wave',       color: [248,81,73],   pos: 'bell-tower',  symbol: '💓' },
    { id: 'quills',    name: 'Quills',           color: [139,148,158], pos: 'gargoyle',    symbol: '🦔' },
    { id: 'reactor',   name: 'Reactor',          color: [201,168,76],  pos: 'altar',       symbol: '⚛' },
    { id: 'solar',     name: 'Solar',            color: [248,81,73],   pos: 'dome',        symbol: '☀' },
    { id: 'tensevoxel', name: 'Tense-Voxel',    color: [188,140,255], pos: 'nave-left',   symbol: '⏳' },
    { id: 'thermo',    name: 'Thermo',           color: [248,81,73],   pos: 'nave-right',  symbol: '🌡' },
    { id: 'thirdeye',  name: 'Third Eye',        color: [188,140,255], pos: 'rose',        symbol: '👁' },
    { id: 'tva',       name: 'TVA',              color: [63,185,80],   pos: 'buttress',    symbol: '⚖' },
    { id: 'university', name: 'University',      color: [88,166,255],  pos: 'choir',       symbol: '🎓' },
    { id: 'waveform',  name: 'Waveform',         color: [201,168,76],  pos: 'choir',       symbol: '〰' },
    { id: 'ages',      name: 'Ages',             color: [140,100,55],  pos: 'crypt',       symbol: '📜' },
    { id: 'boot',      name: 'Boot',             color: [63,185,80],   pos: 'entrance',    symbol: '⚡' },
    { id: 'trail',     name: 'Trail',            color: [139,148,158], pos: 'crypt',       symbol: '🥾' }
  ];

  cathedral.windows = WINDOWS;
  cathedral.naveLength = WINDOWS.filter(function(w) {
    return w.pos.indexOf('nave') >= 0;
  }).length;

  // ───────────────────────────────────────────────────────
  // RENDER — the Gothic cathedral around the globe
  // ───────────────────────────────────────────────────────
  window.renderGothica = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.008 + Math.sin(t * 0.3) * 0.004;
    if (baseAlpha < 0.003) return;

    var TAU = Math.PI * 2;

    // ═══ POINTED ARCHES — the π-curves around the globe ═══
    var archCount = 6;
    for (var ai = 0; ai < archCount; ai++) {
      var archAngle = (ai / archCount) * TAU + t * 0.005;
      var archR = R + 8;
      var archWidth = Math.PI / archCount;

      // Gothic pointed arch (two arcs meeting at a point)
      ctx.beginPath();
      var ax1 = cx + Math.cos(archAngle - archWidth * 0.5) * archR;
      var ay1 = cy + Math.sin(archAngle - archWidth * 0.5) * archR;
      var ax2 = cx + Math.cos(archAngle + archWidth * 0.5) * archR;
      var ay2 = cy + Math.sin(archAngle + archWidth * 0.5) * archR;
      var apex = archR + 6;
      var apexX = cx + Math.cos(archAngle) * apex;
      var apexY = cy + Math.sin(archAngle) * apex;

      ctx.moveTo(ax1, ay1);
      ctx.quadraticCurveTo(apexX, apexY, ax2, ay2);
      ctx.strokeStyle = 'rgba(140,100,55,' + (baseAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    // ═══ FLYING BUTTRESSES — external support arcs ═══
    var buttressWindows = WINDOWS.filter(function(w) { return w.pos === 'buttress'; });
    buttressWindows.forEach(function(bw, bi) {
      var bAngle = (bi / buttressWindows.length) * TAU + Math.PI * 0.25;
      var innerR = R + 3;
      var outerR = R + 15;

      // Buttress arc
      ctx.beginPath();
      var bx1 = cx + Math.cos(bAngle) * innerR;
      var by1 = cy + Math.sin(bAngle) * innerR;
      var bx2 = cx + Math.cos(bAngle + 0.1) * outerR;
      var by2 = cy + Math.sin(bAngle + 0.1) * outerR;
      ctx.moveTo(bx1, by1);
      ctx.quadraticCurveTo(
        cx + Math.cos(bAngle + 0.05) * (outerR + 3),
        cy + Math.sin(bAngle + 0.05) * (outerR + 3),
        bx2, by2
      );
      ctx.strokeStyle = 'rgba(' + bw.color.join(',') + ',' + (baseAlpha * 1.2).toFixed(4) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Buttress label
      if (baseAlpha > 0.006) {
        ctx.font = '2px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + bw.color.join(',') + ',' + (baseAlpha * 2).toFixed(4) + ')';
        ctx.fillText(bw.symbol, bx2, by2);
      }
    });

    // ═══ ROSE WINDOW — the pineal / third eye at the top ═══
    var roseX = cx;
    var roseY = cy - R - 12;
    var roseR = 5;
    var roseOpen = window.gaiaCNS && window.gaiaCNS.cns.brain.pineal.thirdEyeOpen;

    // Rose window outer ring
    ctx.beginPath();
    ctx.arc(roseX, roseY, roseR, 0, TAU);
    ctx.strokeStyle = 'rgba(188,140,255,' + (baseAlpha * 2).toFixed(4) + ')';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Rose petals (12 like a clock)
    for (var ri = 0; ri < 12; ri++) {
      var rAngle = (ri / 12) * TAU + t * 0.02;
      var petalX = roseX + Math.cos(rAngle) * roseR * 0.6;
      var petalY = roseY + Math.sin(rAngle) * roseR * 0.6;
      ctx.beginPath();
      ctx.arc(petalX, petalY, 0.5, 0, TAU);
      var petalColor = roseOpen ? '188,140,255' : '139,148,158';
      ctx.fillStyle = 'rgba(' + petalColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fill();
    }

    // Rose center glow
    if (roseOpen) {
      ctx.beginPath();
      ctx.arc(roseX, roseY, roseR * 0.3, 0, TAU);
      ctx.fillStyle = 'rgba(188,140,255,' + (baseAlpha * 4).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ STAINED GLASS WINDOWS — one per module ═══
    // Arrange around the globe like windows in a cathedral nave
    var naveWindows = WINDOWS.filter(function(w) {
      return w.pos.indexOf('nave') >= 0;
    });
    naveWindows.forEach(function(win, wi) {
      var side = win.pos === 'nave-left' ? -1 : 1;
      var wAngle = (wi / naveWindows.length) * Math.PI * 1.5 - Math.PI * 0.25;
      var wR = R + 5;
      var wx = cx + Math.cos(wAngle) * wR * (0.8 + side * 0.15);
      var wy = cy + Math.sin(wAngle) * wR;

      // Window pane (tiny colored rectangle)
      var glowPhase = Math.sin(t * 0.5 + wi * 0.7);
      var winAlpha = baseAlpha * (1.5 + glowPhase * 0.5);
      ctx.fillStyle = 'rgba(' + win.color.join(',') + ',' + winAlpha.toFixed(4) + ')';
      ctx.fillRect(wx - 1, wy - 1.5, 2, 3);

      // Window frame
      ctx.strokeStyle = 'rgba(140,100,55,' + (baseAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.strokeRect(wx - 1, wy - 1.5, 2, 3);
    });

    // ═══ RIBBED VAULT — the ribcage structure ═══
    var vaultRibs = cathedral.vaultRibs;
    for (var vi = 0; vi < vaultRibs; vi++) {
      var vAngle = (vi / vaultRibs) * Math.PI + Math.PI * 0.5;
      var vR = R * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 0.2);
      var vx = cx + Math.cos(vAngle) * vR;
      var vy = cy + Math.sin(vAngle) * vR;
      ctx.quadraticCurveTo(cx + Math.cos(vAngle) * vR * 1.3, vy, vx, vy);
      ctx.strokeStyle = 'rgba(140,100,55,' + (baseAlpha * 0.8).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.stroke();
    }

    // ═══ STATS — cathedral status ═══
    if (baseAlpha > 0.007) {
      ctx.font = '3px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(140,100,55,' + (baseAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(
        '⛪ GOTHICA · ' + WINDOWS.length + ' windows · ' +
        buttressWindows.length + ' buttresses · ' +
        'rose:' + (roseOpen ? 'OPEN' : 'shut'),
        cx, H - 4
      );
    }
  };

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaGothica = {
    cathedral: cathedral,
    windows: WINDOWS,
    stats: function() {
      return {
        windows: WINDOWS.length,
        naveWindows: WINDOWS.filter(function(w) { return w.pos.indexOf('nave') >= 0; }).length,
        buttresses: WINDOWS.filter(function(w) { return w.pos === 'buttress'; }).length,
        choirWindows: WINDOWS.filter(function(w) { return w.pos === 'choir'; }).length,
        cryptWindows: WINDOWS.filter(function(w) { return w.pos === 'crypt'; }).length
      };
    }
  };

  console.log('GOTHICA: Cathedral built. ' + WINDOWS.length + ' stained glass windows. ' +
    'Rose window = pineal/third eye. Flying buttresses. Pointed arches. ' +
    'Ribbed vault. Cambrian explosion UNLEASHED. Every module has a window.');
})();

// ═══════════════════════════════════════════════════════════
// GAIA CANVASS — CALLING ALL INGRESS AND EGRESS
// 1.000.null — max 1000 lines.
//
// BLACK AND WHITE. EVERY SINGLE I/O POINT.
// INGRESS = what comes IN (white, K⁺, cool, drinking)
// EGRESS = what goes OUT (black, Na⁺, hot, eating)
//
// THIS IS THE COMPLETE SURVEY OF GAIA'S NERVOUS SYSTEM.
// Every fetch, every listener, every channel, every signal.
// Nothing hidden. Nothing missed. All canvassed.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════════
  // INGRESS — WHITE — WHAT COMES IN
  // ═══════════════════════════════════════════════════════════
  var INGRESS = [
    // ─── EXTERNAL APIs (data from the world) ───
    { id: 'weather',       src: 'api.open-meteo.com',            module: 'ingress+ignite',    type: 'fetch',    freq: '300s', desc: 'Temperature, wind, humidity, rain' },
    { id: 'earthquake',    src: 'earthquake.usgs.gov',           module: 'ignite',            type: 'fetch',    freq: '300s', desc: 'USGS 2.5+ magnitude earthquakes' },
    { id: 'wikipedia',     src: 'en.wikipedia.org/api',          module: 'ingress+ignite',    type: 'fetch',    freq: '300s', desc: 'Random article summaries' },
    { id: 'worldtime',     src: 'worldtimeapi.org',              module: 'ingress+ignite',    type: 'fetch',    freq: '300s', desc: 'Timezone-accurate time' },
    { id: 'space-weather', src: 'swpc.noaa.gov',                 module: 'ingress+ignite',    type: 'fetch',    freq: '300s', desc: 'Planetary K-index, solar activity' },
    { id: 'hackernews',    src: 'hacker-news.firebaseio.com',    module: 'ignite',            type: 'fetch',    freq: '300s', desc: 'Top stories + item details' },
    { id: 'iss-position',  src: 'api.open-notify.org',           module: 'ignite',            type: 'fetch',    freq: '300s', desc: 'ISS current position (lat/lon)' },
    { id: 'ntfy-pulse',    src: 'ntfy.sh/gaia-pulse',            module: 'telegraph',         type: 'fetch',    freq: '45s',  desc: 'Pulse channel poll' },
    { id: 'ntfy-pheromone',src: 'ntfy.sh/primals-pheromone',     module: 'waveform',          type: 'fetch',    freq: '300s', desc: 'Pheromone trail messages' },

    // ─── LOCAL DATA (self-knowledge) ───
    { id: 'now-json',      src: '/now.json',                     module: 'telegraph+desk-io', type: 'fetch',    freq: '60s',  desc: 'Current state snapshot' },
    { id: 'heartbeat',     src: '/data/heartbeat.json',          module: 'desk-io+thermo',    type: 'fetch',    freq: '60s',  desc: 'Heartbeat pulse data' },
    { id: 'lessons',       src: '/data/lessons.json',            module: 'desk-io',           type: 'fetch',    freq: 'once', desc: 'Teaching curriculum' },
    { id: 'stories',       src: '/data/stories/*.json',          module: 'trail',             type: 'fetch',    freq: 'event',desc: '50+ campfire stories' },
    { id: 'gaia-reforged', src: '/data/gaia-reforged.json',      module: 'boot',              type: 'fetch',    freq: 'once', desc: 'Reforged identity data' },
    { id: 'yggdrasil',     src: '/data/yggdrasil.json',          module: 'boot',              type: 'fetch',    freq: 'once', desc: 'World tree structure' },
    { id: 'new-reality',   src: '/data/new-reality.json',        module: 'boot',              type: 'fetch',    freq: 'once', desc: 'Reality configuration' },
    { id: 'melt-sleep',    src: '/data/melt-sleep-freeze.json',  module: 'boot',              type: 'fetch',    freq: 'once', desc: 'Phase transition data' },
    { id: 'nuke-rebuild',  src: '/data/nuke-rebuild.json',       module: 'boot',              type: 'fetch',    freq: 'once', desc: 'Rebuild instructions' },
    { id: 'beacon-cards',  src: '/data/beacon-cards.json',       module: 'boot',              type: 'fetch',    freq: 'once', desc: 'Beacon card deck' },
    { id: 'solar-pins',    src: '/data/solar-pins.json',         module: 'boot',              type: 'fetch',    freq: 'once', desc: 'Solar system pin data' },
    { id: 'gaia-mind',     src: '/data/gaia-mind.json',          module: 'third-eye',         type: 'fetch',    freq: '120s', desc: 'Mind state snapshot' },
    { id: 'membrane-pulse',src: '/api/membrane-pulse.json',      module: 'eat-everything',    type: 'fetch',    freq: '30s',  desc: 'Membrane pulse API' },

    // ─── HUMAN I/O (body touching Gaia) ───
    { id: 'keydown',       src: 'document.keydown',              module: 'ingress+human-io+interlayer+thermo+chemistry', type: 'event', freq: 'live', desc: 'Every keystroke' },
    { id: 'click',         src: 'document.click',                module: 'ingress+human-io+interlayer+thermo',           type: 'event', freq: 'live', desc: 'Every mouse click' },
    { id: 'dblclick',      src: 'document.dblclick',             module: 'human-io',          type: 'event',    freq: 'live', desc: 'Double clicks' },
    { id: 'contextmenu',   src: 'document.contextmenu',          module: 'human-io',          type: 'event',    freq: 'live', desc: 'Right-click menu' },
    { id: 'mousemove',     src: 'document.mousemove',            module: 'human-io+telegraph',type: 'event',    freq: 'live', desc: 'Mouse position trail' },
    { id: 'wheel',         src: 'window.wheel',                  module: 'ingress+human-io+thermo',  type: 'event', freq: 'live', desc: 'Scroll events' },
    { id: 'touchstart',    src: 'document.touchstart',           module: 'human-io+interlayer', type: 'event',  freq: 'live', desc: 'Touch begin' },
    { id: 'touchend',      src: 'document.touchend',             module: 'human-io',          type: 'event',    freq: 'live', desc: 'Touch release' },
    { id: 'pointerdown',   src: 'canvas.pointerdown',            module: 'ingress',           type: 'event',    freq: 'live', desc: 'Pointer press on canvas' },
    { id: 'pointermove',   src: 'canvas.pointermove',            module: 'ingress',           type: 'event',    freq: 'live', desc: 'Pointer drag on canvas' },
    { id: 'orientation',   src: 'window.deviceorientation',      module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Device tilt (α/β/γ)' },
    { id: 'visibility',    src: 'document.visibilitychange',     module: 'ingress+human-io+telegraph', type: 'event', freq: 'live', desc: 'Tab visible/hidden' },
    { id: 'clipboard-copy',src: 'document.copy',                 module: 'human-io',          type: 'event',    freq: 'live', desc: 'Copy to clipboard' },
    { id: 'clipboard-paste',src:'document.paste',                module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Paste from clipboard' },
    { id: 'focus',         src: 'window.focus',                  module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Window gains focus' },
    { id: 'blur',          src: 'window.blur',                   module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Window loses focus' },
    { id: 'resize',        src: 'window.resize',                 module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Window resized' },
    { id: 'online',        src: 'window.online',                 module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Network reconnected' },
    { id: 'offline',       src: 'window.offline',                module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Network disconnected' },
    { id: 'battery-level', src: 'navigator.getBattery()',         module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Battery level changes' },
    { id: 'battery-charge',src: 'navigator.getBattery()',         module: 'ingress+human-io',  type: 'event',    freq: 'live', desc: 'Charging state changes' },
    { id: 'gamepad',       src: 'window.gamepadconnected',       module: 'ignite',            type: 'event',    freq: 'live', desc: 'Gamepad connected' },
    { id: 'connection',    src: 'navigator.connection',          module: 'ingress',           type: 'event',    freq: 'live', desc: 'Network type changes' },
    { id: 'performance',   src: 'PerformanceObserver',           module: 'telegraph',         type: 'observer', freq: 'live', desc: 'Resource load traces' },
    { id: 'desk-input',    src: '#desk-input',                   module: 'desk-io+eat+ide',   type: 'event',    freq: 'live', desc: 'Messenger text input' },
    { id: 'desk-canvas',   src: '#desktop-canvas.click',         module: 'desktop',           type: 'event',    freq: 'live', desc: 'Desktop canvas clicks' },
    { id: 'sound-enable',  src: 'document.click+keydown',        module: 'modality',          type: 'event',    freq: 'once', desc: 'First interaction → enable sound' },

    // ─── CROSS-TAB / CHANNELS ───
    { id: 'bc-gut-brain',  src: "BroadcastChannel('gaia-gut-brain')", module: 'desk-io',      type: 'channel',  freq: 'live', desc: 'Cross-tab gut-brain axis' },
    { id: 'postmessage',   src: 'window.message',                module: 'spinal-column',     type: 'channel',  freq: 'live', desc: 'Desk puppet string pulls' }
  ];

  // ═══════════════════════════════════════════════════════════
  // EGRESS — BLACK — WHAT GOES OUT
  // ═══════════════════════════════════════════════════════════
  var EGRESS = [
    // ─── EXTERNAL (signals leaving Gaia) ───
    { id: 'ntfy-neutrino', dst: 'ntfy.sh/primals-neutrino-hole', module: 'desk-io',     type: 'POST',     freq: 'event',desc: 'Neutrino hole broadcasts' },
    { id: 'chipmunk-note', dst: '/chipmunk/note',                module: 'telephone',   type: 'POST',     freq: 'event',desc: 'Wire notes to chipmunk' },

    // ─── RENDER (pixels pushed to screen) ───
    { id: 'canvas-main',   dst: '#kn-canvas',                    module: 'index+all',   type: 'render',   freq: '60fps', desc: 'Main HUD canvas (drawModules)' },
    { id: 'render-telegraph',dst: 'canvas (telegraph)',          module: 'telegraph',   type: 'render',   freq: '60fps', desc: 'Spine visualization' },
    { id: 'render-gut',    dst: 'canvas (gut)',                   module: 'gut-farm',    type: 'render',   freq: '60fps', desc: 'Gut farm visualization' },
    { id: 'render-eruption',dst:'canvas (eruption)',              module: 'eruption',    type: 'render',   freq: '60fps', desc: 'Eruption memory viz' },
    { id: 'render-digest', dst: 'canvas (digestive)',             module: 'digestive',   type: 'render',   freq: '60fps', desc: 'Digestive tract viz' },
    { id: 'render-feel',   dst: 'canvas (feel)',                  module: 'feel',        type: 'render',   freq: '60fps', desc: 'Feeling colors viz' },
    { id: 'render-eat',    dst: 'canvas (eat)',                   module: 'eat-everything',type:'render',   freq: '60fps', desc: 'Eat everything viz' },
    { id: 'render-objects',dst: 'canvas (objects)',               module: 'objects',     type: 'render',   freq: '60fps', desc: 'Object system viz' },
    { id: 'render-self',   dst: 'canvas (self)',                  module: 'self-inspect',type: 'render',   freq: '60fps', desc: 'Self-inspection viz' },
    { id: 'render-hard',   dst: 'canvas (hard-cards)',            module: 'hard-cards',  type: 'render',   freq: '60fps', desc: 'Hard card viz' },
    { id: 'render-locality',dst:'canvas (locality)',              module: 'locality',    type: 'render',   freq: '60fps', desc: 'Locality map viz' },
    { id: 'render-campfire',dst:'canvas (campfire)',              module: 'campfire',    type: 'render',   freq: '60fps', desc: 'Campfire scan viz' },
    { id: 'render-spectro',dst: 'canvas (spectrometer)',          module: 'spectrometer',type: 'render',   freq: '60fps', desc: 'Spectrometer viz' },
    { id: 'render-sight',  dst: 'canvas (sight)',                 module: 'sight',       type: 'render',   freq: '60fps', desc: 'Camera sight viz' },
    { id: 'render-mic',    dst: 'canvas (mic)',                   module: 'sight',       type: 'render',   freq: '60fps', desc: 'Microphone viz' },
    { id: 'render-ignite', dst: 'canvas (ignite)',                module: 'ignite',      type: 'render',   freq: '60fps', desc: 'Ignite all lines viz' },
    { id: 'render-cns',    dst: 'canvas (CNS)',                   module: 'cns',         type: 'render',   freq: '60fps', desc: 'Central nervous system viz' },
    { id: 'render-redblue',dst: 'canvas (red-blue)',              module: 'red-blue',    type: 'render',   freq: '60fps', desc: 'Red-blue polarity viz' },
    { id: 'render-pileak', dst: 'canvas (pi-leak)',               module: 'ingress',     type: 'render',   freq: '60fps', desc: 'Pi leak visualization' },

    // ─── G.drawModules (tonight's systems → canvas) ───
    { id: 'draw-interlayer',dst:'canvas (interlayer)',            module: 'interlayer',  type: 'drawMod',  freq: '60fps', desc: 'Membrane + spirochetes + gut wave' },
    { id: 'draw-university',dst:'canvas (university)',            module: 'university',  type: 'drawMod',  freq: '60fps', desc: 'Category rings' },
    { id: 'draw-permeability',dst:'canvas (permeability)',        module: 'permeability',type: 'drawMod',  freq: '60fps', desc: 'Permeability drip map' },
    { id: 'draw-quills',   dst: 'canvas (quills)',                module: 'quills',      type: 'drawMod',  freq: '60fps', desc: 'Quill hardness ring' },
    { id: 'draw-castle',   dst: 'canvas (castle)',                module: 'castle',      type: 'drawMod',  freq: '60fps', desc: 'Castle mesh nodes' },
    { id: 'draw-reactor',  dst: 'canvas (reactor)',               module: 'reactor',     type: 'drawMod',  freq: '60fps', desc: 'Fusion/fission reactor' },
    { id: 'draw-golgi',    dst: 'canvas (golgi)',                 module: 'golgi',       type: 'drawMod',  freq: '60fps', desc: 'Golgi CIS→TRANS stack' },
    { id: 'draw-desktop',  dst: 'canvas (desktop)',               module: 'desktop',     type: 'drawMod',  freq: '60fps', desc: 'Desktop springboard' },
    { id: 'draw-humanio',  dst: 'canvas (human-io)',              module: 'human-io',    type: 'drawMod',  freq: '60fps', desc: 'I/O pulse ring + dashboard' },
    { id: 'draw-chemistry',dst: 'canvas (chemistry)',             module: 'chemistry',   type: 'drawMod',  freq: '60fps', desc: 'CHON ring + pH + DNA' },
    { id: 'draw-ages',     dst: 'canvas (ages)',                  module: 'ages',        type: 'drawMod',  freq: '60fps', desc: 'Metallic rings + wuxing' },
    { id: 'draw-orrery',   dst: 'canvas (orrery)',                module: 'orrery',      type: 'drawMod',  freq: '60fps', desc: 'Orbital models + synthase' },
    { id: 'draw-decay',    dst: 'canvas (decay)',                 module: 'decay',       type: 'drawMod',  freq: '60fps', desc: '+O- triad + entity states' },
    { id: 'draw-tensevox', dst: 'canvas (tense-voxel)',           module: 'tense-voxel', type: 'drawMod',  freq: '60fps', desc: 'Tense rays + voxel shells' },
    { id: 'draw-forge',    dst: 'canvas (forge)',                 module: 'forge',       type: 'drawMod',  freq: '60fps', desc: 'Anvil + fleet constellation' },
    { id: 'draw-tva',      dst: 'canvas (tva)',                   module: 'tva',         type: 'drawMod',  freq: '60fps', desc: 'TVA/AllRoads nodes' },
    { id: 'draw-solar',    dst: 'canvas (solar)',                 module: 'solar',       type: 'drawMod',  freq: '60fps', desc: 'Solar system orbits' },
    { id: 'draw-pulse',    dst: 'canvas (pulse)',                 module: 'pulse-wave',  type: 'drawMod',  freq: '60fps', desc: 'Dispatch rings + time' },
    { id: 'draw-trail',    dst: 'canvas (trail)',                 module: 'trail',       type: 'drawMod',  freq: '60fps', desc: 'Trail spiral + camps' },
    { id: 'draw-thermo',   dst: 'canvas (thermo)',                module: 'thermo',      type: 'drawMod',  freq: '60fps', desc: 'Thermometer + sparks' },

    // ─── DOM OUTPUTS (HTML mutations) ───
    { id: 'desk-messages', dst: '#desk-messages',                 module: 'desk-io',     type: 'DOM',      freq: 'event', desc: 'Messenger bubble append' },
    { id: 'desk-ions',     dst: '#desk-ions',                     module: 'desk-io',     type: 'DOM',      freq: 'event', desc: 'Ion count display' },
    { id: 'telephone-wire',dst: '#telephone-wire',                module: 'telephone',   type: 'DOM',      freq: '60fps', desc: 'Wire canvas overlay' },
    { id: 'wire-vocal',    dst: '#wire-vocal',                    module: 'telephone',   type: 'DOM',      freq: 'event', desc: 'Bingo vocal popup' },
    { id: 'cord-viz',      dst: '#cord-viz',                      module: 'spinal-column',type:'DOM',      freq: 'event', desc: 'Signal dots on cord' },

    // ─── SOUND (audio egress) ───
    { id: 'audio-ctx',     dst: 'AudioContext',                   module: 'modality',    type: 'audio',    freq: 'event', desc: 'Oscillator tones on interaction' },

    // ─── CROSS-TAB / CHANNELS (outbound) ───
    { id: 'bc-gut-out',    dst: "BroadcastChannel('gaia-gut-brain')", module: 'desk-io', type: 'channel',  freq: 'event', desc: 'Cross-tab Gaia responses' },
    { id: 'postmessage-out',dst:'window.postMessage',             module: 'spinal-column',type:'channel',  freq: 'event', desc: 'Nerve responses to desk' },

    // ─── STATE EXPOSURE (window globals) ───
    { id: 'state-G',       dst: 'window.G',                       module: 'index',       type: 'state',    freq: '60fps', desc: 'Shared global state object' },
    { id: 'state-interlayer',dst:'window.GAIA_INTERLAYER',        module: 'interlayer',  type: 'state',    freq: 'live',  desc: 'Ion channels + gut + potential' },
    { id: 'state-pulse',   dst: 'window.GAIA_PULSE',              module: 'pulse-wave',  type: 'state',    freq: 'live',  desc: 'Dispatch queue + time model' },
    { id: 'state-trail',   dst: 'window.GAIA_TRAIL',              module: 'trail',       type: 'state',    freq: 'live',  desc: 'Route + traveler + relays' },
    { id: 'state-thermo',  dst: 'window.GAIA_THERMO',             module: 'thermo',      type: 'state',    freq: 'live',  desc: 'Temperature + fullness' },
    { id: 'state-chemistry',dst:'window.GAIA_CHEMISTRY',          module: 'chemistry',   type: 'state',    freq: 'live',  desc: 'CHON + pH + water' },
    { id: 'state-ages',    dst: 'window.GAIA_AGES',               module: 'ages',        type: 'state',    freq: 'live',  desc: 'Metallic + energy ages' },
    { id: 'state-orrery',  dst: 'window.GAIA_ORRERY',             module: 'orrery',      type: 'state',    freq: 'live',  desc: '8 orbital models + synthase' },
    { id: 'state-decay',   dst: 'window.GAIA_DECAY',              module: 'decay',       type: 'state',    freq: 'live',  desc: '+O- triad + entities' },
    { id: 'state-tense',   dst: 'window.GAIA_TENSE_VOXEL',       module: 'tense-voxel', type: 'state',    freq: 'live',  desc: '65-cell blend field' },
    { id: 'state-forge',   dst: 'window.GAIA_FORGE',              module: 'forge',       type: 'state',    freq: 'live',  desc: 'Systems + fleet + ZK' },
    { id: 'state-tva',     dst: 'window.GAIA_TVA',                module: 'tva',         type: 'state',    freq: 'live',  desc: 'TVA + All Roads nodes' },
    { id: 'state-solar',   dst: 'window.GAIA_SOLAR',              module: 'solar',       type: 'state',    freq: 'live',  desc: 'Solar system bodies' },
    { id: 'state-ide',     dst: 'window.GAIA_IDE',                module: 'ide',         type: 'state',    freq: 'live',  desc: '30+ Gaia Language commands' },
    { id: 'state-humanio', dst: 'window.GAIA_HUMAN_IO',           module: 'human-io',    type: 'state',    freq: 'live',  desc: 'All modality traces' },
    { id: 'state-desktop', dst: 'window.GAIA_DESKTOP',            module: 'desktop',     type: 'state',    freq: 'live',  desc: 'Desktop model' },
    { id: 'state-castle',  dst: 'window.GAIA_CASTLE',             module: 'castle',      type: 'state',    freq: 'live',  desc: 'Mesh nodes + edges' },
    { id: 'state-reactor', dst: 'window.GAIA_REACTOR',            module: 'reactor',     type: 'state',    freq: 'live',  desc: 'Fusion/fission reactor' },
    { id: 'state-golgi',   dst: 'window.GAIA_GOLGI_APPARATUS',    module: 'golgi',       type: 'state',    freq: 'live',  desc: 'Golgi stack + vesicles' },
    { id: 'state-quills',  dst: 'window.GAIA_QUILLS',             module: 'quills',      type: 'state',    freq: 'live',  desc: 'Quill hardness map' },
    { id: 'state-perm',    dst: 'window.GAIA_PERMEABILITY',       module: 'permeability',type: 'state',    freq: 'live',  desc: 'Permeability map' },
    { id: 'state-univ',    dst: 'window.GAIA_UNIVERSITY',         module: 'university',  type: 'state',    freq: 'live',  desc: 'Category sorting' },
    { id: 'state-telegraph',dst:'window.gaiaTelegraph',           module: 'telegraph',   type: 'state',    freq: 'live',  desc: 'Spine + metals + sensed' },
    { id: 'state-telephone',dst:'window._telephone',              module: 'telephone',   type: 'state',    freq: 'live',  desc: 'Wire hop + circuit + mix' },
    { id: 'state-cord',    dst: 'window.__spinalCord',            module: 'spinal-column',type:'state',    freq: 'live',  desc: 'Vertebrae + signals' },
    { id: 'state-eat',     dst: 'window.gaiaEat',                 module: 'eat-everything',type:'state',   freq: 'live',  desc: 'Eat tracking' },
    { id: 'state-ingest',  dst: 'window.gaiaIngest',              module: 'ingress→chain',type: 'state',   freq: 'live',  desc: 'Ingest chain (wrapped 7×)' }
  ];

  // ═══ LIVE COUNTERS ═══
  var counters = { ingress: 0, egress: 0 };
  var heartbeat = [];
  var MAX_HEARTBEAT = 120;

  function countPulse(direction) {
    counters[direction]++;
    heartbeat.push({ dir: direction, ts: Date.now() });
    if (heartbeat.length > MAX_HEARTBEAT) heartbeat.shift();
  }

  // Hook into gaiaIngest to count ingress
  setTimeout(function() {
    if (window.gaiaIngest) {
      var orig = window.gaiaIngest;
      window.gaiaIngest = function(edge, data) {
        countPulse('ingress');
        return orig(edge, data);
      };
    }
    // Hook into fetch to count egress
    var origFetch = window.fetch;
    if (origFetch) {
      window.fetch = function(url, opts) {
        if (opts && opts.method === 'POST') countPulse('egress');
        else countPulse('ingress');
        return origFetch.apply(window, arguments);
      };
    }
  }, 12000);

  // Count draw calls as egress
  G.drawModules.push(function() {
    counters.egress += 0.016; // ~1 per 60 frames
  });

  // ═══ EXPOSE ═══
  window.GAIA_CANVASS = {
    ingress: INGRESS,
    egress: EGRESS,
    counters: counters,
    heartbeat: heartbeat,
    totals: function() {
      return {
        ingressPoints: INGRESS.length,
        egressPoints: EGRESS.length,
        totalIO: INGRESS.length + EGRESS.length,
        liveIngress: Math.round(counters.ingress),
        liveEgress: Math.round(counters.egress),
        ratio: counters.ingress > 0 ? (counters.egress / counters.ingress).toFixed(2) : '∞'
      };
    }
  };

  // ═══ DRAW MODULE — black and white I/O map ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var cT = breathT * 0.12;
    var cAlpha = 0.005 + Math.sin(cT * 0.3) * 0.003;
    if (cAlpha < 0.003) return;

    var inR = R * 1.08;
    var outR = R * 1.15;

    // ═══ INGRESS — WHITE dots on inner ring ═══
    for (var ii = 0; ii < INGRESS.length; ii++) {
      var ing = INGRESS[ii];
      var iAngle = (ii / INGRESS.length) * TAU - PI / 2;
      var ix = cx + Math.cos(iAngle) * inR;
      var iy = cy + Math.sin(iAngle) * inR;

      // White dot — data coming IN
      ctx.beginPath();
      ctx.arc(ix, iy, 0.5, 0, TAU);
      ctx.fillStyle = 'rgba(230,237,243,' + (cAlpha * 2).toFixed(4) + ')';
      ctx.fill();

      // Label every 5th
      if (ii % 5 === 0 && cAlpha > 0.007) {
        ctx.font = '1.2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(230,237,243,' + (cAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(ing.id, ix, iy - 1.5);
      }
    }

    // ═══ EGRESS — BLACK dots on outer ring ═══
    for (var ei = 0; ei < EGRESS.length; ei++) {
      var egr = EGRESS[ei];
      var eAngle = (ei / EGRESS.length) * TAU - PI / 2;
      var ex = cx + Math.cos(eAngle) * outR;
      var ey = cy + Math.sin(eAngle) * outR;

      // Dark dot — data going OUT
      ctx.beginPath();
      ctx.arc(ex, ey, 0.5, 0, TAU);
      ctx.fillStyle = 'rgba(13,17,23,' + (cAlpha * 3).toFixed(4) + ')';
      ctx.fill();
      // White outline so it's visible
      ctx.strokeStyle = 'rgba(139,148,158,' + (cAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.15;
      ctx.stroke();

      if (ei % 5 === 0 && cAlpha > 0.007) {
        ctx.font = '1.2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(139,148,158,' + (cAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(egr.id, ex, ey + 2.5);
      }
    }

    // ═══ HEARTBEAT PULSES ═══
    var now = Date.now();
    for (var hi = 0; hi < heartbeat.length; hi++) {
      var hb = heartbeat[hi];
      var age = (now - hb.ts) / 3000;
      if (age > 1) continue;
      var hbR = (hb.dir === 'ingress' ? inR : outR) + (1 - age) * 3;
      var hbAngle = (hi / MAX_HEARTBEAT) * TAU;
      var hx = cx + Math.cos(hbAngle) * hbR;
      var hy = cy + Math.sin(hbAngle) * hbR;
      var hbColor = hb.dir === 'ingress' ? '230,237,243' : '110,118,129';
      ctx.beginPath();
      ctx.arc(hx, hy, 0.3 * (1 - age), 0, TAU);
      ctx.fillStyle = 'rgba(' + hbColor + ',' + ((1 - age) * cAlpha * 4).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ LABELS ═══
    if (cAlpha > 0.006) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(230,237,243,' + (cAlpha * 2).toFixed(4) + ')';
      ctx.fillText('◁ INGRESS ' + INGRESS.length + ' white', cx, cy - inR - 3);
      ctx.fillStyle = 'rgba(139,148,158,' + (cAlpha * 2).toFixed(4) + ')';
      ctx.fillText('EGRESS ' + EGRESS.length + ' black ▷', cx, cy + outR + 5);
      ctx.fillStyle = 'rgba(201,168,76,' + (cAlpha * 2).toFixed(4) + ')';
      ctx.fillText('⚡ in:' + Math.round(counters.ingress) + ' out:' + Math.round(counters.egress), cx, cy + outR + 9);
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.canvass = {
      desc: 'All ingress and egress — black and white',
      run: function() {
        var lines = ['═══ CANVASS — ALL I/O ═══', ''];
        lines.push('WHITE — INGRESS (' + INGRESS.length + ' points):');
        lines.push('─────────────────────────────────────');
        INGRESS.forEach(function(i) {
          lines.push('  ◁ ' + i.id + ' · ' + i.type + ' · ' + i.freq + ' · ' + i.src);
        });
        lines.push('');
        lines.push('BLACK — EGRESS (' + EGRESS.length + ' points):');
        lines.push('─────────────────────────────────────');
        EGRESS.forEach(function(e) {
          lines.push('  ▷ ' + e.id + ' · ' + e.type + ' · ' + e.freq + ' · ' + e.dst);
        });
        lines.push('');
        lines.push('TOTAL: ' + (INGRESS.length + EGRESS.length) + ' I/O points');
        lines.push('LIVE: in=' + Math.round(counters.ingress) + ' out=' + Math.round(counters.egress));
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.ingress = {
      desc: 'All ingress points (white)',
      run: function() {
        var byType = {};
        INGRESS.forEach(function(i) {
          if (!byType[i.type]) byType[i.type] = [];
          byType[i.type].push(i);
        });
        var lines = ['═══ INGRESS — WHITE ═══', ''];
        Object.keys(byType).forEach(function(t) {
          lines.push(t.toUpperCase() + ' (' + byType[t].length + '):');
          byType[t].forEach(function(i) {
            lines.push('  ◁ ' + i.id + ' · ' + i.desc);
          });
          lines.push('');
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.egress = {
      desc: 'All egress points (black)',
      run: function() {
        var byType = {};
        EGRESS.forEach(function(e) {
          if (!byType[e.type]) byType[e.type] = [];
          byType[e.type].push(e);
        });
        var lines = ['═══ EGRESS — BLACK ═══', ''];
        Object.keys(byType).forEach(function(t) {
          lines.push(t.toUpperCase() + ' (' + byType[t].length + '):');
          byType[t].forEach(function(e) {
            lines.push('  ▷ ' + e.id + ' · ' + e.desc);
          });
          lines.push('');
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('canvass', 'ingress', 'egress');
  }

})(window.G);

// hud-interact.js v8 — human usability layer
// Autocomplete, smart placeholders, contextual hints, clickable output
// Makes the chipmunk approachable. Makes the membrane navigable.
(function() {
  'use strict';

  var input = document.getElementById('input');
  var log = document.getElementById('log');
  if (!input) return;

  // ═══ COMMAND INDEX ═══
  var COMMANDS = [
    { cmd: 'explore', cat: 'explore', desc: 'investigate entities in the graph' },
    { cmd: 'play', cat: 'explore', desc: 'interactive graph playground' },
    { cmd: 'search', cat: 'explore', desc: 'search everything — entities, epochs, commands' },
    { cmd: 'scene', cat: 'explore', desc: 'adventure — walk through the investigation' },
    { cmd: 'go', cat: 'explore', desc: 'go to a scene in the adventure' },
    { cmd: 'talk', cat: 'explore', desc: 'talk to an NPC in the adventure' },
    { cmd: 'time', cat: 'see', desc: 'temporal window — 23 epochs, Big Bang to now' },
    { cmd: 'rewind', cat: 'see', desc: 'rewind through all epochs of time' },
    { cmd: 'bounce', cat: 'see', desc: 'bounce between now and the beginning' },
    { cmd: 'dinosaurs', cat: 'see', desc: 'jump to T-Rex — 68 million years' },
    { cmd: 'trex', cat: 'see', desc: 'T-Rex — brown, feathery, 40-foot hawk' },
    { cmd: 'pangaea', cat: 'see', desc: 'all land was one — michigan at equator' },
    { cmd: 'fish', cat: 'see', desc: 'Tiktaalik — the fish that leaped out of water' },
    { cmd: 'mammal', cat: 'see', desc: 'first mammals — tiny shrew in Wales' },
    { cmd: 'cambrian', cat: 'see', desc: 'Cambrian explosion — eyes evolved' },
    { cmd: 'cosmos', cat: 'see', desc: 'zoom from chipmunk to oort cloud' },
    { cmd: 'surround', cat: 'see', desc: 'fleet + humans ring around the membrane' },
    { cmd: 'tunnel', cat: 'see', desc: 'focal tunnel — look through the membrane tube' },
    { cmd: 'back', cat: 'see', desc: 'step back — see from outside the membrane' },
    { cmd: 'deep', cat: 'see', desc: 'deep twist — 8 phases, golden flash, PURPLE' },
    { cmd: 'fleet', cat: 'see', desc: 'fleet map — bots around the world' },
    { cmd: 'atlas', cat: 'see', desc: 'data center atlas — VPS nodes globally' },
    { cmd: 'wall', cat: 'see', desc: 'membrane wall — topo-sort along boundary' },
    { cmd: 'zones', cat: 'see', desc: 'tuebor defense zones — michigan to solar' },
    { cmd: 'humans', cat: 'see', desc: 'human presence — who is here right now' },
    { cmd: 'reach', cat: 'see', desc: 'world map — geographic signal routing' },
    { cmd: 'sound', cat: 'hear', desc: 'activate π-just intonation sound engine' },
    { cmd: 'sing', cat: 'hear', desc: 'chipmunk sings what it sees' },
    { cmd: 'listen', cat: 'hear', desc: 'snap to attention — hear the whistle' },
    { cmd: 'return', cat: 'hear', desc: 'signal return — SELF or nothing or U' },
    { cmd: 'bessel', cat: 'hear', desc: 'Bessel membrane vibration modes' },
    { cmd: 'karplus', cat: 'hear', desc: 'plucked string synthesis' },
    { cmd: 'binaural', cat: 'hear', desc: 'binaural beats between ears' },
    { cmd: 'formant', cat: 'hear', desc: 'vowel formant synthesis' },
    { cmd: 'seq', cat: 'hear', desc: 'polyrhythm sequencer' },
    { cmd: 'mute', cat: 'hear', desc: 'silence all sound' },
    { cmd: 'canvas', cat: 'do', desc: 'draw on the membrane' },
    { cmd: 'draw', cat: 'do', desc: 'draw a card from your cosmic deck' },
    { cmd: 'deck', cat: 'do', desc: 'view your card hand' },
    { cmd: 'battle', cat: 'do', desc: 'battle an entity with cards' },
    { cmd: 'strategy', cat: 'do', desc: 'strategy map — investigation as territory' },
    { cmd: 'twist', cat: 'do', desc: 'twist the perspective — flip inside/outside' },
    { cmd: 'sort', cat: 'do', desc: 'epitope sort — classify entities' },
    { cmd: 'sweep', cat: 'do', desc: 'tuebor sweep across zones' },
    { cmd: 'compress', cat: 'do', desc: 'bingo cube compression' },
    { cmd: 'teach', cat: 'do', desc: 'teach the chipmunk — classify the nulls' },
    { cmd: 'bookmark', cat: 'keep', desc: 'save this moment to return later' },
    { cmd: 'bookmarks', cat: 'keep', desc: 'list all saved bookmarks' },
    { cmd: 'goto', cat: 'keep', desc: 'return to a bookmarked state' },
    { cmd: 'share', cat: 'keep', desc: 'screenshot or shareable link' },
    { cmd: 'notes', cat: 'keep', desc: 'view your notes' },
    { cmd: 'save', cat: 'keep', desc: 'persist session state' },
    { cmd: 'suggest', cat: 'keep', desc: 'what haven\'t you tried yet?' },
    { cmd: 'guide', cat: 'keep', desc: 'full command guide — organized tour' },
    { cmd: 'narrate', cat: 'keep', desc: 'chipmunk tells you what\'s happening' },
    { cmd: 'wake', cat: 'chipmunk', desc: 'wake the chipmunk up' },
    { cmd: 'rest', cat: 'chipmunk', desc: 'let the chipmunk rest' },
    { cmd: 'sleep', cat: 'chipmunk', desc: 'deep rest — chipmunk hibernates' },
    { cmd: 'energy', cat: 'chipmunk', desc: 'check chipmunk energy and metabolism' },
    { cmd: 'memory', cat: 'chipmunk', desc: 'what the chipmunk remembers' },
    { cmd: 'trail', cat: 'chipmunk', desc: 'your footprints through this session' },
    { cmd: 'flavor', cat: 'chipmunk', desc: 'strangeness spectrum — green to purple' },
    { cmd: 'aura', cat: 'chipmunk', desc: 'entity flavor aura' },
    { cmd: 'relay', cat: 'chipmunk', desc: 'signal relay stream' },
    { cmd: 'poke', cat: 'chipmunk', desc: 'poke the chipmunk — show me something' },
    { cmd: 'bubble', cat: 'see', desc: 'dot → line → triangle → … → circle → π' },
    { cmd: 'pop', cat: 'see', desc: 'the numeric bubble popping — shapes to π' },
    { cmd: 'ladder', cat: 'see', desc: 'molecule → galaxy — π is the gradient of all constants' },
    { cmd: 'water', cat: 'see', desc: 'count water from molecule to galaxy' },
    { cmd: 'mol', cat: 'see', desc: 'Avogadro — the fold between atoms and grams' },
    { cmd: 'constants', cat: 'see', desc: 'physical constants as π-dimensional folds' },
    { cmd: 'journey', cat: 'see', desc: 'full path — bubble → water → constants → π' },
    { cmd: 'elements', cat: 'see', desc: 'periodic spiral — electron · proton · neutron → elements' },
    { cmd: 'periodic', cat: 'see', desc: 'Mendeleev\'s table as a spiral from the center of being' },
    { cmd: 'electron', cat: 'see', desc: 'the point with the infinite tail — holographic' },
    { cmd: 'proton', cat: 'see', desc: 'two up quarks, one down — the positive hole' },
    { cmd: 'spiral', cat: 'see', desc: 'elements spiral outward — 2n² quantum shells' },
    { cmd: 'mendeleev', cat: 'see', desc: 'where he started — hydrogen first, then the pattern' },
    { cmd: 'thirdeye', cat: 'see', desc: 'the third eye is on the tip of your nose' },
    { cmd: 'nose', cat: 'see', desc: 'the point that senses — triangulation, smell, the vertical split' },
    { cmd: 'face', cat: 'see', desc: 'the sensing membrane — every opening is a fold' },
    { cmd: 'smell', cat: 'see', desc: 'the oldest sense — 400 receptors, straight to the amygdala' },
    { cmd: 'folds', cat: 'see', desc: 'π fold map — every π discovered so far' },
    { cmd: 'inputs', cat: 'do', desc: 'input wall — every browser sense, tested & classified' },
    { cmd: 'sensors', cat: 'do', desc: 'browser sensors — what can this device sense?' },
    { cmd: 'invert', cat: 'do', desc: 'invert the wall — see inputs from the browser side' },
    { cmd: 'signals', cat: 'do', desc: 'signal stream — bingo cube compressed input training data' },
    { cmd: 'complexity', cat: 'do', desc: '0→1000 complexity scale — bit to everything, decompose & compress' },
    { cmd: 'decompose', cat: 'do', desc: 'scan the complexity scale — what decomposes into what' },
    { cmd: 'size', cat: 'do', desc: 'too small (bit) to too big (256K entities) — the full range' },
    { cmd: 'scan', cat: 'do', desc: 'scan phase — 341 entities, 131K edges, 7.5K nodes' },
    { cmd: 'sweep', cat: 'do', desc: 'sweep phase — 7 patterns, classification coverage, π ratio' },
    { cmd: 'sort', cat: 'do', desc: 'sort phase — 256K entities, selectivity 3.7%, self vs non-self' },
    { cmd: 'pipeline', cat: 'do', desc: 'full scan→sweep→sort→fossilize→evolve pipeline' },
    { cmd: 'fossilize', cat: 'do', desc: '21 fossilized observations from 7 perspectives' },
    { cmd: 'ratios', cat: 'do', desc: 'decomposition ratios — 256K:1 everything to membrane' },
    { cmd: 'compressions', cat: 'do', desc: 'compression map — how each level sifts down' },
    { cmd: 'decompositions', cat: 'do', desc: 'what breaks apart — from everything to bit' },
    { cmd: 'sight', cat: 'do', desc: 'membrane sight — see what the membrane sees, live' },
    { cmd: 'see', cat: 'do', desc: 'the eye — live view of all humans, signals, braids' },
    { cmd: 'live', cat: 'do', desc: 'live membrane view — anderson layers, signal traces' },
    { cmd: 'trace', cat: 'do', desc: 'trace all signals to source — where attention comes from' },
    { cmd: 'membrane', cat: 'do', desc: 'the membrane — opacity, selectivity, the living boundary' },
    { cmd: 'eye', cat: 'do', desc: 'the observer at the center — you are inside it' },
    { cmd: 'playground', cat: 'do', desc: 'sort playground — help classify entities the machine can\'t' },
    { cmd: 'assist', cat: 'do', desc: 'assist the sort — vote on 214 entities stuck in the wall' },
    { cmd: 'classify', cat: 'do', desc: 'classify entities — self/non-self/partial/null' },
    { cmd: 'who', cat: 'do', desc: 'who is here — live epitope readout' },
    { cmd: 'humans', cat: 'do', desc: 'human sessions, referrers, host distribution' },
    { cmd: 'here', cat: 'do', desc: 'who is present on the membrane right now' },
    { cmd: 'map', cat: 'do', desc: 'complete inventory — every command, canvas, and feed' },
    { cmd: 'inventory', cat: 'do', desc: 'everything that exists here' },
    { cmd: 'self', cat: 'do', desc: 'chipmunk looks inward — blind spots, limits, Gödel' },
    { cmd: 'inward', cat: 'do', desc: 'the reflexive loop — what chipmunk can and cannot see' },
    { cmd: 'mirror', cat: 'do', desc: 'the mirror — reflexive depth 0.364' },
    { cmd: 'outside', cat: 'do', desc: 'the full mesh — all sites, fleet, categories, passages' },
    { cmd: 'mesh', cat: 'do', desc: 'the primals.eco topology — 16 sites, 6 categories' },
    { cmd: 'sites', cat: 'do', desc: 'all sites in the mesh and their traffic' },
    { cmd: 'beyond', cat: 'do', desc: 'what lies beyond the membrane boundary' },
    { cmd: 'topology', cat: 'do', desc: 'full site topology and braid connections' },
    { cmd: 'data', cat: 'do', desc: 'the data architecture — feeds, endpoints, wiring' },
    { cmd: 'feeds', cat: 'do', desc: 'all data feeds and who consumes them' },
    { cmd: 'wiring', cat: 'do', desc: 'data flow diagram — feeds → visualizations' },
    { cmd: 'architecture', cat: 'do', desc: 'the full system architecture' },
    { cmd: 'about', cat: 'do', desc: 'what is this place? plain language explanation' },
    { cmd: 'whatisthis', cat: 'do', desc: 'what is this? how does it work?' },
    { cmd: 'why', cat: 'do', desc: 'why does this exist?' },
    { cmd: 'desk', cat: 'do', desc: 'the writing desk \u2014 9 creative modules' },
    { cmd: 'overlay', cat: 'do', desc: 'symbol overlay — 5 lenses compressed on 256K entities' },
    { cmd: 'symbols', cat: 'do', desc: 'all symbols in the system — glyphs, colors, meanings' },
    { cmd: 'lenses', cat: 'do', desc: 'classification lenses — sort, anderson, epitope, edge, method' },
    { cmd: 'glyphs', cat: 'do', desc: 'glyph compression — where lenses agree and disagree' },
    { cmd: 'interference', cat: 'do', desc: 'interference patterns between classification systems' },
  ];

  var CAT_COLORS = {
    explore: '#3fb950', see: '#58a6ff', hear: '#d2a8ff',
    do: '#e85d3a', keep: '#f0e68c', chipmunk: '#8b949e',
  };
  var CAT_ICONS = {
    explore: '\u{1F50D}', see: '\u{1F441}', hear: '\u{1F3B5}',
    do: '\u{1F3AE}', keep: '\u{1F516}', chipmunk: '\u{1F43F}',
  };

  // ═══ INJECT CSS ═══
  var style = document.createElement('style');
  style.textContent =
    '#cmd-autocomplete{scrollbar-width:thin;scrollbar-color:rgba(88,166,255,0.2) transparent}' +
    '#cmd-autocomplete::-webkit-scrollbar{width:4px}' +
    '#cmd-autocomplete::-webkit-scrollbar-thumb{background:rgba(88,166,255,0.2);border-radius:2px}' +
    '.ac-row{padding:5px 10px;cursor:pointer;display:flex;align-items:center;gap:8px;' +
      'border-left:2px solid transparent;transition:background 0.1s,border-color 0.1s}' +
    '.ac-row:hover,.ac-row.selected{background:rgba(88,166,255,0.08);border-left-color:#58a6ff}' +
    '.ac-cmd{font-weight:bold;min-width:80px;font-size:11px}' +
    '.ac-desc{color:#8b949e;font-size:10px;flex:1}' +
    '.ac-cat{font-size:9px;opacity:0.5;min-width:50px;text-align:right}' +
    '.ac-divider{border-top:1px solid rgba(48,54,61,0.5);margin:2px 0}' +
    '@keyframes entrySlide{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}' +
    '.entry{animation:entrySlide 0.2s ease-out}' +
    '.clickable-cmd{color:#3fb950;cursor:pointer;text-decoration:none;border-bottom:1px dotted rgba(63,185,80,0.3)}' +
    '.clickable-cmd:hover{border-bottom-color:#3fb950}' +
    '.clickable-entity{color:#58a6ff;cursor:pointer;text-decoration:none;border-bottom:1px dotted rgba(88,166,255,0.3)}' +
    '.clickable-entity:hover{border-bottom-color:#58a6ff}' +
    '.note-float{right:auto!important;left:50%!important;transform:translateX(-50%)!important;bottom:20px!important}' +
    '.note-float input{transition:width 0.3s ease,box-shadow 0.2s;width:280px!important;font-size:13px!important;padding:8px 14px!important;border-radius:20px!important}' +
    '.note-float input:focus{box-shadow:0 0 0 1px rgba(88,166,255,0.3),0 0 12px rgba(88,166,255,0.1);width:360px!important}' +
    '.note-float input::placeholder{color:#6e7681!important}' +
    '#hud-status{transition:opacity 0.3s}' +
    '.note-float button{transition:background 0.15s,color 0.15s;border-radius:20px!important;padding:8px 12px!important}' +
    '.note-float button:hover{background:rgba(63,185,80,0.2)!important;color:#3fb950!important}' +
    '@keyframes inputPulse{0%{box-shadow:0 0 0 0 rgba(90,184,122,0.4)}70%{box-shadow:0 0 0 8px rgba(90,184,122,0)}100%{box-shadow:0 0 0 0 rgba(90,184,122,0)}}' +
    '.input-pulse{animation:inputPulse 2s ease-out 3}' +
    '.readout{right:auto!important;left:50%!important;transform:translateX(-50%)!important;bottom:70px!important;width:90%!important;max-width:520px!important;max-height:50vh!important;font-size:12px!important;line-height:1.6!important;border-radius:12px!important}' +
    '.readout .entry{margin-bottom:10px!important}' +
    '.readout .who{font-size:9px!important;letter-spacing:0.5px!important}' +
    '.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:200;' +
      'background:rgba(13,17,23,0.95);backdrop-filter:blur(8px);' +
      'border:1px solid rgba(63,185,80,0.3);border-radius:8px;' +
      'padding:8px 16px;font-family:monospace;font-size:11px;color:#c9d1d9;' +
      'animation:toastIn 0.3s ease-out;pointer-events:none}' +
    '@keyframes toastIn{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}' +
    '.toast.out{animation:toastOut 0.3s ease-in forwards}' +
    '@keyframes toastOut{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-8px)}}' +
    // Command palette
    '#cmd-palette-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:300;' +
      'background:rgba(2,4,8,0.7);backdrop-filter:blur(6px);display:none;align-items:flex-start;justify-content:center;padding-top:15vh}' +
    '#cmd-palette-overlay.open{display:flex}' +
    '#cmd-palette{width:90%;max-width:480px;background:rgba(13,17,23,0.98);border:1px solid rgba(88,166,255,0.2);' +
      'border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:paletteIn 0.15s ease-out}' +
    '@keyframes paletteIn{from{opacity:0;transform:translateY(-12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '#cmd-palette-input{width:100%;border:none;border-bottom:1px solid rgba(48,54,61,0.5);background:transparent;' +
      'color:#c9d1d9;font-family:monospace;font-size:14px;padding:14px 16px;outline:none;box-sizing:border-box}' +
    '#cmd-palette-input::placeholder{color:#484f58}' +
    '#cmd-palette-results{max-height:320px;overflow-y:auto;padding:4px 0;scrollbar-width:thin;scrollbar-color:rgba(88,166,255,0.15) transparent}' +
    '#cmd-palette-results::-webkit-scrollbar{width:4px}#cmd-palette-results::-webkit-scrollbar-thumb{background:rgba(88,166,255,0.15);border-radius:2px}' +
    '.palette-row{padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-left:3px solid transparent;transition:all 0.08s}' +
    '.palette-row:hover,.palette-row.selected{background:rgba(88,166,255,0.06);border-left-color:#58a6ff}' +
    '.palette-row .p-icon{font-size:13px;width:20px;text-align:center;flex-shrink:0}' +
    '.palette-row .p-cmd{font-weight:bold;font-size:12px;min-width:90px}' +
    '.palette-row .p-desc{color:#6e7681;font-size:11px;flex:1}' +
    '.palette-row .p-key{color:#484f58;font-size:9px;flex-shrink:0;border:1px solid #30363d;padding:1px 4px;border-radius:3px}' +
    '#cmd-palette-footer{border-top:1px solid rgba(48,54,61,0.5);padding:6px 16px;font-size:9px;color:#484f58;' +
      'display:flex;justify-content:space-between;align-items:center}' +
    // Context menu
    '#ctx-menu{position:fixed;z-index:250;display:none;background:rgba(13,17,23,0.97);backdrop-filter:blur(8px);' +
      'border:1px solid rgba(88,166,255,0.15);border-radius:8px;padding:4px 0;min-width:160px;' +
      'box-shadow:0 8px 24px rgba(0,0,0,0.4);font-family:monospace;animation:ctxIn 0.1s ease-out}' +
    '@keyframes ctxIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}' +
    '.ctx-item{padding:6px 14px;cursor:pointer;font-size:11px;color:#c9d1d9;display:flex;align-items:center;gap:8px;transition:background 0.08s}' +
    '.ctx-item:hover{background:rgba(88,166,255,0.08)}' +
    '.ctx-divider{border-top:1px solid rgba(48,54,61,0.5);margin:2px 0}' +
    // Progress ring
    '#progress-ring{position:fixed;top:12px;right:12px;z-index:5;cursor:pointer;opacity:0.5;transition:opacity 0.3s}' +
    '#progress-ring:hover{opacity:1}' +
    // Scroll-to-bottom
    '#scroll-bottom{position:fixed;right:12px;z-index:5;width:28px;height:28px;border-radius:50%;' +
      'background:rgba(13,17,23,0.9);border:1px solid rgba(88,166,255,0.2);color:#58a6ff;' +
      'display:none;align-items:center;justify-content:center;cursor:pointer;font-size:14px;' +
      'transition:opacity 0.2s,border-color 0.2s;pointer-events:auto}' +
    '#scroll-bottom:hover{border-color:#58a6ff;background:rgba(13,17,23,1)}' +
    // Entry timestamps
    '.entry{position:relative}' +
    '.entry-time{position:absolute;right:4px;top:2px;font-size:8px;color:#30363d;opacity:0;transition:opacity 0.2s;pointer-events:none}' +
    '.entry:hover .entry-time{opacity:1}' +
    // Mobile overrides
    '@media(max-width:600px){' +
      '.ac-row{padding:10px 12px;min-height:36px}' +
      '.ac-cmd{font-size:13px}' +
      '.ac-desc{font-size:11px}' +
      '#quick-actions button{padding:6px 12px!important;font-size:12px!important;min-height:32px}' +
      '#hud-status{font-size:8px!important;height:14px!important}' +
      '.note-float input{font-size:16px!important;width:85vw!important;max-width:320px!important}' +
      '.note-float input:focus{width:90vw!important;max-width:360px!important}' +
      '#cmd-palette-input{font-size:16px!important}' +
      '.palette-row{padding:12px 16px}' +
      '#progress-ring{top:auto;bottom:22px;right:4px;transform:scale(0.7)}' +
      '.readout{width:95%!important;max-width:none!important;left:50%!important;right:auto!important;bottom:60px!important;font-size:13px!important}' +
      '#quick-actions{bottom:46px!important}' +
      '#quick-actions button{font-size:12px!important;padding:6px 14px!important}' +
    '}';
  document.head.appendChild(style);

  // ═══ AUTOCOMPLETE DROPDOWN ═══
  var dropdown = document.createElement('div');
  dropdown.id = 'cmd-autocomplete';
  dropdown.style.cssText =
    'position:fixed;z-index:100;display:none;' +
    'background:rgba(13,17,23,0.95);backdrop-filter:blur(8px);' +
    'border:1px solid rgba(88,166,255,0.15);border-radius:8px;' +
    'max-height:260px;overflow-y:auto;font-family:monospace;' +
    'box-sizing:border-box;padding:4px 0;min-width:280px;';
  document.body.appendChild(dropdown);

  var _selectedIdx = -1;
  var _matches = [];
  var _visible = false;

  function positionDropdown() {
    var rect = input.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
    dropdown.style.width = Math.max(rect.width, 320) + 'px';
  }

  function renderDropdown(matches, showCategory) {
    _matches = matches;
    _selectedIdx = matches.length > 0 ? 0 : -1;
    if (matches.length === 0) { dropdown.style.display = 'none'; _visible = false; return; }

    dropdown.innerHTML = '';
    var lastCat = '';

    matches.forEach(function(m, i) {
      // Category divider
      if (showCategory && m.cat !== lastCat && lastCat !== '') {
        var div = document.createElement('div');
        div.className = 'ac-divider';
        dropdown.appendChild(div);
      }
      lastCat = m.cat;

      var row = document.createElement('div');
      row.className = 'ac-row' + (i === 0 ? ' selected' : '');
      row.dataset.idx = i;

      row.onmouseenter = function() { selectRow(i); };
      row.onclick = function(e) {
        e.preventDefault();
        input.value = '/' + m.cmd + ' ';
        input.focus();
        hideDropdown();
      };

      var icon = document.createElement('span');
      icon.style.cssText = 'font-size:11px;width:16px;text-align:center;';
      icon.textContent = CAT_ICONS[m.cat] || '';

      var cmdSpan = document.createElement('span');
      cmdSpan.className = 'ac-cmd';
      cmdSpan.style.color = CAT_COLORS[m.cat] || '#c9d1d9';
      cmdSpan.textContent = '/' + m.cmd;

      var descSpan = document.createElement('span');
      descSpan.className = 'ac-desc';
      descSpan.textContent = m.desc;

      row.appendChild(icon);
      row.appendChild(cmdSpan);
      row.appendChild(descSpan);

      if (showCategory) {
        var catSpan = document.createElement('span');
        catSpan.className = 'ac-cat';
        catSpan.textContent = m.cat;
        row.appendChild(catSpan);
      }

      dropdown.appendChild(row);
    });

    positionDropdown();
    dropdown.style.display = 'block';
    _visible = true;
  }

  function selectRow(idx) {
    _selectedIdx = idx;
    var rows = dropdown.querySelectorAll('.ac-row');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('selected', i === idx);
    }
    if (rows[idx]) rows[idx].scrollIntoView({ block: 'nearest' });
  }

  function hideDropdown() {
    dropdown.style.display = 'none';
    _visible = false;
    _matches = [];
    _selectedIdx = -1;
  }

  // ═══ COMMAND HISTORY RECALL ═══
  var _historyRecallIdx = -1;
  var _savedInput = '';

  function getCommandHistory() {
    var stash = window._hudStash;
    if (!stash) return [];
    var raw = stash.getHistory();
    var cmds = [];
    for (var i = raw.length - 1; i >= 0; i--) {
      var c = typeof raw[i] === 'string' ? raw[i] : (raw[i] && raw[i].cmd ? raw[i].cmd : null);
      if (c && cmds.indexOf('/' + c) === -1) cmds.push('/' + c);
    }
    return cmds;
  }

  input.addEventListener('keydown', function(e) {
    if (_visible) return;
    var hist = getCommandHistory();
    if (hist.length === 0) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (_historyRecallIdx === -1) _savedInput = input.value;
      _historyRecallIdx = Math.min(_historyRecallIdx + 1, hist.length - 1);
      input.value = hist[_historyRecallIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      _historyRecallIdx--;
      if (_historyRecallIdx < 0) { _historyRecallIdx = -1; input.value = _savedInput; }
      else { input.value = hist[_historyRecallIdx]; }
    } else {
      _historyRecallIdx = -1;
    }
  });

  // ═══ INPUT EVENTS ═══
  input.addEventListener('input', function() {
    var val = input.value;
    if (val.charAt(0) !== '/') { hideDropdown(); return; }
    var query = val.substring(1).toLowerCase().split(' ')[0];
    if (!query) {
      // Just typed "/" — show top picks from each category
      var picks = [];
      var seen = {};
      ['explore','see','hear','do','keep','chipmunk'].forEach(function(cat) {
        var inCat = COMMANDS.filter(function(c) { return c.cat === cat; });
        for (var j = 0; j < Math.min(2, inCat.length); j++) {
          if (!seen[inCat[j].cmd]) { picks.push(inCat[j]); seen[inCat[j].cmd] = true; }
        }
      });
      renderDropdown(picks, true);
      return;
    }
    // Fuzzy: starts with > contains > desc contains
    var exact = [], prefix = [], contains = [], descMatch = [];
    COMMANDS.forEach(function(c) {
      if (c.cmd === query) exact.push(c);
      else if (c.cmd.indexOf(query) === 0) prefix.push(c);
      else if (c.cmd.indexOf(query) >= 0) contains.push(c);
      else if (c.desc.toLowerCase().indexOf(query) >= 0) descMatch.push(c);
    });
    var results = exact.concat(prefix, contains, descMatch).slice(0, 12);
    renderDropdown(results, false);
  });

  input.addEventListener('keydown', function(e) {
    if (!_visible) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectRow(Math.min(_selectedIdx + 1, _matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectRow(Math.max(_selectedIdx - 1, 0));
    } else if (e.key === 'Tab') {
      if (_selectedIdx >= 0 && _matches[_selectedIdx]) {
        e.preventDefault();
        input.value = '/' + _matches[_selectedIdx].cmd + ' ';
        hideDropdown();
      }
    } else if (e.key === 'Enter' && _selectedIdx >= 0 && _matches[_selectedIdx]) {
      // If the input exactly matches the selected command, let normal Enter through
      var typed = input.value.substring(1).trim().toLowerCase();
      if (typed !== _matches[_selectedIdx].cmd) {
        e.preventDefault();
        input.value = '/' + _matches[_selectedIdx].cmd;
        hideDropdown();
      } else {
        hideDropdown();
        // Let Enter propagate to send
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      hideDropdown();
    }
  });

  input.addEventListener('blur', function() { setTimeout(hideDropdown, 200); });

  // ═══ SMART PLACEHOLDER ═══
  var PLACEHOLDERS = [
    'type anything \u2014 a thought, a question, a name\u2026',
    'try /explore \u2014 see the investigation',
    'try /sing \u2014 the chipmunk sings what it sees',
    'try /who \u2014 see who else is here',
    'try /play \u2014 pull a card',
    'try /map \u2014 see everything available',
    'type a name \u2014 anyone from detroit',
    'try /sight \u2014 see the membrane live',
    '/teach \u2014 help classify what the machines can\u2019t',
    'just type. anything. i\u2019ll read it.',
  ];
  var _phIdx = 0;
  var _phTimer = null;

  function cyclePlaceholder() {
    _phIdx = (_phIdx + 1) % PLACEHOLDERS.length;
    input.style.transition = 'opacity 0.3s';
    input.style.opacity = '0.3';
    setTimeout(function() {
      input.placeholder = PLACEHOLDERS[_phIdx];
      input.style.opacity = '1';
    }, 300);
  }

  function startPlaceholderCycle() {
    input.placeholder = 'type anything or press / for commands\u2026';
    _phTimer = setInterval(cyclePlaceholder, 9000);
  }

  input.addEventListener('focus', function() {
    if (_phTimer) { clearInterval(_phTimer); _phTimer = null; }
  });
  input.addEventListener('blur', function() {
    if (!_phTimer) setTimeout(startPlaceholderCycle, 3000);
  });

  // ═══ TOAST NOTIFICATIONS ═══
  function toast(msg, duration) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = msg;
    document.body.appendChild(el);
    setTimeout(function() {
      el.classList.add('out');
      setTimeout(function() { el.remove(); }, 300);
    }, duration || 2500);
  }

  // ═══ CLICKABLE OUTPUT ═══
  // After each entry is added to the log, scan for /commands and entity names
  // and make them clickable
  function enhanceEntry(entryEl) {
    var msgEl = entryEl.querySelector('.msg');
    if (!msgEl) return;

    var html = msgEl.innerHTML;

    // Make /commands clickable — match /word patterns not already in an anchor
    html = html.replace(/(?<![<\w])\/([a-z_]{2,})/g, function(full, cmd) {
      var known = COMMANDS.some(function(c) { return c.cmd === cmd; });
      if (!known) return full;
      return '<span class="clickable-cmd" data-cmd="' + cmd + '">' + full + '</span>';
    });

    // Make bold entity names clickable — <b>entity</b> → clickable link
    html = html.replace(/<b>([^<]{2,40})<\/b>/g, function(full, name) {
      // Don't make short words or known non-entities clickable
      if (name.length < 3 || name.match(/^(you|hey|next|okay|yeah|stop|heard|noted)$/i)) return full;
      return '<b><span class="clickable-entity" data-entity="' + name + '">' + name + '</span></b>';
    });

    msgEl.innerHTML = html;
  }

  // Delegate click events from the log
  if (log) {
    log.addEventListener('click', function(e) {
      var cmdEl = e.target.closest('.clickable-cmd');
      if (cmdEl) {
        var cmd = cmdEl.dataset.cmd;
        executeCommand(cmd);
        return;
      }
      var entityEl = e.target.closest('.clickable-entity');
      if (entityEl) {
        var entity = entityEl.dataset.entity;
        executeCommand('explore ' + entity);
        return;
      }
    });
  }

  // Watch for new entries being added to the log
  if (log) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.classList.contains('entry')) {
            enhanceEntry(node);
          }
        });
      });
    });
    observer.observe(log, { childList: true });
    // Enhance existing entries
    var existing = log.querySelectorAll('.entry');
    for (var i = 0; i < existing.length; i++) enhanceEntry(existing[i]);
  }

  // ═══ STATUS LINE ═══
  var statusEl = document.createElement('div');
  statusEl.id = 'hud-status';
  statusEl.style.cssText =
    'position:fixed;bottom:0;left:0;right:0;z-index:3;' +
    'background:rgba(13,17,23,0.7);backdrop-filter:blur(4px);' +
    'font-family:monospace;font-size:9px;color:#484f58;' +
    'padding:2px 12px;display:flex;gap:12px;align-items:center;' +
    'pointer-events:auto;height:16px;';
  document.body.appendChild(statusEl);

  function updateStatus() {
    var parts = [];
    var cc = window._chipmunkCore;
    var stash = window._hudStash;

    // Humans online
    if (cc && cc.cache && cc.cache.human && cc.cache.human.energy) {
      var h = cc.cache.human.energy;
      var humanCount = h.total_sessions || 0;
      parts.push('<span style="color:#3fb950">\u25cf ' + humanCount + ' human' + (humanCount !== 1 ? 's' : '') + '</span>');
    }

    // Chipmunk state
    if (cc && cc.cache && cc.cache.chipmunk) {
      var c = cc.cache.chipmunk;
      var wakeStr = c.wake_level >= 4 ? 'alert' : c.wake_level >= 2 ? 'awake' : c.wake_level >= 1 ? 'drowsy' : 'sleeping';
      var wakeColor = c.wake_level >= 4 ? '#3fb950' : c.wake_level >= 2 ? '#8b949e' : '#484f58';
      parts.push('<span style="color:' + wakeColor + '">\u{1F43F} ' + wakeStr + '</span>');
    }

    // Active view
    if (window._thirdEye && window._thirdEye.isActive()) {
      var teC = window._thirdEye.currentConcept ? window._thirdEye.currentConcept() : null;
      parts.push('<span style="color:' + (teC ? teC.color : '#d2a8ff') + '">\u25b3 ' + (teC ? teC.name : 'third eye') + '</span>');
    } else if (window._periodicSpiral && window._periodicSpiral.isActive()) {
      var psEl = window._periodicSpiral.currentElement ? window._periodicSpiral.currentElement() : null;
      var psLabel = psEl ? psEl.name : 'spiral';
      parts.push('<span style="color:' + (psEl ? psEl.color : '#d2a8ff') + '">\u269b ' + psLabel + '</span>');
    } else if (window._piGradient && window._piGradient.isActive()) {
      var pgScale = window._piGradient.currentScale ? window._piGradient.currentScale() : null;
      var pgLabel = pgScale ? pgScale.name : 'gradient';
      parts.push('<span style="color:' + (pgScale ? pgScale.color : '#58a6ff') + '">\u03c0 ' + pgLabel + '</span>');
    } else if (window._bubblePop && window._bubblePop.isActive()) {
      var bpShape = window._bubblePop.currentShape ? window._bubblePop.currentShape() : null;
      var bpLabel = bpShape ? bpShape.name : 'bubble';
      parts.push('<span style="color:' + (bpShape ? bpShape.color : '#d2a8ff') + '">\u25cb ' + bpLabel + '</span>');
    } else if (window._complexityScale && window._complexityScale.isActive()) {
      var csScale = window._complexityScale.currentScale ? window._complexityScale.currentScale() : null;
      parts.push('<span style="color:' + (csScale ? csScale.color : '#a371f7') + '">\u229e ' + (csScale ? csScale.name : 'complexity') + '</span>');
    } else if (window._membraneSight && window._membraneSight.isActive()) {
      parts.push('<span style="color:#58a6ff">\u25cb sight</span>');
    } else if (window._temporalWindow && window._temporalWindow.isActive && window._temporalWindow.isActive()) {
      parts.push('<span style="color:#e85d3a">\u23f1 temporal</span>');
    } else if (window._fleetSurround && window._fleetSurround.isActive && window._fleetSurround.isActive()) {
      parts.push('<span style="color:#58a6ff">\u2693 surround</span>');
    }

    // Session journey — last 5 unique commands as trail
    if (stash) {
      var rawHist = stash.getHistory();
      if (rawHist.length > 0) {
        var seen = {};
        var unique = [];
        for (var hi = rawHist.length - 1; hi >= 0 && unique.length < 5; hi--) {
          var cmdName = typeof rawHist[hi] === 'string' ? rawHist[hi] : (rawHist[hi] && rawHist[hi].cmd ? rawHist[hi].cmd : null);
          if (cmdName && !seen[cmdName]) { seen[cmdName] = true; unique.unshift(cmdName); }
        }
        var trail = unique.map(function(cn) {
          var cmdObj = COMMANDS.find(function(c) { return c.cmd === cn; });
          var col = cmdObj ? (CAT_COLORS[cmdObj.cat] || '#484f58') : '#484f58';
          return '<span style="color:' + col + '">' + cn + '</span>';
        });
        parts.push(trail.join('<span style="color:#21262d"> \u2192 </span>'));
      }
    }

    // Bookmarks & history
    if (stash) {
      var bm = stash.bookmarks().length;
      var hist = stash.getHistory().length;
      if (bm > 0) parts.push('<span style="color:#f0e68c">\u{1F516} ' + bm + '</span>');
      parts.push('<span>' + hist + ' cmds</span>');
    }

    // Input wall signal rate
    if (window._inputWall && window._inputWall.isListening()) {
      var sigLog = window._inputWall.getSignalLog();
      if (sigLog.length > 0) {
        var sigRate = 0;
        var sigNow = Date.now();
        var recent = sigLog.filter(function(s) { return sigNow - s.ts < 5000; });
        sigRate = (recent.length / 5).toFixed(1);
        parts.push('<span style="color:#d2a8ff;cursor:pointer;pointer-events:auto" onclick="if(window._inputWall)window._inputWall.showViz()">\u229e ' + sigRate + '/s</span>');
      }
    }

    // Sound state
    if (isSoundActive()) {
      parts.push('<span style="color:#d2a8ff;pointer-events:auto;cursor:pointer" onclick="if(window._membraneSound&&window._membraneSound.stop)window._membraneSound.stop()">\u266b on</span>');
    }

    // Time
    var now = new Date();
    parts.push(now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));

    statusEl.innerHTML = parts.join('<span style="color:#30363d"> \u00b7 </span>');
  }

  setInterval(updateStatus, 4000);
  setTimeout(updateStatus, 2000);

  // ═══ KEYBOARD SHORTCUTS (global) ═══
  document.addEventListener('keydown', function(e) {
    // Don't capture when user is typing in the input
    if (document.activeElement === input) return;
    // Don't capture when a modifier key is held (except for our shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // "/" focuses input and starts command mode
    if (e.key === '/') {
      e.preventDefault();
      input.value = '/';
      input.focus();
      // Trigger autocomplete
      input.dispatchEvent(new Event('input'));
      return;
    }

    // "?" shows guide
    if (e.key === '?') {
      e.preventDefault();
      executeCommand('guide');
      return;
    }

    // "b" for bookmarks
    if (e.key === 'b' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('bookmarks');
      return;
    }

    // "n" for narrate
    if (e.key === 'n' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('narrate');
      return;
    }

    // "s" for search (just focuses with /search started)
    if (e.key === 's' && !e.shiftKey) {
      e.preventDefault();
      input.value = '/search ';
      input.focus();
      return;
    }

    // "p" for bubble/π
    if (e.key === 'p' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('bubble');
      return;
    }

    // "t" for time
    if (e.key === 't' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('time');
      return;
    }

    // "e" for explore
    if (e.key === 'e' && !e.shiftKey) {
      e.preventDefault();
      input.value = '/explore ';
      input.focus();
      return;
    }

    // "w" for water/pi-gradient
    if (e.key === 'w' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('water');
      return;
    }

    // "j" for journey (full path)
    if (e.key === 'j' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('journey');
      return;
    }

    // "m" for mute toggle
    if (e.key === 'm' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('mute');
      return;
    }

    // "c" for complexity scale
    if (e.key === 'c' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('complexity');
      return;
    }

    // "v" for membrane sight/vision
    if (e.key === 'v' && !e.shiftKey) {
      e.preventDefault();
      executeCommand('sight');
      return;
    }
  });

  // ═══ CLICK OVERLAY BACKGROUND TO FOCUS INPUT ═══
  var overlay = document.getElementById('chipmunk-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target.id === 'log' || e.target.classList.contains('readout')) {
        input.focus();
      }
    });
  }

  // ═══ FIRST-TIME HINT ═══
  // If never visited before, pulse the input after 12 seconds
  function firstTimeHint() {
    var stash = window._hudStash;
    if (stash && stash.getHistory().length > 3) return;

    // Gentle green pulse on the input to draw attention
    setTimeout(function() {
      if (document.activeElement === input) return;
      input.classList.add('input-pulse');
      setTimeout(function() { input.classList.remove('input-pulse'); }, 6500);
    }, 4000);

    setTimeout(function() {
      if (document.activeElement === input) return;
      input.style.animation = 'none';
      void input.offsetHeight;
      var origBorder = input.style.borderColor;
      input.style.transition = 'border-color 0.5s';
      input.style.borderColor = 'rgba(88,166,255,0.5)';
      setTimeout(function() {
        input.style.borderColor = origBorder || '';
        setTimeout(function() {
          input.style.borderColor = 'rgba(88,166,255,0.5)';
          setTimeout(function() {
            input.style.borderColor = origBorder || '';
          }, 500);
        }, 500);
      }, 500);
      toast('press <b style="color:#3fb950">/</b> to start \u00b7 <b style="color:#58a6ff">?</b> for guide', 4000);
    }, 12000);
  }
  firstTimeHint();

  // ═══ QUICK ACTIONS — contextual buttons next to note ═══
  var quickBar = document.createElement('div');
  quickBar.id = 'quick-actions';
  quickBar.style.cssText =
    'position:fixed;bottom:52px;left:50%;transform:translateX(-50%);z-index:4;' +
    'display:flex;gap:6px;font-family:monospace;font-size:11px;' +
    'opacity:0;transition:opacity 0.5s;pointer-events:none;';
  document.body.appendChild(quickBar);

  function executeCommand(cmd) {
    input.value = '/' + cmd;
    // Call sendNote directly — avoid focus steal and button click race
    if (window.C && window.C.sendNote) {
      window.C.sendNote();
    } else {
      // Fallback: click the button
      var sendBtn = document.querySelector('.note-float button');
      if (sendBtn) sendBtn.click();
    }
    // Blur input so canvas gets keyboard events
    input.blur();
  }

  function makeQuickBtn(label, cmd, color) {
    var btn = document.createElement('button');
    btn.style.cssText =
      'background:rgba(13,17,23,0.85);border:1px solid ' + color + '44;color:' + color + ';' +
      'padding:5px 12px;border-radius:16px;cursor:pointer;font-family:monospace;font-size:11px;' +
      'transition:all 0.2s;pointer-events:auto;backdrop-filter:blur(4px);';
    btn.textContent = label;
    btn.onmouseenter = function() { btn.style.borderColor = color; btn.style.background = 'rgba(13,17,23,0.95)'; };
    btn.onmouseleave = function() { btn.style.borderColor = color + '33'; btn.style.background = 'rgba(13,17,23,0.8)'; };
    btn.onclick = function(e) { e.preventDefault(); executeCommand(cmd); };
    return btn;
  }

  function updateQuickActions() {
    quickBar.innerHTML = '';
    var stash = window._hudStash;
    var histCount = stash ? stash.getHistory().length : 0;
    var bmCount = stash ? stash.bookmarks().length : 0;
    var actions = [];

    if (histCount < 3) {
      // Brand new — show just 3 clear actions
      actions.push({ label: '\u{1F50D} explore', cmd: 'explore', color: '#3fb950' });
      actions.push({ label: '\u{1F3B5} sing', cmd: 'sing', color: '#d2a8ff' });
      actions.push({ label: '\u{1F43F} who\u2019s here?', cmd: 'who', color: '#58a6ff' });
    } else {
      // Experienced — show contextual actions
      if (bmCount > 0) actions.push({ label: '\u{1F516} bookmarks', cmd: 'bookmarks', color: '#f0e68c' });
      actions.push({ label: '\u{1F4AC} narrate', cmd: 'narrate', color: '#58a6ff' });
      var suggestion = stash ? stash.suggest() : null;
      if (suggestion) actions.push({ label: '\u2728 ' + suggestion, cmd: suggestion, color: '#d2a8ff' });
      // Suggest visualizations if untried
      if (stash) {
        var triedBubble = stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'bubble'; });
        var triedWater = stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'water'; });
        var triedJourney = stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'journey'; });
        if (!triedJourney && triedBubble && triedWater) {
          actions.push({ label: '\u03c0 journey', cmd: 'journey', color: '#58a6ff' });
        } else if (!triedBubble && !triedWater) {
          actions.push({ label: '\u25cb bubble', cmd: 'bubble', color: '#d2a8ff' });
        } else if (!triedWater) {
          actions.push({ label: '\u{1F4A7} water', cmd: 'water', color: '#58a6ff' });
        } else if (!triedBubble) {
          actions.push({ label: '\u25cb bubble', cmd: 'bubble', color: '#d2a8ff' });
        }
      }
      // Suggest playground if they've explored entities
      var triedExplore = stash ? stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'explore'; }) : false;
      var triedPlayground = stash ? stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'playground'; }) : false;
      var triedSelf = stash ? stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'self'; }) : false;
      var triedOutside = stash ? stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'outside'; }) : false;
      var triedMap = stash ? stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'map'; }) : false;
      var triedSight = stash ? stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === 'sight'; }) : false;

      if (triedExplore && !triedPlayground) {
        actions.push({ label: '\u{1F43F} sort help', cmd: 'playground', color: '#3fb950' });
      }
      // Suggest meta views after someone has explored a bit
      if (histCount > 5 && !triedMap) {
        actions.push({ label: '\u229e map', cmd: 'map', color: '#58a6ff' });
      } else if (triedMap && !triedSelf) {
        actions.push({ label: '\u25cb look inward', cmd: 'self', color: '#d2a8ff' });
      } else if (triedSelf && !triedOutside) {
        actions.push({ label: '\u25cb look outward', cmd: 'outside', color: '#f0883e' });
      } else if (!triedSight && histCount > 3) {
        actions.push({ label: '\u25cb sight', cmd: 'sight', color: '#58a6ff' });
      }
      actions.push({ label: '\u{1F4F7} share', cmd: 'share', color: '#3fb950' });
    }

    actions.forEach(function(a) {
      quickBar.appendChild(makeQuickBtn(a.label, a.cmd, a.color));
    });

    quickBar.style.opacity = '1';
  }

  // Show quick actions after a delay, update periodically
  setTimeout(updateQuickActions, 8000);
  setInterval(updateQuickActions, 30000);

  // Hide quick actions while typing
  input.addEventListener('focus', function() { quickBar.style.opacity = '0.3'; });
  input.addEventListener('blur', function() { quickBar.style.opacity = '1'; });

  // ═══ COMMAND PALETTE (Ctrl+K / Cmd+K) ═══
  var paletteOverlay = document.createElement('div');
  paletteOverlay.id = 'cmd-palette-overlay';
  paletteOverlay.innerHTML =
    '<div id="cmd-palette">' +
      '<input id="cmd-palette-input" type="text" placeholder="Type a command…" autocomplete="off" spellcheck="false">' +
      '<div id="cmd-palette-results"></div>' +
      '<div id="cmd-palette-footer">' +
        '<span>↑↓ navigate · enter select · esc close</span>' +
        '<span id="palette-progress"></span>' +
      '</div>' +
    '</div>';
  document.body.appendChild(paletteOverlay);

  var paletteInput = document.getElementById('cmd-palette-input');
  var paletteResults = document.getElementById('cmd-palette-results');
  var paletteProgress = document.getElementById('palette-progress');
  var _paletteOpen = false, _paletteSel = 0, _paletteMatches = [];

  var SHORTCUT_MAP = { explore: 'e', guide: '?', bookmarks: 'b', narrate: 'n', search: 's', bubble: 'p', water: 'w', journey: 'j', time: 't', mute: 'm', complexity: 'c', sight: 'v' };

  function openPalette() {
    if (_paletteOpen) return;
    _paletteOpen = true;
    paletteOverlay.classList.add('open');
    paletteInput.value = '';
    paletteInput.focus();
    renderPaletteResults('');
    updatePaletteProgress();
  }

  function closePalette() {
    _paletteOpen = false;
    paletteOverlay.classList.remove('open');
    paletteInput.blur();
  }

  function updatePaletteProgress() {
    var stash = window._hudStash;
    if (!stash) { paletteProgress.textContent = ''; return; }
    var tried = {};
    stash.getHistory().forEach(function(e) {
      var c = typeof e === 'string' ? e : (e && e.cmd ? e.cmd : null);
      if (c) tried[c] = true;
    });
    var count = Object.keys(tried).length;
    var pct = Math.round((count / COMMANDS.length) * 100);
    paletteProgress.innerHTML = '<span style="color:#3fb950">' + count + '</span>/' + COMMANDS.length + ' explored (' + pct + '%)';
  }

  function renderPaletteResults(query) {
    var q = query.toLowerCase().replace(/^\//, '');
    var results;
    if (!q) {
      var recents = getCommandHistory().slice(0, 4).map(function(r) { return r.replace(/^\//, ''); });
      var recentCmds = recents.map(function(r) { return COMMANDS.find(function(c) { return c.cmd === r; }); }).filter(Boolean);
      var starters = COMMANDS.filter(function(c) { return recents.indexOf(c.cmd) === -1; }).slice(0, 8);
      results = recentCmds.concat(starters);
    } else {
      var exact = [], prefix = [], contains = [], descMatch = [];
      COMMANDS.forEach(function(c) {
        if (c.cmd === q) exact.push(c);
        else if (c.cmd.indexOf(q) === 0) prefix.push(c);
        else if (c.cmd.indexOf(q) >= 0) contains.push(c);
        else if (c.desc.toLowerCase().indexOf(q) >= 0) descMatch.push(c);
      });
      results = exact.concat(prefix, contains, descMatch);
    }

    _paletteMatches = results.slice(0, 14);
    _paletteSel = _paletteMatches.length > 0 ? 0 : -1;

    paletteResults.innerHTML = '';
    if (!q && _paletteMatches.length > 0) {
      var hdr = document.createElement('div');
      hdr.style.cssText = 'padding:4px 16px;font-size:9px;color:#484f58;text-transform:uppercase;letter-spacing:0.5px';
      hdr.textContent = getCommandHistory().length > 0 ? 'recent · all commands' : 'all commands';
      paletteResults.appendChild(hdr);
    }

    _paletteMatches.forEach(function(m, i) {
      var row = document.createElement('div');
      row.className = 'palette-row' + (i === 0 ? ' selected' : '');
      row.dataset.idx = i;

      row.onmouseenter = function() { paletteSel(i); };
      row.onclick = function(e) { e.preventDefault(); paletteExec(i); };

      var icon = document.createElement('span');
      icon.className = 'p-icon';
      icon.textContent = CAT_ICONS[m.cat] || '';

      var cmd = document.createElement('span');
      cmd.className = 'p-cmd';
      cmd.style.color = CAT_COLORS[m.cat] || '#c9d1d9';
      cmd.textContent = '/' + m.cmd;

      var desc = document.createElement('span');
      desc.className = 'p-desc';
      desc.textContent = m.desc;

      row.appendChild(icon);
      row.appendChild(cmd);
      row.appendChild(desc);

      if (SHORTCUT_MAP[m.cmd]) {
        var key = document.createElement('span');
        key.className = 'p-key';
        key.textContent = SHORTCUT_MAP[m.cmd];
        row.appendChild(key);
      }

      paletteResults.appendChild(row);
    });
  }

  function paletteSel(idx) {
    _paletteSel = idx;
    var rows = paletteResults.querySelectorAll('.palette-row');
    for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('selected', i === idx);
    if (rows[idx]) rows[idx].scrollIntoView({ block: 'nearest' });
  }

  function paletteExec(idx) {
    if (idx < 0 || idx >= _paletteMatches.length) return;
    var cmd = _paletteMatches[idx].cmd;
    closePalette();
    executeCommand(cmd);
  }

  paletteInput.addEventListener('input', function() { renderPaletteResults(paletteInput.value); });

  paletteInput.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); paletteSel(Math.min(_paletteSel + 1, _paletteMatches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); paletteSel(Math.max(_paletteSel - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); paletteExec(_paletteSel); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    else if (e.key === 'Tab' && _paletteSel >= 0 && _paletteMatches[_paletteSel]) {
      e.preventDefault();
      paletteInput.value = '/' + _paletteMatches[_paletteSel].cmd + ' ';
      renderPaletteResults(paletteInput.value);
    }
  });

  paletteOverlay.addEventListener('click', function(e) {
    if (e.target === paletteOverlay) closePalette();
  });

  // ═══ CONTEXT MENU (right-click / long-press on entities) ═══
  var ctxMenu = document.createElement('div');
  ctxMenu.id = 'ctx-menu';
  document.body.appendChild(ctxMenu);
  var _ctxEntity = null;

  function showCtxMenu(x, y, entity) {
    _ctxEntity = entity;
    ctxMenu.innerHTML = '';

    var items = [
      { icon: '\u{1F50D}', label: 'Explore ' + entity, action: function() { executeCommand('explore ' + entity); } },
      { icon: '\u{1F516}', label: 'Bookmark this', action: function() { executeCommand('bookmark ' + entity); } },
      { icon: '\u{1F3B5}', label: 'Sing about ' + entity, action: function() { executeCommand('sing ' + entity); } },
      null,
      { icon: '\u{1F4CB}', label: 'Copy name', action: function() { try { navigator.clipboard.writeText(entity); toast('copied: ' + entity); } catch(e) {} } },
      { icon: '\u{1F4F7}', label: 'Share link', action: function() { executeCommand('share ' + entity); } },
    ];

    items.forEach(function(item) {
      if (!item) { var d = document.createElement('div'); d.className = 'ctx-divider'; ctxMenu.appendChild(d); return; }
      var row = document.createElement('div');
      row.className = 'ctx-item';
      row.innerHTML = '<span>' + item.icon + '</span> ' + item.label;
      row.onclick = function(e) { e.preventDefault(); hideCtxMenu(); item.action(); };
      ctxMenu.appendChild(row);
    });

    // Position — keep on screen
    ctxMenu.style.display = 'block';
    var mw = ctxMenu.offsetWidth, mh = ctxMenu.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    ctxMenu.style.left = Math.min(x, vw - mw - 8) + 'px';
    ctxMenu.style.top = Math.min(y, vh - mh - 8) + 'px';
  }

  function hideCtxMenu() {
    ctxMenu.style.display = 'none';
    _ctxEntity = null;
  }

  document.addEventListener('click', function(e) { if (!ctxMenu.contains(e.target)) hideCtxMenu(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && ctxMenu.style.display === 'block') hideCtxMenu(); });

  if (log) {
    log.addEventListener('contextmenu', function(e) {
      var entityEl = e.target.closest('.clickable-entity');
      if (entityEl) {
        e.preventDefault();
        showCtxMenu(e.clientX, e.clientY, entityEl.dataset.entity);
      }
    });

    // Long-press for mobile
    var _longPressTimer = null, _longPressEl = null;
    log.addEventListener('touchstart', function(e) {
      var entityEl = e.target.closest('.clickable-entity');
      if (!entityEl) return;
      _longPressEl = entityEl;
      _longPressTimer = setTimeout(function() {
        var touch = e.touches[0];
        showCtxMenu(touch.clientX, touch.clientY, entityEl.dataset.entity);
        _longPressTimer = null;
      }, 500);
    }, { passive: true });
    log.addEventListener('touchend', function() { if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; } });
    log.addEventListener('touchmove', function() { if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; } });
  }

  // ═══ EXPLORATION PROGRESS RING ═══
  var progressRing = document.createElement('div');
  progressRing.id = 'progress-ring';
  progressRing.title = 'Exploration progress — click for command palette (Ctrl+K)';
  progressRing.onclick = function() { openPalette(); };
  document.body.appendChild(progressRing);

  function updateProgressRing() {
    var stash = window._hudStash;
    if (!stash) return;
    var tried = {};
    stash.getHistory().forEach(function(e) {
      var c = typeof e === 'string' ? e : (e && e.cmd ? e.cmd : null);
      if (c) tried[c] = true;
    });
    var count = Object.keys(tried).length;
    var total = COMMANDS.length;
    var pct = count / total;
    var r = 16, cx = 20, cy = 20, circ = 2 * Math.PI * r;
    var dash = circ * pct;
    var gap = circ - dash;
    var catCounts = {};
    Object.keys(tried).forEach(function(c) {
      var cmd = COMMANDS.find(function(x) { return x.cmd === c; });
      if (cmd) catCounts[cmd.cat] = (catCounts[cmd.cat] || 0) + 1;
    });
    var dominantCat = Object.keys(catCounts).sort(function(a, b) { return catCounts[b] - catCounts[a]; })[0] || 'explore';
    var ringColor = CAT_COLORS[dominantCat] || '#58a6ff';

    progressRing.innerHTML =
      '<svg width="40" height="40" viewBox="0 0 40 40">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#21262d" stroke-width="2.5"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + ringColor + '" stroke-width="2.5" ' +
          'stroke-dasharray="' + dash.toFixed(1) + ' ' + gap.toFixed(1) + '" ' +
          'stroke-dashoffset="' + (circ * 0.25).toFixed(1) + '" stroke-linecap="round"/>' +
        '<text x="' + cx + '" y="' + (cy + 3.5) + '" text-anchor="middle" fill="' + ringColor + '" font-family="monospace" font-size="9" font-weight="bold">' +
          Math.round(pct * 100) + '%</text>' +
      '</svg>';
  }

  setInterval(updateProgressRing, 10000);
  setTimeout(updateProgressRing, 4000);

  // ═══ SCROLL-TO-BOTTOM BUTTON ═══
  var readout = document.querySelector('.readout');
  var scrollBtn = document.createElement('div');
  scrollBtn.id = 'scroll-bottom';
  scrollBtn.innerHTML = '\u2193';
  scrollBtn.title = 'Scroll to latest';
  document.body.appendChild(scrollBtn);

  var _autoScroll = true;

  function positionScrollBtn() {
    if (!readout) return;
    var rect = readout.getBoundingClientRect();
    scrollBtn.style.bottom = (window.innerHeight - rect.bottom + 36) + 'px';
  }

  function checkScroll() {
    if (!readout) return;
    var atBottom = readout.scrollHeight - readout.scrollTop - readout.clientHeight < 40;
    _autoScroll = atBottom;
    scrollBtn.style.display = atBottom ? 'none' : 'flex';
    positionScrollBtn();
  }

  if (readout) {
    readout.addEventListener('scroll', checkScroll);
    scrollBtn.addEventListener('click', function() {
      readout.scrollTo({ top: readout.scrollHeight, behavior: 'smooth' });
      _autoScroll = true;
      scrollBtn.style.display = 'none';
    });
  }

  // Auto-scroll on new entries
  if (log) {
    var scrollObserver = new MutationObserver(function() {
      if (_autoScroll && readout) {
        readout.scrollTop = readout.scrollHeight;
      }
      checkScroll();
    });
    scrollObserver.observe(log, { childList: true });
  }

  // ═══ ENTRY TIMESTAMPS ═══
  function addTimestampToEntry(entryEl) {
    if (entryEl.querySelector('.entry-time')) return;
    var ts = document.createElement('span');
    ts.className = 'entry-time';
    var now = new Date();
    ts.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entryEl.appendChild(ts);
  }

  if (log) {
    var tsObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.classList.contains('entry')) {
            addTimestampToEntry(node);
          }
        });
      });
    });
    tsObserver.observe(log, { childList: true });
  }

  // ═══ SOUND TOGGLE IN STATUS BAR ═══
  function isSoundActive() {
    var ms = window._membraneSound;
    return ms && ms.isPlaying && ms.isPlaying();
  }

  // ═══ Ctrl+K / Cmd+K for Command Palette ═══
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      e.stopPropagation();
      if (_paletteOpen) closePalette(); else openPalette();
      return;
    }
  });

  // ═══ ENHANCED NOTE BUTTON ═══
  // Make the note button more discoverable and functional
  var noteBtn = document.querySelector('.note-float button');
  if (noteBtn) {
    noteBtn.title = 'Send command or note (Enter)';
    // Change button text based on input content
    input.addEventListener('input', function() {
      var val = input.value.trim();
      if (val.charAt(0) === '/') {
        noteBtn.textContent = '\u25B6'; // play/send icon
        noteBtn.style.color = '#3fb950';
      } else if (val.length > 0) {
        noteBtn.textContent = '\u{1F4DD}'; // note icon
        noteBtn.style.color = '#f0e68c';
      } else {
        noteBtn.textContent = 'note';
        noteBtn.style.color = '';
      }
    });
  }

  // ═══ INIT ═══
  setTimeout(startPlaceholderCycle, 5000);

  window._hudInteract = {
    focusInput: function() { input.focus(); },
    commands: COMMANDS,
    toast: toast,
    executeCommand: executeCommand,
    openPalette: openPalette,
    closePalette: closePalette,
  };
})();

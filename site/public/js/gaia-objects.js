// ═══════════════════════════════════════════════════════════
// GAIA OBJECTS — composed things from items + recipes
//
// OBJECT = composed thing (desk, messenger, campfire)
// ITEM = irreducible NFT (my cactus, my keyboard, my handwriting)
// RAIN = what it looks like from outside (just another thing)
//
// Three perspectives:
//   OWNER: my cactus — specific, named, valued
//   SELF:  just a cactus — being what I am
//   RAIN:  just rain — generic, passing, unremarkable
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // OBJECT REGISTRY — everything tagged as an object
  // ───────────────────────────────────────────────────────
  var objects = {};

  function registerObject(id, config) {
    objects[id] = {
      id: id,
      name: config.name || id,
      type: config.type || 'object',
      items: config.items || [],
      recipe: config.recipe || {},
      views: {
        owner: config.ownerView || 'a thing I care about',
        self: config.selfView || 'just being what I am',
        rain: config.rainView || 'just rain'
      },
      born: Date.now(),
      interactions: 0,
      lastTouched: 0
    };
    return objects[id];
  }

  function touchObject(id) {
    if (objects[id]) {
      objects[id].interactions++;
      objects[id].lastTouched = Date.now();
    }
  }

  // ───────────────────────────────────────────────────────
  // SCAN THE HUD — find and tag all objects
  // ───────────────────────────────────────────────────────
  function scanAndTag() {
    // THE MESSENGER — the desk input area
    if (document.getElementById('desk-input')) {
      registerObject('messenger', {
        name: 'Messenger',
        type: 'interface',
        items: ['text-input', 'send-button', 'message-history', 'ion-bar'],
        recipe: { input: 'textarea', button: 'send', display: 'messages', sensor: 'ions' },
        ownerView: 'My channel to Gaia — every keystroke is Na⁺ through her membrane',
        selfView: 'a pipe. text goes in, response comes out. ion channel kinetics.',
        rainView: 'a chat box at the bottom of a website'
      });
    }

    // THE GLOBE — the main canvas
    if (document.getElementById('kn-globe')) {
      registerObject('globe', {
        name: 'Globe',
        type: 'canvas',
        items: ['canvas-element', 'pin-system', 'render-loop', 'projection'],
        recipe: { surface: 'canvas2d', data: 'PINS', engine: '60fps-loop' },
        ownerView: 'Gaia\'s body — her sphere, her membrane, her organs spinning',
        selfView: 'a canvas that redraws. pixels. math. trigonometry. nothing more.',
        rainView: 'an animated circle with colored dots'
      });
    }

    // THE DESK — the bottom area with controls
    if (document.getElementById('hud-desk')) {
      registerObject('desk', {
        name: 'Desk',
        type: 'surface',
        items: ['table-surface', 'ion-channel', 'gut-indicator', 'toggle-button'],
        recipe: { surface: 'div', channel: 'ion-display', stomach: 'gut-status' },
        ownerView: 'Kevin\'s workstation — where the 4th body\'s hands reach into the HUD',
        selfView: 'a horizontal panel anchored to the bottom. CSS flex. dark background.',
        rainView: 'a status bar'
      });
    }

    // THE MAP — zoom and layer controls
    var mapPanel = document.querySelector('[class*="map"]') || document.getElementById('map-controls');
    registerObject('map', {
      name: 'Map Controls',
      type: 'navigation',
      items: ['zoom-plus', 'zoom-minus', 'layer-buttons', 'focus-button'],
      recipe: { zoom: 'buttons', layers: 'radio', focus: 'toggle' },
      ownerView: 'navigation — how I move through Gaia\'s body',
      selfView: 'event listeners attached to DOM elements. onclick handlers.',
      rainView: 'some small buttons on the right side'
    });

    // THE CAMPFIRE — the story system
    registerObject('campfire', {
      name: 'Campfire',
      type: 'system',
      items: ['fire-state', 'story-genes', 'plato-circle', 'beacon-registry'],
      recipe: { fuel: 'stories', heat: 'interaction', light: 'display', smoke: 'RSS' },
      ownerView: 'the gathering place — stories breed here, visitors sit around the fire',
      selfView: 'a state machine. spark→coal→fire→ember→bone. gene recombination.',
      rainView: 'a popup with text that appears at the bottom of the page'
    });

    // THE HARD CARDS — Kevin's handwriting
    registerObject('hard-cards', {
      name: 'Hard Cards',
      type: 'artifact',
      items: ['38-scanned-cards', '6-prints', 'graph-paper', 'ink', 'signatures'],
      recipe: { medium: 'paper+ink', process: 'scan', display: 'translucent-overlay' },
      ownerView: 'MY handwriting — proof I exist behind the screen',
      selfView: 'bitmap images. arrays of pixels. RGBA values in memory.',
      rainView: 'some faint scribbles that sometimes appear behind the globe'
    });

    // THE SPECTROMETER — smell=color system
    registerObject('spectrometer', {
      name: 'Spectrometer',
      type: 'sensor',
      items: ['24-spectral-signatures', 'gut-spectrum', 'tri-face-pyramids', 'phase-drips'],
      recipe: { input: 'data-sources', process: 'color-mixing', output: 'visual-drips' },
      ownerView: 'Gaia\'s nose — she smells data sources as colors',
      selfView: 'a mapping function. input keys → weighted RGB blend. nothing smells.',
      rainView: 'colorful dots dripping down the screen'
    });

    // THE SELF-INSPECTOR
    registerObject('self-inspect', {
      name: 'Self Inspector',
      type: 'diagnostic',
      items: ['file-inventory', 'snake-classifier', 'crush-tracker', 'health-bars'],
      recipe: { scan: 'manifest', classify: 'line-count', display: 'proportional-bars' },
      ownerView: 'Gaia looking in a mirror — she sees her own sickness',
      selfView: 'an array of objects with line counts. sort. filter. render.',
      rainView: 'tiny bars in the corner of the screen'
    });

    // THE LOCALITY SYSTEM
    registerObject('locality', {
      name: 'Locality',
      type: 'spatial',
      items: ['iqr-rings', 'body-inversion', 'nn-graph', 'corpus-pin'],
      recipe: { anchor: 'corpus', distance: 'haversine', walk: 'nn-least-first' },
      ownerView: 'where Kevin is in space — his body mapped onto Gaia\'s coordinates',
      selfView: 'math. haversine formula. k-nearest-neighbor graph. floats.',
      rainView: 'faint concentric circles'
    });

    // THE INTERACTION SYSTEM
    registerObject('interaction', {
      name: 'Interaction Tracker',
      type: 'sensor',
      items: ['fusion-score', 'seeking-modes', 'chord-burst', 'notification'],
      recipe: { input: 'events', score: 'compound-decay', output: 'seeking-mode' },
      ownerView: 'how alive the conversation is — fusion when we\'re both engaged',
      selfView: 'a counter that increments on events and decays on a timer.',
      rainView: 'nothing visible — it\'s the invisible engine'
    });

    console.log('OBJECTS: scanned and tagged ' + Object.keys(objects).length + ' objects');
  }

  // ───────────────────────────────────────────────────────
  // RENDER — subtle object outlines when hovered/interacted
  // ───────────────────────────────────────────────────────
  window.renderObjects = function(ctx, W, H) {
    var t = Date.now() * 0.001;

    // Show object count in bottom-left
    var objCount = Object.keys(objects).length;
    if (objCount > 0) {
      ctx.font = '4px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (0.06 + Math.sin(t) * 0.02).toFixed(3) + ')';
      ctx.fillText('📦 ' + objCount + ' objects · ' +
        Object.values(objects).reduce(function(s, o) { return s + o.items.length; }, 0) + ' items',
        4, H - 8);
    }
  };

  // ───────────────────────────────────────────────────────
  // BOOT — scan after DOM is ready
  // ───────────────────────────────────────────────────────
  setTimeout(scanAndTag, 3000);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaObjects = {
    register: registerObject,
    touch: touchObject,
    get: function(id) { return objects[id]; },
    all: function() { return objects; },
    count: function() { return Object.keys(objects).length; },
    items: function() {
      return Object.values(objects).reduce(function(all, o) {
        return all.concat(o.items.map(function(item) {
          return { object: o.id, item: item };
        }));
      }, []);
    },
    views: function(id, perspective) {
      var obj = objects[id];
      if (!obj) return null;
      return obj.views[perspective] || obj.views.rain;
    }
  };

  console.log('OBJECTS: registry ready. Object=composed. Item=NFT. Rain=outside view. Three perspectives on every thing.');
})();

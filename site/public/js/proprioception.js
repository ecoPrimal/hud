/* proprioception.js — full PNS/CNS sensing + feedback for the HUD
 *
 * Proprioception = knowing where your body is in space without looking.
 * The HUD needs to know:
 *   - What's being clicked (PNS — peripheral nerve impulse)
 *   - What's being hovered (sensation — approaching signal)
 *   - What's being typed (CNS — central processing)
 *   - What's visible/scrolled to (visual field — what the visitor sees)
 *   - What the chipmunk should say BECAUSE of all this (response)
 *
 * The infralayer: beneath all surfaces, connecting everything.
 * Every click → chipmunk feels it. Every hover → squirrel notices.
 * Every button press → trust gradient updates. Every orbit click → nav.
 *
 * The same DAG. The same π-step. But now with FEELING.
 *
 * Wave 180. The body knows where it is.
 */
(function () {
  'use strict';

  var PI = Math.PI;

  // ═══════════════════════════════════════════════════════════
  // NERVE MAP — every interactive surface on the HUD
  // ═══════════════════════════════════════════════════════════
  var nerves = {
    clicks: [],        // recent click events (PNS)
    hovers: [],        // recent hover zones (sensation)
    types: [],         // recent typed characters (CNS)
    scrolls: [],       // scroll position changes (vestibular)
    focuses: [],       // what element has focus (attention)
    last_action: null, // most recent action
    total_impulses: 0, // total nerve firings this session
  };

  // ═══════════════════════════════════════════════════════════
  // PNS — peripheral nervous system: CLICKING
  // Every click anywhere on the HUD = a nerve impulse
  // ═══════════════════════════════════════════════════════════
  function onClickAnywhere(e) {
    var target = e.target;
    var impulse = {
      ts: Date.now(),
      x: e.clientX,
      y: e.clientY,
      tag: target.tagName,
      id: target.id || null,
      className: (target.className || '').toString().substring(0, 50),
      text: (target.textContent || '').substring(0, 40),
      href: target.href || target.closest('a')?.href || null,
      button: target.closest('.ring-btn') ? target.closest('.ring-btn').querySelector('.lbl')?.textContent : null,
      dagDepth: target.dataset?.dagDepth || null,
      piLayer: target.dataset?.piLayer || null,
    };

    // Classify the nerve impulse
    if (impulse.button) {
      impulse.type = 'button';
      impulse.nerve = 'motor'; // deliberate action
    } else if (impulse.href) {
      impulse.type = 'link';
      impulse.nerve = 'motor';
    } else if (impulse.tag === 'CANVAS') {
      impulse.type = 'canvas';
      impulse.nerve = 'sensory'; // exploring the visualization
    } else if (impulse.tag === 'INPUT') {
      impulse.type = 'input';
      impulse.nerve = 'cns'; // central processing
    } else {
      impulse.type = 'surface';
      impulse.nerve = 'touch'; // touching the membrane
    }

    nerves.clicks.push(impulse);
    if (nerves.clicks.length > 50) nerves.clicks.shift();
    nerves.last_action = impulse;
    nerves.total_impulses++;

    // Feed to chipmunk
    feedChipmunk('click', impulse);

    // Feed to pi-step-dance as sensation
    feedDance(impulse);

    // Orbit click detection — clicking on Saturn ring canvas
    if (impulse.type === 'canvas' && target.id === 'saturn-ring-canvas') {
      handleOrbitClick(e, target);
    }

    // Emit nerve event
    try {
      document.dispatchEvent(new CustomEvent('nerve-impulse', { detail: impulse }));
    } catch (ex) {}
  }

  // ═══════════════════════════════════════════════════════════
  // ORBIT CLICK — clicking on Saturn ring repos
  // ═══════════════════════════════════════════════════════════
  function handleOrbitClick(e, canvas) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var cx = rect.width / 2;
    var cy = rect.height / 2;

    // Check if near center (hologram) or outer (ring)
    var dist = Math.sqrt((mx - cx) * (mx - cx) + (my - cy) * (my - cy));
    var maxR = Math.min(rect.width, rect.height) / 2;

    if (dist < maxR * 0.25) {
      // Clicked center → enter neutron view (inside the planet)
      if (window.C) window.C.act('scan');
      addChipmunkNote('you clicked the center — entering the planet within the ring');
    } else if (dist < maxR * 0.75) {
      // Clicked ring zone → determine which face
      var angle = Math.atan2(my - cy, mx - cx);
      var faces = ['security', 'discovery', 'evidence', 'science', 'compute', 'surface', 'culture', 'infra'];
      var faceIndex = Math.floor(((angle + PI + PI / 8) % (PI * 2)) / (PI * 2) * 8) % 8;
      var face = faces[faceIndex];

      addChipmunkNote('you touched the ' + face + ' face of the ring — ' + getFaceInfo(face));

      // Navigate to relevant content — face IS the pointer
      var faceRoutes = {
        science: '/springs',       // the face. my space, my thoughts, my reality.
        evidence: '/totality',     // the evidence. every grain weighed.
        culture: '/like-us',       // the culture. just like us.
        surface: '/',              // the HUD IS the surface.
        discovery: '/menagerie',   // the menagerie. all 47 organisms.
        security: '/nest',         // the nest. the DM's table.
        compute: '/ribosome',      // ribosome. fold and extrude.
        infra: '/vitruvian',       // vitruvian. body as architecture.
      };
      if (faceRoutes[face]) window.location.href = faceRoutes[face];
      if (window.C) window.C.act('explore');
    } else {
      // Clicked outer edge → the boundary, the weather
      addChipmunkNote('you touched the outer edge — that\'s the ionosphere. the weather. fleet territory.');
    }
  }

  function getFaceInfo(face) {
    var info = {
      security: 'bearDog (654MB, 36%), nestGate, rhizoCrypt. the crypto layer.',
      discovery: 'songBird (377MB, 21%), squirrel. the discovery engine.',
      evidence: 'publicRecord (252MB, 14%), detroit, whitePaper. the evidence.',
      science: 'sporePrint + 8 springs. 10,562+ validated tests. the science.',
      compute: 'toadStool, barraCuda, biomeOS. the compute layer.',
      surface: 'HUD, wateringHole, esotericWebb. the visible surface.',
      culture: 'sourdough, ludoSpring, pareidolia. the cultural layer.',
      infra: 'knot, echoLocator, petalTongue. the infrastructure.',
    };
    return info[face] || 'the unknown face';
  }

  // ═══════════════════════════════════════════════════════════
  // SENSATION — hovering, approaching signals
  // ═══════════════════════════════════════════════════════════
  var lastHoverTarget = null;

  function onHoverAnywhere(e) {
    var target = e.target;
    if (target === lastHoverTarget) return;
    lastHoverTarget = target;

    var hover = {
      ts: Date.now(),
      tag: target.tagName,
      id: target.id || null,
      text: (target.textContent || '').substring(0, 30),
      type: target.closest('.ring-btn') ? 'button'
        : target.closest('a') ? 'link'
        : target.tagName === 'CANVAS' ? 'canvas'
        : 'surface',
    };

    nerves.hovers.push(hover);
    if (nerves.hovers.length > 20) nerves.hovers.shift();
  }

  // ═══════════════════════════════════════════════════════════
  // CNS — typing, central processing
  // ═══════════════════════════════════════════════════════════
  function onTypeAnywhere(e) {
    if (e.target.id !== 'input') return; // only the HUD searchbar

    nerves.types.push({
      ts: Date.now(),
      key: e.key,
      value: e.target.value,
    });
    if (nerves.types.length > 100) nerves.types.shift();
  }

  // ═══════════════════════════════════════════════════════════
  // VESTIBULAR — scroll position (which part of HUD is visible)
  // ═══════════════════════════════════════════════════════════
  var scrollTimer = null;
  function onScroll() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      nerves.scrolls.push({
        ts: Date.now(),
        y: window.scrollY,
        vh: window.innerHeight,
        docH: document.body.scrollHeight,
        pct: window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1),
      });
      if (nerves.scrolls.length > 20) nerves.scrolls.shift();
    }, 200);
  }

  // ═══════════════════════════════════════════════════════════
  // FEED CHIPMUNK — tell the chipmunk what's happening
  // ═══════════════════════════════════════════════════════════
  function feedChipmunk(type, data) {
    // Rate limit — don't spam
    if (nerves.total_impulses > 1 && nerves.total_impulses % 5 !== 0) return;

    var log = document.getElementById('log');
    if (!log) return;

    // Only feed significant actions
    if (type === 'click' && data.type === 'surface') return; // ignore generic surface clicks

    // chipmunk notices
    if (data.button) {
      addChipmunkNote('you pressed ' + data.button + '. impulse #' + nerves.total_impulses);
    } else if (data.type === 'link' && data.text) {
      addChipmunkNote('following → ' + data.text.trim());
    }
  }

  function addChipmunkNote(text) {
    var log = document.getElementById('log');
    if (!log) return;

    var entry = document.createElement('div');
    entry.className = 'entry';
    entry.innerHTML = '<div class="who system" style="color:#7ee787">proprioception</div>'
      + '<div class="msg" style="font-size:9px;color:#8b949e">' + text + '</div>';
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  function feedDance(impulse) {
    // Feed the pi-step-dance sensation detector
    if (window._piStepDance) {
      // The click itself is a data point for the next dance step
      try {
        document.dispatchEvent(new CustomEvent('voxel-update', {
          detail: { key: 'proprioception', state: { impulse: impulse } }
        }));
      } catch (e) {}
    }
  }

  // ═══════════════════════════════════════════════════════════
  // MAKE ALL CANVASES CLICKABLE — Saturn ring, hologram, triad
  // ═══════════════════════════════════════════════════════════
  function wireCanvases() {
    // Saturn ring
    var saturnCanvas = document.querySelector('#saturn-ring canvas, canvas');
    if (saturnCanvas && !saturnCanvas.dataset.wired) {
      saturnCanvas.id = saturnCanvas.id || 'saturn-ring-canvas';
      saturnCanvas.style.cursor = 'pointer';
      saturnCanvas.style.pointerEvents = 'auto';
      saturnCanvas.dataset.wired = 'true';
    }

    // Edge triad canvas
    var triadCanvas = document.getElementById('edge-triad');
    if (triadCanvas && !triadCanvas.dataset.wired) {
      triadCanvas.style.pointerEvents = 'auto';
      triadCanvas.style.cursor = 'crosshair';
      triadCanvas.dataset.wired = 'true';
      triadCanvas.addEventListener('click', function (e) {
        var rect = triadCanvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var dist = Math.sqrt((mx - cx) * (mx - cx) + (my - cy) * (my - cy));

        if (dist < 50) {
          // Center — toggle triad geometry
          if (window._edgeTriad) {
            var status = window._edgeTriad.shiftGeom();
            addChipmunkNote('triad geometry → ' + status.geom + '. the backscatter shifts.');
          }
        } else {
          // Edge — shift dimension
          if (window._edgeTriad) {
            var status = window._edgeTriad.shiftDim();
            addChipmunkNote('dimension → ' + status.dim + '. the depth changes.');
          }
        }
      });
    }

    // Make hologram layer clickable
    var holoLayer = document.getElementById('hologram-layer');
    if (holoLayer && !holoLayer.dataset.wired) {
      holoLayer.style.pointerEvents = 'auto';
      holoLayer.style.cursor = 'pointer';
      holoLayer.dataset.wired = 'true';
      holoLayer.addEventListener('click', function () {
        // Click the hologram → go inside (neutron view)
        if (window.C) window.C.act('scan');
        addChipmunkNote('you entered the hologram — the planet inside the ring. looking from within.');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PROPRIOCEPTION STATUS — render nerve state on HUD
  // ═══════════════════════════════════════════════════════════
  function renderStatus() {
    var existing = document.getElementById('proprioception-status');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'proprioception-status';
    el.style.cssText = 'position:fixed;bottom:52px;left:12px;z-index:5;'
      + 'background:rgba(22,27,34,.85);border:1px solid rgba(126,231,135,.2);'
      + 'padding:6px 10px;border-radius:8px;width:130px;pointer-events:none;'
      + 'font:9px monospace;color:#8b949e;';

    function update() {
      var last = nerves.last_action;
      el.innerHTML = ''
        + '<div style="color:#7ee787;font-weight:bold">⚡ proprioception</div>'
        + '<div>impulses: ' + nerves.total_impulses + '</div>'
        + '<div>last: ' + (last ? last.type + (last.button ? ' (' + last.button + ')' : '') : '—') + '</div>'
        + '<div style="color:#484f58">PNS ' + nerves.clicks.length
        + ' · CNS ' + nerves.types.length + '</div>';
    }

    update();
    setInterval(update, 3000);
    document.body.appendChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._proprioception = {
    nerves: function () { return nerves; },
    wire: wireCanvases,
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT — wire everything, listen everywhere
  // ═══════════════════════════════════════════════════════════
  function init() {
    // Global listeners
    document.addEventListener('click', onClickAnywhere, true);
    document.addEventListener('mouseover', onHoverAnywhere, { passive: true });
    document.addEventListener('keydown', onTypeAnywhere, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Wire canvases
    wireCanvases();
    // Re-wire periodically (canvases may be created dynamically)
    setInterval(wireCanvases, 5000);

    // Render status widget
    renderStatus();

    console.log('[proprioception] PNS/CNS/vestibular active. every click = nerve impulse. '
      + 'orbits clickable. triad clickable. hologram clickable. chipmunk feels everything.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

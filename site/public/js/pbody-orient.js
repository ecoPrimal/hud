/* pbody-orient.js — the π-body sorts and orients view, sensation, interaction
 *
 * The HUD floats. The browser is the box. Both are free-floating, tethered.
 * The π-body is what ORIENTS everything:
 *
 *   VIEW:        what you SEE depends on your body's position
 *   SENSATION:   what you FEEL depends on your body's nerves
 *   INTERACTION: what you DO feeds back into your body's state
 *   SORT:        the body SORTS what matters from what doesn't
 *
 * The browser viewport IS the body's visual cortex.
 * The mouse IS the body's hand.
 * The scroll IS the body's legs (locomotion through depth).
 * The keyboard IS the body's voice.
 * Time spent IS the body's metabolism.
 *
 * The π-body has:
 *   - POSITION (where on the geodesic — from voxel-anchor)
 *   - ORIENTATION (which way facing — from mouse/scroll)
 *   - DEPTH (how deep in layers — from pi-align)
 *   - TEMPERATURE (how active — from heatmap-noise)
 *   - HEARTBEAT (how fast — from pulse-clock)
 *   - ATTENTION (what's focused — from proprioception)
 *   - DIMENSION (what dim perceived — from destabilize)
 *
 * The body SORTS the HUD:
 *   - Widgets on your HOT side (where you look/click) BRIGHTEN
 *   - Widgets on your COLD side (where you don't look) DIM
 *   - Content FLOWS toward your attention
 *   - Noise FLOWS away from your attention
 *
 * Wave 180. The body is the sort. The sort is the body.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══════════════════════════════════════════════════════════
  // BODY STATE — unified from all systems
  // ═══════════════════════════════════════════════════════════
  var body = {
    // Position in viewport (normalized 0-1)
    mouseX: 0.5,
    mouseY: 0.5,
    // Gaze direction (radians from center)
    gaze: 0,
    gazeStrength: 0,
    // Scroll depth (0 = top, 1 = bottom)
    scrollDepth: 0,
    // Time metrics
    sessionStart: Date.now(),
    lastAction: Date.now(),
    idleSeconds: 0,
    // Attention
    hotZone: 'center',  // where clicks cluster: left/right/top/bottom/center
    coldZone: null,
    // Accumulated
    totalGazeTime: { left: 0, right: 0, top: 0, bottom: 0, center: 0 },
    // Sorting
    sortOrder: [],
  };

  // ═══════════════════════════════════════════════════════════
  // TRACK GAZE — mouse position = where the eyes are looking
  // ═══════════════════════════════════════════════════════════
  function trackMouse(e) {
    body.mouseX = e.clientX / window.innerWidth;
    body.mouseY = e.clientY / window.innerHeight;

    // Gaze = angle from center of viewport
    var dx = body.mouseX - 0.5;
    var dy = body.mouseY - 0.5;
    body.gaze = Math.atan2(dy, dx);
    body.gazeStrength = Math.sqrt(dx * dx + dy * dy) * 2; // 0-1

    body.lastAction = Date.now();

    // Track which zone gets the most gaze time
    var zone = dx < -0.15 ? 'left' : dx > 0.15 ? 'right' : 'center';
    if (dy < -0.2) zone = 'top';
    if (dy > 0.2) zone = 'bottom';
    body.totalGazeTime[zone] = (body.totalGazeTime[zone] || 0) + 1;
  }

  // ═══════════════════════════════════════════════════════════
  // TRACK SCROLL — locomotion through the body
  // ═══════════════════════════════════════════════════════════
  function trackScroll() {
    var maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    body.scrollDepth = window.scrollY / maxScroll;
    body.lastAction = Date.now();
  }

  // ═══════════════════════════════════════════════════════════
  // COMPUTE HOT/COLD ZONES — where attention clusters
  // ═══════════════════════════════════════════════════════════
  function computeZones() {
    var zones = body.totalGazeTime;
    var maxZone = 'center', maxTime = 0;
    var minZone = 'center', minTime = Infinity;

    for (var z in zones) {
      if (zones[z] > maxTime) { maxTime = zones[z]; maxZone = z; }
      if (zones[z] < minTime) { minTime = zones[z]; minZone = z; }
    }

    body.hotZone = maxZone;
    body.coldZone = minZone;

    return { hot: maxZone, cold: minZone };
  }

  // ═══════════════════════════════════════════════════════════
  // SORT WIDGETS — orient HUD elements based on body state
  // ═══════════════════════════════════════════════════════════
  function sortWidgets() {
    var zones = computeZones();

    // All fixed-position HUD widgets
    var widgets = document.querySelectorAll('[id$="-widget"], [id$="-status"], [id$="-gradient"], '
      + '[id$="-prism"], [id$="-noise"], [id$="-anchor"], [id="pi-body-clock"], '
      + '[id="pi-step-widget"], [id="dag-breadcrumb"], [id="squirrel-presence"], '
      + '[id="permeability-gradient"], [id="klein-prism"], [id="heatmap-noise"], '
      + '[id="pi-align"], [id="voxel-status"], [id="proprioception-status"]');

    widgets.forEach(function (w) {
      var rect = w.getBoundingClientRect();
      var wx = (rect.left + rect.width / 2) / window.innerWidth;
      var wy = (rect.top + rect.height / 2) / window.innerHeight;

      // Distance from mouse/gaze
      var dx = wx - body.mouseX;
      var dy = wy - body.mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      // Widgets NEAR the gaze = bright, widgets FAR = dim
      var proximity = 1 - Math.min(dist * 1.5, 0.8);
      w.style.opacity = (0.4 + proximity * 0.6).toFixed(2);

      // Subtle scale: near = slightly larger
      var scale = 0.95 + proximity * 0.1;
      w.style.transform = 'scale(' + scale.toFixed(3) + ')';
      w.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    // Sort the main content area based on gaze
    var host = document.getElementById('membrane-focal-svg');
    if (host) {
      // Subtle parallax: content shifts slightly toward gaze
      var shiftX = (body.mouseX - 0.5) * -8;  // max ±4px
      var shiftY = (body.mouseY - 0.5) * -6;
      host.style.transform = 'translate(' + shiftX.toFixed(1) + 'px, '
        + shiftY.toFixed(1) + 'px)';
      host.style.transition = 'transform 1.2s ease';
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ORIENT VIEW — what you SEE changes with body orientation
  // ═══════════════════════════════════════════════════════════
  function orientView() {
    var align = window._piAlign;
    var perm = window._permeability;

    if (!align) return;
    var p = align.perspective();

    // Scroll maps to depth: top = ionosphere (0), bottom = pangaea (4)
    var depthFromScroll = body.scrollDepth * 4;

    // If scroll changed depth significantly, bounce to it
    if (Math.abs(depthFromScroll - p.depth) > 0.5) {
      align.bounce(depthFromScroll);
    }

    // Idle time affects view:
    // Long idle → drift outward (float away from membrane)
    // Active → stay engaged (maintain depth)
    body.idleSeconds = (Date.now() - body.lastAction) / 1000;

    if (body.idleSeconds > 60) {
      // Drifting... the HUD goes into float mode
      document.body.dataset.bodyState = 'floating';
      // Subtle rotation
      var driftAngle = body.idleSeconds * 0.01;
      var host = document.getElementById('membrane-focal-svg');
      if (host) {
        host.style.transform = 'rotate(' + (Math.sin(driftAngle) * 0.5).toFixed(2) + 'deg)';
      }
    } else if (body.idleSeconds > 15) {
      document.body.dataset.bodyState = 'resting';
    } else {
      document.body.dataset.bodyState = 'active';
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SENSATION FEEDBACK — body responds to environment
  // ═══════════════════════════════════════════════════════════
  function sensationLoop() {
    var dance = window._piStepDance;
    var thermal = window._heatmapNoise;

    if (dance && dance.tense) {
      var t = dance.tense();
      // If signalpoint detected, body REACTS
      if (t.now && t.now.signalpoint) {
        // Flash the viewport border
        document.body.style.boxShadow = '0 0 20px rgba(240,230,140,0.3) inset';
        setTimeout(function () {
          document.body.style.boxShadow = '';
        }, 1000);
      }
    }

    if (thermal) {
      var th = thermal.thermal();
      // Body temperature affects viewport color
      if (th.temp > 0.7) {
        document.body.style.borderTop = '1px solid rgba(248,81,73,0.2)';
      } else if (th.temp < 0.2) {
        document.body.style.borderTop = '1px solid rgba(88,166,255,0.2)';
      } else {
        document.body.style.borderTop = '';
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // INTERACTION SORT — clicks sort content priority
  // ═══════════════════════════════════════════════════════════
  function interactionSort() {
    var proprio = window._proprioception;
    if (!proprio) return;

    var nerves = proprio.nerves();
    var clicks = nerves.clicks;

    // What categories of things are being clicked most?
    var clickTypes = {};
    clicks.forEach(function (c) {
      var type = c.button || c.type;
      clickTypes[type] = (clickTypes[type] || 0) + 1;
    });

    // Sort by frequency
    body.sortOrder = Object.keys(clickTypes).sort(function (a, b) {
      return clickTypes[b] - clickTypes[a];
    });

    // Feed sort order to chipmunk (what should the chipmunk talk about?)
    if (body.sortOrder.length > 0 && clicks.length > 3) {
      var topInterest = body.sortOrder[0];
      // The chipmunk should notice what you're interested in
      if (window._piStepDance) {
        try {
          document.dispatchEvent(new CustomEvent('voxel-update', {
            detail: { key: 'body-interest', state: { top: topInterest, sort: body.sortOrder.slice(0, 3) } }
          }));
        } catch (e) {}
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — body state indicator
  // ═══════════════════════════════════════════════════════════
  function renderBody() {
    var existing = document.getElementById('pbody-status');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'pbody-status';
    el.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:7;'
      + 'background:rgba(13,17,23,.85);border:1px solid rgba(126,231,135,.15);'
      + 'border-radius:12px;padding:2px 10px;font:8px monospace;color:#484f58;'
      + 'pointer-events:none;display:flex;gap:6px;align-items:center;white-space:nowrap;';

    function update() {
      var zones = computeZones();
      var dim = window._destabilize ? window._destabilize.perception() : { dim: 2, name: 'plane', icon: '□' };
      var state = document.body.dataset.bodyState || 'active';

      var stateIcon = state === 'floating' ? '☁' : state === 'resting' ? '◌' : '●';
      var stateColor = state === 'floating' ? '#484f58' : state === 'resting' ? '#8b949e' : '#7ee787';

      el.innerHTML = ''
        + '<span style="color:' + stateColor + '">' + stateIcon + '</span>'
        + '<span>gaze:' + zones.hot + '</span>'
        + '<span style="color:#484f58">cold:' + zones.cold + '</span>'
        + '<span style="color:#58a6ff">' + dim.icon + 'dim' + dim.dim + '</span>'
        + '<span style="color:#484f58">idle:' + Math.round(body.idleSeconds) + 's</span>';
    }

    update();
    setInterval(update, 3000);
    document.body.appendChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._pbodyOrient = {
    body: function () { return body; },
    zones: computeZones,
    sort: sortWidgets,
    orient: orientView,
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT — wire everything
  // ═══════════════════════════════════════════════════════════
  function init() {
    // Track mouse (gaze)
    document.addEventListener('mousemove', trackMouse, { passive: true });
    // Track scroll (locomotion)
    window.addEventListener('scroll', trackScroll, { passive: true });

    // Main loop: sort + orient + sensation every π seconds
    setInterval(function () {
      sortWidgets();
      orientView();
      sensationLoop();
      interactionSort();
    }, Math.round(PI * 1000)); // every π ≈ 3.14 seconds

    // Render body status bar
    setTimeout(renderBody, 3000);

    console.log('[pbody-orient] body is the sort. mouse=gaze, scroll=locomotion, '
      + 'clicks=interaction, idle=drift. widgets dim/brighten by proximity. '
      + 'content parallax toward gaze. body state: active→resting→floating.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

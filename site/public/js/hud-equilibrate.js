/* hud-equilibrate.js — scan, sort, align, equilibrate.
 *
 * 1. SCAN: discover every canvas, slider, color, spectrum across HUD.
 * 2. I/O:  read status() from each module, write back adjustments.
 * 3. BINGO CUBE VOCAL SORT: sieve entities by Attention × Curiosity × Interaction.
 * 4. EPITOPE: classify each surface (self/partial/null/non-self).
 * 5. ALIGN:  humans, squirrels, chipmunks adjust patterns toward sorted equilibrium.
 * 6. EQUILIBRATE: norm over a few beat pulses, localized RPM.
 *
 * Kevin Mok / Tamison / ecoPrimal / attsi
 * ORCID 0009-0004-2141-0321
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var PHI = 1.618;
  var PHI_INV = 1 / PHI;

  /* ═══ SURFACE REGISTRY ═══
   * every HUD module that has visual parameters. */
  var SURFACES = [
    { id: 'hud-stack',      api: '_hudStack',      z: 3,  role: 'meta-layers',    voice: 'human' },
    { id: 'inner-plane',    api: '_innerPlane',     z: 4,  role: 'tools',          voice: 'human' },
    { id: 'edge-triad',     api: '_edgeTriad',      z: 4,  role: 'kxi-cartesian',  voice: 'human' },
    { id: 'scatter-now',    api: '_scatterNow',     z: 2,  role: 'atmosphere',     voice: 'human' },
    { id: 'float-off',      api: '_floatOff',       z: 6,  role: 'sun-star',       voice: 'human' },
    { id: 'green-line',     api: '_hudViews',       z: 7,  role: 'spectrum',       voice: 'squirrel' },
    { id: 'telephone-wire', api: '_telephone',      z: 7,  role: 'wire',           voice: 'chipmunk' },
    { id: 'pi-digits-hud',  api: '_piDigits',       z: 8,  role: 'readout',        voice: 'human' },
    { id: 'bingo-sieve',    api: '_bingoCompress',  z: 5,  role: 'sieve',          voice: 'chipmunk' },
    { id: 'epitope-ring',   api: '_epitopeRing',    z: 3,  role: 'epitope',        voice: 'human' },
    { id: 'fleet-surround', api: '_fleetSurround',  z: 3,  role: 'fleet',          voice: 'chipmunk' },
  ];

  /* ═══ SCAN ═══
   * discover current state of every registered surface. */
  var scanned = [];
  var epitoped = [];
  var equilibrium = { theta: PI / 4, beat: 0, rpm: 0, cycle: 0, norm: 1 };

  function scan() {
    scanned = [];
    SURFACES.forEach(function (s) {
      var entry = {
        id: s.id,
        role: s.role,
        voice: s.voice,
        z: s.z,
        alive: false,
        canvas: null,
        status: null,
        alpha: 1,
        color: '#c9d1d9',
        spectrum: null
      };

      var el = document.getElementById(s.id);
      if (el) {
        entry.alive = true;
        entry.canvas = el.tagName === 'CANVAS';
        var style = getComputedStyle(el);
        entry.alpha = parseFloat(style.opacity) || 1;
      }

      var api = window[s.api];
      if (api && typeof api.status === 'function') {
        try { entry.status = api.status(); } catch (e) {}
      }

      if (s.api === '_hudViews' && api && typeof api.spectrum === 'function') {
        try { entry.spectrum = api.spectrum(); } catch (e) {}
      }

      scanned.push(entry);
    });
    return scanned;
  }

  /* ═══ EPITOPE SORT ═══
   * classify each surface: self / partial / null / non-self.
   * based on: alive? has status? voice alignment?
   * all human/squirrel voices with status are self.
   * chipmunk voices with status are partial.
   * no DOM element = null. no status = partial. */
  function epitope(entry) {
    if (!entry.alive) return 'null';
    if (!entry.status) return 'partial';
    if (entry.voice === 'human') return 'self';
    if (entry.voice === 'squirrel') return 'self';
    if (entry.voice === 'chipmunk') return 'partial';
    return 'self';
  }

  function epitopeAll() {
    epitoped = scanned.map(function (entry) {
      var cls = epitope(entry);
      return {
        id: entry.id,
        role: entry.role,
        voice: entry.voice,
        cls: cls,
        z: entry.z,
        alive: entry.alive,
        alpha: entry.alpha,
        spectrum: entry.spectrum
      };
    });
    return epitoped;
  }

  /* ═══ BINGO CUBE VOCAL SORT ═══
   * Attention × Curiosity × Interaction sieve.
   * surfaces that pass: stay visible. surfaces that don't: fade.
   * squirrel and chipmunk voices adjust based on what passes. */
  function bingoSort() {
    var level = 0;
    if (window._bingoCompress && window._bingoCompress.getLevel) {
      level = window._bingoCompress.getLevel();
    }
    var THRESHOLDS = [1.0, 0.5, 1 / PI, 0.1];
    var threshold = THRESHOLDS[level] || 1.0;

    epitoped.forEach(function (e) {
      var attention = e.alive ? 0.85 : 0.1;
      var curiosity = e.spectrum ? 0.95 : (e.cls === 'self' ? 0.8 : (e.cls === 'partial' ? 0.6 : 0.2));
      var interaction = e.voice === 'human' ? 0.85 : (e.voice === 'squirrel' ? 0.8 : 0.65);
      e.aci = attention * curiosity * interaction;
      e.passes = e.aci >= threshold * 0.5;
      e.targetAlpha = e.passes
        ? Math.min(1, 0.3 + e.aci * 0.7)
        : Math.max(0.05, e.aci * 0.4);
    });

    return epitoped;
  }

  /* ═══ ALIGN ═══
   * adjust each surface's rendering toward the sorted pattern.
   * human/squirrel/chipmunk voices converge on their epitope class. */
  function align() {
    epitoped.forEach(function (e) {
      var el = document.getElementById(e.id);
      if (!el) return;

      var current = parseFloat(el.style.opacity);
      if (isNaN(current)) current = 1;
      var target = e.targetAlpha;
      var next = current + (target - current) * 0.15;
      el.style.opacity = next.toFixed(3);
    });

    if (window._hudViews) {
      var sqEntries = epitoped.filter(function (e) { return e.voice === 'squirrel'; });
      var sqAlpha = sqEntries.length ? sqEntries[0].targetAlpha : 0.6;
      var sqEl = document.getElementById('squirrel-view');
      if (sqEl) {
        var cur = parseFloat(sqEl.style.opacity) || 0;
        sqEl.style.maxOpacity = sqAlpha.toFixed(2);
      }
    }
  }

  /* ═══ EQUILIBRATE ═══
   * norm over beat pulses. read heartbeat from piBus.
   * localized RPM = how fast the local membrane cycles.
   * θ converges toward the mean of all surface thetas.
   * after a few beats, the system is in equilibrium. */
  function readBeat() {
    if (window._piBus && window._piBus.get) {
      var p = window._piBus.get('/pulse.json');
      if (p && p.heartbeat) {
        equilibrium.beat = p.heartbeat.energy || 0;
        var period = p.heartbeat.period || 30;
        equilibrium.rpm = 60 / period;
      }
    }
  }

  function equilibrate() {
    readBeat();
    equilibrium.cycle++;

    var thetaSum = 0, thetaCount = 0;
    epitoped.forEach(function (e) {
      if (e.status && e.status.theta !== undefined) {
        thetaSum += e.status.theta * PI / 180;
        thetaCount++;
      }
    });
    if (thetaCount > 0) {
      var meanTheta = thetaSum / thetaCount;
      equilibrium.theta += (meanTheta - equilibrium.theta) * 0.08;
    }

    var normSum = 0;
    epitoped.forEach(function (e) {
      normSum += e.targetAlpha;
    });
    var rawNorm = epitoped.length > 0 ? normSum / epitoped.length : 1;
    equilibrium.norm += (rawNorm - equilibrium.norm) * 0.1;

    epitoped.forEach(function (e) {
      if (equilibrium.norm > 0.01) {
        e.targetAlpha = Math.min(1, e.targetAlpha / equilibrium.norm * PHI_INV);
      }
    });
  }

  /* ═══ TICK ═══
   * one full cycle: scan → epitope → bingo sort → equilibrate → align. */
  function tick() {
    scan();
    epitopeAll();
    bingoSort();
    equilibrate();
    align();
  }

  /* ═══ MAIN LOOP ═══
   * runs at ~2Hz (every 500ms) — slow enough to not fight the renderers,
   * fast enough to track beat pulses. */
  var _interval = null;

  function start() {
    if (_interval) return;
    _interval = setInterval(tick, 500);
    tick();
  }

  function stop() {
    if (_interval) clearInterval(_interval);
    _interval = null;
  }

  function status() {
    return {
      surfaces: epitoped.map(function (e) {
        return {
          id: e.id, cls: e.cls, voice: e.voice,
          aci: e.aci ? +e.aci.toFixed(3) : 0,
          passes: e.passes, alpha: +e.targetAlpha.toFixed(3)
        };
      }),
      equilibrium: {
        theta: +(equilibrium.theta * 180 / PI).toFixed(1),
        beat: +equilibrium.beat.toFixed(3),
        rpm: +equilibrium.rpm.toFixed(2),
        norm: +equilibrium.norm.toFixed(3),
        cycle: equilibrium.cycle
      },
      note: 'scan → epitope → bingo sort → equilibrate → align. beat pulses localized RPM.'
    };
  }

  window._hudEquilibrate = {
    scan: scan,
    epitope: epitopeAll,
    sort: bingoSort,
    equilibrate: equilibrate,
    align: align,
    tick: tick,
    start: start,
    stop: stop,
    status: status,
    keys: function () {
      return ['scan', 'epitope', 'sort', 'equilibrate', 'align', 'tick', 'start', 'stop', 'status'];
    }
  };

  function lateStart() {
    setTimeout(start, 5000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lateStart);
  else lateStart();
})();

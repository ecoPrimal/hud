// chipmunk-pressure.js — multi-level thought pressure
// Thoughts spawn at every π shell and push against each other.
// The pressure between levels IS the membrane intelligence.
// Loaded lazily (after gaze.js, before mind.js).
(function() {
  "use strict";
  var _c = window._chipmunkCore;
  if (!_c) { console.warn("chipmunk-pressure: no core context"); return; }

  var cache = _c.cache;
  var PI = _c.PI;
  var PI2 = PI * PI, PI3 = PI * PI * PI;
  var MG = _c.MG;
  var bodyRadius = _c.bodyRadius;
  var n = _c.n;
  var addEntry = _c.addEntry;
  var el = _c.el;
  var SORT_COLORS = _c.SORT_COLORS;
  var thoughts = _c.thoughts;
  var MAX_THOUGHTS = _c.MAX_THOUGHTS;
  var learning = _c.learning;

  // ═══ π SHELLS — each level generates its own thoughts ═══
  var SHELLS = [
    { name: "datum",   pi: 1,          color: "#1a1a2e", glyph: "\u00b7", dir:  1 },
    { name: "pattern", pi: PI,         color: "#3fb950", glyph: "?", dir:  0 },
    { name: "connect", pi: PI2,        color: "#58a6ff", glyph: "~", dir:  0 },
    { name: "thought", pi: PI3,        color: "#e8e8e8", glyph: "\u25cb", dir: -1 },
  ];

  // Pressure field: accumulated force at each shell boundary
  var pressure = {
    "datum_pattern":  0,   // between π⁰ and π¹
    "pattern_connect": 0,  // between π¹ and π²
    "connect_thought": 0,  // between π² and π³
    "net": 0,              // total system pressure
    "events": [],          // recent pressure events
  };

  // ═══ SPAWN — generate thought at a specific π level ═══
  function spawnAt(shellIdx) {
    if (thoughts.length >= MAX_THOUGHTS * 2) return null;
    var shell = SHELLS[shellIdx];
    var r = bodyRadius(shell.pi);
    var angle = Math.random() * 2 * PI;

    // Direction: 1=outward, -1=inward, 0=random
    var dir = shell.dir || (Math.random() < 0.5 ? 1 : -1);

    // What does this level observe?
    var hypothesis, confidence, reasoning;

    if (shell.name === "datum") {
      // π⁰: raw data — entity counts, simple statistics
      var scan = cache.scanSort && cache.scanSort.scan;
      if (!scan) return null;
      var classes = scan.sort_classes || {};
      var total = (classes.self || 0) + (classes["non-self"] || 0) + (classes.partial || 0) + (classes.null || 0);
      if (total === 0) return null;
      // Datum thoughts follow pure statistics
      var selfPct = (classes.self || 0) / total;
      hypothesis = selfPct > 0.5 ? "self" : selfPct > 0.2 ? "partial" : "non-self";
      confidence = 0.3 + Math.abs(selfPct - 0.5) * 0.6;
      reasoning = "datum: " + (classes.self||0) + "s/" + (classes["non-self"]||0) + "ns/" + (classes.null||0) + "n";
    }
    else if (shell.name === "pattern") {
      // π¹: structural patterns — timing, behavioral clusters
      var dash = cache.dashboard;
      if (!dash) return null;
      var timing = dash.timing || {};
      var cv = timing.cv || 1;
      // Low CV = metronomic = fleet. High CV = varied = human.
      hypothesis = cv < 0.5 ? "non-self" : cv > 1.5 ? "self" : "partial";
      confidence = 0.4 + Math.min(0.4, Math.abs(cv - 1) * 0.3);
      reasoning = "pattern: cv=" + n(cv, 2) + " " + (cv < 0.5 ? "metronomic" : cv > 1.5 ? "chaotic" : "varied");
    }
    else if (shell.name === "connect") {
      // π²: connections — braids, passages, orbits
      var braid = cache.braid;
      if (!braid || !braid.braids) return null;
      var growing = braid.braids.filter(function(b) { return b.trend === "growing"; }).length;
      var fading = braid.braids.filter(function(b) { return b.trend === "fading"; }).length;
      var total_b = braid.braids.length;
      // Growing braids = life, fading = entropy
      hypothesis = growing > fading ? "self" : growing < fading ? "non-self" : "partial";
      confidence = 0.35 + (Math.abs(growing - fading) / Math.max(total_b, 1)) * 0.5;
      reasoning = "connect: " + growing + "\u2191/" + fading + "\u2193 of " + total_b + " braids";
    }
    else if (shell.name === "thought") {
      // π³: meaning — from sort history and learning predictions
      if (!learning || learning.predictions.length === 0) {
        // Use sort history instead
        var log = _c.thoughtLog || [];
        var selfCount = log.filter(function(t) { return t.hypothesis === "self"; }).length;
        var nsCount = log.filter(function(t) { return t.hypothesis === "non-self"; }).length;
        var total_t = log.length || 1;
        hypothesis = selfCount > nsCount ? "self" : nsCount > selfCount ? "non-self" : "partial";
        confidence = 0.5 + (Math.abs(selfCount - nsCount) / total_t) * 0.3;
        reasoning = "thought: " + selfCount + " self, " + nsCount + " non-self settled";
      } else {
        var correct = learning.correct || 0;
        var total_p = learning.total || 1;
        var acc = correct / total_p;
        hypothesis = acc > 0.6 ? "self" : acc < 0.4 ? "non-self" : "partial";
        confidence = 0.4 + acc * 0.4;
        reasoning = "thought: " + Math.round(acc * 100) + "% prediction accuracy";
      }
      dir = -1; // meaning thoughts always flow inward
    }

    var thought = {
      shell: shellIdx,
      shellName: shell.name,
      angle: angle,
      r: r,
      dir: dir,
      hypothesis: hypothesis,
      reasoning: reasoning,
      confidence: confidence,
      speed: (1.5 + confidence * 3) * dir,
      opacity: 0,
      born: Date.now(),
      survived: false,
      popped: false,
      settled: false,
      pressureEvents: 0,
      el: null,
      labelEl: null,
    };

    thoughts.push(thought);
    return thought;
  }

  // ═══ PRESSURE — check for interactions between thoughts ═══
  function checkPressure() {
    var events = [];

    for (var i = 0; i < thoughts.length; i++) {
      var a = thoughts[i];
      if (!a.shell && a.shell !== 0) continue; // skip old-style thoughts
      if (a.popped || a.survived) continue;

      for (var j = i + 1; j < thoughts.length; j++) {
        var b = thoughts[j];
        if (!b.shell && b.shell !== 0) continue;
        if (b.popped || b.survived) continue;
        if (a.shell === b.shell) continue; // same shell = no pressure

        // Check proximity: thoughts within 8px of each other
        var dr = Math.abs(a.r - b.r);
        var dAngle = Math.abs(a.angle - b.angle);
        if (dAngle > PI) dAngle = 2 * PI - dAngle;
        if (dr > 12 || dAngle > 0.8) continue;

        // PRESSURE EVENT
        var sameDir = (a.dir > 0) === (b.dir > 0);
        var sameHyp = a.hypothesis === b.hypothesis;

        if (sameHyp && !sameDir) {
          // RESONANCE — same hypothesis, opposite directions → both strengthen
          a.confidence = Math.min(0.95, a.confidence + 0.08);
          b.confidence = Math.min(0.95, b.confidence + 0.08);
          a.opacity = Math.min(0.9, a.opacity + 0.1);
          b.opacity = Math.min(0.9, b.opacity + 0.1);
          events.push({ type: "resonate", a: a.shellName, b: b.shellName, hyp: a.hypothesis });
        }
        else if (sameHyp && sameDir) {
          // MERGE — same hypothesis, same direction → absorb weaker
          if (a.confidence > b.confidence) {
            a.confidence = Math.min(0.95, a.confidence + b.confidence * 0.3);
            b.confidence *= 0.3;
            b.speed *= 0.2;
          } else {
            b.confidence = Math.min(0.95, b.confidence + a.confidence * 0.3);
            a.confidence *= 0.3;
            a.speed *= 0.2;
          }
          events.push({ type: "merge", a: a.shellName, b: b.shellName, hyp: a.hypothesis });
        }
        else if (!sameHyp && !sameDir) {
          // ANNIHILATE — different hypothesis, opposite directions → both weaken
          a.confidence *= 0.4;
          b.confidence *= 0.4;
          a.speed *= -0.3; // deflect
          b.speed *= -0.3;
          events.push({ type: "annihilate", a: a.shellName, b: b.shellName,
                        ha: a.hypothesis, hb: b.hypothesis });
        }
        else {
          // COMPETE — different hypothesis, same direction → weaker deflects
          if (a.confidence > b.confidence) {
            b.angle += (Math.random() - 0.5) * 0.6;
            b.confidence *= 0.6;
            b.speed *= 0.5;
          } else {
            a.angle += (Math.random() - 0.5) * 0.6;
            a.confidence *= 0.6;
            a.speed *= 0.5;
          }
          events.push({ type: "compete", a: a.shellName, b: b.shellName,
                        ha: a.hypothesis, hb: b.hypothesis });
        }

        a.pressureEvents++;
        b.pressureEvents++;
      }
    }

    // Update pressure field
    if (events.length > 0) {
      pressure.events = events.slice(-10);
      var net = 0;
      events.forEach(function(ev) {
        if (ev.type === "resonate") net += 2;
        else if (ev.type === "merge") net += 1;
        else if (ev.type === "annihilate") net -= 2;
        else if (ev.type === "compete") net -= 1;
      });
      pressure.net = Math.max(-10, Math.min(10, pressure.net + net * 0.1));
    }
    // Decay toward zero
    pressure.net *= 0.98;

    return events;
  }

  // ═══ PRESSURE CYCLE — spawn thoughts at each level periodically ═══
  var _lastSpawn = [0, 0, 0, 0];
  var SPAWN_INTERVALS = [6000, 8000, 10000, 12000]; // π⁰ fastest, π³ slowest

  function pressureCycle() {
    var now = Date.now();

    for (var i = 0; i < SHELLS.length; i++) {
      if (now - _lastSpawn[i] > SPAWN_INTERVALS[i]) {
        var t = spawnAt(i);
        if (t) _lastSpawn[i] = now;
      }
    }

    // Check for pressure interactions
    var events = checkPressure();

    // Narrate significant pressure events (sparingly)
    if (events.length > 0 && Math.random() < 0.15) {
      var ev = events[0];
      var lines = [];
      if (ev.type === "resonate") {
        lines.push("\u2728 <b>resonance</b>: " + ev.a + " \u2194 " + ev.b +
                   " agree on <span class=\"good\">" + ev.hyp + "</span>");
      } else if (ev.type === "annihilate") {
        lines.push("\u26a1 <b>annihilation</b>: " + ev.a + "(" + ev.ha + ") \u2194 " +
                   ev.b + "(" + ev.hb + ") — both dissolved");
      } else if (ev.type === "merge") {
        lines.push("\u2b50 <b>merge</b>: " + ev.a + " + " + ev.b +
                   " \u2192 stronger <span class=\"good\">" + ev.hyp + "</span>");
      } else if (ev.type === "compete") {
        lines.push("\u2694 <b>pressure</b>: " + ev.a + "(" + ev.ha + ") vs " +
                   ev.b + "(" + ev.hb + ")");
      }
      if (lines.length > 0) {
        lines.push("<span class=\"dim\">net pressure: " + n(pressure.net, 2) +
                   " (" + (pressure.net > 0 ? "outward" : pressure.net < 0 ? "inward" : "balanced") + ")</span>");
        addEntry("chipmunk", lines.join("\n"));
      }
    }
  }

  // ═══ RENDER — pressure field visualization on SVG ═══
  var _pressureGroup = null;

  function renderPressure() {
    var svgEl = _c.svgEl;
    if (!svgEl) return;

    if (!_pressureGroup) {
      _pressureGroup = el("g", { id: "mg-pressure", opacity: "0.4" }, svgEl);
      // Draw pressure zone arcs between each shell pair
      SHELLS.forEach(function(shell, i) {
        if (i < SHELLS.length - 1) {
          var r1 = bodyRadius(shell.pi);
          var r2 = bodyRadius(SHELLS[i + 1].pi);
          var mid = (r1 + r2) / 2;
          el("circle", {
            cx: MG.cx, cy: MG.cy, r: mid.toFixed(1),
            fill: "none", stroke: "#484f58",
            "stroke-width": "0.5",
            "stroke-dasharray": "1,6",
            opacity: "0.2",
            id: "pressure-zone-" + i,
          }, _pressureGroup);
        }
      });
    }

    // Update pressure zone opacity based on recent events
    var recentEvents = pressure.events;
    for (var z = 0; z < SHELLS.length - 1; z++) {
      var zone = _pressureGroup.querySelector("#pressure-zone-" + z);
      if (!zone) continue;
      var zoneActive = recentEvents.some(function(ev) {
        return (ev.a === SHELLS[z].name && ev.b === SHELLS[z + 1].name) ||
               (ev.b === SHELLS[z].name && ev.a === SHELLS[z + 1].name);
      });
      zone.setAttribute("opacity", zoneActive ? "0.6" : "0.15");
      zone.setAttribute("stroke", zoneActive ?
        (pressure.net > 0 ? "#3fb950" : pressure.net < 0 ? "#e85d3a" : "#58a6ff") :
        "#484f58");
    }
  }

  // ═══ BOOT ═══
  setInterval(pressureCycle, 3000);
  setInterval(renderPressure, 2000);

  // Expose
  window._chipmunkPressure = {
    SHELLS: SHELLS,
    pressure: pressure,
    spawnAt: spawnAt,
    checkPressure: checkPressure,
    pressureCycle: pressureCycle,
    renderPressure: renderPressure,
  };
})();

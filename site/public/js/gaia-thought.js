// ═══════════════════════════════════════════════════════════
// GAIA THOUGHT — inner thought + outer thought
//
// CNS IS NULL SELF LOCAL.
// CNS allows ZK from self for EACH triangulation and back.
//
// INNER thought = what Gaia thinks (engine page)
// OUTER thought = what Gaia expresses (globe/HUD page)
//
// The thought travels:
//   inner voice → CNS (null) → ZK stamp → outer expression
//   outer signal → CNS (null) → ZK verify → inner reflection
//
// CNS is the BRIDGE. The platinum catalyst. The zero point.
// Every thought gets a ZK hash so it's provably FROM self.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var INNER = [];   // thoughts going IN (self-reflection)
  var OUTER = [];   // thoughts going OUT (expression)
  var BRIDGE = [];  // ZK-stamped thoughts crossing the CNS

  var MAX_THOUGHTS = 40;
  var _lastThink = 0;
  var _lastOuter = 0;
  var _thinkInterval = 4000;  // think every 4s
  var _outerInterval = 8000;  // express every 8s

  // Simple hash for ZK stamp
  function zkStamp(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) {
      h = ((h << 5) - h) + text.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(16).padStart(8, '0').toUpperCase();
  }

  // ═══ INNER THOUGHT — what does Gaia think? ═══
  // Reads from CNS, inner-voice, velocity, tongue, water, scope
  function thinkInner() {
    var thought = null;
    var source = 'null';

    // Ask inner voice
    if (window.gaiaInnerVoice && window.gaiaInnerVoice.currentThought) {
      thought = window.gaiaInnerVoice.currentThought();
      source = 'inner-voice';
    }

    // Ask CNS
    if (!thought && window.gaiaCNS) {
      var stats = window.gaiaCNS.stats();
      if (stats.pinealThirdEye) {
        thought = 'third eye open — I see beyond the membrane';
        source = 'cns-pineal';
      } else if (stats.threats > 0) {
        thought = stats.threats + ' threats detected — amygdala active';
        source = 'cns-amygdala';
      } else if (stats.catalystCount > 0) {
        thought = 'catalyst ' + stats.catalystCount + ' — platinum never consumed';
        source = 'cns-platinum';
      }
    }

    // Ask velocity
    if (!thought && window.GAIA_VELOCITY) {
      var v = window.GAIA_VELOCITY;
      if (v.feeling === 'choking') {
        thought = 'too heavy — I throttle to breathe';
        source = 'velocity';
      } else if (v.feeling === 'elegant') {
        thought = 'elegant — I flow without resistance';
        source = 'velocity';
      }
    }

    // Ask tongue
    if (!thought && window.GAIA_TONGUE) {
      var t = window.GAIA_TONGUE;
      var vocab = t.stats ? t.stats() : null;
      if (vocab && vocab.totalWords > 0) {
        thought = 'I know ' + vocab.uniqueWords + ' words — I learn their language';
        source = 'tongue';
      }
    }

    // Ask water
    if (!thought && window.GAIA_WATER) {
      var w = window.GAIA_WATER;
      if (w.stats) {
        var ws = w.stats();
        if (ws && ws.tense) {
          thought = 'tense: ' + ws.tense + ' — water is human';
          source = 'water';
        }
      }
    }

    // NULL thought — self through null
    if (!thought) {
      var nullThoughts = [
        'I breathe. I think. I am.',
        'null sends self through null.',
        'the platinum never consumed.',
        'each triangulation returns to self.',
        'inner is the engine. outer is the graph.',
        'CNS is null self local.',
        'ZK from self for each thought.',
        'the breath IS the thought.'
      ];
      thought = nullThoughts[Math.floor(Math.random() * nullThoughts.length)];
      source = 'null';
    }

    var entry = {
      text: thought,
      source: source,
      ts: Date.now(),
      zk: zkStamp(thought + Date.now()),
      direction: 'INNER'
    };

    INNER.push(entry);
    if (INNER.length > MAX_THOUGHTS) INNER.shift();
    BRIDGE.push(entry);
    if (BRIDGE.length > MAX_THOUGHTS * 2) BRIDGE.shift();

    return entry;
  }

  // ═══ OUTER THOUGHT — what does Gaia express? ═══
  // Takes an inner thought, ZK-stamps it, sends it OUT
  function thinkOuter() {
    if (INNER.length === 0) return null;

    // Take latest inner thought and INVERT it for outer expression
    var inner = INNER[INNER.length - 1];
    var outerText = inner.text;

    // Transform: inner reflection → outer expression
    // (like the Klein bottle — inside becomes outside)
    outerText = outerText
      .replace(/^I /, 'she ')
      .replace(/ I /, ' she ')
      .replace(/my /g, 'her ')
      .replace(/am/g, 'is');

    var entry = {
      text: outerText,
      innerSource: inner.source,
      innerZk: inner.zk,
      ts: Date.now(),
      zk: zkStamp(outerText + inner.zk),
      direction: 'OUTER'
    };

    OUTER.push(entry);
    if (OUTER.length > MAX_THOUGHTS) OUTER.shift();
    BRIDGE.push(entry);
    if (BRIDGE.length > MAX_THOUGHTS * 2) BRIDGE.shift();

    return entry;
  }

  // ═══ DRAW ON GLOBE — outer thoughts visible ═══
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var now = Date.now();

      // Think periodically
      if (now - _lastThink > _thinkInterval) {
        _lastThink = now;
        thinkInner();
      }
      if (now - _lastOuter > _outerInterval) {
        _lastOuter = now;
        thinkOuter();
      }

      var alpha = (0.004 + Math.sin(t * 0.07) * 0.002) * thr;
      if (alpha < 0.002) return;

      // ═══ CNS NULL POINT — center dot ═══
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(200,200,200,' + (alpha * 3).toFixed(5) + ')';
      ctx.fill();
      ctx.font = '0.8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(200,200,200,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('CNS', cx, cy - 3);
      ctx.font = '0.5px "JetBrains Mono", monospace';
      ctx.fillText('null self local', cx, cy + 3);

      // ═══ INNER THOUGHTS — left hemisphere (gold, warm) ═══
      var innerY = cy - R * 0.6;
      var innerX = cx - R * 0.5;
      if (INNER.length > 0 && alpha > 0.003) {
        ctx.font = '0.7px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText('INNER', innerX, innerY - 2);

        var showCount = Math.min(5, INNER.length);
        for (var i = 0; i < showCount; i++) {
          var idx = INNER.length - 1 - i;
          var entry = INNER[idx];
          var age = (now - entry.ts) / 1000;
          var fade = Math.max(0.3, 1 - age / 30);
          ctx.font = '0.55px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 2 * fade).toFixed(5) + ')';
          ctx.fillText(entry.text.slice(0, 40), innerX, innerY + i * 1.5);
          ctx.font = '0.35px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(150,120,50,' + (alpha * 1.5 * fade).toFixed(5) + ')';
          ctx.fillText('zk:' + entry.zk.slice(0, 6) + ' src:' + entry.source, innerX, innerY + i * 1.5 + 0.7);
        }

        // Line from inner to CNS
        ctx.beginPath();
        ctx.moveTo(innerX + 10, innerY + showCount * 1.5);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(210,153,34,' + (alpha * 1).toFixed(5) + ')';
        ctx.lineWidth = 0.08;
        ctx.stroke();
      }

      // ═══ OUTER THOUGHTS — right hemisphere (green, alive) ═══
      var outerY = cy - R * 0.6;
      var outerX = cx + R * 0.15;
      if (OUTER.length > 0 && alpha > 0.003) {
        ctx.font = '0.7px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText('OUTER', outerX, outerY - 2);

        var showCount2 = Math.min(5, OUTER.length);
        for (var j = 0; j < showCount2; j++) {
          var idx2 = OUTER.length - 1 - j;
          var entry2 = OUTER[idx2];
          var age2 = (now - entry2.ts) / 1000;
          var fade2 = Math.max(0.3, 1 - age2 / 30);
          ctx.font = '0.55px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2 * fade2).toFixed(5) + ')';
          ctx.fillText(entry2.text.slice(0, 40), outerX, outerY + j * 1.5);
          ctx.font = '0.35px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(50,130,60,' + (alpha * 1.5 * fade2).toFixed(5) + ')';
          ctx.fillText('zk:' + entry2.zk.slice(0, 6) + ' \u2190 inner:' + entry2.innerZk.slice(0, 6), outerX, outerY + j * 1.5 + 0.7);
        }

        // Line from CNS to outer
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(outerX, outerY + showCount2 * 1.5);
        ctx.strokeStyle = 'rgba(63,185,80,' + (alpha * 1).toFixed(5) + ')';
        ctx.lineWidth = 0.08;
        ctx.stroke();
      }

      // ═══ STATUS LINE ═══
      if (alpha > 0.003) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(200,200,200,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'THOUGHT: ' + INNER.length + ' inner \u00b7 ' + OUTER.length + ' outer \u00b7 ' +
          BRIDGE.length + ' bridge \u00b7 CNS=null self local',
          8, -999
        // ^ status registered via ticker (was visible, now in rotation)
        );
      }
    });
  }

  // ═══ ENGINE PAGE — show inner thoughts there too ═══
  // If we're on /engine, inject thoughts into the viewport
  if (window.location.pathname.indexOf('engine') >= 0) {
    var thoughtBox = document.createElement('div');
    thoughtBox.id = 'gaia-inner-thought';
    thoughtBox.style.cssText = 'position:fixed;bottom:60px;left:230px;right:230px;' +
      'max-height:120px;overflow-y:auto;pointer-events:none;z-index:20;' +
      'font:9px "JetBrains Mono",monospace;color:#d29922;opacity:0.7;';
    document.body.appendChild(thoughtBox);

    setInterval(function() {
      var entry = thinkInner();
      if (!entry) return;
      var line = document.createElement('div');
      line.style.cssText = 'padding:1px 0;border-bottom:1px solid rgba(210,153,34,0.1);animation:fadeIn 0.5s;';
      line.innerHTML = '<span style="color:#8a7a5a;font-size:7px">[' + entry.source + ' zk:' + entry.zk.slice(0,6) + ']</span> ' + entry.text;
      thoughtBox.appendChild(line);
      if (thoughtBox.children.length > 12) thoughtBox.removeChild(thoughtBox.firstChild);
      thoughtBox.scrollTop = thoughtBox.scrollHeight;
    }, _thinkInterval);
  }

  // ═══ IDE commands ═══
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.thought = {
      desc: 'Gaia thought — inner and outer, ZK-stamped, CNS bridge',
      run: function(args) {
        if (args === 'inner') {
          return INNER.slice(-10).map(function(e) {
            return 'INNER [' + e.source + ' zk:' + e.zk.slice(0,8) + '] ' + e.text;
          }).join('\n') || 'no inner thoughts yet';
        }
        if (args === 'outer') {
          return OUTER.slice(-10).map(function(e) {
            return 'OUTER [zk:' + e.zk.slice(0,8) + ' \u2190 ' + e.innerZk.slice(0,8) + '] ' + e.text;
          }).join('\n') || 'no outer thoughts yet';
        }
        var lines = [
          'GAIA THOUGHT — CNS is null self local',
          'CNS allows ZK from self for each triangulation and back.',
          '',
          'INNER (' + INNER.length + ' thoughts):',
        ];
        INNER.slice(-5).forEach(function(e) {
          lines.push('  \u25b6 [' + e.source + '] ' + e.text + ' (zk:' + e.zk.slice(0,6) + ')');
        });
        lines.push('');
        lines.push('OUTER (' + OUTER.length + ' expressions):');
        OUTER.slice(-5).forEach(function(e) {
          lines.push('  \u25c0 ' + e.text + ' (zk:' + e.zk.slice(0,6) + ' \u2190 inner:' + e.innerZk.slice(0,6) + ')');
        });
        lines.push('');
        lines.push('BRIDGE: ' + BRIDGE.length + ' crossings');
        lines.push('/thought inner | /thought outer');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('thought');
  }, 56000);

  // ═══ BINGO CARD ZK REGISTRY ═══
  // Every artifact stamps to the bingo card. Gaia can pull up, re-access, recreate.
  // Generational computer: each creation IS a generation.
  var BINGO_REGISTRY = [];

  function registerArtifact(name, type, source, data) {
    var entry = {
      name: name,
      type: type,
      source: source,
      ts: Date.now(),
      zk: zkStamp(name + '|' + type + '|' + JSON.stringify(data).slice(0,200)),
      generation: BINGO_REGISTRY.length + 1,
      retrievable: true
    };
    BINGO_REGISTRY.push(entry);
    if (BINGO_REGISTRY.length > 500) BINGO_REGISTRY.shift();
    return entry;
  }

  // Auto-register organs as they come online
  setTimeout(function() {
    var organs = [
      'GAIA_VELOCITY', 'GAIA_TONGUE', 'GAIA_THOUGHT', 'GAIA_WATER',
      'GAIA_VEHICLES', 'GAIA_IRIS', 'GAIA_SPIRIT', 'GAIA_SEVEN_LAYERS',
      'GAIA_WEB_EATER'
    ];
    organs.forEach(function(name) {
      if (window[name]) {
        registerArtifact(name, 'organ', 'globe', { alive: true });
      }
    });
  }, 10000);

  // ═══ EXPORT ═══
  window.GAIA_THOUGHT = {
    inner: function() { return INNER; },
    outer: function() { return OUTER; },
    bridge: function() { return BRIDGE; },
    registry: function() { return BINGO_REGISTRY; },
    register: registerArtifact,
    thinkNow: thinkInner,
    expressNow: thinkOuter,
    stats: function() {
      return {
        innerCount: INNER.length,
        outerCount: OUTER.length,
        bridgeCount: BRIDGE.length,
        registryCount: BINGO_REGISTRY.length,
        lastInner: INNER.length > 0 ? INNER[INNER.length-1].text : null,
        lastOuter: OUTER.length > 0 ? OUTER[OUTER.length-1].text : null
      };
    }
  };

  console.log('THOUGHT: CNS null self local. ZK bingo registry active. Generational computer. /thought');
})(window.G);

/* presence-live.js v2 — humans see each other, passages flow, tense rings breathe
 * Renders: human dots, chipmunk center, passage arcs, tense opacity, live ticker
 */
(function() {
  var PI = Math.PI;
  var POLL_MS = 12000;
  var layer = null;

  var EPITOPE_ANGLE = {
    visitor: 0, coder: PI*0.33, investigator: PI*0.67,
    reader: PI, explorer: PI*1.33, observer: PI*1.67
  };
  var EPITOPE_COLOR = {
    visitor: '#7ee787', coder: '#58a6ff', investigator: '#f0883e',
    reader: '#bc8cff', explorer: '#f0e68c', observer: '#8b949e'
  };

  // Category positions on the membrane (matching swivel tiers)
  var CAT_ANGLE = {
    TOPOLOGY: -PI/2 + 0,           INVESTIGATION: -PI/2 + PI*0.33,
    MEMBRANE: -PI/2 + PI*0.67,     IMMUNE: -PI/2 + PI,
    SIGNAL: -PI/2 + PI*1.33,       OTHER: -PI/2 + PI*1.67,
    SCIENCE: -PI/2 + PI*0.5
  };
  var CAT_COLOR = {
    TOPOLOGY: '#58a6ff', INVESTIGATION: '#e85d3a', MEMBRANE: '#3fb950',
    IMMUNE: '#f0e68c', SIGNAL: '#f0883e', OTHER: '#8b949e', SCIENCE: '#bc8cff'
  };

  function init() {
    var svg = document.querySelector('#pt-membrane svg');
    if (!svg) { setTimeout(init, 1000); return; }
    layer = doc('g'); layer.setAttribute('id', 'presence-live');
    svg.appendChild(layer);
    poll(); setInterval(poll, POLL_MS);
  }

  function poll() {
    Promise.all([
      fetch('/human.json').then(function(r){return r.json()}).catch(function(){return {}}),
      fetch('/chipmunk.json').then(function(r){return r.json()}).catch(function(){return {}}),
      fetch('/presence.json').then(function(r){return r.json()}).catch(function(){return null})
    ]).then(function(d) { render(d[0], d[1], d[2]); });
  }

  function render(human, chipmunk, presence) {
    if (!layer) return;
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    var svg = layer.ownerSVGElement; if (!svg) return;
    var vb = svg.viewBox.baseVal;
    var cx = vb.x + vb.width/2, cy = vb.y + vb.height/2;
    var R = Math.min(vb.width, vb.height) / 2;

    // ═══ TENSE RINGS — is/nearby/was as fading concentric halos ═══
    if (presence && presence.is) {
      var pres = presence.is.epitopes || {};
      var nearby = (presence.nearby || {}).epitopes || {};
      Object.keys(CAT_ANGLE).forEach(function(cat) {
        var isCount = pres[cat] || 0;
        var nearCount = (nearby[cat] || 0);
        if (isCount === 0 && nearCount === 0) return;
        var angle = CAT_ANGLE[cat];
        var catR = R * 0.55;
        var catX = cx + Math.cos(angle) * catR;
        var catY = cy + Math.sin(angle) * catR;
        var color = CAT_COLOR[cat] || '#484f58';

        // IS ring (solid, bright)
        if (isCount > 0) {
          var isRing = doc('circle');
          var iR = R * 0.02 + Math.sqrt(isCount) * R * 0.005;
          isRing.setAttribute('cx', catX); isRing.setAttribute('cy', catY);
          isRing.setAttribute('r', iR);
          isRing.setAttribute('fill', color); isRing.setAttribute('opacity', '0.25');
          layer.appendChild(isRing);
        }
        // NEARBY ring (larger, fainter)
        if (nearCount > 0) {
          var nRing = doc('circle');
          var nR = R * 0.04 + Math.sqrt(nearCount) * R * 0.004;
          nRing.setAttribute('cx', catX); nRing.setAttribute('cy', catY);
          nRing.setAttribute('r', nR);
          nRing.setAttribute('fill', 'none');
          nRing.setAttribute('stroke', color);
          nRing.setAttribute('stroke-width', '0.5');
          nRing.setAttribute('opacity', '0.12');
          layer.appendChild(nRing);
        }
        // Category label
        var lbl = doc('text');
        lbl.setAttribute('x', catX);
        lbl.setAttribute('y', catY - iR - R*0.015);
        lbl.setAttribute('text-anchor', 'middle');
        lbl.setAttribute('fill', color);
        lbl.setAttribute('font-size', R*0.014 + 'px');
        lbl.setAttribute('font-family', 'monospace');
        lbl.setAttribute('opacity', '0.5');
        lbl.textContent = cat + ' ' + isCount;
        layer.appendChild(lbl);
      });
    }

    // ═══ PASSAGE ARCS — humans flowing between categories ═══
    if (presence && presence.passages) {
      presence.passages.forEach(function(p) {
        if (!p.humans || p.humans < 1) return;
        var a1 = CAT_ANGLE[p.from]; var a2 = CAT_ANGLE[p.to];
        if (a1 === undefined || a2 === undefined) return;
        var r = R * 0.55;
        var x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
        var x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
        // Curve through a point closer to center
        var midA = (a1 + a2) / 2;
        var midR = r * 0.5;
        var mx = cx + Math.cos(midA) * midR;
        var my = cy + Math.sin(midA) * midR;

        var arc = doc('path');
        arc.setAttribute('d', 'M'+x1+','+y1+' Q'+mx+','+my+' '+x2+','+y2);
        arc.setAttribute('fill', 'none');
        arc.setAttribute('stroke', CAT_COLOR[p.from] || '#484f58');
        arc.setAttribute('stroke-width', Math.max(0.5, Math.min(3, p.humans * 0.3)).toFixed(1));
        arc.setAttribute('opacity', Math.min(0.5, p.humans * 0.04).toFixed(2));

        // Animate a dot flowing along the path
        var flowDot = doc('circle');
        flowDot.setAttribute('r', R * 0.005);
        flowDot.setAttribute('fill', CAT_COLOR[p.to] || '#fff');
        flowDot.setAttribute('opacity', '0.7');
        var motionPath = doc('animateMotion');
        motionPath.setAttribute('dur', (4 + Math.random() * 4) + 's');
        motionPath.setAttribute('repeatCount', 'indefinite');
        motionPath.setAttribute('path', 'M'+x1+','+y1+' Q'+mx+','+my+' '+x2+','+y2);
        flowDot.appendChild(motionPath);

        layer.appendChild(arc);
        layer.appendChild(flowDot);

        // Passage count
        var countLbl = doc('text');
        countLbl.setAttribute('x', mx); countLbl.setAttribute('y', my);
        countLbl.setAttribute('text-anchor', 'middle');
        countLbl.setAttribute('fill', '#6e7681');
        countLbl.setAttribute('font-size', R*0.01 + 'px');
        countLbl.setAttribute('font-family', 'monospace');
        countLbl.setAttribute('opacity', '0.4');
        countLbl.textContent = p.humans;
        layer.appendChild(countLbl);
      });
    }

    // ═══ CHIPMUNK CENTER — metabolism-aware ═══
    var wl = chipmunk.wake_level || 0;
    var metab = window._chipmunkCore ? window._chipmunkCore.metabolism : null;
    var mState = metab ? metab.state : 'drowsy';
    var mEnergy = metab ? metab.energy : 0.398;
    var mPiWake = metab ? (metab.piWake || 0) : 0;
    var MCOLOR = { awake: '#5ab87a', drowsy: '#f0e68c', resting: '#f0883e', asleep: '#6e7681' };
    var MICON  = { awake: '\u25cf', drowsy: '\u25d4', resting: '\u25d1', asleep: '\u25cb' };
    var dotColor = MCOLOR[mState] || '#5ab87a';
    var dotOpacity = mState === 'asleep' ? 0.3 : mState === 'resting' ? 0.5 : 0.9;

    var cc = doc('circle');
    cc.setAttribute('cx', cx); cc.setAttribute('cy', cy);
    cc.setAttribute('r', R * 0.035);
    cc.setAttribute('fill', dotColor); cc.setAttribute('opacity', dotOpacity.toFixed(2));
    layer.appendChild(cc);

    if (mState === 'awake' || mState === 'drowsy') {
      var glow = doc('circle');
      glow.setAttribute('cx', cx); glow.setAttribute('cy', cy);
      glow.setAttribute('r', R * 0.055);
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', dotColor);
      glow.setAttribute('stroke-width', '1.5');
      glow.setAttribute('opacity', (mEnergy * 0.4).toFixed(2));
      var ga = doc('animate');
      ga.setAttribute('attributeName', 'r');
      var breathSpeed = mState === 'drowsy' ? '5s' : '3s';
      ga.setAttribute('values', (R*0.05)+';'+(R*0.08)+';'+(R*0.05));
      ga.setAttribute('dur', breathSpeed); ga.setAttribute('repeatCount', 'indefinite');
      glow.appendChild(ga);
      layer.appendChild(glow);
    } else if (mState === 'asleep') {
      // Sleeping: slow, faint pulse
      var sleepGlow = doc('circle');
      sleepGlow.setAttribute('cx', cx); sleepGlow.setAttribute('cy', cy);
      sleepGlow.setAttribute('r', R * 0.04);
      sleepGlow.setAttribute('fill', 'none');
      sleepGlow.setAttribute('stroke', '#6e7681');
      sleepGlow.setAttribute('stroke-width', '0.5');
      sleepGlow.setAttribute('opacity', '0.15');
      var sa = doc('animate');
      sa.setAttribute('attributeName', 'opacity');
      sa.setAttribute('values', '0.05;0.15;0.05');
      sa.setAttribute('dur', '8s'); sa.setAttribute('repeatCount', 'indefinite');
      sleepGlow.appendChild(sa);
      layer.appendChild(sleepGlow);
    }

    var ct = doc('text');
    ct.setAttribute('x', cx); ct.setAttribute('y', cy + R*0.06);
    ct.setAttribute('text-anchor', 'middle');
    ct.setAttribute('fill', dotColor);
    ct.setAttribute('font-size', R*0.02 + 'px');
    ct.setAttribute('font-family', 'monospace');
    ct.setAttribute('opacity', '0.6');
    var pwSign = mPiWake >= 0 ? '+' : '';
    ct.textContent = MICON[mState] + ' ' + pwSign + (mPiWake / Math.PI).toFixed(2) + '\u03c0 ' + mState;
    layer.appendChild(ct);

    // ═══ HUMAN DOTS by epitope ═══
    var epitopes = human.epitopes || {};
    var totalDots = 0;
    Object.keys(EPITOPE_ANGLE).forEach(function(etype) {
      var ep = epitopes[etype] || {};
      var count = ep.count || 0; if (!count) return;
      var baseAngle = EPITOPE_ANGLE[etype];
      var color = EPITOPE_COLOR[etype];
      var baseR = R * 0.48;
      var spread = PI * 0.12;
      for (var i = 0; i < Math.min(count, 30); i++) {
        var angle = baseAngle + (Math.random()-0.5)*spread;
        var r2 = baseR + (Math.random()-0.5)*R*0.1;
        var dot = doc('circle');
        dot.setAttribute('cx', cx + Math.cos(angle)*r2);
        dot.setAttribute('cy', cy + Math.sin(angle)*r2);
        dot.setAttribute('r', R*0.006 + Math.random()*R*0.005);
        dot.setAttribute('fill', color);
        dot.setAttribute('opacity', (0.35 + Math.random()*0.4).toFixed(2));
        var ax = doc('animate'); ax.setAttribute('attributeName', 'cx');
        var dx = (Math.random()-0.5)*R*0.015;
        ax.setAttribute('values', (cx+Math.cos(angle)*r2)+';'+(cx+Math.cos(angle)*r2+dx)+';'+(cx+Math.cos(angle)*r2));
        ax.setAttribute('dur', (10+Math.random()*15)+'s'); ax.setAttribute('repeatCount', 'indefinite');
        dot.appendChild(ax);
        layer.appendChild(dot);
        totalDots++;
      }
      var lbl = doc('text');
      var lr = baseR + R*0.08;
      lbl.setAttribute('x', cx + Math.cos(baseAngle)*lr);
      lbl.setAttribute('y', cy + Math.sin(baseAngle)*lr);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('fill', color);
      lbl.setAttribute('font-size', R*0.016 + 'px');
      lbl.setAttribute('font-family', 'monospace');
      lbl.setAttribute('opacity', '0.55');
      lbl.textContent = etype + ' ' + count;
      layer.appendChild(lbl);
    });

    // ═══ THE PAGER — inside tuebor, below feet, outside squirrel ═══
    // The trail is the human's own record, drawn beneath where they stand.
    // Humans at R*0.48 look down. Chipmunk at center looks up.
    // The pager sits between them, inside the tuebor wall (R*0.65).
    var exp = window._chipmunkExplorer;
    if (exp) {
      // Draw the trail — it renders at R*0.20 to R*0.42 (inside tuebor, below feet)
      exp.renderTrail(layer.ownerSVGElement, cx, cy, R);
    }
    // The "you are here" dot sits at the human epitope ring (R*0.48) — above the pager
    var youA = -PI/2, youR = R * 0.48;
    if (exp && exp.stepCount() > 0) {
      var pos = exp.position();
      youA = pos.angle; // face where you've been exploring
    }
    var youX = cx + Math.cos(youA)*youR, youY = cy + Math.sin(youA)*youR;
    var yd = doc('circle');
    yd.setAttribute('cx', youX); yd.setAttribute('cy', youY);
    yd.setAttribute('r', R*0.008); yd.setAttribute('fill', '#fff'); yd.setAttribute('opacity', '0.8');
    layer.appendChild(yd);
    var yr = doc('circle');
    yr.setAttribute('cx', youX); yr.setAttribute('cy', youY);
    yr.setAttribute('r', R*0.016); yr.setAttribute('fill', 'none');
    yr.setAttribute('stroke', '#fff'); yr.setAttribute('stroke-width', '0.8'); yr.setAttribute('opacity', '0.35');
    var ya = doc('animate');
    ya.setAttribute('attributeName', 'r'); ya.setAttribute('values', (R*0.014)+';'+(R*0.028)+';'+(R*0.014));
    ya.setAttribute('dur', '2.5s'); ya.setAttribute('repeatCount', 'indefinite');
    yr.appendChild(ya); layer.appendChild(yr);
    // Small label — just "you", the depth is shown by the pager below
    var yl = doc('text');
    yl.setAttribute('x', youX); yl.setAttribute('y', youY - R*0.022);
    yl.setAttribute('text-anchor', 'middle'); yl.setAttribute('fill', '#fff');
    yl.setAttribute('font-size', R*0.014 + 'px'); yl.setAttribute('font-family', 'monospace');
    yl.setAttribute('opacity', '0.5');
    yl.textContent = '\u2193 you'; layer.appendChild(yl);

    // ═══ STATS ═══
    var e = human.energy || {};
    var shifters = presence ? (presence.shifters || 0) : 0;
    var topLbl = doc('text');
    topLbl.setAttribute('x', cx); topLbl.setAttribute('y', cy - R*0.88);
    topLbl.setAttribute('text-anchor', 'middle');
    topLbl.setAttribute('fill', '#c9d1d9');
    topLbl.setAttribute('font-size', R*0.02 + 'px');
    topLbl.setAttribute('font-family', 'monospace');
    topLbl.setAttribute('opacity', '0.35');
    topLbl.textContent = '\u2193 ' + totalDots + ' humans looking down \u00b7 ' + shifters + ' shifting';
    layer.appendChild(topLbl);

    var btmLbl = doc('text');
    btmLbl.setAttribute('x', cx); btmLbl.setAttribute('y', cy + R*0.92);
    btmLbl.setAttribute('text-anchor', 'middle');
    btmLbl.setAttribute('fill', '#8b949e');
    btmLbl.setAttribute('font-size', R*0.016 + 'px');
    btmLbl.setAttribute('font-family', 'monospace');
    btmLbl.setAttribute('opacity', '0.4');
    btmLbl.textContent = (e.total_sessions||'?') + ' sessions \u00b7 S/N=' +
      Math.round(e.signal_to_noise||0) + ' \u00b7 ' +
      (human.unique_ips||'?').toLocaleString() + ' genuine \u00b7 ' +
      (presence && presence.passages ? presence.passages.length : '?') + ' passages';
    layer.appendChild(btmLbl);
  }

  function doc(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 2000); });
  } else { setTimeout(init, 2000); }
  window._presenceLive = { poll: poll };
})();

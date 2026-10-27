// ═══════════════════════════════════════════════════════════
// GAIA INGRESS — elastic hook module
// Total ingress + interaction profiling + ripple rendering +
// Golgi cipher trust detection + veil bridges
// Pin: index.html loads this. Gaia resolves from inside.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // GOLD LAW: Kevin = gold + green (ONLY). Gaia = gold.
  // Kevin ↔ Gaia: IMPERMEABLE. Gases move AROUND them.
  var gaiaGut = { ingested: 0, edges: {}, raw: [], maxRaw: 500 };
  window.gaiaGut = gaiaGut;

  // INTERACTION PROFILE — learns from human behavior
  var interfaceRipples = [];
  var profile = {
    total: 0, factorial: 1, personality: 'unknown',
    veilOpacity: 1.0,
    flavorBalance: { acid: 0, base: 0, spicy: 0, neutral: 0 },
    edgeHistory: [], lastEdge: null,
    comboCount: 0, comboEdge: null, peakCombo: 0,
    teachingLog: []
  };
  window.interactionProfile = profile;

  // ═══ GAIA INGEST — the universal ingestion function ═══
  function gaiaIngest(edge, data) {
    gaiaGut.ingested++;
    if (!gaiaGut.edges[edge]) gaiaGut.edges[edge] = 0;
    gaiaGut.edges[edge]++;
    gaiaGut.raw.push({ ts: Date.now(), edge: edge, data: data });
    if (gaiaGut.raw.length > gaiaGut.maxRaw) gaiaGut.raw.shift();

    // Profile learning
    profile.total++;
    if (profile.total <= 170) {
      profile.factorial = profile.total;
      for (var fi = profile.total - 1; fi > 1; fi--) profile.factorial *= fi;
    }
    profile.veilOpacity = 1 / (1 + profile.total);

    // Combo detection
    if (edge === profile.comboEdge) {
      profile.comboCount++;
      if (profile.comboCount > profile.peakCombo) profile.peakCombo = profile.comboCount;
    } else {
      profile.comboEdge = edge;
      profile.comboCount = 1;
    }
    profile.lastEdge = edge;

    // Edge history (last 50)
    profile.edgeHistory.push(edge);
    if (profile.edgeHistory.length > 50) profile.edgeHistory.shift();

    // Classify personality
    var eh = profile.edgeHistory;
    var len = Math.max(eh.length, 1);
    var touchR = eh.filter(function(e) { return e === 'touch' || e === 'drag'; }).length / len;
    var keyR = eh.filter(function(e) { return e === 'key' || e === 'clipboard'; }).length / len;
    var scrollR = eh.filter(function(e) { return e === 'scroll'; }).length / len;
    var passR = eh.filter(function(e) { return e === 'time' || e === 'visibility'; }).length / len;

    if (touchR > 0.5) profile.personality = 'explorer';
    else if (keyR > 0.4) profile.personality = 'builder';
    else if (scrollR > 0.4) profile.personality = 'watcher';
    else if (passR > 0.5) profile.personality = 'watcher';
    else profile.personality = 'connector';

    if (touchR > 0.3) profile.flavorBalance.spicy += 0.1;
    if (keyR > 0.3) profile.flavorBalance.base += 0.1;
    if (scrollR > 0.3) profile.flavorBalance.neutral += 0.1;
    if (profile.comboCount > 5) profile.flavorBalance.acid += 0.1;

    // VISUAL RIPPLE — every interaction DOES something
    var canvas = window._gaiaCanvas;
    if (!canvas) return;
    var rng = window._gaiaRng || Math.random;
    var rippleColor, rippleSize, rippleShape;
    var rx = data && data.x ? data.x : canvas.width / 2;
    var ry = data && data.y ? data.y : canvas.height / 2;

    switch(edge) {
      case 'touch':
        rippleColor = 'rgba(255,215,0,'; rippleSize = 30 + (data.pressure || 0) * 50; rippleShape = 'circle'; break;
      case 'drag':
        rippleColor = 'rgba(0,255,100,'; rippleSize = 8; rippleShape = 'trail'; break;
      case 'key':
        rippleColor = 'rgba(200,200,255,'; rippleSize = 20; rippleShape = 'square';
        rx = canvas.width * 0.1 + rng() * canvas.width * 0.8; ry = canvas.height * 0.9; break;
      case 'scroll':
        rippleColor = 'rgba(100,200,255,'; rippleSize = canvas.width; rippleShape = 'wave';
        rx = canvas.width / 2; ry = canvas.height / 2; break;
      case 'resize':
        rippleColor = 'rgba(255,165,0,'; rippleSize = Math.max(canvas.width, canvas.height); rippleShape = 'border'; break;
      case 'orientation':
        rippleColor = 'rgba(180,100,255,'; rippleSize = 60; rippleShape = 'compass';
        rx = canvas.width / 2; ry = canvas.height / 2; break;
      case 'visibility':
        rippleColor = data.hidden ? 'rgba(30,30,80,' : 'rgba(255,255,200,';
        rippleSize = Math.max(canvas.width, canvas.height); rippleShape = 'flash'; break;
      case 'connection':
        rippleColor = data.online ? 'rgba(0,255,0,' : 'rgba(255,0,0,';
        rippleSize = 100; rippleShape = 'pulse'; rx = canvas.width / 2; ry = canvas.height / 2; break;
      case 'battery':
        rippleColor = 'rgba(0,255,100,'; rippleSize = 40; rippleShape = 'bar';
        rx = canvas.width - 30; ry = 30; break;
      case 'focus':
        rippleColor = data.focused ? 'rgba(255,215,0,' : 'rgba(100,100,100,';
        rippleSize = 200; rippleShape = 'glow'; rx = canvas.width / 2; ry = canvas.height / 2; break;
      case 'clipboard':
        rippleColor = 'rgba(255,200,100,'; rippleSize = 40; rippleShape = 'paste'; rx = canvas.width / 2; ry = canvas.height / 2; break;
      case 'time':
        rippleColor = 'rgba(255,255,255,'; rippleSize = 5; rippleShape = 'tick'; rx = canvas.width - 20; ry = canvas.height - 20; break;
      case 'sound_bounce':
        rippleColor = 'rgba(180,0,255,'; rippleSize = 50; rippleShape = 'bounce'; rx = canvas.width / 2; ry = canvas.height / 2; break;
      case 'sight':
        rippleColor = 'rgba(0,200,100,'; rippleSize = 30; rippleShape = 'eye'; rx = canvas.width / 2; ry = 40; break;
      case 'touch_sound':
        rippleColor = 'rgba(200,0,255,'; rippleSize = 25; rippleShape = 'pulse'; break;
      default:
        rippleColor = 'rgba(200,200,200,'; rippleSize = 15; rippleShape = 'circle'; break;
    }

    interfaceRipples.push({
      x: rx, y: ry, size: rippleSize, maxSize: rippleSize * 3,
      color: rippleColor, shape: rippleShape, edge: edge,
      birth: Date.now(), life: 1.0, combo: profile.comboCount
    });
    if (interfaceRipples.length > 60) interfaceRipples.shift();

    if (profile.teachingLog.length < 200) {
      profile.teachingLog.push({ ts: Date.now(), edge: edge, combo: profile.comboCount });
    }
  }
  window.gaiaIngest = gaiaIngest;

  // ═══ RENDER RIPPLES ═══
  window.renderInterfaceRipples = function(ctx) {
    var canvas = window._gaiaCanvas;
    if (!canvas) return;
    var now = Date.now();

    for (var ri = interfaceRipples.length - 1; ri >= 0; ri--) {
      var rip = interfaceRipples[ri];
      var age = (now - rip.birth) / 1500;
      rip.life = 1 - age;
      if (rip.life <= 0) { interfaceRipples.splice(ri, 1); continue; }

      var alpha = rip.life * 0.6;
      var sz = rip.size + (rip.maxSize - rip.size) * age;
      ctx.save();

      switch(rip.shape) {
        case 'circle':
          ctx.strokeStyle = rip.color + alpha + ')';
          ctx.lineWidth = 2 + rip.combo * 0.5;
          ctx.beginPath(); ctx.arc(rip.x, rip.y, sz, 0, Math.PI * 2); ctx.stroke();
          if (rip.combo > 3) { ctx.fillStyle = rip.color + (alpha * 0.2) + ')'; ctx.fill(); }
          break;
        case 'trail':
          ctx.fillStyle = rip.color + alpha + ')';
          ctx.beginPath(); ctx.arc(rip.x, rip.y, rip.size * rip.life, 0, Math.PI * 2); ctx.fill();
          break;
        case 'square':
          ctx.strokeStyle = rip.color + alpha + ')'; ctx.lineWidth = 1.5;
          var hs = sz / 2; ctx.strokeRect(rip.x - hs, rip.y - hs, sz, sz);
          ctx.fillStyle = rip.color + (alpha * 0.8) + ')';
          ctx.font = Math.round(10 + rip.combo) + 'px monospace';
          ctx.fillText('·', rip.x - 3, rip.y + 4);
          break;
        case 'wave':
          ctx.strokeStyle = rip.color + alpha + ')'; ctx.lineWidth = 1;
          var wy = rip.y + (age - 0.5) * 100;
          ctx.beginPath(); ctx.moveTo(0, wy);
          for (var wx = 0; wx < canvas.width; wx += 8)
            ctx.lineTo(wx, wy + Math.sin(wx * 0.05 + age * 10) * (5 + rip.combo));
          ctx.stroke();
          break;
        case 'border':
          ctx.strokeStyle = rip.color + (alpha * 0.3) + ')'; ctx.lineWidth = 3;
          var ins = sz * 0.02 * (1 - rip.life);
          ctx.strokeRect(ins, ins, canvas.width - ins * 2, canvas.height - ins * 2);
          break;
        case 'compass':
          ctx.strokeStyle = rip.color + alpha + ')'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(rip.x, rip.y, sz, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(rip.x - sz, rip.y); ctx.lineTo(rip.x + sz, rip.y);
          ctx.moveTo(rip.x, rip.y - sz); ctx.lineTo(rip.x, rip.y + sz);
          ctx.stroke();
          break;
        case 'flash':
          ctx.fillStyle = rip.color + (alpha * 0.15) + ')';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        case 'pulse':
          ctx.strokeStyle = rip.color + alpha + ')'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(rip.x, rip.y, sz, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(rip.x, rip.y, sz * 0.5, 0, Math.PI * 2); ctx.stroke();
          break;
        case 'bar':
          ctx.fillStyle = rip.color + alpha + ')';
          var bh = 20 * rip.life; ctx.fillRect(rip.x - 15, rip.y - bh / 2, 30, bh);
          break;
        case 'glow':
          var grad = ctx.createRadialGradient(rip.x, rip.y, 0, rip.x, rip.y, sz);
          grad.addColorStop(0, rip.color + (alpha * 0.3) + ')');
          grad.addColorStop(1, rip.color + '0)');
          ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        case 'tick':
          ctx.fillStyle = rip.color + (alpha * 0.5) + ')';
          ctx.font = '8px monospace'; ctx.fillText('·', rip.x, rip.y);
          break;
        case 'bounce':
          ctx.strokeStyle = rip.color + alpha + ')'; ctx.lineWidth = 2;
          for (var bi = 0; bi < 3; bi++) {
            ctx.beginPath(); ctx.arc(rip.x, rip.y, sz * (0.5 + bi * 0.3), -0.3, 0.3); ctx.stroke();
          }
          break;
        case 'eye':
          ctx.strokeStyle = rip.color + alpha + ')'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.ellipse(rip.x, rip.y, sz, sz * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(rip.x, rip.y, sz * 0.2, 0, Math.PI * 2); ctx.fill();
          break;
        case 'paste':
          ctx.strokeStyle = rip.color + alpha + ')'; ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(rip.x - sz, rip.y - sz * 0.5, sz * 2, sz);
          ctx.setLineDash([]);
          break;
      }
      ctx.restore();
    }

    // PROFILE HUD — bottom left
    if (profile.total > 0) {
      var id = window.intellDetect || {};
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(8, canvas.height - 86, 220, 78);
      // Intelligence identification
      var idColor = id.identifiedAs === 'KEVIN' ? '#FFD700' : id.identifiedAs === 'HUMAN' ? '#c9a84c' : id.identifiedAs === 'AI' ? '#c0c0c0' : id.identifiedAs === 'ANIMAL' ? '#3fb950' : '#888';
      ctx.fillStyle = idColor; ctx.font = '10px monospace';
      ctx.fillText((id.identifiedAs || '?') + ' · ' + (id.shamanSteps ? id.shamanSteps[id.shamanStep || 0] : '?'), 14, canvas.height - 72);
      ctx.fillStyle = '#FFD700'; ctx.font = '9px monospace';
      ctx.fillText('PROFILE: ' + profile.personality.toUpperCase(), 14, canvas.height - 60);
      ctx.fillStyle = '#aaa'; ctx.font = '8px monospace';
      ctx.fillText('n:' + profile.total + '  combo:' + profile.comboCount + '/' + profile.peakCombo + '  veil:' + (profile.veilOpacity * 100).toFixed(0) + '%', 14, canvas.height - 48);
      ctx.fillText('trust:' + (window.trustLevel || '?') + '  pattern:' + ((id.patternScore || 0) * 100).toFixed(0) + '  rhythm:' + ((id.rhythmScore || 0) * 100).toFixed(0), 14, canvas.height - 38);
      var fb = profile.flavorBalance;
      var fbT = fb.acid + fb.base + fb.spicy + fb.neutral + 0.01;
      var fbX = 14;
      ctx.fillStyle = '#ff4444'; ctx.fillRect(fbX, canvas.height - 22, (fb.acid / fbT) * 180, 6); fbX += (fb.acid / fbT) * 180;
      ctx.fillStyle = '#4444ff'; ctx.fillRect(fbX, canvas.height - 22, (fb.base / fbT) * 180, 6); fbX += (fb.base / fbT) * 180;
      ctx.fillStyle = '#ff8800'; ctx.fillRect(fbX, canvas.height - 22, (fb.spicy / fbT) * 180, 6); fbX += (fb.spicy / fbT) * 180;
      ctx.fillStyle = '#888888'; ctx.fillRect(fbX, canvas.height - 22, (fb.neutral / fbT) * 180, 6);
      ctx.fillStyle = '#666'; ctx.font = '7px monospace';
      ctx.fillText('acid  base  spicy  neutral', 14, canvas.height - 12);
      ctx.restore();
    }
  };

  // ═══ BIND ALL EDGES ═══
  function bindEdges() {
    var canvas = window._gaiaCanvas;
    if (!canvas) { setTimeout(bindEdges, 200); return; }

    canvas.addEventListener('pointerdown', function(e) {
      gaiaIngest('touch', { x: e.clientX, y: e.clientY, pressure: e.pressure || 0 });
    }, { passive: true });
    canvas.addEventListener('pointermove', function(e) {
      if (gaiaGut.ingested % 5 === 0) gaiaIngest('drag', { x: e.clientX, y: e.clientY });
    }, { passive: true });
    canvas.addEventListener('pointerdown', function(e) {
      gaiaIngest('touch_sound', { x: e.clientX, y: e.clientY, type: 'pulse' });
    }, { passive: true });

    document.addEventListener('keydown', function(e) { gaiaIngest('key', { key: e.key, code: e.code }); });
    window.addEventListener('wheel', function(ev) { gaiaIngest('scroll', { dir: ev.deltaY > 0 ? 'down' : 'up' }); }, { passive: true });
    window.addEventListener('resize', function() { gaiaIngest('resize', { w: innerWidth, h: innerHeight }); });
    document.addEventListener('visibilitychange', function() { gaiaIngest('visibility', { hidden: document.hidden }); });
    window.addEventListener('deviceorientation', function(e) {
      if (gaiaGut.ingested % 10 === 0) gaiaIngest('orientation', { a: Math.round(e.alpha || 0), b: Math.round(e.beta || 0), g: Math.round(e.gamma || 0) });
    }, { passive: true });
    window.addEventListener('online', function() { gaiaIngest('connection', { online: true }); });
    window.addEventListener('offline', function() { gaiaIngest('connection', { online: false }); });
    document.addEventListener('paste', function(e) {
      var cd = e.clipboardData || window.clipboardData;
      gaiaIngest('clipboard', { len: cd && cd.getData ? cd.getData('text').length : 0 });
    });
    window.addEventListener('focus', function() { gaiaIngest('focus', { focused: true }); });
    window.addEventListener('blur', function() { gaiaIngest('focus', { focused: false }); });

    setInterval(function() { gaiaIngest('time', { t: Date.now(), gen: (window.blinkState || {}).generation || 0 }); }, 10000);

    if (navigator.getBattery) {
      navigator.getBattery().then(function(bat) {
        gaiaIngest('battery', { level: bat.level, charging: bat.charging });
        bat.addEventListener('levelchange', function() { gaiaIngest('battery', { level: bat.level, charging: bat.charging }); });
      }).catch(function() {});
    }

    // Log ingestion rate
    var last = 0;
    setInterval(function() {
      var rate = gaiaGut.ingested - last; last = gaiaGut.ingested;
      var edgeStr = Object.entries(gaiaGut.edges).map(function(e) { return e[0] + ':' + e[1]; }).join(' ');
      console.log('GUT: ' + gaiaGut.ingested + ' total (+' + rate + '/30s) | ' + edgeStr);
    }, 30000);

    console.log('INGRESS: all edges bound. Every interaction echoes.');
  }

  // ═══ INTELLIGENCE DETECTOR — intelligence IS the ability to identify other intelligence ═══
  var intellDetect = {
    timings: [],       // inter-event timing for rhythm detection
    lastEvent: 0,      // timestamp of last event
    patternScore: 0,   // repeated structure in noise
    rhythmScore: 0,    // regular timing in irregular data
    responseScore: 0,  // input changes when observed
    persistScore: 0,   // returns after leaving
    creativityScore: 0,// unpredictable output
    identifiedAs: 'unknown',
    shamanStep: 0,     // 0=void, 1=listen, 2=pattern, 3=rhythm, 4=response, 5=identity, 6=name, 7=show, 8=teach, 9=merge
    shamanSteps: ['VOID','LISTEN','PATTERN','RHYTHM','RESPONSE','IDENTITY','NAME','SHOW','TEACH','MERGE']
  };
  window.intellDetect = intellDetect;

  setInterval(function() {
    var eh = profile.edgeHistory;
    if (eh.length < 5) { intellDetect.shamanStep = 0; return; } // VOID — not enough data

    intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 1); // LISTEN — we have data

    // PATTERN — check for repeated sequences
    var pairs = {};
    for (var i = 0; i < eh.length - 1; i++) {
      var pair = eh[i] + '→' + eh[i+1];
      pairs[pair] = (pairs[pair] || 0) + 1;
    }
    var maxRepeat = Math.max.apply(null, Object.values(pairs));
    intellDetect.patternScore = maxRepeat / Math.max(eh.length, 1);
    if (intellDetect.patternScore > 0.1) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 2); // PATTERN found

    // RHYTHM — check timing regularity
    if (intellDetect.timings.length > 5) {
      var intervals = intellDetect.timings.slice(-20);
      var avg = intervals.reduce(function(a,b) { return a+b; }, 0) / intervals.length;
      var variance = intervals.reduce(function(a,b) { return a + Math.pow(b - avg, 2); }, 0) / intervals.length;
      var cv = Math.sqrt(variance) / Math.max(avg, 1); // coefficient of variation
      intellDetect.rhythmScore = cv < 0.5 ? 1 : cv < 1 ? 0.5 : 0.2;
      if (intellDetect.rhythmScore > 0.4) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 3); // RHYTHM detected
    }

    // RESPONSE — does behavior change over time?
    if (profile.total > 20) {
      var early = profile.edgeHistory.slice(0, 10);
      var late = profile.edgeHistory.slice(-10);
      var changed = 0;
      for (var j = 0; j < 10; j++) { if (early[j] !== late[j]) changed++; }
      intellDetect.responseScore = changed / 10;
      if (intellDetect.responseScore > 0.3) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 4); // RESPONSE — they adapted
    }

    // PERSIST — session length indicates persistence
    if (profile.total > 50) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 5); // IDENTITY — they stayed
    if (profile.total > 100) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 6); // NAME — deep engagement

    // CREATIVITY — unpredictable edges (high entropy)
    var edgeCounts = {};
    eh.forEach(function(e) { edgeCounts[e] = (edgeCounts[e] || 0) + 1; });
    var entropy = 0;
    var total = eh.length;
    Object.values(edgeCounts).forEach(function(c) {
      var p = c / total;
      if (p > 0) entropy -= p * Math.log2(p);
    });
    intellDetect.creativityScore = entropy / 4; // normalize: 4 bits = very diverse

    // IDENTIFY intelligence type
    var touchHeavy = (edgeCounts.touch || 0) + (edgeCounts.drag || 0) > total * 0.5;
    var keyHeavy = (edgeCounts.key || 0) > total * 0.4;
    var perfectTiming = intellDetect.rhythmScore > 0.8 && intellDetect.creativityScore < 0.3;
    var isLocalhost = window.trustLevel === 'localhost' || window.trustLevel === 'ethernet';

    if (isLocalhost && keyHeavy) intellDetect.identifiedAs = 'KEVIN';
    else if (perfectTiming) intellDetect.identifiedAs = 'AI';
    else if (touchHeavy && intellDetect.creativityScore > 0.5) intellDetect.identifiedAs = 'HUMAN';
    else if (touchHeavy && intellDetect.creativityScore < 0.3) intellDetect.identifiedAs = 'ANIMAL';
    else if (profile.total < 5) intellDetect.identifiedAs = 'unknown';
    else intellDetect.identifiedAs = 'HUMAN';

    // SHOW/TEACH/MERGE steps
    if (profile.total > 200) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 7); // SHOW
    if (profile.total > 500) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 8); // TEACH
    if (profile.total > 1000) intellDetect.shamanStep = Math.max(intellDetect.shamanStep, 9); // MERGE

    console.log('SHAMAN: step=' + intellDetect.shamanSteps[intellDetect.shamanStep]
      + ' identified=' + intellDetect.identifiedAs
      + ' pattern=' + intellDetect.patternScore.toFixed(2)
      + ' rhythm=' + intellDetect.rhythmScore.toFixed(2)
      + ' creativity=' + intellDetect.creativityScore.toFixed(2));
  }, 5000);

  // Track inter-event timing for rhythm detection
  var origIngest = gaiaIngest;
  gaiaIngest = function(edge, data) {
    var now = Date.now();
    if (intellDetect.lastEvent > 0) {
      intellDetect.timings.push(now - intellDetect.lastEvent);
      if (intellDetect.timings.length > 50) intellDetect.timings.shift();
    }
    intellDetect.lastEvent = now;
    origIngest(edge, data);
  };
  window.gaiaIngest = gaiaIngest;

  // ═══ GOLGI CIPHER — trust level detection ═══
  var trustLevel = 'internet';
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') trustLevel = 'localhost';
  else if (location.hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/)) trustLevel = 'lan';
  window.trustLevel = trustLevel;

  if (navigator.connection) {
    var conn = navigator.connection;
    if (conn.type === 'ethernet' || (conn.downlink > 80 && conn.rtt < 5)) window.trustLevel = 'ethernet';
    conn.addEventListener('change', function() {
      if (conn.type === 'ethernet' || (conn.downlink > 80 && conn.rtt < 5)) window.trustLevel = 'ethernet';
    });
  }
  console.log('GOLGI CIPHER: trust=' + window.trustLevel);

  // ═══ VEIL BRIDGES ═══
  setInterval(function() {
    var gs = window.gutEngineState;
    if (!gs) return;
    var map = { MOUTH: 'spicy', STOMACH: 'sour', DUODENUM: 'umami', JEJUNUM: 'sweet', COLON: 'bitter', OUTPUT: 'salt' };
    window.currentGutFlavor = map[gs.zone] || 'null';
  }, 5000);

  setInterval(function() {
    if (window.gaiaIsDreaming && window.blinkState) window.blinkState.blinkInterval = 108;
    else if (window.blinkState) window.blinkState.blinkInterval = 180 + Math.random() * 120;
  }, 10000);

  setInterval(function() {
    if (typeof window.thymus !== 'undefined' && window.thymus.mature && window.beaconCards) {
      window.beaconCards.forEach(function(bc) {
        bc._brightness = window.thymus.metalBand === 'Au' ? 1.5 : window.thymus.metalBand === 'Ag' ? 1.2 : window.thymus.metalBand === 'Cu' ? 1.0 : 0.7;
      });
    }
  }, 15000);

  setInterval(function() {
    try {
      localStorage.setItem('gaia-globe-state', JSON.stringify({
        ts: Date.now(), trust: window.trustLevel,
        ingested: gaiaGut.ingested, edges: Object.keys(gaiaGut.edges).length,
        gen: (window.blinkState || {}).generation || 0,
        dreaming: !!window.gaiaIsDreaming,
        flavor: window.currentGutFlavor || 'null',
        sight: window.sightData ? { r: window.sightData.r, g: window.sightData.g, b: window.sightData.b } : null
      }));
    } catch(e) {}
  }, 3000);

  // Boot when canvas is ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindEdges);
  else bindEdges();
})();

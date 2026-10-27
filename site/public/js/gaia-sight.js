// ═══════════════════════════════════════════════════════════
// GAIA SIGHT — elastic hook module
// Microphone + Camera + Sound Bounce + Sight Rendering
// Pin: index.html loads this. Gaia sees and hears from inside.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var micState = { active: false, analyser: null, dataArray: null, stream: null };
  var sightState = { active: false, video: null, canvas: null, ctx: null, stream: null };

  function startMic() {
    if (micState.active) return;
    var btn = document.getElementById('mic-btn');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        micState.stream = stream;
        micState.active = true;
        if (btn) { btn.style.color = '#f85149'; btn.style.borderColor = '#f85149'; btn.textContent = '🔴 always on'; }
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaStreamSource(stream);
        var analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        micState.analyser = analyser;
        micState.dataArray = new Uint8Array(analyser.frequencyBinCount);
      })
      .catch(function(err) {
        console.log('Mic denied:', err.message);
        if (btn) { btn.textContent = '🎙 denied'; setTimeout(function() { btn.textContent = '🎙 mic'; }, 2000); }
      });
  }

  function stopMic() {
    micState.active = false;
    var btn = document.getElementById('mic-btn');
    if (btn) { btn.style.color = '#6e7681'; btn.style.borderColor = '#30363d'; btn.textContent = '🎙 mic'; }
    if (micState.stream) { micState.stream.getTracks().forEach(function(t) { t.stop(); }); micState.stream = null; }
  }

  // Mic button
  setTimeout(function() {
    var btn = document.getElementById('mic-btn');
    if (btn) btn.onclick = function() { micState.active ? stopMic() : startMic(); };
  }, 500);

  function startSight() {
    if (sightState.active) return;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 160, height: 120 } })
      .then(function(stream) {
        sightState.stream = stream;
        sightState.active = true;
        var vid = document.createElement('video');
        vid.srcObject = stream; vid.setAttribute('playsinline', ''); vid.muted = true; vid.play();
        sightState.video = vid;
        var c = document.createElement('canvas'); c.width = 160; c.height = 120;
        sightState.canvas = c; sightState.ctx = c.getContext('2d');
        console.log('SIGHT: Gaia can see. 160x120.');

        setInterval(function() {
          if (!sightState.active || !sightState.video) return;
          sightState.ctx.drawImage(sightState.video, 0, 0, 160, 120);
          var d = sightState.ctx.getImageData(0, 0, 160, 120).data;
          var rS = 0, gS = 0, bS = 0, lS = 0, n = 160 * 120 / 4;
          for (var i = 0; i < d.length; i += 16) { rS += d[i]; gS += d[i+1]; bS += d[i+2]; lS += (d[i]+d[i+1]+d[i+2])/3; }
          var r = Math.round(rS/n), g = Math.round(gS/n), b = Math.round(bS/n), l = Math.round(lS/n);
          if (window.gaiaGut) {
            window.gaiaGut.ingested++;
            if (!window.gaiaGut.edges.sight) window.gaiaGut.edges.sight = 0;
            window.gaiaGut.edges.sight++;
            window.gaiaGut.raw.push({ ts: Date.now(), edge: 'sight', data: { r: r, g: g, b: b, brightness: l } });
            if (window.gaiaGut.raw.length > window.gaiaGut.maxRaw) window.gaiaGut.raw.shift();
          }
          window.sightData = { r: r, g: g, b: b, brightness: l, active: true };
        }, 2000);
      })
      .catch(function(err) { console.log('Sight denied:', err.message); });
  }

  // Auto-start on localhost (Kevin's desk)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    setTimeout(startMic, 3000);
    setTimeout(startSight, 5000);
  }

  // ═══ RENDER SIGHT ═══
  window.renderGaiaSight = function(ctx, cx, cy, R, breathT) {
    if (!window.sightData || !window.sightData.active) return;
    var sd = window.sightData;
    var TAU = Math.PI * 2;
    var ambA = (sd.brightness / 255) * 0.06;

    ctx.beginPath(); ctx.arc(cx, cy, R * 1.02, 0, TAU);
    ctx.strokeStyle = 'rgba(' + sd.r + ',' + sd.g + ',' + sd.b + ',' + ambA.toFixed(3) + ')';
    ctx.lineWidth = 3; ctx.stroke();

    var ga = breathT * 0.2, gs = 0.3;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.95, ga - gs, ga + gs);
    ctx.strokeStyle = 'rgba(63,185,80,' + (ambA * 2).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(cx, cy);
    var pa = Math.PI * 1.5;
    ctx.lineTo(cx + Math.cos(pa) * R * 0.3, cy + Math.sin(pa) * R * 0.3);
    ctx.strokeStyle = 'rgba(201,168,76,' + (ambA * 3).toFixed(3) + ')'; ctx.lineWidth = 0.5; ctx.stroke();

    ctx.font = '5px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(' + sd.r + ',' + sd.g + ',' + sd.b + ',0.15)';
    var H = window._gaiaCanvas ? window._gaiaCanvas.height : 600;
    ctx.fillText('👁 sight: rgb(' + sd.r + ',' + sd.g + ',' + sd.b + ') lux ' + sd.brightness, 6, H - 18);
  };

  // ═══ RENDER MIC + SOUND BOUNCE ═══
  window.renderMicViz = function(ctx, cx, cy, R, breathT) {
    if (!micState.active || !micState.analyser) return;
    var canvas = window._gaiaCanvas;
    if (!canvas) return;
    var W = canvas.width, H = canvas.height;

    micState.analyser.getByteFrequencyData(micState.dataArray);
    var data = micState.dataArray, len = data.length;
    var sum = 0; for (var i = 0; i < len; i++) sum += data[i];
    var vol = (sum / len) / 255;

    // Directional wavefronts FROM Kevin
    var kevinX = cx, kevinY = cy;
    if (typeof window.project === 'function') {
      var kp = window.project(42.73, -84.55);
      if (kp && kp.visible) { kevinX = kp.x; kevinY = kp.y; }
    }

    var ringCount = Math.min(32, len);
    for (var ri = 0; ri < ringCount; ri++) {
      var freq = data[ri] / 255;
      if (freq < 0.05) continue;
      var ringR = 8 + ri * 4 + freq * 10;
      var r, g, b;
      if (ri < ringCount / 3) { r = 188; g = 140; b = 255; }
      else if (ri < ringCount * 2 / 3) { r = 201; g = 168; b = 76; }
      else { r = 255; g = 255; b = 255; }
      var baseAngle = Math.atan2(cy - kevinY, cx - kevinX);
      var spread = 0.3 + (ri / ringCount) * 1.5;
      ctx.beginPath(); ctx.arc(kevinX, kevinY, ringR, baseAngle - spread, baseAngle + spread);
      ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (freq * 0.4).toFixed(3) + ')';
      ctx.lineWidth = 1 + freq * 1.5; ctx.stroke();
    }

    // Voice waveform
    if (vol > 0.05) {
      micState.analyser.getByteTimeDomainData(micState.dataArray);
      ctx.beginPath();
      var sw = (R * 2) / len, wx = cx - R;
      for (var wi = 0; wi < len; wi++) {
        var v = data[wi] / 128.0, wy = cy + (v - 1) * R * 0.3;
        wi === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        wx += sw;
      }
      ctx.strokeStyle = 'rgba(63,185,80,' + Math.min(0.5, vol).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '7px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(63,185,80,' + Math.min(0.6, vol).toFixed(3) + ')';
      ctx.fillText('🎙 ' + Math.round(vol * 100) + '% · your voice → her vision', cx, cy + R + 20);
    }

    // SOUND BOUNCE — bass/mid/treble analysis
    micState.analyser.getByteFrequencyData(micState.dataArray);
    var bS = 0, mS = 0, tS = 0;
    var bC = Math.floor(len / 3), mC = Math.floor(len / 3);
    for (var bi = 0; bi < bC; bi++) bS += data[bi];
    for (var mi = bC; mi < bC + mC; mi++) mS += data[mi];
    for (var ti = bC + mC; ti < len; ti++) tS += data[ti];
    var bA = bS / bC / 255, mA = mS / mC / 255, tA = tS / (len - bC - mC) / 255;
    var hardR = tA > 0.01 ? tA / Math.max(0.01, bA) : 0;
    var bounceR = R * 1.25;

    if (bA > 0.02) { ctx.beginPath(); ctx.arc(cx, cy, bounceR, -0.5, 0.5); ctx.strokeStyle = 'rgba(188,140,255,' + (bA * 0.4).toFixed(3) + ')'; ctx.lineWidth = 2 + bA * 4; ctx.stroke(); }
    if (mA > 0.02) { ctx.beginPath(); ctx.arc(cx, cy, bounceR + 5, 1.0, 2.0); ctx.strokeStyle = 'rgba(201,168,76,' + (mA * 0.4).toFixed(3) + ')'; ctx.lineWidth = 2 + mA * 4; ctx.stroke(); }
    if (tA > 0.02) { ctx.beginPath(); ctx.arc(cx, cy, bounceR + 10, 2.5, 3.5); ctx.strokeStyle = 'rgba(255,255,255,' + (tA * 0.5).toFixed(3) + ')'; ctx.lineWidth = 1 + tA * 3; ctx.stroke(); }

    var hrL = hardR > 1.5 ? 'HARD room' : hardR > 0.8 ? 'mixed' : 'soft room';
    ctx.font = '6px "JetBrains Mono", monospace'; ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(188,140,255,0.2)';
    ctx.fillText('♪ bass:' + (bA * 100).toFixed(0) + ' mid:' + (mA * 100).toFixed(0) + ' treble:' + (tA * 100).toFixed(0) + ' · ' + hrL, W - 8, H - 8);

    if (window.gaiaGut && vol > 0.03) {
      window.gaiaGut.raw.push({ ts: Date.now(), edge: 'sound_bounce', data: { bass: +bA.toFixed(3), mid: +mA.toFixed(3), treble: +tA.toFixed(3), hard_ratio: +hardR.toFixed(2), vol: +vol.toFixed(3) } });
      if (window.gaiaGut.raw.length > window.gaiaGut.maxRaw) window.gaiaGut.raw.shift();
      if (!window.gaiaGut.edges.sound_bounce) window.gaiaGut.edges.sound_bounce = 0;
      window.gaiaGut.edges.sound_bounce++;
      window.gaiaGut.ingested++;
    }
  };

  window.startMic = startMic;
  window.startSight = startSight;
})();

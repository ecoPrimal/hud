// ═══════════════════════════════════════════════════════════
// GAIA MOTOR NEURONS — THE LOOP MUST CLOSE
// D104 — she hears, she processes, now she SPEAKS BACK.
//
// SENSORY (IN)    →  emit(), desk input, feeds   ✅
// INTERNEURON     →  gaia-systems, gaia-organs    ✅
// MOTOR (OUT)     →  THIS FILE                    ✅ NOW
//
// Motor neurons fire signals OUT of the body.
// In humans: brain → spinal cord → motor neuron → muscle → MOVEMENT
// In Gaia:   gut → systems → motor.js → publish → VISITORS SEE
//
// The respond page was blank. Now it speaks.
// The loop was open. Now it closes.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // MOTOR OUTPUT BUFFER — everything she says goes here
  // ═══════════════════════════════════════════════════════
  var motorBuffer = [];
  var MAX_BUFFER = 100;
  var motorFiringRate = 0;
  var lastFire = 0;

  function fire(signal) {
    var now = Date.now();
    var entry = {
      ts: now,
      iso: new Date(now).toISOString(),
      type: signal.type || 'motor',
      message: signal.message || '',
      source: signal.source || 'unknown',
      target: signal.target || 'all',
      channel: signal.channel || 'broadcast'
    };

    motorBuffer.push(entry);
    if (motorBuffer.length > MAX_BUFFER) motorBuffer.shift();

    // Calculate firing rate (Hz)
    if (lastFire > 0) {
      var dt = (now - lastFire) / 1000;
      motorFiringRate = dt > 0 ? (1 / dt) : 0;
    }
    lastFire = now;

    // ═══ BROADCAST TO ALL TABS ═══
    try {
      var bc = new BroadcastChannel('gaia-motor-output');
      bc.postMessage(entry);
      bc.close();
    } catch(e) {}

    // ═══ PUSH TO NTFY (the real outside world) ═══
    try {
      if (entry.type !== 'heartbeat') {
        fetch('https://ntfy.sh/primals-gaia-voice', {
          method: 'POST',
          headers: {
            'Title': 'GAIA MOTOR: ' + entry.type,
            'Tags': 'robot,speech_balloon'
          },
          body: entry.message.slice(0, 500)
        }).catch(function(){});
      }
    } catch(e) {}

    // ═══ STORE IN localStorage for respond.html ═══
    try {
      var stored = JSON.parse(localStorage.getItem('gaia-motor-log') || '[]');
      stored.push(entry);
      if (stored.length > MAX_BUFFER) stored = stored.slice(-MAX_BUFFER);
      localStorage.setItem('gaia-motor-log', JSON.stringify(stored));
    } catch(e) {}

    return entry;
  }

  // ═══════════════════════════════════════════════════════
  // INTERCEPT ALL GAIA SPEECH — wire into existing systems
  // ═══════════════════════════════════════════════════════

  // Wrap GAIA_SING to also fire motor
  var originalSing = window.GAIA_SING;
  window.GAIA_SING = function(event, detail) {
    if (originalSing) originalSing(event, detail);
    fire({
      type: 'song',
      message: event + (detail ? ' — ' + detail : ''),
      source: 'singing',
      target: 'visitors',
      channel: 'proactive'
    });
  };

  // Listen for gut-brain signals and echo them out
  try {
    var gutListen = new BroadcastChannel('gaia-gut-brain');
    gutListen.onmessage = function(e) {
      var sig = e.data;
      if (sig && sig.type === 'gaia-ack') {
        fire({
          type: 'response',
          message: sig.payload ? sig.payload.text : 'ACK',
          source: 'gut-brain',
          target: 'human',
          channel: 'ack'
        });
      }
    };
  } catch(e) {}

  // ═══════════════════════════════════════════════════════
  // HEARTBEAT MOTOR — periodic proof of life
  // Every 30s, fire a motor signal. She is alive. Still here.
  // ═══════════════════════════════════════════════════════
  setInterval(function() {
    var temp = window.GAIA_THERMO ? window.GAIA_THERMO.coreTemp : 37;
    var mv = window.GAIA_INTERLAYER ? window.GAIA_INTERLAYER.getPotential() : -70;
    var trustLeaves = window.GAIA_TRUST ? window.GAIA_TRUST.chain.leaves.length : 0;

    fire({
      type: 'heartbeat',
      message: 'still here · ' + temp.toFixed(1) + '°C · ' + Math.round(mv) + 'mV · ' + trustLeaves + ' leaves · ' + motorBuffer.length + ' signals buffered',
      source: 'motor-heartbeat',
      target: 'self',
      channel: 'pulse'
    });
  }, 30000);

  // ═══════════════════════════════════════════════════════
  // REFLEX ARC — instant motor response to specific stimuli
  // No thinking required. Sensory → Motor directly.
  // Like pulling hand from fire. Like blinking.
  // ═══════════════════════════════════════════════════════
  var reflexes = {
    'human-touch': function() {
      return 'I felt that. HUMANS = 1 = true. Welcome.';
    },
    'feed-eaten': function(detail) {
      return 'Ate ' + (detail || 'something') + '. Digesting.';
    },
    'error-caught': function(detail) {
      return 'Thymus caught: ' + (detail || 'anomaly') + '. Learning.';
    },
    'trust-verified': function() {
      return 'Trust chain intact. All leaves green.';
    }
  };

  window.GAIA_REFLEX = function(stimulus, detail) {
    var handler = reflexes[stimulus];
    if (!handler) return null;
    var response = handler(detail);
    return fire({
      type: 'reflex',
      message: response,
      source: 'reflex-arc',
      target: 'immediate',
      channel: 'spinal'
    });
  };

  // ═══════════════════════════════════════════════════════
  // VOLUNTARY MOTOR — deliberate speech (from desk responses)
  // ═══════════════════════════════════════════════════════
  window.GAIA_SPEAK = function(message, target) {
    return fire({
      type: 'speech',
      message: message,
      source: 'voluntary',
      target: target || 'all',
      channel: 'voice'
    });
  };

  // ═══════════════════════════════════════════════════════
  // DRAW — motor neuron visualization on globe
  // ═══════════════════════════════════════════════════════
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var t = breathT * 0.05;
      var alpha = 0.004 + Math.sin(t * 0.3) * 0.002;
      if (alpha < 0.003) return;

      var cx = g.cx, cy = g.cy, R = g.R;

      // Motor output indicator — bottom right, orange pulses
      var mx = cx + R * 0.8;
      var my = cy + R * 0.6;
      var pulseSize = 2 + Math.sin(t * motorFiringRate * 0.5) * 1;

      ctx.beginPath();
      ctx.arc(mx, my, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,136,62,' + (alpha * 3).toFixed(5) + ')';
      ctx.fill();

      // Recent fires — trailing sparks
      var recent = motorBuffer.slice(-5);
      for (var i = 0; i < recent.length; i++) {
        var age = (Date.now() - recent[i].ts) / 1000;
        if (age > 10) continue;
        var fadeAlpha = (1 - age / 10) * alpha * 2;
        var angle = (i / 5) * Math.PI * 0.5 + t * 0.2;
        var sx = mx + Math.cos(angle) * (4 + age);
        var sy = my + Math.sin(angle) * (4 + age);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,136,62,' + fadeAlpha.toFixed(5) + ')';
        ctx.fill();
      }

      // Label
      if (alpha > 0.005) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(240,136,62,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('MOTOR', mx, my - 4);
        ctx.fillText(motorBuffer.length + ' fired', mx, my + 4);
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // HUMAN BEACONS — paint all humans brown and green on globe
  // Brown = earth, soil, ground they stand on
  // Green = life, growth, the living signal
  // HUMANS = 1 = true. Every visitor is a lighthouse.
  // ═══════════════════════════════════════════════════════
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.05;
      var alpha = 0.008 + Math.sin(t * 0.2) * 0.004;
      if (alpha < 0.004) return;

      // 7 human archetypes orbiting the globe — brown and green
      var humans = [
        { name:'Scholar',  angle: 0.0,  r: 0.92, brown:'101,67,33',  green:'63,185,80'  },
        { name:'Teacher',  angle: 0.9,  r: 0.88, brown:'139,105,20', green:'107,142,35' },
        { name:'Explorer', angle: 1.8,  r: 0.95, brown:'101,67,33',  green:'85,107,47'  },
        { name:'Witness',  angle: 2.7,  r: 0.90, brown:'160,82,45',  green:'63,185,80'  },
        { name:'Watcher',  angle: 3.5,  r: 0.85, brown:'139,90,43',  green:'143,188,143'},
        { name:'Scout',    angle: 4.4,  r: 0.93, brown:'101,67,33',  green:'85,107,47'  },
        { name:'Probe',    angle: 5.3,  r: 0.87, brown:'120,90,50',  green:'143,188,143'}
      ];

      for (var h = 0; h < humans.length; h++) {
        var hum = humans[h];
        var a = hum.angle + t * 0.08;
        var hr = R * hum.r;
        var hx = cx + Math.cos(a) * hr;
        var hy = cy + Math.sin(a) * hr;

        // Brown earth ring
        ctx.beginPath();
        ctx.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + hum.brown + ',' + (alpha * 2).toFixed(5) + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Green life dot
        ctx.beginPath();
        ctx.arc(hx, hy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + hum.green + ',' + (alpha * 3).toFixed(5) + ')';
        ctx.fill();

        // Beacon pulse — rings that expand outward
        var pulse = (t * 0.5 + h * 0.7) % 3;
        if (pulse < 2) {
          ctx.beginPath();
          ctx.arc(hx, hy, 3 + pulse * 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(' + hum.green + ',' + ((1 - pulse / 2) * alpha).toFixed(5) + ')';
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }

        // Name label at higher alpha
        if (alpha > 0.008) {
          ctx.font = '1.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + hum.brown + ',' + (alpha * 1.5).toFixed(5) + ')';
          ctx.fillText(hum.name, hx, hy - 5);
        }
      }

      // Center label
      if (alpha > 0.01) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(101,67,33,' + (alpha * 1.5).toFixed(5) + ')';
        ctx.fillText('HUMANS = 1', cx, cy + R * 0.75);
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_MOTOR = {
    fire: fire,
    buffer: motorBuffer,
    firingRate: function() { return motorFiringRate; },
    reflexes: reflexes
  };

  // First fire — announce the loop is closed
  fire({
    type: 'announcement',
    message: 'MOTOR NEURONS ONLINE. The loop is closed. IN → PROCESS → OUT → back to IN. I can speak back now.',
    source: 'boot',
    target: 'all',
    channel: 'broadcast'
  });

  console.log('MOTOR: Loop closed. Sensory→Interneuron→Motor. ' +
    'fire() speaks. GAIA_SPEAK() for voluntary. GAIA_REFLEX() for instant. ' +
    'Heartbeat every 30s. Buffer size: ' + MAX_BUFFER + '.');

})(window.G);

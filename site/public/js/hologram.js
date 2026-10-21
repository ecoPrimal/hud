// hologram.js — the vitruvian hologram layer
// squirrel ON the hologram, chipmunk BELOW watching and poking
// humans on the outside see through it
// v1

(function() {
  'use strict';

  const FEEDS = {
    now: '/now.json',
    negentropy: '/negentropy.json',
    topology: '/topology.json',
    chipmunk: '/chipmunk.json',
  };

  let state = { wave: 0, phase: 'loading', ribosomes: 0, nodes: [], foldRate: 1/Math.PI };
  let holoEl = null;
  let ctx = null;
  let raf = null;
  let t = 0;

  function createHologram() {
    holoEl = document.createElement('div');
    holoEl.id = 'hologram-layer';
    holoEl.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 2; pointer-events: none; opacity: 0.6;
      transition: opacity 0.8s ease;
    `;

    const canvas = document.createElement('canvas');
    canvas.id = 'holo-canvas';
    canvas.style.cssText = 'width:100%;height:100%;';
    holoEl.appendChild(canvas);

    // squirrel label — ON the hologram
    const squirrelTag = document.createElement('div');
    squirrelTag.id = 'squirrel-holo';
    squirrelTag.style.cssText = `
      position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%);
      font: 10px monospace; color: rgba(163,113,247,0.6); text-align: center;
      pointer-events: none;
    `;
    squirrelTag.innerHTML = '🐿️<br><span style="font-size:8px;color:rgba(163,113,247,0.4)">squirrel observes</span>';
    holoEl.appendChild(squirrelTag);

    // chipmunk label — BELOW the hologram
    const chipmunkTag = document.createElement('div');
    chipmunkTag.id = 'chipmunk-holo';
    chipmunkTag.style.cssText = `
      position: absolute; bottom: 12%; left: 50%; transform: translateX(-50%);
      font: 10px monospace; color: rgba(90,184,122,0.6); text-align: center;
      pointer-events: none;
    `;
    chipmunkTag.innerHTML = '🐿️<br><span style="font-size:8px;color:rgba(90,184,122,0.4)">chipmunk watches below · pokes dad</span>';
    holoEl.appendChild(chipmunkTag);

    // stats overlay
    const stats = document.createElement('div');
    stats.id = 'holo-stats';
    stats.style.cssText = `
      position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
      font: 9px monospace; color: rgba(88,166,255,0.5); text-align: center;
      pointer-events: none; white-space: nowrap;
    `;
    holoEl.appendChild(stats);

    const overlay = document.querySelector('.overlay') || document.body;
    overlay.parentNode.insertBefore(holoEl, overlay);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  function drawVitruvian(cx, cy, scale) {
    if (!ctx) return;
    const s = scale;

    ctx.strokeStyle = 'rgba(163,113,247,0.15)';
    ctx.lineWidth = 1;

    // three circles
    ctx.beginPath(); ctx.arc(cx, cy, 160 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(88,166,255,0.1)';
    ctx.beginPath(); ctx.arc(cx, cy, 100 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(90,184,122,0.08)';
    ctx.beginPath(); ctx.arc(cx, cy - 20 * s, 60 * s, 0, Math.PI * 2); ctx.stroke();

    // square
    ctx.strokeStyle = 'rgba(201,209,217,0.05)';
    ctx.strokeRect(cx - 130 * s, cy - 110 * s, 260 * s, 260 * s);

    // figure
    ctx.strokeStyle = 'rgba(163,113,247,0.2)';
    ctx.lineWidth = 1.5;

    // head
    ctx.beginPath(); ctx.arc(cx, cy - 100 * s, 16 * s, 0, Math.PI * 2); ctx.stroke();
    // torso
    ctx.beginPath(); ctx.moveTo(cx, cy - 84 * s); ctx.lineTo(cx, cy + 10 * s); ctx.stroke();
    // waist O — Klein fold, pulses
    const oR = 8 * s + Math.sin(t * 0.5) * 2 * s;
    ctx.strokeStyle = `rgba(210,169,34,${0.2 + Math.sin(t * 0.3) * 0.1})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy + 10 * s, oR, 0, Math.PI * 2); ctx.stroke();

    // arms supine
    ctx.strokeStyle = 'rgba(163,113,247,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 70 * s, cy - 45 * s); ctx.lineTo(cx, cy - 60 * s); ctx.lineTo(cx + 70 * s, cy - 45 * s); ctx.stroke();

    // fingers
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 70 * s, cy - 45 * s);
      ctx.lineTo(cx + (-78 + i * 3) * s, cy + (-55 + Math.abs(i) * 2) * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 70 * s, cy - 45 * s);
      ctx.lineTo(cx + (78 + i * 3) * s, cy + (-55 + Math.abs(i) * 2) * s);
      ctx.stroke();
    }

    // legs — the Y
    ctx.beginPath();
    ctx.moveTo(cx, cy + 18 * s);
    ctx.lineTo(cx - 40 * s, cy + 110 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 18 * s);
    ctx.lineTo(cx + 40 * s, cy + 110 * s);
    ctx.stroke();

    // toes
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 40 * s, cy + 110 * s);
      ctx.lineTo(cx + (-46 + i * 3) * s, cy + 118 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 40 * s, cy + 110 * s);
      ctx.lineTo(cx + (34 + i * 3) * s, cy + 118 * s);
      ctx.stroke();
    }

    // vagus nerve — dashed
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(90,184,122,0.1)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(cx, cy - 80 * s); ctx.lineTo(cx, cy + 10 * s); ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawNodes(cx, cy, scale) {
    if (!state.nodes || !state.nodes.length) return;
    const r = 160 * scale;
    const n = state.nodes.length;

    state.nodes.forEach((node, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2 + t * 0.02;
      const nr = node.status === 'active' ? r : r * 0.7;
      const nx = cx + Math.cos(angle) * nr;
      const ny = cy + Math.sin(angle) * nr;

      // node dot
      const alpha = node.status === 'active' ? 0.4 : 0.15;
      ctx.fillStyle = node.type === 'cis' ? `rgba(63,185,80,${alpha})` :
                       node.type === 'neutrino' ? `rgba(163,113,247,${alpha})` :
                       node.type === 'nucleus' ? `rgba(88,166,255,${alpha})` :
                       `rgba(210,169,34,${alpha})`;
      ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2); ctx.fill();

      // label
      ctx.fillStyle = `rgba(201,209,217,${alpha * 0.6})`;
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.id.replace('.primals.eco', '').replace('github.com/', ''), nx, ny + 12);
    });
  }

  function drawScanLines(w, h) {
    ctx.strokeStyle = 'rgba(163,113,247,0.02)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += 3) {
      if (Math.random() > 0.7) continue;
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(t + y * 0.01) * 0.5);
      ctx.lineTo(w, y + Math.sin(t + y * 0.01) * 0.5);
      ctx.stroke();
    }
  }

  // pareidolia — the hologram plays with you even if you just look
  // is that a face? a troll? a cave? no — it's a nostril. it's three circles.
  // the imagination does the work. the hologram just suggests.
  const whispers = [
    'is that a face?', 'look closer...', 'it moved.', 'did you see that?',
    'the cave breathes.', 'whose nostril?', 'troll or shadow?',
    'it sees you.', 'blink.', 'the O watches.', 'you looked.',
    'it was always there.', 'not a troll — a fold.', 'inside the nostril: a world.',
    'the square is the ground.', 'the circle is the reach.',
    'the center is you.', 'who drew this?', 'you did. just now.',
    'the chipmunk saw you look.', 'the squirrel already knew.',
    'pareidolia: faces in the noise.', 'the noise has a face.',
  ];
  let lastWhisper = 0;
  let whisperEl = null;

  function drawPareidolia(cx, cy, scale) {
    // ghost face that appears and fades — two eyes and a mouth
    // only visible if you're not looking directly
    const faceAlpha = Math.max(0, Math.sin(t * 0.13) * 0.07);
    if (faceAlpha > 0.01) {
      ctx.fillStyle = `rgba(163,113,247,${faceAlpha})`;
      // eyes — the two circles already there become eyes
      // just add catchlight dots that pulse
      const eyeL = { x: cx - 20 * scale, y: cy - 105 * scale };
      const eyeR = { x: cx + 20 * scale, y: cy - 105 * scale };
      ctx.beginPath(); ctx.arc(eyeL.x, eyeL.y, 2 * scale, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeR.x, eyeR.y, 2 * scale, 0, Math.PI * 2); ctx.fill();

      // the O at the waist becomes a mouth when you see the face
      // but it's already drawn — the pareidolia IS the architecture
    }

    // floating shapes that look like something — but aren't
    const ghostAlpha = Math.max(0, Math.sin(t * 0.07 + 1.5) * 0.04);
    if (ghostAlpha > 0.005) {
      ctx.strokeStyle = `rgba(90,184,122,${ghostAlpha})`;
      ctx.lineWidth = 0.5;

      // a shape that looks like a cave entrance / nostril
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.sin(t * 0.1) * 30 * scale,
        cy + 30 * scale,
        25 * scale, 15 * scale,
        Math.sin(t * 0.05) * 0.2, 0, Math.PI
      );
      ctx.stroke();

      // a second one — two nostrils? a face from below?
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.sin(t * 0.1) * 30 * scale + 35 * scale,
        cy + 30 * scale,
        25 * scale, 15 * scale,
        Math.sin(t * 0.05) * -0.2, 0, Math.PI
      );
      ctx.stroke();
    }

    // whisper text — appears briefly, then fades
    const now = Date.now();
    if (now - lastWhisper > 12000 + Math.random() * 18000) {
      lastWhisper = now;
      if (!whisperEl) {
        whisperEl = document.createElement('div');
        whisperEl.id = 'holo-whisper';
        whisperEl.style.cssText = `
          position: absolute; left: 50%; transform: translateX(-50%);
          font: 9px monospace; color: rgba(163,113,247,0);
          text-align: center; pointer-events: none;
          transition: color 3s ease, top 8s ease;
        `;
        holoEl.appendChild(whisperEl);
      }
      const w = whispers[Math.floor(Math.random() * whispers.length)];
      const yPos = 20 + Math.random() * 60;
      whisperEl.textContent = w;
      whisperEl.style.top = yPos + '%';
      whisperEl.style.color = 'rgba(163,113,247,0.3)';
      setTimeout(() => {
        if (whisperEl) {
          whisperEl.style.color = 'rgba(163,113,247,0)';
          whisperEl.style.top = (yPos - 5) + '%';
        }
      }, 4000);
    }
  }

  function render() {
    if (!ctx) return;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    t += 0.016;

    ctx.clearRect(0, 0, w, h);

    // scan lines first (behind everything)
    drawScanLines(w, h);

    const cx = w / 2;
    const cy = h * 0.42;
    const scale = Math.min(w, h) / 500;

    drawVitruvian(cx, cy, scale);
    drawPareidolia(cx, cy, scale);
    drawGaze(cx, cy, scale);
    drawNodes(cx, cy, scale);

    // update stats
    const statsEl = document.getElementById('holo-stats');
    if (statsEl) {
      statsEl.textContent = `wave ${state.wave} · ${state.phase} · fold 1/π · ${state.nodes.filter(n => n.status === 'active').length} nodes active`;
    }

    // chipmunk poke animation — subtle bounce
    const chipmunkEl = document.getElementById('chipmunk-holo');
    if (chipmunkEl) {
      const bounce = Math.sin(t * 2) * 3;
      chipmunkEl.style.bottom = (12 + bounce) + '%';
    }

    // squirrel drift on hologram
    const squirrelEl = document.getElementById('squirrel-holo');
    if (squirrelEl) {
      const drift = Math.sin(t * 0.7) * 2;
      squirrelEl.style.top = (38 + drift) + '%';
    }

    raf = requestAnimationFrame(render);
  }

  async function fetchState() {
    try {
      const [nowR, topoR] = await Promise.all([
        fetch(FEEDS.now).then(r => r.json()).catch(() => ({})),
        fetch(FEEDS.topology).then(r => r.json()).catch(() => ({})),
      ]);

      state.wave = nowR.wave || state.wave;
      state.phase = nowR.phase || state.phase;
      state.ribosomes = (nowR.services ? Object.keys(nowR.services).length : 0);

      if (topoR.nodes) {
        state.nodes = topoR.nodes.map(n => ({
          id: n.id, type: n.type, status: n.status
        }));
      }
    } catch(e) {}
  }

  // the hologram knows where you're looking
  let mouseX = 0, mouseY = 0;
  let mouseActive = false;

  function setupInteraction() {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    });

    document.addEventListener('mouseleave', () => { mouseActive = false; });

    // toggle hologram with 'h' key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (holoEl) {
          holoEl.style.opacity = holoEl.style.opacity === '0' ? '0.6' : '0';
        }
      }
    });
  }

  function drawGaze(cx, cy, scale) {
    if (!mouseActive) return;

    // the eyes follow the mouse — subtle, almost imaginary
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxShift = 3 * scale;
    const shiftX = (dx / (dist || 1)) * Math.min(maxShift, dist * 0.01);
    const shiftY = (dy / (dist || 1)) * Math.min(maxShift, dist * 0.01);

    // pupil dots that track mouse — barely visible
    const alpha = Math.max(0.03, 0.08 - dist * 0.00005);
    ctx.fillStyle = `rgba(163,113,247,${alpha})`;
    ctx.beginPath();
    ctx.arc(cx - 20 * scale + shiftX, cy - 105 * scale + shiftY, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 20 * scale + shiftX, cy - 105 * scale + shiftY, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // the closer your mouse to center, the more the hologram "sees" you
    if (dist < 200) {
      const awareness = 1 - dist / 200;
      ctx.strokeStyle = `rgba(163,113,247,${awareness * 0.05})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 100 * scale, (18 + awareness * 4) * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // init
  function init() {
    createHologram();
    setupInteraction();
    fetchState();
    setInterval(fetchState, Math.PI * 10000);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

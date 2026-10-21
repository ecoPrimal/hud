// saturn-ring.js — the flat citadel around the globe
// the totality IS the ring. the hologram IS the planet within.
// visitors land on the ring and see different faces as it turns.

(function() {
  'use strict';

  const FACES = [
    { name: 'security', color: [232,93,58], repos: [
      { n:'bearDog', kb:654704, t:0, org:'eco' },
      { n:'nestGate', kb:41124, t:0, org:'eco' },
      { n:'rhizoCrypt', kb:3168, t:0, org:'eco' },
      { n:'loamSpine', kb:3115, t:0, org:'eco' },
    ]},
    { name: 'discovery', color: [163,113,247], repos: [
      { n:'songBird', kb:377536, t:0, org:'eco' },
      { n:'squirrel', kb:25664, t:0, org:'eco' },
      { n:'sweetGrass', kb:3154, t:0, org:'eco' },
    ]},
    { name: 'evidence', color: [88,166,255], repos: [
      { n:'publicRecord', kb:252201, t:0, org:'defend' },
      { n:'detroit', kb:48, t:0, org:'eco' },
      { n:'whitePaper', kb:35299, t:0, org:'eco' },
    ]},
    { name: 'science', color: [63,185,80], repos: [
      { n:'sporePrint', kb:63234, t:0, org:'eco' },
      { n:'hotSpring', kb:116201, t:850, org:'synth' },
      { n:'wetSpring', kb:14676, t:1750, org:'synth' },
      { n:'neuralSpring', kb:13805, t:4500, org:'synth' },
      { n:'healthSpring', kb:5108, t:840, org:'synth' },
      { n:'groundSpring', kb:5961, t:930, org:'synth' },
      { n:'ludoSpring', kb:3159, t:1692, org:'synth' },
      { n:'airSpring', kb:6370, t:0, org:'synth' },
      { n:'primalSpring', kb:6294, t:0, org:'synth' },
    ]},
    { name: 'compute', color: [210,169,34], repos: [
      { n:'toadStool', kb:49314, t:0, org:'eco' },
      { n:'barraCuda', kb:7963, t:0, org:'eco' },
      { n:'biomeOS', kb:24971, t:0, org:'eco' },
      { n:'coralReef', kb:8978, t:0, org:'eco' },
      { n:'rustChip', kb:1597, t:0, org:'synth' },
    ]},
    { name: 'surface', color: [240,230,140], repos: [
      { n:'HUD', kb:1656, t:0, org:'eco' },
      { n:'petalTongue', kb:9467, t:0, org:'eco' },
      { n:'wateringHole', kb:40424, t:0, org:'eco' },
      { n:'cellMembrane', kb:2584, t:0, org:'eco' },
    ]},
    { name: 'culture', color: [247,120,186], repos: [
      { n:'sourDough', kb:6909, t:0, org:'eco' },
      { n:'esotericWebb', kb:630, t:0, org:'eco' },
      { n:'bingoCube', kb:225, t:0, org:'eco' },
      { n:'coralForge', kb:0, t:0, org:'synth' },
      { n:'opsonize-rs', kb:30, t:0, org:'eco' },
    ]},
    { name: 'infra', color: [139,148,158], repos: [
      { n:'agentReagents', kb:942, t:0, org:'synth' },
      { n:'benchScale', kb:762, t:0, org:'synth' },
      { n:'ionChannel', kb:982, t:0, org:'synth' },
    ]},
  ];

  const TOTALS = {
    gb: 1.75, repos: 67, orgs: 6, tests: 10562,
    papers: 109, waves: 180, convergences: 12,
    fossils: 7, nascent: 10,
  };

  let allRepos = [];
  FACES.forEach((face, fi) => {
    face.repos.forEach((r, ri) => {
      allRepos.push({ ...r, face: fi, faceName: face.name, color: face.color });
    });
  });

  let canvas, ctx, raf, t = 0;
  let ringAngle = 0;
  let hoveredFace = -1;
  let activeFaceLabel = '';
  let activeFaceStats = '';
  let mouseX = 0, mouseY = 0;

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'saturn-ring-canvas';
    canvas.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 1; pointer-events: none; opacity: 1;
    `;
    const holoLayer = document.getElementById('hologram-layer');
    if (holoLayer) {
      holoLayer.parentNode.insertBefore(canvas, holoLayer);
    } else {
      const overlay = document.querySelector('.overlay');
      if (overlay) overlay.parentNode.insertBefore(canvas, overlay);
      else document.body.appendChild(canvas);
    }

    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
    });

    render();
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
  }

  function render() {
    if (!ctx) { raf = requestAnimationFrame(render); return; }
    const w = canvas.width, h = canvas.height;
    t += 0.008;
    ringAngle += 0.0004;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.42;
    const scale = Math.min(w, h) / 500;

    drawRing(cx, cy, scale, w, h);
    drawFaceLabel(cx, cy, scale);
    drawTotalityBar(w, h);

    raf = requestAnimationFrame(render);
  }

  function drawRing(cx, cy, scale, w, h) {
    const a = 200 * scale;
    const b = 50 * scale;
    const tilt = 0.35;
    const totalRepos = allRepos.length;

    const faceCount = FACES.length;
    const faceArc = (Math.PI * 2) / faceCount;

    // draw ring glow first
    ctx.save();
    ctx.translate(cx, cy + 15 * scale);

    // ring dust — hundreds of tiny particles
    for (let i = 0; i < 300; i++) {
      const dustAngle = (i / 300) * Math.PI * 2 + ringAngle + Math.sin(i * 0.7) * 0.05;
      const dustR = a + (Math.sin(i * 1.3 + t) * 18 * scale) + (i % 7 - 3) * 2 * scale;
      const dx = Math.cos(dustAngle) * dustR;
      const dy = Math.sin(dustAngle) * b * (dustR / a) + Math.sin(dustAngle) * tilt * 10;

      const faceIdx = Math.floor(((dustAngle - ringAngle + Math.PI * 4) % (Math.PI * 2)) / faceArc) % faceCount;
      const fc = FACES[faceIdx].color;
      const alpha = 0.04 + Math.sin(t * 2 + i) * 0.02;

      ctx.fillStyle = `rgba(${fc[0]},${fc[1]},${fc[2]},${alpha})`;
      ctx.fillRect(dx, dy, 1, 1);
    }

    // repo particles — each repo orbits in the ring
    allRepos.forEach((repo, i) => {
      const baseAngle = (i / totalRepos) * Math.PI * 2;
      const angle = baseAngle + ringAngle;
      const sizeLog = Math.max(1.5, Math.log10(Math.max(repo.kb, 10)) * 1.2);

      const rx = a + Math.sin(i * 2.7 + t * 0.5) * 8 * scale;
      const dx = Math.cos(angle) * rx;
      const dy = Math.sin(angle) * b * (rx / a) + Math.sin(angle) * tilt * 8;

      const behind = Math.sin(angle) > 0;
      const alpha = behind ? 0.08 : 0.25;
      const c = repo.color;

      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
      ctx.beginPath();
      ctx.arc(dx, dy, sizeLog * scale, 0, Math.PI * 2);
      ctx.fill();

      // validated tests glow
      if (repo.t > 0 && !behind) {
        ctx.strokeStyle = `rgba(63,185,80,${0.15 + Math.sin(t + i) * 0.05})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(dx, dy, (sizeLog + 2) * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // label — only show for front-facing, large repos, or nearby mouse
      if (!behind) {
        const screenX = cx + dx;
        const screenY = cy + 15 * scale + dy;
        const distToMouse = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2);

        if (repo.kb > 30000 || distToMouse < 60) {
          const labelAlpha = distToMouse < 60 ? 0.6 : 0.15;
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${labelAlpha})`;
          ctx.font = `${Math.max(7, 8 * scale)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(repo.n, dx, dy - (sizeLog + 4) * scale);

          if (repo.t > 0 && (distToMouse < 60 || repo.kb > 50000)) {
            ctx.fillStyle = `rgba(63,185,80,${labelAlpha * 0.7})`;
            ctx.font = `${Math.max(6, 6.5 * scale)}px monospace`;
            ctx.fillText(`${repo.t}+ tests`, dx, dy + (sizeLog + 8) * scale);
          }
        }
      }
    });

    // ring edge lines — the gap between faces
    for (let fi = 0; fi < faceCount; fi++) {
      const edgeAngle = fi * faceArc + ringAngle;
      const dx1 = Math.cos(edgeAngle) * (a - 20 * scale);
      const dy1 = Math.sin(edgeAngle) * b * ((a - 20 * scale) / a);
      const dx2 = Math.cos(edgeAngle) * (a + 20 * scale);
      const dy2 = Math.sin(edgeAngle) * b * ((a + 20 * scale) / a);

      ctx.strokeStyle = 'rgba(48,54,61,0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(dx1, dy1); ctx.lineTo(dx2, dy2); ctx.stroke();

      // face name at mid-arc (front only)
      const midAngle = (fi + 0.5) * faceArc + ringAngle;
      if (Math.sin(midAngle) < -0.2) {
        const lx = Math.cos(midAngle) * (a + 30 * scale);
        const ly = Math.sin(midAngle) * b * ((a + 30 * scale) / a) + Math.sin(midAngle) * tilt * 10;
        ctx.fillStyle = `rgba(${FACES[fi].color[0]},${FACES[fi].color[1]},${FACES[fi].color[2]},0.3)`;
        ctx.font = `${Math.max(8, 9 * scale)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(FACES[fi].name, lx, ly - 8 * scale);

        const faceKB = FACES[fi].repos.reduce((s, r) => s + r.kb, 0);
        const faceTests = FACES[fi].repos.reduce((s, r) => s + r.t, 0);
        ctx.fillStyle = `rgba(${FACES[fi].color[0]},${FACES[fi].color[1]},${FACES[fi].color[2]},0.15)`;
        ctx.font = `${Math.max(6, 7 * scale)}px monospace`;
        let sub = `${FACES[fi].repos.length} repos · ${(faceKB/1024).toFixed(0)} MB`;
        if (faceTests > 0) sub += ` · ${faceTests}+ tests`;
        ctx.fillText(sub, lx, ly + 4 * scale);
      }
    }

    ctx.restore();
  }

  function drawFaceLabel(cx, cy, scale) {
    // which face is currently "front and center"
    const frontAngle = -Math.PI / 2;
    const faceArc = (Math.PI * 2) / FACES.length;
    const currentFace = Math.floor(((frontAngle - ringAngle + Math.PI * 10) % (Math.PI * 2)) / faceArc) % FACES.length;
    const face = FACES[currentFace];

    if (!face) return;

    const c = face.color;
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.12)`;
    ctx.font = `bold ${Math.max(10, 12 * scale)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`▸ ${face.name}`, cx, cy + 100 * scale);

    const totalKB = face.repos.reduce((s, r) => s + r.kb, 0);
    const totalTests = face.repos.reduce((s, r) => s + r.t, 0);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.08)`;
    ctx.font = `${Math.max(8, 9 * scale)}px monospace`;
    let info = `${face.repos.length} organisms · ${(totalKB/1024).toFixed(0)} MB`;
    if (totalTests > 0) info += ` · ${totalTests.toLocaleString()}+ validated`;
    ctx.fillText(info, cx, cy + 116 * scale);
  }

  function drawTotalityBar(w, h) {
    // bottom bar — aggregate totality numbers
    const y = h - 28;

    ctx.fillStyle = 'rgba(13,17,23,0.5)';
    ctx.fillRect(0, y - 10, w, 30);

    ctx.font = '9px monospace';
    ctx.textAlign = 'center';

    const parts = [
      { v: `${TOTALS.gb} GB`, c: 'rgba(240,230,140,0.3)' },
      { v: `${TOTALS.repos} repos`, c: 'rgba(88,166,255,0.3)' },
      { v: `${TOTALS.orgs} orgs`, c: 'rgba(163,113,247,0.3)' },
      { v: `${TOTALS.tests.toLocaleString()}+ tests`, c: 'rgba(63,185,80,0.3)' },
      { v: `${TOTALS.papers} papers`, c: 'rgba(210,169,34,0.3)' },
      { v: `wave ${TOTALS.waves}`, c: 'rgba(90,184,122,0.3)' },
      { v: `${TOTALS.convergences} convergences`, c: 'rgba(247,120,186,0.3)' },
      { v: `${TOTALS.fossils} fossils`, c: 'rgba(139,148,158,0.3)' },
      { v: `${TOTALS.nascent} nascent`, c: 'rgba(126,231,135,0.3)' },
    ];

    const spacing = w / (parts.length + 1);
    parts.forEach((p, i) => {
      ctx.fillStyle = p.c;
      ctx.fillText(p.v, spacing * (i + 1), y + 2);
    });

    // pulsing separator dots
    parts.forEach((_, i) => {
      if (i < parts.length - 1) {
        const alpha = 0.1 + Math.sin(t * 2 + i) * 0.05;
        ctx.fillStyle = `rgba(48,54,61,${alpha})`;
        ctx.fillText('·', spacing * (i + 1) + spacing / 2, y + 2);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }
})();

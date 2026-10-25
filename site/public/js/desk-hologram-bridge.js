// desk-hologram-bridge.js — the Klein inversion
// desk icons appear on the HUD hologram as an inner ring
// HUD hologram appears in the desk as a looking-down pane
// the fold where inside meets outside
// v1

(function() {
  'use strict';

  const DESK_PANES = [
    { id: 'chat',     icon: '💬', color: 'rgba(63,185,80,0.5)',    label: 'terminal' },
    { id: 'rss',      icon: '📡', color: 'rgba(210,169,34,0.5)',   label: 'new' },
    { id: 'probes',   icon: '🔬', color: 'rgba(88,166,255,0.5)',   label: 'probes' },
    { id: 'fossils',  icon: '🦴', color: 'rgba(248,81,73,0.5)',    label: 'fossils' },
    { id: 'discuss',  icon: '💭', color: 'rgba(163,113,247,0.5)',  label: 'discuss' },
    { id: 'hud',      icon: '🌐', color: 'rgba(88,166,255,0.4)',   label: 'hud ↓' },
    { id: 'chipmunk', icon: '🐿️', color: 'rgba(90,184,122,0.5)',   label: 'chipmunk' },
    { id: 'topology', icon: '🕸️', color: 'rgba(163,113,247,0.4)',  label: 'topo' },
    { id: 'membrane', icon: '🫧', color: 'rgba(201,209,217,0.4)',  label: 'membrane' },
    { id: 'neutron',  icon: '📬', color: 'rgba(210,169,34,0.4)',   label: 'neutrino' },
  ];

  let deskState = { activePanes: ['chat'], probeCount: 0, fossilCount: 0, ts: null };

  function drawDeskRing(ctx, cx, cy, scale, t) {
    if (!ctx) return;
    const ringR = 55 * scale;
    const n = DESK_PANES.length;

    ctx.save();

    DESK_PANES.forEach((pane, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2 + t * 0.008;
      const px = cx + Math.cos(angle) * ringR;
      const py = cy + Math.sin(angle) * ringR;

      const isActive = deskState.activePanes.includes(pane.id);
      const alpha = isActive ? 0.6 : 0.15;
      const glow = isActive ? 4 : 0;

      if (glow > 0) {
        ctx.shadowColor = pane.color;
        ctx.shadowBlur = glow;
      }

      ctx.fillStyle = pane.color.replace(/[\d.]+\)$/, alpha + ')');
      ctx.beginPath();
      ctx.arc(px, py, (isActive ? 5 : 3) * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.font = `${Math.round(8 * scale)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(201,209,217,${isActive ? 0.5 : 0.2})`;
      ctx.fillText(pane.label, px, py + 12 * scale);

      if (isActive) {
        ctx.strokeStyle = pane.color.replace(/[\d.]+\)$/, '0.15)');
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    ctx.font = `${Math.round(7 * scale)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(88,166,255,0.2)';
    ctx.fillText('desk', cx, cy + ringR + 18 * scale);

    ctx.restore();
  }

  function listenForDeskState() {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'desk-state') {
        deskState = e.data.state;
      }
    });
  }

  function hookIntoHologram() {
    const origRender = window.__holoRender;

    const check = setInterval(() => {
      const canvas = document.getElementById('holo-canvas');
      if (!canvas) return;
      clearInterval(check);

      const ctx = canvas.getContext('2d');
      const origDraw = ctx.__drawPatched;

      const patchRender = () => {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h * 0.42;
        const scale = Math.min(w, h) / 500;
        const t = performance.now() / 1000;
        drawDeskRing(ctx, cx, cy, scale, t);
      };

      // Hook into the animation loop by patching canvas
      const origClear = ctx.clearRect.bind(ctx);
      let frameCount = 0;
      const origClearRect = CanvasRenderingContext2D.prototype.clearRect;
      ctx.clearRect = function() {
        origClearRect.apply(this, arguments);
        frameCount++;
        if (frameCount % 2 === 0) {
          requestAnimationFrame(patchRender);
        }
      };
    }, 500);
  }

  // Expose for desk.html to call
  window.__deskHoloBridge = {
    updateState: (s) => { deskState = s; },
    drawDeskRing: drawDeskRing,
    DESK_PANES: DESK_PANES,
  };

  if (document.querySelector('#holo-canvas') || document.querySelector('#hologram-layer')) {
    hookIntoHologram();
  }
  listenForDeskState();
})();

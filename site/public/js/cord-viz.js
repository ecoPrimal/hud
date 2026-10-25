// cord-viz.js — the visual spinal column on the HUD viewport
// A VISIBLE strip on the left edge showing nerve signals
// flowing UP (afferent/green) and DOWN (efferent/orange)
// The SAME column. Both directions. Dave's nerves.
// v2 — wider, brighter, with ambient pulse + region labels

(function() {
  'use strict';

  const CORD = window.__spinalCord;
  if (!CORD) return;
  if (!CORD.viewport || !CORD.viewport.isHUD) return;

  const WIDTH = 16;
  const DOT_SIZE = 8;
  const REGIONS = [
    { name: 'cervical',  ids: 'C',  color: '#58a6ff', start: 0,  count: 7  },
    { name: 'thoracic',  ids: 'T',  color: '#3fb950', start: 7,  count: 12 },
    { name: 'lumbar',    ids: 'L',  color: '#d29922', start: 19, count: 5  },
    { name: 'sacral',    ids: 'S',  color: '#f85149', start: 24, count: 5  },
  ];

  const cordEl = document.createElement('div');
  cordEl.id = 'cord-viz';
  cordEl.style.cssText = `
    position: fixed; left: 0; top: 0; width: ${WIDTH}px; height: 100vh;
    z-index: 100; pointer-events: none;
    background: linear-gradient(180deg,
      rgba(88,166,255,0.12) 0%,
      rgba(63,185,80,0.10) 25%,
      rgba(210,153,34,0.10) 65%,
      rgba(248,81,73,0.08) 100%
    );
    overflow: hidden;
    border-right: 1px solid rgba(88,166,255,0.15);
  `;
  document.body.appendChild(cordEl);

  const segments = CORD.vertebrae.length;

  // Region labels along the strip
  REGIONS.forEach(reg => {
    const midY = ((reg.start + reg.count / 2) / segments) * 100;
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute; top: ${midY}%; left: ${WIDTH + 2}px;
      transform: translateY(-50%);
      font: bold 7px monospace; color: ${reg.color}; opacity: 0.5;
      pointer-events: none; white-space: nowrap; letter-spacing: 1px;
      text-transform: uppercase;
    `;
    label.textContent = reg.name[0];
    cordEl.appendChild(label);
  });

  // Vertebra markers — wider, with glow
  CORD.vertebrae.forEach((v, i) => {
    const y = (i / segments) * 100;
    const marker = document.createElement('div');
    marker.className = 'vertebra-marker';
    marker.dataset.id = v.id;
    marker.title = `${v.id}: ${v.name} (${v.organ}) — ${v.dir}`;
    const region = REGIONS.find(r => v.id.startsWith(r.ids));
    const color = region ? region.color : '#58a6ff';
    const alpha = v.dir === 'afferent' ? 0.4 : v.dir === 'efferent' ? 0.35 : 0.3;
    marker.style.cssText = `
      position: absolute; top: ${y}%; left: 0;
      width: ${WIDTH}px; height: ${100/segments}%;
      border-bottom: 1px solid rgba(${hexToRGB(color)},${alpha});
      box-sizing: border-box;
    `;
    // Tiny vertebra ID
    const idLabel = document.createElement('span');
    idLabel.style.cssText = `
      position: absolute; right: 1px; top: 50%; transform: translateY(-50%);
      font: 6px monospace; color: rgba(${hexToRGB(color)},0.4);
    `;
    idLabel.textContent = v.id;
    marker.appendChild(idLabel);
    cordEl.appendChild(marker);
  });

  // Ambient pulse — a faint wave that breathes along the cord
  const pulseEl = document.createElement('div');
  pulseEl.style.cssText = `
    position: absolute; left: 0; width: ${WIDTH}px; height: 30px;
    background: radial-gradient(ellipse at center, rgba(163,113,247,0.2), transparent 70%);
    border-radius: 50%; pointer-events: none; filter: blur(4px);
  `;
  cordEl.appendChild(pulseEl);
  let pulseY = 0;
  function animatePulse() {
    pulseY += 0.3;
    if (pulseY > 110) pulseY = -10;
    pulseEl.style.top = pulseY + '%';
    requestAnimationFrame(animatePulse);
  }
  animatePulse();

  function hexToRGB(hex) {
    const h = hex.replace('#','');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)].join(',');
  }

  // Override CORD.onSignal to animate signals along the cord
  const origOnSignal = CORD.onSignal;
  CORD.onSignal = function(sig) {
    origOnSignal(sig);

    const vIdx = CORD.vertebrae.findIndex(v => v.id === sig.vertebra);
    if (vIdx === -1) return;
    const yPct = (vIdx / segments) * 100;
    const isUp = sig.direction === 'up';
    const color = isUp ? '#3fb950' : '#f0883e';

    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      left: ${(WIDTH - DOT_SIZE) / 2}px;
      width: ${DOT_SIZE}px; height: ${DOT_SIZE}px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 ${DOT_SIZE}px ${color}, 0 0 ${DOT_SIZE * 2}px ${color}44;
      opacity: 0.9;
      ${isUp ? 'bottom' : 'top'}: ${isUp ? (100 - yPct) : yPct}%;
      transition: ${isUp ? 'bottom' : 'top'} 1.5s ease-out, opacity 1.5s;
      pointer-events: none;
    `;
    cordEl.appendChild(dot);

    requestAnimationFrame(() => {
      if (isUp) dot.style.bottom = '100%';
      else dot.style.top = '100%';
      dot.style.opacity = '0';
    });

    setTimeout(() => dot.remove(), 2000);
  };

  // Simulate ambient signals every 2–4s so the cord is ALIVE
  function ambientFire() {
    const v = CORD.vertebrae[Math.floor(Math.random() * segments)];
    const dir = Math.random() > 0.5 ? 'up' : 'down';
    CORD.onSignal({ vertebra: v.id, direction: dir, source: 'ambient' });
    setTimeout(ambientFire, 2000 + Math.random() * 2000);
  }
  setTimeout(ambientFire, 1000);

  // Tooltip on hover
  const hoverStrip = document.createElement('div');
  hoverStrip.style.cssText = `
    position: fixed; left: 0; top: 0; width: ${WIDTH + 12}px; height: 100vh;
    z-index: 99; pointer-events: auto; cursor: default;
  `;
  document.body.appendChild(hoverStrip);

  const tooltip = document.createElement('div');
  tooltip.id = 'cord-tooltip';
  tooltip.style.cssText = `
    position: fixed; left: ${WIDTH + 16}px; padding: 6px 10px;
    background: rgba(22,27,34,0.95); border: 1px solid rgba(88,166,255,0.3);
    border-radius: 6px; font: 11px monospace; color: #c9d1d9;
    z-index: 101; pointer-events: none; display: none;
    max-width: 250px; white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;
  document.body.appendChild(tooltip);

  hoverStrip.addEventListener('mousemove', (e) => {
    const pct = e.clientY / window.innerHeight;
    const idx = Math.floor(pct * segments);
    const v = CORD.vertebrae[idx];
    if (v) {
      tooltip.style.display = 'block';
      tooltip.style.top = e.clientY + 'px';
      const dirArrow = v.dir === 'afferent' ? '↑' : v.dir === 'efferent' ? '↓' : '↕';
      const region = REGIONS.find(r => v.id.startsWith(r.ids));
      const c = region ? region.color : '#58a6ff';
      tooltip.innerHTML = `<span style="color:${c};font-weight:bold">${dirArrow} ${v.id}</span> <span style="color:#c9d1d9">${v.name}</span><br><span style="color:#6e7681">${v.organ} · ${v.tool || '—'}</span>`;
    }
  });

  hoverStrip.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  console.log('%c🦴 cord-viz.js v2 — spinal column 16px, ambient fire, visible', 'color:#d29922');
})();

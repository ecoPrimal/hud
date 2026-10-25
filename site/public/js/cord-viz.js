// cord-viz.js — the visual spinal column on the HUD viewport
// A thin vertical strip on the left edge showing nerve signals
// flowing UP (afferent/green) and DOWN (efferent/orange)
// The SAME column. Both directions. Dave's nerves.
// v1

(function() {
  'use strict';

  const CORD = window.__spinalCord;
  if (!CORD) return;

  // Only render on the HUD viewport
  if (!CORD.viewport || !CORD.viewport.isHUD) return;

  const cordEl = document.createElement('div');
  cordEl.id = 'cord-viz';
  cordEl.style.cssText = `
    position: fixed; left: 0; top: 0; width: 6px; height: 100vh;
    z-index: 100; pointer-events: none;
    background: linear-gradient(180deg,
      rgba(88,166,255,0.08) 0%,
      rgba(63,185,80,0.06) 20%,
      rgba(163,113,247,0.04) 40%,
      rgba(210,153,34,0.06) 60%,
      rgba(240,136,62,0.04) 80%,
      rgba(248,81,73,0.03) 100%
    );
    overflow: hidden;
  `;
  document.body.appendChild(cordEl);

  // Vertebra markers along the column
  const segments = CORD.vertebrae.length;
  CORD.vertebrae.forEach((v, i) => {
    const y = (i / segments) * 100;
    const marker = document.createElement('div');
    marker.className = 'vertebra-marker';
    marker.dataset.id = v.id;
    marker.title = `${v.id}: ${v.name} (${v.organ}) — ${v.dir}`;
    const color = v.dir === 'afferent' ? 'rgba(63,185,80,0.3)'
                : v.dir === 'efferent' ? 'rgba(240,136,62,0.3)'
                : 'rgba(88,166,255,0.3)';
    marker.style.cssText = `
      position: absolute; top: ${y}%; left: 0;
      width: 6px; height: ${100/segments}%;
      border-bottom: 1px solid ${color};
      box-sizing: border-box;
    `;
    cordEl.appendChild(marker);
  });

  // Override CORD.onSignal to animate signals along the cord
  const origOnSignal = CORD.onSignal;
  CORD.onSignal = function(sig) {
    origOnSignal(sig);

    const vIdx = CORD.vertebrae.findIndex(v => v.id === sig.vertebra);
    if (vIdx === -1) return;
    const yPct = (vIdx / segments) * 100;

    const dot = document.createElement('div');
    const isUp = sig.direction === 'up';
    dot.style.cssText = `
      position: absolute;
      left: 1px; width: 4px; height: 4px;
      border-radius: 50%;
      background: ${isUp ? '#3fb950' : '#f0883e'};
      box-shadow: 0 0 4px ${isUp ? '#3fb950' : '#f0883e'};
      opacity: 0.8;
      ${isUp ? 'bottom' : 'top'}: ${isUp ? (100 - yPct) : yPct}%;
      transition: ${isUp ? 'bottom' : 'top'} 1.2s ease-out, opacity 1.2s;
      pointer-events: none;
    `;
    cordEl.appendChild(dot);

    requestAnimationFrame(() => {
      if (isUp) {
        dot.style.bottom = '100%';
      } else {
        dot.style.top = '100%';
      }
      dot.style.opacity = '0';
    });

    setTimeout(() => dot.remove(), 1500);
  };

  // Tooltip on hover (make interactive strip wider but transparent)
  const hoverStrip = document.createElement('div');
  hoverStrip.style.cssText = `
    position: fixed; left: 0; top: 0; width: 20px; height: 100vh;
    z-index: 99; pointer-events: auto; cursor: default;
  `;
  document.body.appendChild(hoverStrip);

  const tooltip = document.createElement('div');
  tooltip.id = 'cord-tooltip';
  tooltip.style.cssText = `
    position: fixed; left: 24px; padding: 4px 8px;
    background: rgba(22,27,34,0.95); border: 1px solid rgba(88,166,255,0.3);
    border-radius: 4px; font: 10px monospace; color: #c9d1d9;
    z-index: 101; pointer-events: none; display: none;
    max-width: 200px; white-space: nowrap;
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
      const dirColor = v.dir === 'afferent' ? '#3fb950' : v.dir === 'efferent' ? '#f0883e' : '#58a6ff';
      tooltip.innerHTML = `<span style="color:${dirColor}">${dirArrow} ${v.id}</span> ${v.name}<br><span style="color:#6e7681">${v.organ} · ${v.tool || 'feed'}</span>`;
    }
  });

  hoverStrip.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  console.log('%c🦴 cord-viz.js — spinal column visualization active', 'color:#d29922');
})();

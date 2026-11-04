// SPDX-License-Identifier: AGPL-3.0-or-later
// viz-hydrate.js — Progressive enhancement for petalTongue scene visualizations.
//
// Loads petal-tongue-wasm, fetches scene JSON from the server, and adds
// interactive features (pan, zoom, hover, click-to-filter, animation playback)
// on top of the server-rendered SVG base.
//
// Usage: <script type="module" src="/js/viz-hydrate.js"></script>
// Containers must have data-viz-src="/viz/<name>?format=scene-json"

const WASM_PATH = '/wasm/petal_tongue_wasm.js';

class VizController {
  constructor(container) {
    this.container = container;
    this.src = container.dataset.vizSrc;
    this.svgEl = container.querySelector('svg');
    this.scene = null;
    this.wasm = null;
    this.viewBox = { x: 0, y: 0, w: 800, h: 600 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.tooltip = null;
  }

  async init(wasmModule) {
    this.wasm = wasmModule;

    try {
      const resp = await fetch(this.src);
      if (!resp.ok) return;
      this.scene = await resp.text();
    } catch (e) {
      console.warn('[viz-hydrate] Failed to fetch scene:', e);
      return;
    }

    this.setupInteraction();
    this.container.classList.add('viz-interactive');
  }

  setupInteraction() {
    if (!this.svgEl) return;

    // Parse existing viewBox
    const vb = this.svgEl.getAttribute('viewBox');
    if (vb) {
      const [x, y, w, h] = vb.split(/\s+/).map(Number);
      this.viewBox = { x, y, w, h };
    }

    // Zoom via wheel
    this.svgEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const rect = this.svgEl.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * this.viewBox.w + this.viewBox.x;
      const my = ((e.clientY - rect.top) / rect.height) * this.viewBox.h + this.viewBox.y;

      this.viewBox.w *= factor;
      this.viewBox.h *= factor;
      this.viewBox.x = mx - (mx - this.viewBox.x) * factor;
      this.viewBox.y = my - (my - this.viewBox.y) * factor;
      this.applyViewBox();
    }, { passive: false });

    // Pan via pointer drag
    this.svgEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
      this.svgEl.setPointerCapture(e.pointerId);
    });

    this.svgEl.addEventListener('pointermove', (e) => {
      if (!this.isPanning) {
        this.handleHover(e);
        return;
      }
      const rect = this.svgEl.getBoundingClientRect();
      const dx = (e.clientX - this.panStart.x) / rect.width * this.viewBox.w;
      const dy = (e.clientY - this.panStart.y) / rect.height * this.viewBox.h;
      this.viewBox.x -= dx;
      this.viewBox.y -= dy;
      this.panStart = { x: e.clientX, y: e.clientY };
      this.applyViewBox();
    });

    this.svgEl.addEventListener('pointerup', (e) => {
      this.isPanning = false;
      this.svgEl.releasePointerCapture(e.pointerId);
    });

    // Double-click to reset
    this.svgEl.addEventListener('dblclick', () => {
      this.viewBox = { x: 0, y: 0, w: 800, h: 600 };
      this.applyViewBox();
    });

    // Click on nodes
    this.svgEl.addEventListener('click', (e) => {
      if (this.isPanning) return;
      const target = e.target.closest('[data-id]');
      if (target) {
        this.handleNodeClick(target.dataset.id);
      }
    });

    this.createTooltip();
  }

  applyViewBox() {
    const { x, y, w, h } = this.viewBox;
    this.svgEl.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  }

  handleHover(e) {
    const target = e.target.closest('circle, rect');
    if (target && this.tooltip) {
      const label = target.closest('[aria-label]')?.getAttribute('aria-label') ||
                    target.nextElementSibling?.textContent || '';
      if (label) {
        this.tooltip.textContent = label;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${e.clientX + 10}px`;
        this.tooltip.style.top = `${e.clientY - 30}px`;
      }
    } else if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  handleNodeClick(id) {
    const el = this.svgEl.querySelector(`[data-id="${id}"]`) ||
               this.svgEl.querySelector(`circle[data-id="${id}"]`);
    if (!el) return;

    // NUCLEUS composition layers: expand/collapse on click
    const nucleusLayers = ['tower-atomic', 'node-atomic', 'nest-atomic', 'full-nucleus'];
    if (nucleusLayers.includes(id)) {
      this.expandNucleusLayer(id);
      return;
    }

    // Default: highlight pulse
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0.5';
    setTimeout(() => { el.style.opacity = '1'; }, 300);
  }

  expandNucleusLayer(layerId) {
    const nucleusLayers = ['tower-atomic', 'node-atomic', 'nest-atomic', 'full-nucleus'];
    const idx = nucleusLayers.indexOf(layerId);
    if (idx < 0) return;

    // Expand selected + inner layers, dim outer layers
    for (let i = 0; i < nucleusLayers.length; i++) {
      const el = this.svgEl.querySelector(`[data-id="${nucleusLayers[i]}"]`);
      if (!el) continue;
      const parent = el.closest('g') || el.parentElement;
      if (!parent) continue;

      if (i <= idx) {
        parent.style.transition = 'transform 0.4s ease-in-out, opacity 0.3s';
        parent.style.opacity = '1';
        parent.style.transform = 'scale(1.02)';
        parent.style.transformOrigin = 'center center';
      } else {
        parent.style.transition = 'opacity 0.3s';
        parent.style.opacity = '0.4';
      }
    }

    // Reset after 2 seconds
    setTimeout(() => {
      for (const lid of nucleusLayers) {
        const el = this.svgEl.querySelector(`[data-id="${lid}"]`);
        if (!el) continue;
        const parent = el.closest('g') || el.parentElement;
        if (!parent) continue;
        parent.style.transition = 'transform 0.3s, opacity 0.3s';
        parent.style.opacity = '1';
        parent.style.transform = 'scale(1)';
      }
    }, 2000);
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'viz-tooltip';
    document.body.appendChild(this.tooltip);
  }

  rerender(modality = 'svg') {
    if (!this.wasm || !this.scene) return;
    try {
      const result = this.wasm.render_scene_to_modality(this.scene, modality);
      if (result && !result.startsWith('Error:')) {
        this.svgEl.outerHTML = result;
        this.svgEl = this.container.querySelector('svg');
        this.setupInteraction();
      }
    } catch (e) {
      console.warn('[viz-hydrate] Re-render failed:', e);
    }
  }

  async loadAnimation() {
    const animSrc = this.src.replace('format=scene-json', 'format=animation-json');
    try {
      const resp = await fetch(animSrc);
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  }

  async playRelayAnimation() {
    const anim = await this.loadAnimation();
    if (!anim || !this.svgEl) return;

    const steps = anim.Sequential || anim.Parallel || [];
    for (const step of steps) {
      const target = step.target;
      if (!target) continue;
      const nodeId = target.Opacity?.node_id || target.Translate?.node_id || target.StrokeDraw?.node_id || '';
      if (!nodeId) continue;

      // Find SVG elements belonging to this node's group
      const group = this.svgEl.querySelector(`[data-id="${nodeId}"]`) ||
                    this.svgEl.querySelector(`#${CSS.escape(nodeId)}`);
      if (!group) continue;

      const duration = (step.duration_secs || 0.5) * 1000;
      const delay = (step.delay_secs || 0) * 1000;

      await new Promise(r => setTimeout(r, delay));

      group.style.transition = `opacity ${duration}ms ease-out`;
      group.style.opacity = '0.3';
      await new Promise(r => setTimeout(r, 50));
      group.style.opacity = '1';
      group.style.filter = 'drop-shadow(0 0 6px rgba(243,139,168,0.8))';
      await new Promise(r => setTimeout(r, duration));
      group.style.filter = '';
    }
  }
}

class AnimationButton {
  constructor(container, ctrl) {
    this.ctrl = ctrl;
    const btn = document.createElement('button');
    btn.className = 'viz-animate-btn';
    btn.textContent = '\u25B6 Animate relay';
    btn.addEventListener('click', () => ctrl.playRelayAnimation());
    container.appendChild(btn);
  }
}

// Initialize all viz containers on the page
async function initAll() {
  const containers = document.querySelectorAll('[data-viz-src]');
  if (containers.length === 0) return;

  let wasmModule = null;
  try {
    const wasm = await import(WASM_PATH);
    await wasm.default();
    wasmModule = wasm;
  } catch (e) {
    console.info('[viz-hydrate] WASM not available, SVG fallback active:', e.message);
    return;
  }

  for (const container of containers) {
    const ctrl = new VizController(container);
    await ctrl.init(wasmModule);
    container._vizCtrl = ctrl;

    // Add animation button for K-Derm and NUCLEUS visualizations
    if (ctrl.src.includes('kderm') || ctrl.src.includes('nucleus')) {
      new AnimationButton(container, ctrl);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

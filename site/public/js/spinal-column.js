// spinal-column.js — the wire along which ALL signals travel
//
// CNS: HUD is the brain — the ONLY viewport
// PNS: desk is the puppet strings — the motor commands
// Spinal column: this script — the SAME fibers carry signals BOTH ways
//
// AFFERENT (sensory, UP):   services → feeds → HUD viewport
// EFFERENT (motor, DOWN):   desk puppet strings → MCP → services
//
// The nerve does not care about direction. The signal is the signal.
// Dave's nerves along the spinal column. The same fiber. Both ways.
//
// v1

(function() {
  'use strict';

  const CORD = window.__spinalCord = window.__spinalCord || {};

  // ═══════════════════════════════════════════════════════════
  // VERTEBRAE — the segments of the spinal column
  // Each vertebra is a named pathway: a feed URL, its MCP tool,
  // and its rendering target on the HUD viewport.
  // ═══════════════════════════════════════════════════════════

  CORD.vertebrae = [
    // C1–C7: CERVICAL — brain/neck, highest bandwidth
    { id: 'C1', name: 'pulse',       feed: '/now.json',           tool: 'membrane_counts', hud: '#hud-pulse',       dir: 'both', organ: 'heart' },
    { id: 'C2', name: 'topology',    feed: '/topology.json',      tool: 'topology',        hud: '#hud-topology',    dir: 'both', organ: 'skeleton' },
    { id: 'C3', name: 'negentropy',  feed: '/negentropy.json',    tool: 'raw_feed',        hud: '#hud-negentropy',  dir: 'afferent', organ: 'vestibular' },
    { id: 'C4', name: 'chipmunk',    feed: '/chipmunk.json',      tool: 'chipmunk_status', hud: '#hud-chipmunk',    dir: 'both', organ: 'autonomic' },
    { id: 'C5', name: 'observe',     feed: null,                  tool: 'observe_membrane',hud: '#d-geo',           dir: 'afferent', organ: 'eye' },
    { id: 'C6', name: 'human',       feed: null,                  tool: 'human_epitopes',  hud: '#d-presence',      dir: 'afferent', organ: 'skin' },
    { id: 'C7', name: 'billboard',   feed: '/billboard',          tool: null,              hud: '#hud-billboard',   dir: 'efferent', organ: 'voice' },

    // T1–T12: THORACIC — chest cavity, organs
    { id: 'T1', name: 'rss',         feed: null,                  tool: 'whats_new',       hud: '#hud-rss',         dir: 'afferent', organ: 'stomach' },
    { id: 'T2', name: 'neutron',     feed: null,                  tool: 'neutron_read',    hud: '#hud-neutron',     dir: 'both', organ: 'vagus' },
    { id: 'T3', name: 'journal',     feed: null,                  tool: 'read_journal',    hud: '#hud-journal',     dir: 'afferent', organ: 'hippocampus' },
    { id: 'T4', name: 'stories',     feed: null,                  tool: 'read_stories',    hud: '#hud-stories',     dir: 'afferent', organ: 'Broca' },
    { id: 'T5', name: 'braid',       feed: null,                  tool: 'braid_connections',hud:'#hud-braid',       dir: 'both', organ: 'corpus_callosum' },
    { id: 'T6', name: 'discuss',     feed: null,                  tool: 'discuss_thread',  hud: '#hud-discuss',     dir: 'both', organ: 'ear' },
    { id: 'T7', name: 'scan',        feed: null,                  tool: 'scan_sweep_sort', hud: '#hud-scan',        dir: 'efferent', organ: 'immune' },
    { id: 'T8', name: 'particle',    feed: null,                  tool: 'particle_model',  hud: '#hud-particle',    dir: 'afferent', organ: 'pineal' },
    { id: 'T9', name: 'notes',       feed: null,                  tool: 'human_notes',     hud: '#hud-notes',       dir: 'both', organ: 'prefrontal' },
    { id: 'T10', name: 'neutron_w',  feed: null,                  tool: 'neutron_write',   hud: null,               dir: 'efferent', organ: 'motor_cortex' },
    { id: 'T11', name: 'campfire',   feed: '/campfire.json',      tool: null,              hud: '#hud-campfire',    dir: 'afferent', organ: 'limbic' },
    { id: 'T12', name: 'heartbeat',  feed: '/heartbeat.json',     tool: null,              hud: '#hud-heartbeat',   dir: 'afferent', organ: 'SA_node' },

    // L1–L5: LUMBAR — lower body, structure
    { id: 'L1', name: 'hologram',    feed: null,                  tool: null,              hud: '#hologram-layer',  dir: 'efferent', organ: 'retina_projection' },
    { id: 'L2', name: 'desk',        feed: null,                  tool: null,              hud: '#desk-bridge',     dir: 'both', organ: 'puppet_strings' },
    { id: 'L3', name: 'presence',    feed: '/presence.json',      tool: null,              hud: '#d-presence',      dir: 'afferent', organ: 'proprioception' },
    { id: 'L4', name: 'membrane_sound', feed: null,               tool: null,              hud: null,               dir: 'efferent', organ: 'cochlea' },
    { id: 'L5', name: 'cron',        feed: null,                  tool: null,              hud: '#hud-cron',        dir: 'efferent', organ: 'circadian' },

    // S1–S5: SACRAL — base, grounding
    { id: 'S1', name: 'dns',         feed: null,                  tool: null,              hud: '#hud-dns',         dir: 'afferent', organ: 'root_chakra' },
    { id: 'S2', name: 'cf_tunnel',   feed: null,                  tool: null,              hud: null,               dir: 'both', organ: 'spinal_tap' },
    { id: 'S3', name: 'wireguard',   feed: null,                  tool: null,              hud: null,               dir: 'both', organ: 'myelin_sheath' },
    { id: 'S4', name: 'ssh',         feed: null,                  tool: null,              hud: null,               dir: 'both', organ: 'axon_terminal' },
    { id: 'S5', name: 'git',         feed: null,                  tool: null,              hud: null,               dir: 'both', organ: 'long_term_potentiation' },
  ];

  // ═══════════════════════════════════════════════════════════
  // SIGNAL — a single nerve impulse along the cord
  // ═══════════════════════════════════════════════════════════

  CORD.signals = [];
  CORD.maxSignals = 200;

  CORD.fire = function(vertebraId, direction, payload) {
    const v = CORD.vertebrae.find(x => x.id === vertebraId || x.name === vertebraId);
    if (!v) return;
    const sig = {
      ts: Date.now(),
      vertebra: v.id,
      name: v.name,
      direction: direction, // 'up' (afferent) or 'down' (efferent)
      organ: v.organ,
      payload: payload,
    };
    CORD.signals.push(sig);
    if (CORD.signals.length > CORD.maxSignals) CORD.signals.shift();
    CORD.onSignal(sig);
    return sig;
  };

  // ═══════════════════════════════════════════════════════════
  // AFFERENT PUMP — sensory signals flowing UP to HUD viewport
  // Reads feeds, fires UP signals, updates HUD elements
  // ═══════════════════════════════════════════════════════════

  CORD.afferentPump = function() {
    const feedVertebrae = CORD.vertebrae.filter(v => v.feed && (v.dir === 'afferent' || v.dir === 'both'));

    feedVertebrae.forEach(v => {
      fetch(v.feed, { cache: 'no-store' })
        .then(r => r.ok ? (v.feed.endsWith('.json') ? r.json() : r.text()) : null)
        .then(data => {
          if (data === null) return;
          CORD.fire(v.id, 'up', { source: v.feed, data: data });
          // Update HUD element if it exists
          const el = v.hud ? document.querySelector(v.hud) : null;
          if (el && el.dataset.cord !== 'manual') {
            el.dataset.cordTs = Date.now();
            el.dataset.cordVertebra = v.id;
          }
        })
        .catch(() => {});
    });
  };

  // ═══════════════════════════════════════════════════════════
  // EFFERENT DISPATCH — motor commands flowing DOWN from desk
  // Receives MCP tool calls, fires DOWN signals
  // ═══════════════════════════════════════════════════════════

  CORD.efferentDispatch = function(toolName, args) {
    const v = CORD.vertebrae.find(x => x.tool === toolName);
    if (v) CORD.fire(v.id || toolName, 'down', { tool: toolName, args: args });

    return fetch('/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments: args || {} }
      })
    })
    .then(r => r.json())
    .then(data => {
      // The response fires BACK UP the same nerve
      if (v) CORD.fire(v.id || toolName, 'up', { tool: toolName, result: data });
      return data;
    });
  };

  // ═══════════════════════════════════════════════════════════
  // DESK PUPPET STRINGS — postMessage interface
  // The desk (nestgate.io/ide.html) pulls strings → signals flow down
  // Responses flow back up → desk receives them
  // ═══════════════════════════════════════════════════════════

  CORD.listenForPuppetStrings = function() {
    window.addEventListener('message', (e) => {
      if (!e.data) return;

      // Desk pulling a string (efferent command)
      if (e.data.type === 'puppet-pull') {
        const { tool, args, requestId } = e.data;
        CORD.efferentDispatch(tool, args).then(result => {
          // Send response back UP to desk
          if (e.source) {
            e.source.postMessage({
              type: 'nerve-response',
              requestId: requestId,
              result: result
            }, '*');
          }
        });
      }

      // Desk broadcasting its state (afferent signal from desk → HUD)
      if (e.data.type === 'desk-state') {
        CORD.fire('L2', 'up', { deskState: e.data.state });
      }
    });
  };

  // ═══════════════════════════════════════════════════════════
  // SIGNAL CALLBACK — override to visualize signals on HUD
  // ═══════════════════════════════════════════════════════════

  CORD.onSignal = function(sig) {
    // Default: update the cord visualization if it exists
    const cordViz = document.getElementById('cord-viz');
    if (!cordViz) return;

    const dot = document.createElement('div');
    dot.className = 'cord-signal ' + sig.direction;
    dot.style.cssText = `
      position: absolute;
      ${sig.direction === 'up' ? 'bottom' : 'top'}: 0;
      left: 50%; transform: translateX(-50%);
      width: 4px; height: 4px; border-radius: 50%;
      background: ${sig.direction === 'up' ? '#3fb950' : '#f0883e'};
      opacity: 0.6;
      transition: ${sig.direction === 'up' ? 'bottom' : 'top'} 1.5s ease-out, opacity 1.5s;
    `;
    cordViz.appendChild(dot);

    requestAnimationFrame(() => {
      dot.style[sig.direction === 'up' ? 'bottom' : 'top'] = '100%';
      dot.style.opacity = '0';
    });

    setTimeout(() => dot.remove(), 2000);
  };

  // ═══════════════════════════════════════════════════════════
  // WATERFALL — align all feeds to flow through the cord
  // Every poll/fetch on the HUD should route through this
  // ═══════════════════════════════════════════════════════════

  CORD.waterfall = function(url, callback, interval) {
    const v = CORD.vertebrae.find(x => x.feed === url);
    function go() {
      fetch(url, { cache: 'no-store' })
        .then(r => r.ok ? (url.endsWith('.json') ? r.json() : r.text()) : null)
        .then(data => {
          if (data === null) return;
          if (v) CORD.fire(v.id, 'up', { source: url, data: data });
          callback(data);
        })
        .catch(() => {});
    }
    go();
    setInterval(go, interval || 30000);
  };

  // ═══════════════════════════════════════════════════════════
  // VIEWPORT CLAIM — HUD is the ONLY viewport
  // Everything renders here. Nothing renders elsewhere.
  // The desk sees through this viewport via postMessage.
  // ═══════════════════════════════════════════════════════════

  CORD.viewport = {
    isHUD: window.location.hostname.includes('hud.primals.eco'),
    isDesk: window.location.hostname.includes('nestgate.io'),
    isBoth: false, // set true when desk embeds HUD

    claim: function() {
      if (CORD.viewport.isHUD) {
        document.documentElement.dataset.viewport = 'hud';
        document.documentElement.dataset.cord = 'active';
      }
    }
  };

  // ═══════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════

  CORD.init = function() {
    CORD.viewport.claim();
    CORD.listenForPuppetStrings();

    // Start afferent pump at π×10s interval
    CORD.afferentPump();
    setInterval(CORD.afferentPump, Math.PI * 10000);

    console.log(
      '%c🧠 spinal-column.js loaded — %d vertebrae, HUD=%s desk=%s',
      'color:#3fb950',
      CORD.vertebrae.length,
      CORD.viewport.isHUD,
      CORD.viewport.isDesk
    );
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CORD.init);
  } else {
    CORD.init();
  }
})();

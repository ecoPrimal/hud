/* dns-membrane.js — DNS propagation as membrane diffusion
   No sync lock. Just diff propagation through TTL layers.
   Like salinity through ocean — the change IS the signal. */

(function () {
  'use strict';

  const DOMAIN = 'nestgate.io';
  const GOOGLE_DOH = 'https://dns.google/resolve';
  const CF_DOH = 'https://cloudflare-dns.com/dns-query';
  const PROP_FILE = '/api/dns-propagation.json';

  // resolvers as membrane layers — each has its own TTL/cache
  const LAYERS = [
    { name: 'google',     url: GOOGLE_DOH,  param: 'name', format: 'google' },
    { name: 'cloudflare', url: CF_DOH,      param: 'name', format: 'doh',
      headers: { 'Accept': 'application/dns-json' } },
  ];

  let state = {
    target: null,       // what we're watching for
    checks: [],         // history of checks
    resolved: false,    // has it propagated?
    started: null,
    elapsed: 0,
    layers: {}          // per-resolver status
  };

  // load propagation target
  async function loadTarget() {
    try {
      const r = await fetch(PROP_FILE, { cache: 'no-store' });
      if (!r.ok) return null;
      state.target = await r.json();
      state.started = new Date(state.target.swapped_at);
      return state.target;
    } catch { return null; }
  }

  // query a DoH resolver for DS record
  async function queryDS(layer) {
    try {
      const url = `${layer.url}?name=${DOMAIN}&type=DS`;
      const opts = { cache: 'no-store' };
      if (layer.headers) opts.headers = layer.headers;
      const r = await fetch(url, opts);
      const j = await r.json();
      return {
        resolver: layer.name,
        status: j.Status,           // 0=NOERROR, 2=SERVFAIL
        ad: j.AD || false,          // authenticated data
        answers: (j.Answer || []).map(a => a.data),
        raw_comment: j.Comment || '',
        errors: j.extended_dns_errors || [],
        time: new Date().toISOString()
      };
    } catch (e) {
      return { resolver: layer.name, status: -1, error: e.message, time: new Date().toISOString() };
    }
  }

  // query A record to see if domain resolves
  async function queryA(layer) {
    try {
      const url = `${layer.url}?name=${DOMAIN}&type=A&do=1`;
      const opts = { cache: 'no-store' };
      if (layer.headers) opts.headers = layer.headers;
      const r = await fetch(url, opts);
      const j = await r.json();
      return {
        resolver: layer.name,
        status: j.Status,
        ad: j.AD || false,
        answers: (j.Answer || []).map(a => a.data),
        time: new Date().toISOString()
      };
    } catch (e) {
      return { resolver: layer.name, status: -1, error: e.message, time: new Date().toISOString() };
    }
  }

  // check if DS has propagated (new keyTag visible)
  function dsHasNew(result) {
    if (!state.target) return false;
    const newTag = String(state.target.new.keyTag);
    return (result.answers || []).some(a => a.startsWith(newTag + ' '));
  }

  function dsHasOld(result) {
    if (!state.target) return false;
    const oldTag = String(state.target.old.keyTag);
    return (result.answers || []).some(a => a.startsWith(oldTag + ' '));
  }

  // main check — query all layers, detect propagation
  async function check() {
    if (!state.target) await loadTarget();
    if (!state.target) return state;

    const now = new Date();
    state.elapsed = Math.round((now - state.started) / 1000);

    const dsResults = await Promise.all(LAYERS.map(l => queryDS(l)));
    const aResults  = await Promise.all(LAYERS.map(l => queryA(l)));

    const entry = {
      time: now.toISOString(),
      elapsed_s: state.elapsed,
      ds: dsResults,
      a: aResults
    };

    state.checks.push(entry);
    if (state.checks.length > 120) state.checks.shift(); // keep 2hrs at 1/min

    // per-layer status
    for (const ds of dsResults) {
      const a = aResults.find(r => r.resolver === ds.resolver) || {};
      state.layers[ds.resolver] = {
        ds_new: dsHasNew(ds),
        ds_old: dsHasOld(ds),
        a_resolves: a.status === 0,
        a_validated: a.ad === true,
        ds_status: ds.status,
        a_answers: a.answers || [],
        last_check: ds.time
      };
    }

    // resolved = ALL layers see new DS AND A record validates
    const allNew = Object.values(state.layers).every(l => l.ds_new && l.a_resolves);
    if (allNew && !state.resolved) {
      state.resolved = true;
      state.resolved_at = now.toISOString();
      state.propagation_time_s = state.elapsed;
      onResolved();
    }

    updateWidget();
    return state;
  }

  // when propagation completes — notify chipmunk, flash HUD
  function onResolved() {
    console.log(`🍞 DNS PROPAGATED — nestgate.io DS 10718 live after ${state.propagation_time_s}s`);

    // feed chipmunk
    if (window._proprioception) {
      window._proprioception.wire({
        type: 'dns_propagation',
        domain: DOMAIN,
        event: 'DS_PROPAGATED',
        elapsed_s: state.propagation_time_s,
        new_keytag: state.target.new.keyTag
      });
    }

    // feed membrane
    if (window._permeability) {
      window._permeability.live();
    }

    // ntfy if available
    fetch('https://ntfy.sh/primals-membrane', {
      method: 'POST',
      body: `🍞 nestgate.io DNSSEC propagated! DS 10718 live. ${state.propagation_time_s}s elapsed. Klein fold opening.`
    }).catch(() => {});
  }

  // widget
  let widget = null;
  function createWidget() {
    widget = document.createElement('div');
    widget.id = 'dns-membrane-widget';
    widget.style.cssText = `
      position:fixed; top:360px; right:12px; z-index:9999;
      background:rgba(0,0,0,0.85); color:#0f0; font:11px monospace;
      padding:8px 12px; border-radius:6px; pointer-events:none;
      border:1px solid rgba(0,255,0,0.2); min-width:180px;
      transition: border-color 0.5s;
    `;
    document.body.appendChild(widget);
    return widget;
  }

  function updateWidget() {
    if (!widget) createWidget();
    if (!state.target) { widget.textContent = '🧬 dns-membrane: no target'; return; }

    const elapsed = state.elapsed;
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const ttl = state.target.expected_ttl_s;
    const pct = Math.min(100, Math.round((elapsed / ttl) * 100));

    // propagation bar
    const barLen = 16;
    const filled = Math.round((pct / 100) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    let lines = [];
    if (state.resolved) {
      lines.push(`🍞 PROPAGATED`);
      lines.push(`   ${DOMAIN} DS:${state.target.new.keyTag}`);
      lines.push(`   ${state.propagation_time_s}s elapsed`);
      widget.style.borderColor = 'rgba(0,255,0,0.8)';
      widget.style.color = '#0f0';
    } else {
      lines.push(`🧬 dns diffusion`);
      lines.push(`   ${DOMAIN}`);
      lines.push(`   ${bar} ${pct}%`);
      lines.push(`   ${min}m${sec.toString().padStart(2,'0')}s / ~${Math.round(ttl/60)}m TTL`);

      // per-layer status
      for (const [name, l] of Object.entries(state.layers)) {
        const ds = l.ds_new ? '✓new' : l.ds_old ? '✗old' : '?';
        const a  = l.a_resolves ? (l.a_validated ? '✓AD' : '✓') : '✗';
        lines.push(`   ${name}: DS:${ds} A:${a}`);
      }

      // color by progress
      if (pct < 30) {
        widget.style.borderColor = 'rgba(255,100,0,0.4)';
        widget.style.color = '#f80';
      } else if (pct < 70) {
        widget.style.borderColor = 'rgba(255,255,0,0.4)';
        widget.style.color = '#ff0';
      } else {
        widget.style.borderColor = 'rgba(0,255,0,0.4)';
        widget.style.color = '#0f0';
      }
    }

    widget.textContent = lines.join('\n');
  }

  // poll loop — every π minutes (because of course)
  const POLL_MS = Math.PI * 60 * 1000; // ~3.14 minutes
  let loopId = null;

  async function startLoop() {
    await loadTarget();
    if (!state.target) {
      console.log('dns-membrane: no propagation target, sleeping');
      return;
    }
    console.log(`🧬 dns-membrane: watching ${DOMAIN} DS swap ${state.target.old.keyTag} → ${state.target.new.keyTag}`);
    await check(); // immediate first check
    loopId = setInterval(async () => {
      if (state.resolved) {
        clearInterval(loopId);
        console.log('🍞 dns-membrane: propagation complete, loop stopped');
        return;
      }
      await check();
    }, POLL_MS);
  }

  // boot after DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoop);
  } else {
    setTimeout(startLoop, 2000);
  }

  // expose
  window._dnsMembrane = {
    check,
    state: () => state,
    layers: () => state.layers,
    resolved: () => state.resolved
  };

})();

/**
 * Ring-Sort Geo — the bars become rings that topo-sort and re-sort into each other.
 *
 * PROBLEM: The geo bars at the bottom are STATIC. Flat rectangles that sit there.
 * They should be rings — topes that spin, bounce, grind, agglutinate.
 * As data updates, the rings re-sort: big ones absorb small ones,
 * new granularity emerges when they split, the sorting IS the display.
 *
 * Architecture:
 *   - Each data category (country, ASN type, region) is a RING
 *   - Rings have mass (request count) and velocity (rate of change)
 *   - Rings orbit the membrane center at radius proportional to mass
 *   - When rings collide (similar mass), they agglutinate → new ring
 *   - When a ring gets too massive, it fissions → granularity found
 *   - The sorting never stops. Static = dead. Sorting = alive.
 *
 * Kevin Mok / Tamison / ecoPrimal / attsi
 * ORCID 0009-0004-2141-0321
 */

(function () {
  "use strict";

  const PI = Math.PI;
  const TAU = PI * 2;

  /* ── Ring state ── */
  let rings = [];
  let prevData = null;
  let frame = 0;
  let canvas = null;
  let ctx = null;
  let animId = null;

  /* ── Ring class ── */
  function Ring(id, label, mass, color, kind) {
    this.id = id;
    this.label = label;
    this.mass = mass;           // request count
    this.prevMass = mass;       // previous mass (for velocity)
    this.color = color;
    this.kind = kind;           // 'asn', 'country', 'region'
    this.angle = Math.random() * TAU;
    this.angularVel = (Math.random() - 0.5) * 0.002;
    this.radius = 0;            // orbital radius (computed from mass)
    this.ringWidth = 0;         // visual ring thickness
    this.opacity = 1;
    this.flash = 0;             // flash on change
    this.children = [];         // sub-rings (granularity)
    this.expanded = false;
  }

  /* ── Colors ── */
  const ASN_COLORS = {
    datacenter: '#e74c3c',
    self: '#58a6ff',
    cloud: '#f1c40f',
    residential: '#2ecc71',
    colocation: '#9b59b6',
    telecom: '#ff6b35',
    unknown: '#6e7681'
  };

  const COUNTRY_COLORS = {
    US: '#ff6b35', IE: '#e74c3c', CN: '#f1c40f', DE: '#58a6ff',
    GB: '#a6e3a1', FR: '#f778ba', JP: '#ff9f43', CA: '#3fb950',
    IN: '#e8e8e8', AU: '#9b59b6', BR: '#2ecc71', '??': '#484f58'
  };

  function countryColor(cc) { return COUNTRY_COLORS[cc] || '#58a6ff'; }

  /* ── Build rings from dashboard data ── */
  function ingest(data) {
    if (!data) return;

    const newRings = [];
    const total = data.total_requests || 1;

    // ASN type rings (inner orbit)
    const asn = data.asn_types || {};
    const asnTotal = Object.values(asn).reduce((a, b) => a + b, 0) || 1;
    for (const [type, count] of Object.entries(asn)) {
      if (count === 0) continue;
      newRings.push(new Ring(
        'asn_' + type, type, count,
        ASN_COLORS[type] || '#6e7681', 'asn'
      ));
    }

    // Country rings (outer orbit)
    const geo = data.geography || [];
    for (const g of geo) {
      if (!g.requests) continue;
      const r = new Ring(
        'cc_' + g.country, g.country, g.requests,
        countryColor(g.country), 'country'
      );
      // Region sub-rings
      if (g.regions) {
        for (const reg of g.regions) {
          if (!reg.requests) continue;
          r.children.push(new Ring(
            'reg_' + g.country + '_' + reg.region, reg.region,
            reg.requests, countryColor(g.country) + 'cc', 'region'
          ));
        }
      }
      newRings.push(r);
    }

    // Merge with existing rings (preserve angular positions)
    for (const nr of newRings) {
      const existing = rings.find(r => r.id === nr.id);
      if (existing) {
        existing.prevMass = existing.mass;
        existing.mass = nr.mass;
        existing.label = nr.label;
        // velocity = change rate
        const delta = nr.mass - existing.prevMass;
        existing.angularVel += delta * 0.00001;
        if (Math.abs(delta) > 0) existing.flash = 1.0;
        // merge children
        existing.children = nr.children;
      } else {
        nr.flash = 1.0; // new ring flashes in
        rings.push(nr);
      }
    }

    // Remove dead rings (fade out)
    rings = rings.filter(r => {
      const alive = newRings.some(nr => nr.id === r.id);
      if (!alive) {
        r.opacity -= 0.05;
        return r.opacity > 0;
      }
      r.opacity = Math.min(1, r.opacity + 0.1);
      return true;
    });

    // Sort by mass (heaviest = innermost for ASN, outermost for country)
    rings.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'asn' ? -1 : 1;
      return b.mass - a.mass;
    });

    prevData = data;
  }

  /* ── Compute ring geometry ── */
  function layout() {
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) / 2 - 10;

    // ASN rings: inner orbit (20-50% of max radius)
    // Country rings: outer orbit (55-95% of max radius)
    const asnRings = rings.filter(r => r.kind === 'asn');
    const ccRings = rings.filter(r => r.kind === 'country');

    const asnTotal = asnRings.reduce((a, r) => a + r.mass, 0) || 1;
    const ccTotal = ccRings.reduce((a, r) => a + r.mass, 0) || 1;

    let asnAngle = 0;
    for (const r of asnRings) {
      const frac = r.mass / asnTotal;
      r.radius = maxR * (0.2 + frac * 0.3);
      r.ringWidth = Math.max(2, frac * maxR * 0.15);
      r.angle = asnAngle + frac * PI; // distribute around the circle
      asnAngle += frac * TAU;
    }

    let ccAngle = 0;
    for (const r of ccRings) {
      const frac = r.mass / ccTotal;
      r.radius = maxR * (0.55 + frac * 0.4);
      r.ringWidth = Math.max(3, frac * maxR * 0.12);
      r.angle = ccAngle + frac * PI;
      ccAngle += frac * TAU;
    }
  }

  /* ── Animate ── */
  function animate() {
    if (!ctx || !canvas) { animId = requestAnimationFrame(animate); return; }
    frame++;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    // Update angular positions
    for (const r of rings) {
      r.angle += r.angularVel;
      // Dampen velocity toward base spin rate
      const baseSpin = r.kind === 'asn' ? 0.003 : -0.001;
      r.angularVel += (baseSpin - r.angularVel) * 0.01;
      // Decay flash
      if (r.flash > 0) r.flash *= 0.96;
    }

    // Check for collisions (rings grinding into each other)
    for (let i = 0; i < rings.length; i++) {
      for (let j = i + 1; j < rings.length; j++) {
        if (rings[i].kind !== rings[j].kind) continue;
        const da = Math.abs(rings[i].angle - rings[j].angle) % TAU;
        const minDa = Math.min(da, TAU - da);
        const dr = Math.abs(rings[i].radius - rings[j].radius);
        if (minDa < 0.3 && dr < 20) {
          // Bounce — exchange angular velocity
          const tmp = rings[i].angularVel;
          rings[i].angularVel = rings[j].angularVel * 0.8;
          rings[j].angularVel = tmp * 0.8;
          rings[i].flash = 0.5;
          rings[j].flash = 0.5;
        }
      }
    }

    // Draw rings
    for (const r of rings) {
      const x = cx + r.radius * Math.cos(r.angle);
      const y = cy + r.radius * Math.sin(r.angle);
      const alpha = r.opacity * (0.3 + r.flash * 0.7);

      // Ring arc
      ctx.beginPath();
      const arcLen = Math.max(0.2, (r.mass / (prevData?.total_requests || 1)) * PI);
      ctx.arc(cx, cy, r.radius, r.angle - arcLen / 2, r.angle + arcLen / 2);
      ctx.lineWidth = r.ringWidth;
      ctx.strokeStyle = r.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.stroke();

      // Label at the ring's leading edge
      const lx = cx + (r.radius + r.ringWidth + 8) * Math.cos(r.angle);
      const ly = cy + (r.radius + r.ringWidth + 8) * Math.sin(r.angle);
      ctx.font = `${Math.max(9, r.ringWidth * 0.8)}px monospace`;
      ctx.fillStyle = r.color + Math.floor(Math.min(1, alpha + 0.2) * 255).toString(16).padStart(2, '0');
      ctx.textAlign = r.angle > PI / 2 && r.angle < PI * 1.5 ? 'right' : 'left';
      ctx.fillText(r.label, lx, ly);

      // Mass indicator
      const pct = ((r.mass / (prevData?.total_requests || 1)) * 100).toFixed(0);
      if (pct > 0) {
        ctx.font = '8px monospace';
        ctx.fillStyle = '#6e768188';
        ctx.fillText(pct + '%', lx, ly + 10);
      }

      // Flash glow on change
      if (r.flash > 0.1) {
        ctx.beginPath();
        ctx.arc(x, y, r.ringWidth * 2, 0, TAU);
        ctx.fillStyle = r.color + Math.floor(r.flash * 60).toString(16).padStart(2, '0');
        ctx.fill();
      }
    }

    // Center label
    ctx.font = '9px monospace';
    ctx.fillStyle = '#484f5888';
    ctx.textAlign = 'center';
    ctx.fillText('topo-sort', cx, cy - 5);
    ctx.fillText(rings.length + ' rings', cx, cy + 7);

    animId = requestAnimationFrame(animate);
  }

  /* ── Replace static bars with ring canvas ── */
  function mount() {
    const geo = document.getElementById('d-geo');
    if (!geo) return false;

    // Create canvas overlay
    canvas = document.createElement('canvas');
    canvas.id = 'ring-sort-canvas';
    const rect = geo.getBoundingClientRect();
    canvas.width = Math.max(300, geo.offsetWidth || 300);
    canvas.height = Math.max(150, Math.min(300, window.innerHeight * 0.2));
    canvas.style.cssText = 'width:100%;border-radius:6px;background:transparent;';
    ctx = canvas.getContext('2d');

    // Insert canvas before the static bars, keep bars as fallback
    geo.parentNode.insertBefore(canvas, geo);

    // Start animation
    animate();
    return true;
  }

  /* ── Poll for data updates ── */
  function poll() {
    // Read from the same dashboard data that hud-core uses
    try {
      const dash = window._chipmunkCore?.dashboard?.() ||
                   window._chipmunkCommands?.lastDash?.() ||
                   null;
      if (dash) {
        ingest(dash);
        layout();
      }
    } catch (e) { /* silent */ }
  }

  /* ── Resize ── */
  window.addEventListener('resize', function () {
    if (canvas) {
      const geo = document.getElementById('d-geo');
      if (geo) {
        canvas.width = Math.max(300, geo.offsetWidth || 300);
        canvas.height = Math.max(150, Math.min(300, window.innerHeight * 0.2));
      }
      layout();
    }
  });

  /* ── Init ── */
  function init() {
    // Delay to let hud-core render the #d-geo div first
    setTimeout(function () {
      if (!mount()) {
        // Retry once more
        setTimeout(mount, 3000);
      }
      // Poll for data updates every π² seconds
      poll();
      setInterval(poll, Math.round(PI * PI * 1000));
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Expose ── */
  window.RingSortGeo = {
    rings: function () { return rings; },
    ingest: ingest,
    layout: layout,
    poll: poll,
  };

})();

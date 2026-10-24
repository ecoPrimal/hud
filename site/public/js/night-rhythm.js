// night-rhythm.js — close eyes, tight, expand, feel 1/π
// OH YEAH. click the moon to breathe.
(function () {
  'use strict';
  var PI = Math.PI;
  var phase = 0; // 0 closed → 1 tight → 2 expand → 3 rhythm
  var t0 = 0;
  var raf = 0;

  function el(id) { return document.getElementById(id); }

  function build() {
    if (el('night-rhythm')) return;
    var b = document.createElement('button');
    b.id = 'night-rhythm';
    b.type = 'button';
    b.title = 'close eyes · tight · expand · rhythm of the night';
    b.textContent = '☾ night';
    b.setAttribute('aria-pressed', 'false');
    b.style.cssText = 'position:fixed;left:10px;bottom:52px;z-index:6;font:11px monospace;' +
      'background:rgba(22,27,34,.92);border:1px solid rgba(188,140,255,.4);color:#bc8cff;' +
      'padding:6px 12px;border-radius:16px;cursor:pointer';
    var label = document.createElement('div');
    label.id = 'night-rhythm-label';
    label.style.cssText = 'position:fixed;left:10px;bottom:78px;z-index:6;font:10px monospace;color:#8b949e;max-width:200px';
    document.body.appendChild(label);
    document.body.appendChild(b);
    b.addEventListener('click', toggle);
  }

  function toggle() {
    var b = el('night-rhythm');
    var on = b.getAttribute('aria-pressed') === 'true';
    if (on) {
      b.setAttribute('aria-pressed', 'false');
      b.style.borderColor = 'rgba(188,140,255,.4)';
      cancelAnimationFrame(raf);
      el('night-rhythm-label').textContent = '';
      document.documentElement.style.filter = '';
      return;
    }
    b.setAttribute('aria-pressed', 'true');
    b.style.borderColor = '#bc8cff';
    t0 = performance.now();
    phase = 0;
    breathe();
  }

  function breathe() {
    var elapsed = (performance.now() - t0) / 1000;
    var label = el('night-rhythm-label');
    // 0-2s close, 2-4s tight, 4-8s expand, 8+ rhythm
    var msg, dim, scale;
    if (elapsed < 2) {
      msg = 'close eyes…';
      dim = 0.35 + elapsed * 0.1;
      scale = 1;
    } else if (elapsed < 4) {
      msg = 'bring it in tight…';
      dim = 0.55;
      scale = 1 - (elapsed - 2) * 0.15;
    } else if (elapsed < 8) {
      msg = 'expand as far as we can…';
      dim = 0.55 - (elapsed - 4) * 0.08;
      scale = 0.7 + (elapsed - 4) * 0.2;
    } else {
      var pulse = 0.5 + 0.5 * Math.sin(elapsed * PI); // ~0.318Hz-ish feel via π
      msg = 'rhythm of the night · OH YEAH';
      dim = 0.15 + pulse * 0.15;
      scale = 0.95 + pulse * 0.08;
      el('night-rhythm').style.boxShadow = pulse > 0.7 ? '0 0 12px #bc8cff' : 'none';
    }
    label.textContent = msg;
    document.documentElement.style.filter = 'brightness(' + (1 - dim * 0.45) + ')';
    document.documentElement.style.transform = 'scale(' + Math.max(0.85, Math.min(1.15, scale)) + ')';
    document.documentElement.style.transformOrigin = 'center center';
    document.documentElement.style.transition = 'filter .2s';
    raf = requestAnimationFrame(breathe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  fetch('/data/rhythm-of-the-night.json').then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d) window._nightRhythm = d; }).catch(function () {});
})();

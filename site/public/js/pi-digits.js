/* pi-digits.js — 3 sigfigs for DISPLAY, not calcs.
 *
 * π off to the digits. mantissa bounded from 1 down toward 0 (floor 1/π).
 * the center of the 3 is the focus.
 * million / 1,000,000 still available as human scale, as needed.
 * stick with π and reality.
 *
 * the 3 digits are a touchpoint: a normal computer reingests
 *   parse("537π8") → 0.537 × π^8
 * back into binary. calcs keep the raw float.
 */
(function () {
  var PI = Math.PI;
  var LNPI = Math.log(PI);

  function humansOf(h) {
    if (!h) return 0;
    if (typeof h.human_ips === 'number' && h.human_ips > 0) return h.human_ips;
    if (typeof h.human_flow === 'number' && h.human_flow > 0) return h.human_flow;
    var e = h.energy || {};
    return e.total_sessions || 0;
  }

  function siOf(x) {
    var a = Math.abs(x);
    var comma = a >= 1000
      ? Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : String(Math.round(x));
    if (a >= 1e9) return { word: 'billion', comma: comma, scaled: x / 1e9 };
    if (a >= 1e6) return { word: 'million', comma: comma, scaled: x / 1e6 };
    if (a >= 1e3) return { word: 'thousand', comma: comma, scaled: x / 1e3 };
    return { word: '', comma: comma, scaled: x };
  }

  function of(x) {
    var raw = Number(x);
    if (!isFinite(raw) || raw === 0) {
      return pack(0, '000', 0, 0, 0, 0);
    }
    var sign = raw < 0 ? -1 : 1;
    var abs = Math.abs(raw);
    var k = Math.floor(Math.log(abs) / LNPI + 1e-12) + 1;
    var m = abs / Math.pow(PI, k);
    if (m > 1 + 1e-12) { k++; m = abs / Math.pow(PI, k); }
    if (m <= 1 / PI - 1e-12) { k--; m = abs / Math.pow(PI, k); }
    if (m > 0.9995) { k++; m = abs / Math.pow(PI, k); }
    var milli = Math.round(m * 1000);
    if (milli >= 1000) { k++; milli = Math.round((abs / Math.pow(PI, k)) * 1000); }
    if (milli < 100) milli = 100;
    var digits = String(milli);
    while (digits.length < 3) digits = '0' + digits;
    var focus = parseInt(digits.charAt(1), 10);
    return pack(raw, digits, focus, k, m, sign);
  }

  function pack(raw, digits, focus, k, m, sign) {
    var si = siOf(raw);
    var token = (sign < 0 ? '-' : '') + digits + '\u03c0' + k;
    var packed = ((sign < 0 ? 1 : 0) << 24) | ((k + 128) & 0xff) << 16 | (parseInt(digits, 10) & 0x3ff);
    return {
      raw: raw,
      digits: digits,
      d0: digits.charAt(0),
      d1: digits.charAt(1),
      d2: digits.charAt(2),
      focus: focus,
      k: k,
      mant: m,
      sign: sign || 1,
      token: token,
      packed: packed,
      si: si.word,
      comma: si.comma,
      note: '3 sigfigs display. calcs keep raw. token reingests to binary.'
    };
  }

  function parse(token) {
    if (typeof token === 'number') return of(token);
    var s = String(token || '').trim();
    var m = s.match(/^(-?)(\d{3})\s*π\s*(-?\d+)$/i) || s.match(/^(-?)(\d{3})\s*pi\s*(-?\d+)$/i);
    if (!m) return null;
    var sign = m[1] === '-' ? -1 : 1;
    var milli = parseInt(m[2], 10);
    var k = parseInt(m[3], 10);
    var approx = sign * (milli / 1000) * Math.pow(PI, k);
    return { approx: approx, digits: m[2], k: k, sign: sign, token: s };
  }

  function text(p) {
    if (typeof p === 'number') p = of(p);
    if (!p) return '000π0';
    var mag = p.si ? (' · ' + p.comma + (p.si ? ' ' + p.si : '')) : (p.comma && p.comma !== p.digits ? ' · ' + p.comma : '');
    return p.d0 + '\u00b7' + p.d1 + '\u00b7' + p.d2 + ' \u03c0' + p.k + mag;
  }

  function html(p) {
    if (typeof p === 'number') p = of(p);
    if (!p) return '';
    var mag = '';
    if (p.si) mag = '<span class="pi-si">' + p.comma + ' ' + p.si + '</span>';
    else if (p.comma && p.raw >= 1000) mag = '<span class="pi-si">' + p.comma + '</span>';
    return '<span class="pi-digits" title="' + p.raw + ' raw \u00b7 ' + p.token + ' \u00b7 display only" data-token="' + p.token + '" data-packed="' + p.packed + '">' +
      '<span class="pi-d">' + p.d0 + '</span>' +
      '<span class="pi-d pi-focus">' + p.d1 + '</span>' +
      '<span class="pi-d">' + p.d2 + '</span>' +
      '<span class="pi-k">\u03c0<sup>' + p.k + '</sup></span>' +
      mag +
      '</span>';
  }

  function injectCss() {
    if (document.getElementById('pi-digits-css')) return;
    var s = document.createElement('style');
    s.id = 'pi-digits-css';
    s.textContent =
      '.pi-digits{font-family:"Courier New",monospace;letter-spacing:0.04em;white-space:nowrap}' +
      '.pi-d{display:inline-block;min-width:0.7em;text-align:center;color:#8b949e;font-size:11px}' +
      '.pi-focus{color:#3fb950;font-size:15px;font-weight:bold;text-shadow:0 0 8px rgba(63,185,80,0.45)}' +
      '.pi-k{color:#58a6ff;font-size:10px;margin-left:4px}' +
      '.pi-k sup{font-size:8px}' +
      '.pi-si{color:#8b949e;font-size:9px;margin-left:6px}' +
      '#pi-digits-hud{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:8;pointer-events:none;' +
      'background:rgba(13,17,23,0.45);border:1px solid rgba(63,185,80,0.18);border-radius:4px;' +
      'padding:2px 8px;line-height:1.2;font-size:10px}';
    document.head.appendChild(s);
  }

  function paint(el, x) {
    if (!el) return;
    el.innerHTML = html(of(x));
  }

  function liveHumans() {
    var h = (window._chipmunkCore && window._chipmunkCore.cache && window._chipmunkCore.cache.human)
      || (window._piBus && window._piBus.get && window._piBus.get('/human.json'))
      || null;
    return humansOf(h);
  }

  function updateHud() {
    var n = liveHumans();
    var el = document.getElementById('pi-digits-hud');
    if (!el) {
      el = document.createElement('div');
      el.id = 'pi-digits-hud';
      document.body.appendChild(el);
    }
    var p = of(n);
    el.innerHTML = html(p) + '<span class="pi-si">humans</span>';
    var sb = document.getElementById('sb-humans');
    if (sb) sb.innerHTML = html(p);
  }

  function init() {
    injectCss();
    updateHud();
    if (window._piBus && window._piBus.sub) {
      window._piBus.sub('/human.json', function () { updateHud(); }, 'medium');
    }
    setInterval(updateHud, 12000);
  }

  window._piDigits = {
    of: of,
    parse: parse,
    text: text,
    html: html,
    paint: paint,
    humans: humansOf,
    live: liveHumans,
    si: siOf,
    update: updateHud
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

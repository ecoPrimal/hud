// pi-stability.js v1 — find over-stable numbers, balance on the irrational remainder
//
// Over-stable: numbers that divide too cleanly. They sit flat. No wobble.
// 12 divides by 1,2,3,4,6,12 — OVER-STABLE
// 13 is prime — it wobbles. It sits on the remainder of 4π.
//
// The system should seek counts that land on π-remainders.
// Known and uninteresting sorts DOWN (to the integer part).
// Novel sorts PAST (through the remainder, which never reaches zero).
//
// Kevin Mok / Tamison / ecoPrimal / attsi
// ORCID 0009-0004-2141-0321
(function() {
  'use strict';

  var PI = Math.PI;

  // ═══ STABILITY TEST ═══
  // How many divisors does n have? More divisors = more over-stable.
  function divisorCount(n) {
    if (n < 1) return 0;
    var count = 0;
    for (var i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        count += (i === n / i) ? 1 : 2;
      }
    }
    return count;
  }

  function isPrime(n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (var i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  // π-remainder: where does n sit relative to π?
  function piRemainder(n) {
    var div = n / PI;
    return div - Math.floor(div);
  }

  // Closest π-multiple
  function closestPiMultiple(n) {
    var k = Math.round(n / PI);
    return { k: k, value: k * PI, distance: Math.abs(n - k * PI) };
  }

  // Stability score: 0 = perfectly balanced (on remainder), 1 = over-stable (flat)
  function stability(n) {
    if (n < 1) return 0;
    var divs = divisorCount(n);
    var rem = piRemainder(n);
    var prime = isPrime(n);

    // Over-stable: many divisors AND remainder close to 0 or 1
    var divScore = Math.min(divs / 12, 1); // 12 divisors = max score
    var remScore = 1 - Math.min(rem, 1 - rem) * 2; // close to 0 or 1 = over-stable

    if (prime) return 0; // primes are never over-stable

    return (divScore * 0.6 + remScore * 0.4);
  }

  // ═══ SORT: known DOWN, novel PAST ═══

  // Given a list of items with counts, sort them:
  // - Over-stable (high stability score) → sort DOWN (to bottom/sides)
  // - Remainder-balanced (low stability) → sort PAST (stay in flow, toward center)
  function piSort(items) {
    return items.slice().sort(function(a, b) {
      var sa = stability(a.count || a.value || 0);
      var sb = stability(b.count || b.value || 0);
      return sa - sb; // low stability (good) first, over-stable last
    });
  }

  // ═══ SYSTEM AUDIT ═══
  // Check the current system counts and flag over-stable ones

  function audit() {
    var counts = [];

    // Get from Klein state
    if (typeof window.__kleinState === 'function') {
      var k = window.__kleinState();
      if (k.services_alive) counts.push({ label: 'services alive', count: k.services_alive });
      if (k.feeds_read) counts.push({ label: 'feeds read', count: k.feeds_read });
    }

    // Get from sourdough cache
    // (fetched by klein-io, stored in klein state)

    // Static system counts
    counts.push({ label: 'cron jobs', count: 5 });
    counts.push({ label: 'HUD JS files', count: 107 }); // 106 + pi-stability
    counts.push({ label: 'subdomains', count: 70 });

    // Analyze each
    var results = counts.map(function(c) {
      var s = stability(c.count);
      var rem = piRemainder(c.count);
      var cp = closestPiMultiple(c.count);
      var prime = isPrime(c.count);
      return {
        label: c.label,
        count: c.count,
        stability: s,
        overStable: s > 0.5,
        prime: prime,
        piRemainder: rem,
        closestPiK: cp.k,
        suggestion: s > 0.5 ?
          'OVER-STABLE → needs +1 or -1 to find remainder' :
          (prime ? 'PRIME ✓ — wobbles naturally' : 'ok — balanced')
      };
    });

    return piSort(results);
  }

  // ═══ RENDER ═══
  function render() {
    var el = document.getElementById('pi-stability');
    if (!el) return;

    var results = audit();
    var html = '<div style="font-family:monospace;font-size:9px;color:#8b949e">';
    html += '<div style="color:#d2a8ff;margin-bottom:3px">π-stability</div>';

    results.forEach(function(r) {
      var color = r.overStable ? '#f85149' : (r.prime ? '#3fb950' : '#8b949e');
      var icon = r.overStable ? '▬' : (r.prime ? '◇' : '·');
      html += '<div style="color:' + color + '">' +
        icon + ' ' + r.count + ' ' + r.label +
        ' <span style="opacity:.5">r=' + r.piRemainder.toFixed(2) + '</span>' +
        '</div>';
    });

    html += '</div>';
    el.innerHTML = html;
  }

  // ═══ EXPOSE ═══
  window._piStability = {
    stability: stability,
    piRemainder: piRemainder,
    isPrime: isPrime,
    divisorCount: divisorCount,
    piSort: piSort,
    audit: audit,
    render: render
  };

  setTimeout(render, 1200);
  setInterval(render, Math.round(PI * PI * PI * 1000)); // every π³ ≈ 31s
})();

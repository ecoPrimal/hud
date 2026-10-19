// hud-core.js — biomeOS observation surface
// Epitope sort: SIGNAL(billboard), OBSERVE(geo), SORT(presence), REFLECT(tower)
// Shared helpers: div(), row(), chip(), poll()
(function(){
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // Shared DOM helpers — used by all 4 senses
  // ═══════════════════════════════════════════════════════════
  function div(css, parent) {
    var d = document.createElement('div');
    if (css) d.style.cssText = css;
    if (parent) parent.appendChild(d);
    return d;
  }
  function span(html, css, parent) {
    var s = document.createElement('span');
    if (css) s.style.cssText = css;
    if (html) s.innerHTML = html;
    if (parent) parent.appendChild(s);
    return s;
  }
  function poll(url, interval, render, speed) {
    function go() {
      fetch(url, {cache:'no-store'})
        .then(function(r) { return r.ok ? (url.endsWith('.json') ? r.json() : r.text()) : null; })
        .then(function(d) { if (d !== null) render(d); })
        .catch(function(){});
    }
    go();
    // Use PulseClock adaptive timing if available, fall back to fixed
    if (window.PulseClock && speed) {
      window.PulseClock.adaptive(go, speed);
    } else {
      setInterval(go, interval);
    }
  }
  function pct(n, total) { return total > 0 ? Math.round(n / total * 100) : 0; }

  // ═══════════════════════════════════════════════════════════
  // SIGNAL sense: billboard (live narrative)
  // ═══════════════════════════════════════════════════════════
  (function() {
    var el = document.getElementById('hud-billboard');
    var msg = document.getElementById('hud-billboard-msg');
    if (!el || !msg) return;
    poll('/billboard', 15000, function(t) {
      t = t.trim();
      if (t && t.length > 0) { el.style.display = ''; msg.textContent = t; }
      else { el.style.display = 'none'; }
    });
  })();

  // ═══════════════════════════════════════════════════════════
  // Color maps — shared across senses
  // ═══════════════════════════════════════════════════════════
  var EP_COLORS = {
    INVESTIGATION:'#f1c40f', IMMUNE:'#ff6b35', TOPOLOGY:'#9b59b6',
    PHILOSOPHY:'#3fb950', SCIENCE:'#e8e8e8', SIGNAL:'#4a8fb8',
    METHOD:'#58a6ff', MEMBRANE:'#a6e3a1', OTHER:'#6e7681'
  };
  var ORGAN_COLORS = {
    skunkBat:'#e85d75', petalTongue:'#f778ba', squirrel:'#a6e3a1',
    bearDog:'#ff6b35', songBird:'#4a8fb8', nestGate:'#9b59b6',
    loamSpine:'#f1c40f', rhizoCrypt:'#58a6ff', swarmVine:'#3fb950',
    sweetGrass:'#e8e8e8', barraCuda:'#ff9f43'
  };
  function countryColor(c) {
    return c === 'US' ? '#ff6b35' : c === 'IE/US' || c === 'IE' ? '#e74c3c' : c === 'CN' ? '#f1c40f' : '#58a6ff';
  }

  // ═══════════════════════════════════════════════════════════
  // OBSERVE sense: geographic subdivision
  // ═══════════════════════════════════════════════════════════
  function renderGeo(d) {
    var gel = document.getElementById('d-geo');
    if (!gel) return;
    gel.innerHTML = '';
    var geo = d.geography || [], total = d.total_requests || 0;
    var subnets = d.subnets || [], asnTypes = d.asn_types || {};
    if (!geo.length) { gel.innerHTML = '<span style="color:#6e7681;font-size:0.85em">Collecting...</span>'; return; }

    // ASN type bar
    if (asnTypes && Object.keys(asnTypes).length) {
      var bar = div('display:flex;gap:6px;margin-bottom:1em;flex-wrap:wrap;', gel);
      var asnTotal = Object.values(asnTypes).reduce(function(a, b) { return a + b; }, 0);
      Object.keys(asnTypes).sort(function(a, b) { return asnTypes[b] - asnTypes[a]; }).forEach(function(t) {
        var p = pct(asnTypes[t], asnTotal);
        var c = t === 'datacenter' ? '#e74c3c' : t === 'cloud' ? '#f1c40f' : t === 'residential' ? '#2ecc71' : t === 'self' ? '#58a6ff' : '#8b949e';
        span(t + ': ' + p + '%', 'font-size:0.72em;background:' + c + '18;color:' + c + ';padding:2px 8px;border-radius:4px;border:1px solid ' + c + '33', bar);
      });
    }

    // Subnet index
    var subByCountry = {};
    subnets.forEach(function(s) { var c = s.country || '??'; if (!subByCountry[c]) subByCountry[c] = []; subByCountry[c].push(s); });

    geo.forEach(function(g) {
      var cc = countryColor(g.country);
      var p = pct(g.requests, total);
      var row = div('margin-bottom:0.7em;', gel);

      var hdr = div('display:flex;align-items:center;gap:8px;cursor:pointer;', row);
      hdr.innerHTML =
        '<span style="font-size:0.85em;font-weight:600;color:#c9d1d9;min-width:50px">' + g.country + '</span>' +
        '<div style="background:#30363d;height:14px;flex:1;border-radius:3px;overflow:hidden;position:relative">' +
          '<div style="background:' + cc + ';height:100%;width:' + p + '%;min-width:2px;transition:width 0.5s"></div>' +
          '<span style="position:absolute;right:5px;top:0;font-size:0.65em;color:#8b949e;line-height:14px">' + g.requests.toLocaleString() + ' · ' + p + '%</span>' +
        '</div>' +
        '<span style="font-size:0.65em;color:#6e7681;cursor:pointer" class="geo-toggle">▶</span>';

      var detail = div('display:none;margin-left:58px;margin-top:3px;', row);

      (g.regions || []).forEach(function(r) {
        var rpct = pct(r.requests, g.requests);
        var rRow = div('margin-bottom:5px;', detail);
        var rHdr = div('display:flex;align-items:center;gap:5px;cursor:pointer;', rRow);
        rHdr.innerHTML =
          '<span style="font-size:0.78em;color:#c9d1d9;min-width:90px">' + r.region + '</span>' +
          '<div style="background:#21262d;height:8px;flex:1;border-radius:2px;overflow:hidden">' +
            '<div style="background:' + cc + '99;height:100%;width:' + rpct + '%"></div></div>' +
          '<span style="font-size:0.62em;color:#6e7681;min-width:55px;text-align:right">' + r.requests.toLocaleString() + '</span>' +
          '<span style="font-size:0.6em;color:#484f58;cursor:pointer" class="reg-toggle">▶</span>';

        var cityDet = div('display:none;margin-left:95px;margin-top:2px;', rRow);
        (r.cities || []).forEach(function(c) {
          div('display:flex;align-items:center;gap:5px;margin:1px 0;font-size:0.72em;', cityDet).innerHTML =
            '<span style="color:#58a6ff;min-width:85px">' + c.city + '</span><span style="color:#8b949e">' + c.requests.toLocaleString() + '</span>';
        });
        rHdr.onclick = function(e) {
          e.stopPropagation();
          var open = cityDet.style.display !== 'none';
          cityDet.style.display = open ? 'none' : 'block';
          rHdr.querySelector('.reg-toggle').textContent = open ? '▶' : '▼';
        };
      });

      // Country subnets
      var cs = subByCountry[g.country] || [];
      if (cs.length) {
        var subH = div('font-size:0.68em;color:#6e7681;margin-top:6px;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #21262d;padding-top:5px;', detail);
        subH.textContent = 'Network blocks (' + cs.length + ')';
        cs.sort(function(a, b) { return b.requests - a.requests; }).slice(0, 10).forEach(function(s) {
          var cityL = s.city ? (' · ' + s.city) : '';
          var asnL = s.asn_type ? (' · <span style="color:#484f58">' + s.asn_type + '</span>') : '';
          div('display:flex;align-items:center;gap:5px;margin:1px 0;font-size:0.72em;', detail).innerHTML =
            '<code style="color:#58a6ff;min-width:95px">' + s.subnet + '</code>' +
            '<span style="color:#8b949e;flex:1">' + s.org + cityL + asnL + '</span>' +
            '<span style="color:#6e7681;min-width:55px;text-align:right">' + s.requests.toLocaleString() + '</span>';
        });
      }

      div('font-size:0.58em;color:#484f58;margin-top:6px;font-style:italic;', detail).textContent =
        'country → region → city → ASN → fiber';

      hdr.onclick = function() {
        var open = detail.style.display !== 'none';
        detail.style.display = open ? 'none' : 'block';
        hdr.querySelector('.geo-toggle').textContent = open ? '▶' : '▼';
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // SORT sense: human presence (IS/WAS/NEARBY + epitope tense)
  // ═══════════════════════════════════════════════════════════
  function renderPresence(p) {
    var el = document.getElementById('d-presence');
    if (!el) return;
    el.innerHTML = '';

    // Tense counts
    var counts = div('display:flex;gap:16px;margin-bottom:10px;align-items:baseline;', el);
    var isC = p.is.count > 0 ? '#3fb950' : '#6e7681';
    counts.innerHTML =
      '<span style="font-size:1.6em;font-weight:700;color:' + isC + '">' + p.is.count + '</span>' +
      '<span style="font-size:0.75em;color:#8b949e">IS</span>' +
      '<span style="font-size:1.1em;font-weight:600;color:#58a6ff">' + p.nearby.count + '</span>' +
      '<span style="font-size:0.75em;color:#8b949e">NEARBY</span>' +
      '<span style="font-size:0.9em;color:#6e7681">' + p.was.count + '</span>' +
      '<span style="font-size:0.75em;color:#6e7681">WAS</span>';

    // Epitope gravity bar
    var eg = p.epitope_gravity;
    if (eg && Object.keys(eg).length) {
      var bar = div('display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:8px;', el);
      var total = 0;
      Object.values(eg).forEach(function(v) { total += v.count; });
      Object.keys(eg).forEach(function(ep) {
        var seg = div('height:100%;background:' + (EP_COLORS[ep] || '#6e7681') + ';width:' + pct(eg[ep].count, total) + '%;', bar);
        seg.title = ep + ': ' + eg[ep].count + ' (' + pct(eg[ep].count, total) + '%)';
      });

      var labels = div('display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;', el);
      Object.keys(eg).forEach(function(ep) {
        span('●' + ep + ' ' + eg[ep].count, 'font-size:0.68em;color:' + (EP_COLORS[ep] || '#6e7681'), labels);
      });
    }

    // IS pages — live reading feed
    if (p.is_pages && p.is_pages.length) {
      var pages = div('margin-top:6px;', el);
      p.is_pages.slice(0, 5).forEach(function(pg) {
        var c = EP_COLORS[pg.epitope] || '#6e7681';
        var ago = pg.ago_s < 60 ? pg.ago_s + 's' : Math.round(pg.ago_s / 60) + 'm';
        div('display:flex;gap:6px;align-items:center;font-size:0.72em;margin:2px 0;', pages).innerHTML =
          '<span style="color:' + c + ';width:6px;height:6px;border-radius:50%;background:' + c + ';display:inline-block"></span>' +
          '<span style="color:#c9d1d9;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + pg.host + pg.path + '</span>' +
          '<span style="color:#6e7681">' + ago + ' ago</span>';
      });
    }

    // Epitope tense — per-epitope IS/NEARBY/WAS
    var et = p.epitope_tense;
    if (et && Object.keys(et).length) {
      var etDiv = div('margin-top:10px;border-top:1px solid #21262d;padding-top:8px;', el);
      div('font-size:0.7em;color:#8b949e;margin-bottom:6px;', etDiv).textContent = 'epitope tense';

      Object.entries(et).sort(function(a, b) { return b[1].nearby.humans - a[1].nearby.humans; }).forEach(function(pair) {
        var ep = pair[0], t = pair[1];
        var c = EP_COLORS[ep] || '#6e7681';
        var isAlive = t.is.humans > 0;
        var r = div('display:flex;align-items:center;gap:6px;margin:3px 0;font-size:0.7em;', etDiv);

        // Dot + name + tense
        var tense =
          '<span style="color:' + (isAlive ? '#3fb950' : '#6e7681') + '">' + t.is.humans + '</span>' +
          '<span style="color:#484f58;margin:0 2px">/</span>' +
          '<span style="color:#58a6ff">' + t.nearby.humans + '</span>' +
          '<span style="color:#484f58;margin:0 2px">/</span>' +
          '<span style="color:#6e7681">' + t.was.humans + '</span>';

        // Passage arrows (top 3)
        var arrows = '';
        var pass = Object.entries(t.passages_to || {}).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 3);
        if (pass.length) {
          arrows = '<span style="color:#484f58;margin-left:4px">→ </span>' +
            pass.map(function(pp) {
              return '<span style="color:' + (EP_COLORS[pp[0]] || '#6e7681') + '">' + pp[0] + '</span><span style="color:#484f58">(' + pp[1] + ')</span>';
            }).join(' ');
        }

        r.innerHTML =
          '<span style="width:6px;height:6px;border-radius:50%;background:' + (isAlive ? c : '#21262d') + ';display:inline-block"></span>' +
          '<span style="color:' + c + ';width:90px;display:inline-block">' + ep + '</span>' +
          tense + arrows;
      });
    }

    // Passages
    if (p.passages && p.passages.length) {
      var passDiv = div('margin-top:8px;border-top:1px solid #21262d;padding-top:6px;', el);
      div('font-size:0.7em;color:#8b949e;margin-bottom:4px;', passDiv).textContent = 'passages';
      p.passages.slice(0, 6).forEach(function(pg) {
        var fc = EP_COLORS[pg.from] || '#6e7681', tc = EP_COLORS[pg.to] || '#6e7681';
        div('font-size:0.68em;margin:2px 0;display:flex;gap:4px;align-items:center;', passDiv).innerHTML =
          '<span style="color:' + fc + '">' + pg.from + '</span>' +
          '<span style="color:#484f58">→</span>' +
          '<span style="color:' + tc + '">' + pg.to + '</span>' +
          '<span style="color:#484f58;margin-left:auto">' + pg.humans + ' humans</span>';
      });
    }

    // Returners with epitope shift
    if (p.returners && p.returners.total_shifters > 0) {
      var ret = div('margin-top:8px;font-size:0.7em;color:#8b949e;border-top:1px solid #21262d;padding-top:6px;', el);
      ret.innerHTML = '↩ ' + p.returners.total_shifters + ' humans returned with a different epitope';
      if (p.returners.recent && p.returners.recent.length) {
        p.returners.recent.slice(0, 3).forEach(function(r) {
          ret.innerHTML += '<div style="margin:2px 0"><span style="color:' + (EP_COLORS[r.brought] || '#6e7681') + '">' + r.brought +
            '</span> → <span style="color:' + (EP_COLORS[r.left_with] || '#6e7681') + '">' + r.left_with +
            '</span> (' + r.journey + ' shifts, ' + r.visits + ' visits)</div>';
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // REFLECT sense: membrane tower health
  // ═══════════════════════════════════════════════════════════
  function renderTower(t) {
    var el = document.getElementById('d-tower');
    if (!el) return;
    el.innerHTML = '';

    var aliveC = t.alive === t.total ? '#3fb950' : t.alive < t.total * 0.7 ? '#e85d75' : '#f1c40f';
    var hdr = div('display:flex;gap:12px;align-items:baseline;margin-bottom:8px;', el);
    hdr.innerHTML =
      '<span style="font-size:1.4em;font-weight:700;color:' + aliveC + '">' + t.alive + '/' + t.total + '</span>' +
      '<span style="font-size:0.75em;color:#8b949e">organs alive</span>' +
      '<span style="font-size:0.85em;color:#6e7681">ratio ' + t.ratio.toFixed(2) + '</span>';

    var grid = div('display:flex;flex-wrap:wrap;gap:6px;', el);
    Object.keys(t.organs).sort().forEach(function(name) {
      var org = t.organs[name];
      var c = ORGAN_COLORS[name] || '#6e7681';
      var chip = div('border:1px solid #21262d;border-radius:4px;padding:3px 8px;font-size:0.78em;display:flex;align-items:center;gap:4px;', grid);
      var ver = org.version && org.version !== 'unknown' ? ' <span style="color:#484f58;font-size:0.85em">v' + org.version + '</span>' : '';
      var up = '';
      if (org.uptime_s && org.uptime_s > 0) {
        var h = Math.floor(org.uptime_s / 3600), d = Math.floor(h / 24);
        up = ' <span style="color:#484f58;font-size:0.8em">' + (d > 0 ? d + 'd ' : '') + h % 24 + 'h</span>';
      }
      chip.innerHTML =
        '<span style="color:' + (org.alive ? c : '#484f58') + '">' + (org.alive ? '●' : '○') + '</span>' +
        '<span style="color:#c9d1d9">' + name + '</span>' + ver + up;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Poll all 4 senses at their natural frequencies
  // ═══════════════════════════════════════════════════════════
  poll('/dashboard.json', 8000, function(d) {
    var dash = document.getElementById('hud-dash');
    if (dash) dash.style.display = '';
    renderGeo(d);
  }, 'fast');
  poll('/presence.json', 10000, renderPresence, 'fast');
  poll('/tower.json', 15000, renderTower, 'normal');

  // ═══ CAMPFIRE BEACONS — flash/bump/poke from the membrane ═══
  poll('/campfire-flash.json', 30000, function(c) {
    if (!c || !c.beacons) return;
    var el = document.getElementById('hud-beacon');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hud-beacon';
      el.style.cssText = 'position:fixed;bottom:12px;right:12px;max-width:320px;z-index:9999;font:12px/1.4 monospace;pointer-events:none;';
      document.body.appendChild(el);
    }
    var beacons = c.beacons.filter(function(b) {
      if (!b || !b.message) return false;
      if (b.ttl_minutes) {
        var age = (Date.now() - new Date(b.timestamp).getTime()) / 60000;
        if (age > b.ttl_minutes) return false;
      }
      return true;
    }).slice(0, 3);
    if (beacons.length === 0) { el.innerHTML = ''; return; }
    el.innerHTML = beacons.map(function(b) {
      return '<div style="background:rgba(88,166,255,0.12);border:1px solid rgba(88,166,255,0.3);border-radius:6px;padding:8px 12px;margin-bottom:6px;color:#c9d1d9;backdrop-filter:blur(8px);">' +
        '<div style="color:#58a6ff;font-size:10px;margin-bottom:2px;">⚡ beacon · wave ' + (b.wave||'?') + '</div>' +
        '<div>' + b.message + '</div>' +
        (b.detail ? '<div style="color:#8b949e;font-size:11px;margin-top:4px;">' + b.detail + '</div>' : '') +
        '</div>';
    }).join('');
  }, 'normal');
})();

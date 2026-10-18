// desk-neutron.js — neutron flow desk tab
// Wave 179: how information travels. The messaging axis.
(function(){
'use strict';
var D = window.Desk;

function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function stat(val, label) {
  return '<div style="text-align:center"><span style="font-size:24px;font-weight:600;color:#58a6ff;display:block">' + val + '</span><span style="font-size:10px;color:#8b949e;text-transform:uppercase">' + label + '</span></div>';
}

function buildView(n) {
  var html = '<div style="padding:12px">';

  // Stats bar
  html += '<div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(88,166,255,0.12)">';
  html += stat(n.surfaces_observed, 'surfaces');
  html += stat(n.total_crossings, 'crossings');
  html += stat((n.mirrors || []).length, 'mirrors');
  html += stat((n.stuck || []).length, 'stuck');
  html += stat((n.radiating || []).length, 'radiating');
  html += '</div>';

  // Mirrors
  html += '<h4 style="color:#58a6ff;font-size:12px;margin:12px 0 6px">◈ mirrors — surface → surface</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:4px">';
  (n.mirrors || []).forEach(function(m) {
    html += '<div style="padding:6px 8px;background:rgba(88,166,255,0.05);border-left:2px solid rgba(88,166,255,0.15);font-size:11px">';
    html += '<span style="color:#8b949e">' + esc(m.from_surface) + '</span>';
    html += ' <span style="color:#58a6ff">→</span> ';
    html += '<b>' + esc(m.to_surface) + '</b>';
    html += '<span style="float:right;color:#58a6ff;font-weight:600">' + m.crossings + '</span></div>';
  });
  if (!(n.mirrors || []).length) html += '<div style="color:#8b949e;font-size:11px;padding:6px">no flows yet</div>';
  html += '</div>';

  // Stuck
  if ((n.stuck || []).length > 0) {
    html += '<h4 style="color:#f85149;font-size:12px;margin:12px 0 6px">◈ stuck — no outgoing flow</h4>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:3px">';
    (n.stuck || []).forEach(function(s) {
      html += '<span style="padding:2px 7px;background:rgba(248,81,73,0.08);border:1px solid rgba(248,81,73,0.15);border-radius:8px;font-size:10px;color:#f85149">' + esc(s) + '</span>';
    });
    html += '</div>';
  }

  // Top touches
  html += '<h4 style="color:#58a6ff;font-size:12px;margin:12px 0 6px">◈ top touches</h4>';
  html += '<table style="width:100%;font-size:11px;border-collapse:collapse">';
  html += '<tr style="color:#8b949e"><th style="text-align:left;padding:3px">surface</th><th style="text-align:left;padding:3px">from</th><th style="text-align:right;padding:3px">count</th></tr>';
  (n.touches || []).slice(0, 12).forEach(function(t) {
    html += '<tr style="border-top:1px solid rgba(88,166,255,0.04)">';
    html += '<td style="padding:3px;font-weight:500">' + esc(t.surface) + '</td>';
    html += '<td style="padding:3px;color:#8b949e">' + esc(t.referrer) + '</td>';
    html += '<td style="padding:3px;text-align:right;color:#58a6ff;font-weight:600">' + t.touches + '</td></tr>';
  });
  html += '</table>';

  // Flow matrix
  if (n.flows && Object.keys(n.flows).length > 0) {
    html += '<h4 style="color:#58a6ff;font-size:12px;margin:12px 0 6px">◈ flow matrix</h4>';
    html += '<div style="font-size:10px;font-family:monospace">';
    for (var from in n.flows) {
      for (var to in n.flows[from]) {
        var count = n.flows[from][to];
        var bar = Array(Math.min(Math.ceil(count), 15) + 1).join('█');
        html += '<div style="padding:1px 0">' + esc(from) + ' <span style="color:#58a6ff">→</span> ' + esc(to) + ' <span style="color:rgba(88,166,255,0.3)">' + bar + '</span> <span style="color:#58a6ff">' + count + '</span></div>';
      }
    }
    html += '</div>';
  }

  html += '<div style="font-size:10px;color:#8b949e;margin-top:12px;text-align:center">wave ' + (n.wave || '?') + ' · ' + (n.generated || '') + '</div>';
  html += '</div>';
  return html;
}

D.renderNeutron = function() {
  var id = 'desk-neutron-async';
  setTimeout(function(){
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<div style="text-align:center;color:#58a6ff;padding:24px">loading neutron…</div>';
    fetch('/neutron.json')
      .then(function(r) { return r.json(); })
      .then(function(n) {
        var el2 = document.getElementById(id);
        if (el2) el2.innerHTML = buildView(n);
      })
      .catch(function(e) {
        var el2 = document.getElementById(id);
        if (el2) el2.innerHTML = '<div style="color:#f85149;padding:16px">neutron offline: ' + e.message + '</div>';
      });
  }, 50);
  return '<div id="' + id + '">loading…</div>';
};

})();

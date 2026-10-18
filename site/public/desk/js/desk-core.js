// desk-core.js — shared data, classification, and utilities
// Part of desk module split. All functions on window.Desk namespace.
(function(){
'use strict';
var D = window.Desk = window.Desk || {};

D.BRAID_KEY_PREFIX = 'eco_braid_';
D.MARKS_KEY = 'eco_marks';

D.EP_COLORS = {
  PHYSICS:'#e85d3a', TOPOLOGY:'#9b59b6', PHILOSOPHY:'#3fb950',
  METHOD:'#58a6ff', INVESTIGATION:'#f1c40f', IMMUNE:'#ff6b35',
  SCIENCE:'#e8e8e8', SIGNAL:'#4a8fb8',
};

D.EPITOPE_MAP = {
  'anderson':'PHYSICS','localization':'PHYSICS','permeability':'PHYSICS',
  'lattice':'PHYSICS','qcd':'PHYSICS','hofstadter':'PHYSICS','quantum':'PHYSICS',
  'spectral':'PHYSICS','negentropy':'PHYSICS',
  'graph':'TOPOLOGY','topology':'TOPOLOGY','network':'TOPOLOGY','mesh':'TOPOLOGY',
  'braid':'TOPOLOGY','fractal':'TOPOLOGY',
  'philosophy':'PHILOSOPHY','omelas':'PHILOSOPHY','atlas':'PHILOSOPHY',
  'sovereignty':'PHILOSOPHY','commons':'PHILOSOPHY','bibliography':'PHILOSOPHY',
  'methodology':'METHOD','constrained':'METHOD','evolution':'METHOD',
  'guidestone':'METHOD','tufte':'METHOD','schell':'METHOD','ludo':'METHOD',
  'detroit':'INVESTIGATION','tuebor':'INVESTIGATION','public-record':'INVESTIGATION',
  'charter':'INVESTIGATION','institutional':'INVESTIGATION','gorilla':'INVESTIGATION',
  'membrane':'IMMUNE','immune':'IMMUNE','skunkbat':'IMMUNE','scatter':'IMMUNE',
  'antidote':'IMMUNE','non-newtonian':'IMMUNE',
  'science':'SCIENCE','biology':'SCIENCE','genomics':'SCIENCE','ferment':'SCIENCE',
  'signal':'SIGNAL','lossy':'SIGNAL','shannon':'SIGNAL','channel':'SIGNAL',
  'story':'SIGNAL','billboard':'SIGNAL','beacon':'SIGNAL','transit':'SIGNAL',
};

D.classify = function(url) { return D.classifyText(url); };

D.classifyText = function(text) {
  var l = text.toLowerCase(), found = {}, best = 'SIGNAL', bestN = 0;
  for (var kw in D.EPITOPE_MAP) {
    if (l.indexOf(kw) !== -1) found[D.EPITOPE_MAP[kw]] = (found[D.EPITOPE_MAP[kw]]||0) + 1;
  }
  for (var ep in found) { if (found[ep] > bestN) { best = ep; bestN = found[ep]; } }
  return best;
};

D.computeShape = function() {
  var EP_KEYS = Object.keys(D.EP_COLORS);
  var counts = {};
  EP_KEYS.forEach(function(k) { counts[k] = 0; });

  D.getAllVisits().forEach(function(v) {
    var ep = v.epitope || D.classify(v.url);
    counts[ep] = (counts[ep] || 0) + 1;
  });

  var marks = D.getMarks();
  for (var url in marks) {
    var ep = marks[url].epitope || D.classify(url);
    counts[ep] = (counts[ep] || 0) + 3;
  }

  var braids = D.findAllBraids();
  braids.forEach(function(b) {
    if (!b.braid.songs) return;
    for (var sUrl in b.braid.songs) {
      var song = b.braid.songs[sUrl];
      var ep;
      if (typeof song === 'object' && song.epitope) {
        ep = song.epitope;
      } else {
        var text = (typeof song === 'string') ? song : (song.text || '');
        ep = D.classifyText(text + ' ' + sUrl);
      }
      counts[ep] = (counts[ep] || 0) + 5;
    }
  });

  braids.forEach(function(b) {
    if (!b.braid.marks) return;
    b.braid.marks.forEach(function(m) {
      var ep = m.epitope || D.classify(m.url);
      counts[ep] = (counts[ep] || 0) + 3;
    });
  });

  var total = 0;
  EP_KEYS.forEach(function(k) { total += counts[k]; });
  var shape = {};
  EP_KEYS.forEach(function(k) { shape[k] = total > 0 ? counts[k] / total : 0; });
  shape._total = total;
  shape._counts = counts;
  return shape;
};

D.epPill = function(ep) {
  var c = D.EP_COLORS[ep] || '#8b949e';
  return '<span class="ep-pill" style="color:'+c+';border-color:'+c+'44">'+ep+'</span>';
};

D.findAllBraids = function() {
  var braids = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(D.BRAID_KEY_PREFIX) === 0) {
        var raw = localStorage.getItem(key);
        if (raw) {
          var b = JSON.parse(raw);
          if (b && b.visits) braids.push({ key: key, braid: b });
        }
      }
    }
  } catch(e) {}
  return braids;
};

D.getMarks = function() {
  try { return JSON.parse(localStorage.getItem(D.MARKS_KEY) || '{}'); } catch(e) { return {}; }
};

D.getAllVisits = function() {
  var visits = [];
  D.findAllBraids().forEach(function(b) {
    b.braid.visits.forEach(function(v) { visits.push(v); });
  });
  return visits;
};

D.getAllSongs = function() {
  var songs = {};
  D.findAllBraids().forEach(function(b) {
    if (b.braid.songs) {
      for (var url in b.braid.songs) {
        songs[url] = { text: b.braid.songs[url], title: b.braid.visits
          ? (b.braid.visits.find(function(v){return v.url === url;}) || {}).title || url
          : url
        };
      }
    }
  });
  return songs;
};

D.timeAgo = function(iso) {
  var d = new Date(iso), now = new Date();
  var s = Math.floor((now - d) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
};

D.computeEntropy = function(visits) {
  var counts = {}, total = visits.length;
  visits.forEach(function(v) { counts[v.epitope] = (counts[v.epitope]||0)+1; });
  var H = 0;
  for (var ep in counts) {
    var p = counts[ep] / total;
    if (p > 0) H -= p * Math.log2(p);
  }
  return H;
};

D.groupByEpitope = function(items, epKey) {
  var groups = {};
  items.forEach(function(item) {
    var ep = item[epKey || 'epitope'] || 'SIGNAL';
    if (!groups[ep]) groups[ep] = [];
    groups[ep].push(item);
  });
  return groups;
};

D.hexToRgba = function(hex, alpha) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
};

D.downloadFile = function(name, content, type) {
  var blob = new Blob([content], { type: type || 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
};

})();
// desk-study.js — study tab renderer
(function(){
var D = window.Desk;

D.renderStudy = function() {
  var marks = D.getMarks();
  var entries = [];
  for (var url in marks) {
    entries.push({ url: url, title: marks[url].title || url, epitope: marks[url].epitope || D.classify(url), time: marks[url].time });
  }

  if (entries.length === 0) {
    return '<div class="empty-state">' +
      '<h3>nothing marked yet</h3>' +
      '<p>As you explore the membrane, use <strong>\u2605 mark</strong> on pages that catch your eye. They\'ll appear here as your reading list.</p>' +
      '<p><a href="https://sporeprint.primals.eco">start exploring \u2192</a></p>' +
    '</div>';
  }

  var groups = D.groupByEpitope(entries);
  var html = '<div class="stats-bar">' +
    '<div class="stat-item"><div class="stat-val">' + entries.length + '</div><div class="stat-label">marked</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + Object.keys(groups).length + '</div><div class="stat-label">epitopes</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + D.computeEntropy(entries).toFixed(2) + '</div><div class="stat-label">H (entropy)</div></div>' +
  '</div>';

  var epOrder = ['PHYSICS','TOPOLOGY','PHILOSOPHY','METHOD','INVESTIGATION','IMMUNE','SCIENCE','SIGNAL'];
  epOrder.forEach(function(ep) {
    if (!groups[ep]) return;
    var c = D.EP_COLORS[ep];
    html += '<div class="study-group">' +
      '<div class="study-group-label" style="color:'+c+'">' + ep + ' (' + groups[ep].length + ')</div>';
    groups[ep].sort(function(a,b) { return (b.time||'') > (a.time||'') ? 1 : -1; });
    groups[ep].forEach(function(e) {
      html += '<div class="study-item">' +
        '<a href="' + e.url + '" target="_blank">' + e.title + '</a>' +
        '<span class="study-time">' + (e.time ? D.timeAgo(e.time) : '') + '</span>' +
      '</div>';
    });
    html += '</div>';
  });

  return html;
};

})();

// desk-write.js — write tab renderer + escHtml + pad utilities
(function(){
var D = window.Desk;

D.escHtml = function(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};

D.pad = function(s, n) {
  while (s.length < n) s += ' ';
  return s;
};

D.renderWrite = function() {
  var songs = D.getAllSongs();
  var urls = Object.keys(songs);

  if (urls.length === 0) {
    return '<div class="empty-state">' +
      '<h3>no notes yet</h3>' +
      '<p>Use <strong>\u266a sing</strong> on any page to leave a note. Your notes live in your braid \u2014 never sent to a server.</p>' +
      '<p>Your songs will appear here as a notebook.</p>' +
    '</div>';
  }

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
    '<span style="color:var(--fg-dim);font-size:12px">' + urls.length + ' pages with notes</span>' +
    '<button class="export-btn" id="export-md">export as markdown</button>' +
  '</div>';

  urls.forEach(function(url) {
    var s = songs[url];
    var ep = D.classify(url);
    html += '<div class="write-entry">' +
      '<div class="write-page">' +
        D.epPill(ep) +
        ' <a href="' + url + '" target="_blank">' + s.title + '</a>' +
      '</div>' +
      '<div class="write-note">' + D.escHtml(s.text) + '</div>' +
    '</div>';
  });

  return html;
};

D.exportMarkdown = function() {
  var songs = D.getAllSongs();
  var md = '# Desk Notes \u2014 primals.eco\n\n';
  md += '_Exported ' + new Date().toISOString().slice(0,10) + '_\n\n';
  for (var url in songs) {
    var s = songs[url];
    var ep = D.classify(url);
    md += '## ' + s.title + '\n\n';
    md += '**Epitope:** ' + ep + '  \n';
    md += '**URL:** ' + url + '\n\n';
    md += s.text + '\n\n---\n\n';
  }
  D.downloadFile('desk-notes.md', md, 'text/markdown');
};

})();

// desk-draw.js — draw tab renderer (epitope connection map)
(function(){
var D = window.Desk;

D.renderDraw = function() {
  var visits = D.getAllVisits();
  if (visits.length < 2) {
    return '<div class="empty-state">' +
      '<h3>not enough trail yet</h3>' +
      '<p>Explore more pages across the membrane. As your trail grows, the draw canvas maps the connections between the epitopes you\'ve touched.</p>' +
    '</div>';
  }

  var counts = {};
  visits.forEach(function(v) { counts[v.epitope] = (counts[v.epitope]||0)+1; });
  var eps = Object.keys(counts).sort(function(a,b) { return counts[b] - counts[a]; });
  var total = visits.length;

  var html = '<div class="card"><div class="card-header">your epitope map</div><div class="card-body">';
  html += '<div class="draw-canvas" id="draw-area">';

  var cx = 400, cy = 200, r = 150;
  eps.forEach(function(ep, i) {
    var angle = (2 * Math.PI * i / eps.length) - Math.PI/2;
    var x = cx + r * Math.cos(angle) - 25;
    var y = cy + r * Math.sin(angle) - 25;
    var size = 30 + Math.min(50, (counts[ep]/total) * 150);
    var c = D.EP_COLORS[ep];
    html += '<div class="draw-node" style="left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;border-color:'+c+';color:'+c+'">' +
      ep + '<br>' + counts[ep] +
    '</div>';
  });

  html += '</div></div></div>';

  html += '<div class="card"><div class="card-header">epitope transitions</div><div class="card-body">';
  var transitions = {};
  for (var i = 1; i < visits.length; i++) {
    var from = visits[i-1].epitope, to = visits[i].epitope;
    if (from !== to) {
      var key = from + ' \u2192 ' + to;
      transitions[key] = (transitions[key]||0) + 1;
    }
  }
  var tKeys = Object.keys(transitions).sort(function(a,b) { return transitions[b] - transitions[a]; });
  if (tKeys.length === 0) {
    html += '<p style="color:var(--fg-dim)">All visits in one epitope \u2014 no transitions yet.</p>';
  } else {
    tKeys.slice(0,15).forEach(function(t) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0">' +
        '<span style="font-size:12px">' + t + '</span>' +
        '<span style="margin-left:auto;color:var(--fg-dim);font-size:11px">\u00d7' + transitions[t] + '</span>' +
      '</div>';
    });
  }
  html += '</div></div>';

  return html;
};

})();

// desk-play.js — play tab renderer (mountain journey visualization)
(function(){
var D = window.Desk;

D.renderPlay = function() {
  var visits = D.getAllVisits();
  if (visits.length < 1) {
    return '<div class="empty-state">' +
      '<h3>the mountain awaits</h3>' +
      '<p>Every page you visit adds a step to the path. The mountain reveals itself as your epitope signature diversifies.</p>' +
      '<p><a href="https://sporeprint.primals.eco/science/">climb from science \u2192</a></p>' +
    '</div>';
  }

  var H = D.computeEntropy(visits);
  var pos = visits.length < 3 ? 'setting out' : H > 2.2 ? 'ascending \u2014 exploring broadly' : H > 1.2 ? 'summit \u2014 seeing the whole' : 'descending \u2014 building deep';

  var html = '<div class="card"><div class="card-header">your mountain</div><div class="card-body">';

  html += '<div class="stats-bar">' +
    '<div class="stat-item"><div class="stat-val">' + visits.length + '</div><div class="stat-label">steps</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + H.toFixed(2) + '</div><div class="stat-label">H (entropy)</div></div>' +
    '<div class="stat-item"><div class="stat-val" style="font-size:14px">' + pos + '</div><div class="stat-label">position</div></div>' +
  '</div>';

  var counts = {};
  visits.forEach(function(v) { counts[v.epitope] = (counts[v.epitope]||0)+1; });
  var eps = Object.keys(counts).sort(function(a,b) { return counts[b] - counts[a]; });

  html += '<div style="font-family:monospace;font-size:11px;line-height:1.4;padding:16px;background:var(--bg-alt);border-radius:6px">';
  var maxCount = Math.max.apply(null, eps.map(function(e) { return counts[e]; }));
  eps.forEach(function(ep) {
    var c = D.EP_COLORS[ep];
    var barLen = Math.round((counts[ep] / maxCount) * 40);
    var bar = '';
    for (var i = 0; i < barLen; i++) bar += '\u2588';
    html += '<span style="color:'+c+'">' + D.pad(ep, 14) + ' ' + bar + ' ' + counts[ep] + '</span>\n';
  });
  html += '</div>';

  html += '<h3 style="margin-top:20px;color:var(--fg-dim);font-size:12px;text-transform:uppercase;letter-spacing:0.05em">recent path</h3>';
  var recent = visits.slice(-20).reverse();
  recent.forEach(function(v) {
    html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">' +
      D.epPill(v.epitope) +
      ' <a href="' + v.url + '" target="_blank" style="font-size:12px">' + (v.title||v.url).slice(0,60) + '</a>' +
      '<span style="margin-left:auto;color:var(--fg-muted);font-size:10px">' + D.timeAgo(v.time) + '</span>' +
    '</div>';
  });

  html += '</div></div>';
  return html;
};

})();

// desk-create.js — create tab renderer + braid export
(function(){
var D = window.Desk;

D.renderCreate = function() {
  var marks = D.getMarks();
  var songs = D.getAllSongs();
  var markCount = Object.keys(marks).length;
  var songCount = Object.keys(songs).length;

  if (markCount === 0 && songCount === 0) {
    return '<div class="empty-state">' +
      '<h3>forge something</h3>' +
      '<p>Mark pages you find important. Sing notes on them. Come back here to weave them into a story \u2014 a shareable braid of the things that caught your eye.</p>' +
    '</div>';
  }

  var html = '<div class="card"><div class="card-header">forge a braid</div><div class="card-body">';
  html += '<p style="color:var(--fg-dim);margin-bottom:16px">Your marks and songs, woven together. Export as a shareable page.</p>';

  html += '<div class="stats-bar">' +
    '<div class="stat-item"><div class="stat-val">' + markCount + '</div><div class="stat-label">marks</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + songCount + '</div><div class="stat-label">songs</div></div>' +
  '</div>';

  for (var url in marks) {
    var m = marks[url];
    var ep = m.epitope || D.classify(url);
    html += '<div style="margin-bottom:12px;padding:10px;background:var(--surface2);border-radius:4px;border-left:3px solid '+(D.EP_COLORS[ep]||'#8b949e')+'">';
    html += '<div style="display:flex;align-items:center;gap:8px">' +
      D.epPill(ep) + ' <a href="' + url + '" target="_blank">' + (m.title || url) + '</a>' +
    '</div>';
    if (songs[url]) {
      html += '<div style="margin-top:8px;padding:8px;background:var(--bg);border-radius:4px;font-size:12px;color:var(--fg);white-space:pre-wrap">' +
        D.escHtml(songs[url].text) + '</div>';
    }
    html += '</div>';
  }

  html += '<div style="margin-top:16px;display:flex;gap:8px">' +
    '<button class="export-btn" id="export-braid-md">export as markdown</button>' +
    '<button class="export-btn" id="export-braid-json" style="border-color:var(--ep-topology);color:var(--ep-topology)">export as JSON</button>' +
  '</div>';

  html += '</div></div>';
  return html;
};

D.exportBraidMd = function() {
  var marks = D.getMarks();
  var songs = D.getAllSongs();
  var md = '# My Braid \u2014 primals.eco\n\n';
  md += '_Forged ' + new Date().toISOString().slice(0,10) + '_\n\n';
  for (var url in marks) {
    var m = marks[url];
    var ep = m.epitope || D.classify(url);
    md += '## ' + (m.title || url) + '\n\n';
    md += '**Epitope:** ' + ep + '  \n';
    md += '**URL:** ' + url + '\n\n';
    if (songs[url]) md += songs[url].text + '\n\n';
    md += '---\n\n';
  }
  D.downloadFile('braid.md', md, 'text/markdown');
};

D.exportBraidJson = function() {
  var braids = D.findAllBraids();
  var marks = D.getMarks();
  var data = { exported: new Date().toISOString(), braids: braids.map(function(b){return b.braid;}), marks: marks };
  D.downloadFile('braid.json', JSON.stringify(data, null, 2), 'application/json');
};

})();

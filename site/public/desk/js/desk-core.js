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

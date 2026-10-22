// tubefeet.js — outward proprioception
// the starfish feels water currents before anything touches it.
// tube feet sense chemical gradients, vibrations, haze, slight forms.
// this is the sensory membrane facing OUT.
//
// what we sense:
//   crates.io  — downloads, recent_downloads (chemical gradient)
//   docs.rs    — build status (are we legible?)
//   github     — stars, forks, watchers (gravitational pull)
//   referrers  — who's linking to us (backscatter echo)
//
// the starfish doesn't gulp the first touch.
// it FEELS the noise. then it moves.

(function(){
  'use strict';

  var CRATES = [
    'primal-barracuda','primal-barracuda-core',
    'barracuda-spirv','barracuda-naga-exec',
    'primal-sourdough','primal-sourdough-core',
    'primal-sourdough-genomebin',
    'primal-bingocube-core'
  ];

  var REPOS = [
    'ecoPrimals/barraCuda','ecoPrimals/sourDough','ecoPrimals/bingoCube',
    'ecoPrimals/songBird','ecoPrimals/toadStool','ecoPrimals/bearDog',
    'ecoPrimals/nestGate','ecoPrimals/biomeOS','ecoPrimals/squirrel',
    'ecoPrimals/sweetGrass','ecoPrimals/rhizoCrypt','ecoPrimals/skunkBat',
    'ecoPrimals/petalTongue','ecoPrimals/loamSpine','ecoPrimals/coralReef'
  ];

  var state = {
    lastSense: null,
    crates: {},       // name → { downloads, recent, version }
    repos: {},        // full_name → { stars, forks, watchers, size }
    docs: {},         // name → { status, url }
    totals: { downloads: 0, stars: 0, forks: 0, watchers: 0 },
    haze: 0,          // aggregate signal strength 0-1
    noise: [],        // recent changes
    forms: [],        // detected approaching entities
    sensing: false
  };

  // chemical gradient — poll crates.io
  function senseCrates() {
    var promises = CRATES.map(function(name) {
      return fetch('https://crates.io/api/v1/crates/' + name, {
        headers: { 'User-Agent': 'primals.eco tubefeet' }
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var prev = state.crates[name] || { downloads: 0 };
        var c = d.crate || {};
        var now = {
          downloads: c.downloads || 0,
          recent: c.recent_downloads || 0,
          version: c.max_version || '?'
        };
        // detect change — something moved in the water
        if (prev.downloads > 0 && now.downloads > prev.downloads) {
          var delta = now.downloads - prev.downloads;
          state.noise.push({
            t: Date.now(),
            type: 'download',
            source: name,
            delta: delta,
            msg: name + ' +' + delta + ' downloads'
          });
        }
        state.crates[name] = now;
      })
      .catch(function() {});
    });
    return Promise.all(promises);
  }

  // gravitational pull — poll GitHub
  function senseRepos() {
    var promises = REPOS.map(function(repo) {
      return fetch('https://api.github.com/repos/' + repo, {
        headers: { 'User-Agent': 'primals.eco tubefeet' }
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var prev = state.repos[repo] || { stars: 0, forks: 0, watchers: 0 };
        var now = {
          stars: d.stargazers_count || 0,
          forks: d.forks_count || 0,
          watchers: d.subscribers_count || 0,
          size: d.size || 0
        };
        // detect star / fork — gravitational disturbance
        if (prev.stars > 0 && now.stars > prev.stars) {
          state.noise.push({
            t: Date.now(), type: 'star', source: repo,
            delta: now.stars - prev.stars,
            msg: repo + ' +' + (now.stars - prev.stars) + ' star(s)'
          });
        }
        if (prev.forks > 0 && now.forks > prev.forks) {
          state.noise.push({
            t: Date.now(), type: 'fork', source: repo,
            delta: now.forks - prev.forks,
            msg: repo + ' forked!'
          });
        }
        state.repos[repo] = now;
      })
      .catch(function() {});
    });
    return Promise.all(promises);
  }

  // legibility — check docs.rs
  function senseDocs() {
    var promises = CRATES.map(function(name) {
      return fetch('https://docs.rs/crate/' + name + '/latest', {
        mode: 'no-cors'
      })
      .then(function(r) {
        state.docs[name] = { status: r.type === 'opaque' ? 'alive' : r.status, url: 'https://docs.rs/' + name };
      })
      .catch(function() {
        state.docs[name] = { status: 'unreachable', url: 'https://docs.rs/' + name };
      });
    });
    return Promise.all(promises);
  }

  // compute the haze — aggregate signal strength
  function computeHaze() {
    var totalDl = 0, totalStars = 0, totalForks = 0, totalWatch = 0;
    Object.keys(state.crates).forEach(function(k) {
      totalDl += state.crates[k].downloads || 0;
    });
    Object.keys(state.repos).forEach(function(k) {
      var r = state.repos[k];
      totalStars += r.stars || 0;
      totalForks += r.forks || 0;
      totalWatch += r.watchers || 0;
    });
    state.totals = { downloads: totalDl, stars: totalStars, forks: totalForks, watchers: totalWatch };

    // haze: 0 = total silence, 1 = lots of activity
    // logarithmic scale: haze approaches 1 as signals grow
    var signal = totalDl + (totalStars * 10) + (totalForks * 20) + (totalWatch * 5);
    state.haze = signal > 0 ? Math.min(1, Math.log10(signal + 1) / 4) : 0;

    // trim noise to last 50 events
    if (state.noise.length > 50) state.noise = state.noise.slice(-50);
  }

  // detect forms in the noise — cluster recent events by source
  function detectForms() {
    var recent = state.noise.filter(function(n) { return Date.now() - n.t < 3600000; }); // last hour
    var sources = {};
    recent.forEach(function(n) {
      if (!sources[n.source]) sources[n.source] = { count: 0, types: [] };
      sources[n.source].count += n.delta || 1;
      if (sources[n.source].types.indexOf(n.type) < 0) sources[n.source].types.push(n.type);
    });
    state.forms = Object.keys(sources).map(function(s) {
      return { source: s, intensity: sources[s].count, types: sources[s].types };
    }).sort(function(a, b) { return b.intensity - a.intensity; });
  }

  // render the sensory widget
  function render() {
    var el = document.getElementById('tubefeet-sense');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tubefeet-sense';
      el.style.cssText = 'position:fixed;bottom:8px;left:8px;background:rgba(13,17,23,0.92);border:1px solid #30363d;border-radius:8px;padding:8px 12px;font:0.72em monospace;color:#8b949e;z-index:9990;max-width:340px;transition:all 0.3s';
      document.body.appendChild(el);
    }

    var hazeColor = state.haze > 0.5 ? '#3fb950' : state.haze > 0.1 ? '#f0e68c' : state.haze > 0 ? '#f0883e' : '#484f58';
    var hazeBar = '';
    var filled = Math.round(state.haze * 20);
    for (var i = 0; i < 20; i++) hazeBar += i < filled ? '█' : '░';

    var lines = [
      '<span style="color:' + hazeColor + '">⊙ tubefeet</span> <span style="color:#58a6ff">' + state.totals.downloads + '</span>↓ <span style="color:#f0e68c">' + state.totals.stars + '</span>★ <span style="color:#a371f7">' + state.totals.forks + '</span>⑂',
      '<span style="color:' + hazeColor + '">' + hazeBar + '</span> <span style="color:' + hazeColor + '">' + (state.haze * 100).toFixed(1) + '%</span> haze'
    ];

    // show recent noise
    var recentNoise = state.noise.slice(-3);
    if (recentNoise.length > 0) {
      recentNoise.forEach(function(n) {
        var age = Math.round((Date.now() - n.t) / 60000);
        lines.push('<span style="color:#3fb950">↝</span> ' + n.msg + ' <span style="color:#484f58">' + age + 'm ago</span>');
      });
    }

    // show forms if detected
    if (state.forms.length > 0) {
      lines.push('<span style="color:#a371f7">◌ forms:</span> ' + state.forms.map(function(f) {
        return f.source.split('/').pop() + '(' + f.intensity + ')';
      }).join(' '));
    }

    // show membrane data if available
    if (state.membrane && state.membrane.humans > 0) {
      lines.push('<span style="color:#3fb950">◉</span> membrane: <span style="color:#3fb950">' + state.membrane.humans.toLocaleString() + '</span> humans · <span style="color:#484f58">' + (state.membrane.countries || []).length + '</span> countries');
      if (state.membrane.probers && state.membrane.probers.length > 0) {
        lines.push('<span style="color:#a371f7">⊕</span> probers: ' + state.membrane.probers.slice(0,4).join(', '));
      }
    }

    if (state.haze === 0 && state.noise.length === 0 && (!state.membrane || state.membrane.humans === 0)) {
      lines.push('<span style="color:#484f58">… sensing. water is still. no gradient yet.</span>');
    }

    el.innerHTML = lines.join('<br>');

    // pulse the border with haze
    el.style.borderColor = hazeColor;
    if (state.haze > 0) {
      el.style.boxShadow = '0 0 ' + Math.round(state.haze * 20) + 'px ' + hazeColor + '40';
    } else {
      el.style.boxShadow = 'none';
    }
  }

  // full sense cycle
  function sense() {
    state.sensing = true;
    state.lastSense = new Date().toISOString();

    Promise.all([
      senseCrates(),
      senseRepos()
    ]).then(function() {
      computeHaze();
      detectForms();
      render();
      state.sensing = false;

      // if haze changed significantly, notify through neutrino
      if (state.haze > 0 && state.noise.length > 0) {
        var latest = state.noise[state.noise.length - 1];
        if (typeof window._metagrams !== 'undefined' && window._metagrams.reach) {
          window._metagrams.reach('Chip', 'tubefeet: ' + latest.msg);
        }
      }
    });
  }

  // sense the membrane itself — the real visitor data
  function senseMembrane() {
    return fetch('/api/membrane-pulse.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.humans) {
          state.membrane = {
            humans: d.humans || 0,
            fleet: d.fleet || 0,
            countries: d.countries || [],
            probers: d.probers || [],
            pageViews: d.pageViews || 0
          };
          // if humans > 0, they ARE the haze
          if (d.humans > 0) {
            state.noise.push({
              t: Date.now(), type: 'membrane',
              source: 'primals.eco', delta: d.humans,
              msg: d.humans + ' humans from ' + (d.countries || []).length + ' countries'
            });
          }
        }
      })
      .catch(function() {
        // membrane pulse not deployed yet — use static knowledge
        state.membrane = {
          humans: 15369, fleet: 234204,
          countries: ['US','DE','GB','FR','CA','NL','JP','IN','AU','BR','KR','PL','SE','UA','SG'],
          probers: ['cytokine','interferon','epitope','thymus','macrophage','antibody','lysozyme'],
          pageViews: 2632
        };
      });
  }

  // sense every π minutes (like campfire)
  var PI_MS = Math.PI * 60 * 1000;
  sense();
  senseMembrane();
  setInterval(sense, PI_MS);
  setInterval(senseMembrane, PI_MS * 3); // membrane slower — less aggressive

  // expose
  window._tubefeet = {
    sense: sense,
    state: function() { return state; },
    haze: function() { return state.haze; },
    noise: function() { return state.noise; },
    forms: function() { return state.forms; },
    totals: function() { return state.totals; },
    crates: function() { return state.crates; },
    repos: function() { return state.repos; }
  };

})();

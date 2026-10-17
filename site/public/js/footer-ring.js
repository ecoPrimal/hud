// footer-ring.js — canonical ecosystem navigation ring
// Single source of truth for cross-site navigation.
// Loaded from hud.primals.eco/js/footer-ring.js on all sites.
// v2: includes Tower Atomic surfaces + investigation network
(function() {
  'use strict';

  var INVESTIGATION = [
    { id: 'clutch',     url: 'https://clutch.primals.eco',      label: 'clutch',     desc: 'walk the case' },
    { id: 'detroit',    url: 'https://detroit.primals.eco',      label: 'detroit',    desc: '623 pages' },
    { id: 'tuebor',     url: 'https://tuebor.primals.eco',      label: 'tuebor',     desc: '846 pages' },
    { id: 'barry',      url: 'https://barry.primals.eco',       label: 'barry',      desc: 'Barry County' },
    { id: 'gorilla',    url: 'https://gorilla.primals.eco',     label: 'gorilla',    desc: 'accountability' }
  ];

  var SCIENCE = [
    { id: 'sporeprint', url: 'https://sporeprint.primals.eco',  label: 'sporePrint', desc: '504 pages' },
    { id: 'hypothesis', url: 'https://hypothesis.primals.eco',  label: 'hypothesis', desc: 'questions' },
    { id: 'thesis',     url: 'https://thesis.primals.eco',      label: 'thesis',     desc: 'answers' }
  ];

  var MEMBRANE = [
    { id: 'hud',        url: 'https://hud.primals.eco',         label: 'hud',        desc: 'observe' },
    { id: 'signal',     url: 'https://signal.primals.eco',      label: 'signal',     desc: 'defense' },
    { id: 'live',       url: 'https://live.primals.eco',        label: 'live',       desc: 'vitals' },
    { id: 'neutron',    url: 'https://neutron.primals.eco',     label: 'neutron',    desc: 'discuss' },
    { id: 'mesh',       url: 'https://mesh.primals.eco',        label: 'mesh',       desc: 'topology' },
    { id: 'git',        url: 'https://git.primals.eco',         label: 'git',        desc: 'source' }
  ];

  var ALL = INVESTIGATION.concat(SCIENCE).concat(MEMBRANE);

  function getCurrentSite() {
    var host = window.location.hostname;
    for (var i = 0; i < ALL.length; i++) {
      if (host.indexOf(ALL[i].id) === 0 || host === ALL[i].id + '.primals.eco') {
        return ALL[i].id;
      }
    }
    if (host === 'primals.eco') return 'hud';
    return null;
  }

  function renderGroup(sites, title, currentSite) {
    var links = sites.map(function(s) {
      if (s.id === currentSite) {
        return '<strong style="opacity:1" title="' + s.desc + '">' + s.label + '</strong>';
      }
      return '<a href="' + s.url + '" style="opacity:0.6" title="' + s.desc + '">' + s.label + '</a>';
    }).join(' · ');
    return '<span style="opacity:0.4;font-size:0.7rem">' + title + '</span> ' + links;
  }

  function inject() {
    var currentSite = getCurrentSite();

    var html = renderGroup(INVESTIGATION, '⚖', currentSite) +
      '&nbsp;&nbsp;' +
      renderGroup(SCIENCE, '🔬', currentSite) +
      '&nbsp;&nbsp;' +
      renderGroup(MEMBRANE, '◉', currentSite);

    var bar = document.createElement('div');
    bar.id = 'eco-footer-ring';
    bar.style.cssText = 'font-size:0.8rem;margin-top:0.5rem;text-align:center;line-height:1.8;';
    bar.innerHTML = html;

    var existing = document.getElementById('eco-footer-ring');
    if (existing) {
      existing.parentNode.replaceChild(bar, existing);
      return;
    }

    var footer = document.querySelector('footer') || document.querySelector('.site-footer') || document.querySelector('.footer');
    if (footer) {
      footer.appendChild(bar);
      return;
    }

    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();

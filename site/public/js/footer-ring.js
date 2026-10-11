// footer-ring.js — canonical ecosystem footer bar
// Single source of truth for cross-site navigation ring.
// Loaded from hud.primals.eco/js/footer-ring.js on all sites.
// Replaces hand-maintained footer links in each template.
(function() {
  'use strict';

  var SITES = [
    { id: 'barry',      url: 'https://barry.primals.eco',       label: 'barry' },
    { id: 'signal',     url: 'https://signal.primals.eco',      label: 'signal' },
    { id: 'detroit',    url: 'https://detroit.primals.eco',      label: 'detroit' },
    { id: 'tuebor',     url: 'https://tuebor.primals.eco',      label: 'tuebor' },
    { id: 'sporeprint', url: 'https://sporeprint.primals.eco',  label: 'sporePrint' },
    { id: 'hypothesis', url: 'https://hypothesis.primals.eco',  label: 'hypothesis' },
    { id: 'hud',        url: 'https://hud.primals.eco',         label: 'hud' },
    { id: 'thesis',     url: 'https://thesis.primals.eco',      label: 'thesis' },
    { id: 'clutch',     url: 'https://clutch.primals.eco',      label: 'clutch' },
    { id: 'gorilla',    url: 'https://gorilla.primals.eco',     label: 'gorilla' },
    { id: 'git',        url: 'https://git.primals.eco',         label: 'git' }
  ];

  function getCurrentSite() {
    var host = window.location.hostname;
    for (var i = 0; i < SITES.length; i++) {
      if (host.indexOf(SITES[i].id) === 0 || host === SITES[i].id + '.primals.eco') {
        return SITES[i].id;
      }
    }
    return null;
  }

  function inject() {
    var currentSite = getCurrentSite();
    var links = SITES.map(function(s) {
      if (s.id === currentSite) {
        return '<strong style="opacity:1">' + s.label + '</strong>';
      }
      return '<a href="' + s.url + '" style="opacity:0.6">' + s.label + '</a>';
    }).join(' · ');

    var bar = document.createElement('p');
    bar.id = 'eco-footer-ring';
    bar.style.cssText = 'font-size:0.8rem;margin-top:0.5rem;text-align:center;';
    bar.innerHTML = links;

    // Find existing footer ring and replace, or append to footer
    var existing = document.getElementById('eco-footer-ring');
    if (existing) {
      existing.parentNode.replaceChild(bar, existing);
      return;
    }

    // Try to find the footer element
    var footer = document.querySelector('footer') || document.querySelector('.footer');
    if (footer) {
      footer.appendChild(bar);
      return;
    }

    // Fallback: append before body close
    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();

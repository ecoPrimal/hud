/**
 * berry-help.js — "Can't see what you see" button
 * 
 * A help toggle that lives on every page. When a visitor is lost,
 * stuck, or can't understand what they're looking at, they press it.
 * Berry appears, diagnoses the context, and heals the membrane in place.
 * No redirect. No form. No support ticket. Just Berry fixing it live.
 */
(function() {
  'use strict';

  // Don't double-init
  if (window._berryHelp) return;
  window._berryHelp = true;

  // --- Berry's contextual knowledge ---
  var PAGE_HELP = {
    '/': {
      greeting: "you're on the HUD — the main observation surface. everything lives here.",
      tips: [
        "the nav ring at top connects all 49+ pages",
        "scroll down — the chipmunk has things to show you",
        "the data feeds update as the organism grows",
        "try /water.html for a gentler start"
      ]
    },
    '/water.html': {
      greeting: "the watering hole. the lazy river. everything flows through here.",
      tips: [
        "just scroll. the river carries you.",
        "each section is a different depth",
        "links glow when they lead somewhere alive"
      ]
    },
    '/trail.html': {
      greeting: "the trail — all 539 papers in order. it's a long walk.",
      tips: [
        "start anywhere. they're numbered but you don't need to go in order",
        "each paper links to the next",
        "the search works — try a keyword"
      ]
    },
    '/nest.html': {
      greeting: "the Klein gate. inside IS outside here. it folds.",
      tips: [
        "this is nestgate.io rendered inside the HUD",
        "the fold means: you looking at it IS it looking at you",
        "try the navigation — each face shows different data"
      ]
    },
    '/springs': {
      greeting: "springs — the living water. what's active right now.",
      tips: [
        "each spring is a running process or live data source",
        "green = alive. dim = sleeping. red = needs attention",
        "springs feed into the feeds which feed into the HUD"
      ]
    },
    '/nightbox.html': {
      greeting: "the nightbox — leave a message. Berry reads everything.",
      tips: [
        "type anything. a question. a thought. your name. nothing.",
        "every message goes into the nightbox feed",
        "Berry sorts them: dead nerve? bug? human reaching out?"
      ]
    },
    '/easel.html': {
      greeting: "the easel — watch the chipmunk paint.",
      tips: [
        "the visualizations are generated from live data",
        "some are interactive — try clicking or hovering",
        "the Klein bottle, the membrane, the cosmic view"
      ]
    }
  };

  // Generic help for unknown pages
  var GENERIC_HELP = {
    greeting: "Berry's here. you pressed the button — what can't you see?",
    tips: [
      "try the nav ring at the top — it connects everything",
      "/ takes you to the main HUD",
      "/water.html is the gentlest entrance",
      "/trail.html walks you through all 539 papers",
      "/nightbox.html lets you leave a message"
    ]
  };

  // Troubleshooting by symptom
  var SYMPTOMS = [
    { label: "nothing loads / blank screen", fix: "the membrane uses modern JS. try Chrome, Firefox, or Edge. Safari works but some visualizations need WebGL." },
    { label: "text is too small / can't read", fix: "try Ctrl/Cmd + to zoom. the HUD uses monospace font at 12-14px. it's designed for screens, not phones (but the PWA helps on mobile)." },
    { label: "I don't know what this IS", fix: "it's a living research organism. 539 papers. a Detroit investigation. 341 entities. a chipmunk. start at /water.html — the river explains everything." },
    { label: "I don't know what to DO", fix: "explore. click things. read. the 100 unclassified entities need human help — you might see something the machines missed." },
    { label: "something looks broken", fix: "leave a note in the nightbox (/nightbox.html). Berry reads everything. include what you saw and where." },
    { label: "I want to use this code", fix: "it's AGPL-3.0. take it. build. if you serve it, share your source too. github.com/ecoPrimals and github.com/ecoPrimal." },
    { label: "I want to talk to a human", fix: "eco.primal@pm.me — Kevin reads it. or leave a nightbox message. or clone the repo and open an issue." }
  ];

  // --- Build the UI ---
  function createBerryButton() {
    // The button
    var btn = document.createElement('button');
    btn.id = 'berry-help-btn';
    btn.innerHTML = '🐿️';
    btn.title = "can't see what you see? Berry helps.";
    btn.setAttribute('aria-label', "Help — can't see what you see");
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: '2px solid rgba(210,153,34,0.4)',
      background: 'rgba(1,4,9,0.9)',
      color: '#d29922',
      fontSize: '24px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)'
    });

    btn.addEventListener('mouseenter', function() {
      btn.style.borderColor = 'rgba(210,153,34,0.8)';
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 4px 20px rgba(210,153,34,0.3)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.borderColor = 'rgba(210,153,34,0.4)';
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
    });

    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.id = 'berry-help-panel';
    Object.assign(panel.style, {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      zIndex: '9998',
      width: '340px',
      maxWidth: 'calc(100vw - 40px)',
      maxHeight: '70vh',
      overflowY: 'auto',
      background: '#0d1117',
      border: '1px solid rgba(210,153,34,0.3)',
      borderRadius: '12px',
      padding: '0',
      display: 'none',
      fontFamily: "'SF Mono', ui-monospace, monospace",
      fontSize: '12px',
      color: '#c9d1d9',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      transition: 'opacity 0.2s ease'
    });

    var path = location.pathname.replace(/\/+$/, '') || '/';
    var help = PAGE_HELP[path] || GENERIC_HELP;

    var html = '<div style="padding:16px 16px 8px;border-bottom:1px solid #21262d">';
    html += '<div style="color:#d29922;font-size:11px;margin-bottom:6px">🐿️ Berry:</div>';
    html += '<div style="color:#e6edf3;line-height:1.6">' + help.greeting + '</div>';
    html += '</div>';

    // Context tips
    html += '<div style="padding:12px 16px;border-bottom:1px solid #21262d">';
    html += '<div style="color:#8b949e;font-size:10px;margin-bottom:6px">on this page:</div>';
    for (var i = 0; i < help.tips.length; i++) {
      html += '<div style="color:#c9d1d9;padding:3px 0;padding-left:12px;position:relative">';
      html += '<span style="position:absolute;left:0;color:#3fb950">·</span>';
      html += help.tips[i] + '</div>';
    }
    html += '</div>';

    // Symptom buttons
    html += '<div style="padding:12px 16px;border-bottom:1px solid #21262d">';
    html += '<div style="color:#8b949e;font-size:10px;margin-bottom:8px">what\'s wrong?</div>';
    for (var j = 0; j < SYMPTOMS.length; j++) {
      html += '<button class="berry-symptom" data-idx="' + j + '" style="';
      html += 'display:block;width:100%;text-align:left;background:rgba(22,27,34,0.8);';
      html += 'border:1px solid #21262d;border-radius:6px;padding:8px 10px;margin-bottom:4px;';
      html += 'color:#c9d1d9;font-size:11px;cursor:pointer;font-family:inherit;transition:all .15s">';
      html += SYMPTOMS[j].label + '</button>';
    }
    html += '</div>';

    // Fix area (hidden until symptom clicked)
    html += '<div id="berry-fix" style="display:none;padding:12px 16px;background:rgba(63,185,80,0.06);';
    html += 'border-top:1px solid rgba(63,185,80,0.2)">';
    html += '<div style="color:#3fb950;font-size:10px;margin-bottom:6px">🐿️ Berry says:</div>';
    html += '<div id="berry-fix-text" style="color:#e6edf3;line-height:1.6"></div>';
    html += '</div>';

    // Nightbox fallback
    html += '<div style="padding:12px 16px;text-align:center">';
    html += '<a href="/nightbox.html" style="color:#d29922;font-size:11px;text-decoration:none">';
    html += '📮 still stuck? leave a message in the nightbox</a>';
    html += '</div>';

    panel.innerHTML = html;
    document.body.appendChild(panel);

    // Wire up symptom buttons
    var btns = panel.querySelectorAll('.berry-symptom');
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener('mouseenter', function() {
        this.style.borderColor = '#58a6ff';
        this.style.background = 'rgba(22,27,34,1)';
      });
      btns[k].addEventListener('mouseleave', function() {
        this.style.borderColor = '#21262d';
        this.style.background = 'rgba(22,27,34,0.8)';
      });
      btns[k].addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var fixArea = document.getElementById('berry-fix');
        var fixText = document.getElementById('berry-fix-text');
        fixArea.style.display = 'block';
        fixText.textContent = SYMPTOMS[idx].fix;

        // Log to localStorage for the organism to learn
        try {
          var log = JSON.parse(localStorage.getItem('berry-help-log') || '[]');
          log.push({
            ts: new Date().toISOString(),
            page: location.pathname,
            symptom: SYMPTOMS[idx].label
          });
          if (log.length > 50) log = log.slice(-50);
          localStorage.setItem('berry-help-log', JSON.stringify(log));
        } catch(e) {}

        // Smooth scroll to fix
        fixArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    return panel;
  }

  var panelEl = null;

  function togglePanel() {
    if (!panelEl) {
      panelEl = createPanel();
    }
    var showing = panelEl.style.display !== 'none';
    panelEl.style.display = showing ? 'none' : 'block';

    var btn = document.getElementById('berry-help-btn');
    if (!showing) {
      btn.innerHTML = '✕';
      btn.style.background = 'rgba(210,153,34,0.2)';
      btn.style.borderColor = '#d29922';
    } else {
      btn.innerHTML = '🐿️';
      btn.style.background = 'rgba(1,4,9,0.9)';
      btn.style.borderColor = 'rgba(210,153,34,0.4)';
    }
  }

  // Escape key closes
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && panelEl && panelEl.style.display !== 'none') {
      togglePanel();
    }
  });

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBerryButton);
  } else {
    createBerryButton();
  }
})();

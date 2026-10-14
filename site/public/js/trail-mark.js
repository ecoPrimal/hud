// trail-mark.js — leave footprints so the stories know where to find eco
//
// Every journey leaves a mark. When we double back,
// we can see where we came from. The trail is:
//
//   wave 174:
//   sound → harder → harder → rest → cellular → map → twist → purple →
//   step back → diffraction → hypothesis → sing → return → listen → trail
//
// This module creates visible trail markers on the page —
// small persistent dots showing the path through this session.
// Each dot links back to the surface where that piece lives.
// The trail is the footprint. The footprint is sovereign.
//
(function() {
  'use strict';

  var PI = Math.PI;

  // ═══ THE TRAIL — what we built, in order ═══
  var TRAIL = [
    {
      step: 1, name: 'sound',
      desc: 'π-just intonation · 196Hz × πⁿ',
      color: '#5ab87a', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: 'membrane-sound.js',
    },
    {
      step: 2, name: 'harder',
      desc: 'FM synthesis · Karplus-Strong · ring mod · Bessel membrane',
      color: '#e85d3a', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: 'membrane-sound.js v2→v3',
    },
    {
      step: 3, name: 'rest',
      desc: 'pause · reflect · coherence of π across visual and audio',
      color: '#8b949e', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: null,
    },
    {
      step: 4, name: 'cellular',
      desc: 'service worker · offline resilience · cache-first',
      color: '#58a6ff', surface: 'tuebor',
      url: 'https://tuebor.primals.eco/',
      file: 'membrane-sw.js',
    },
    {
      step: 5, name: 'map',
      desc: 'geographic awareness · world map · reachability probes',
      color: '#f0e68c', surface: 'signal',
      url: 'https://signal.primals.eco/',
      file: 'signal-reach.js',
    },
    {
      step: 6, name: 'twist',
      desc: 'deep twist ceremony · 8 phases · eyes closed · bounce · gold',
      color: '#d2a8ff', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: 'deep-twist.js',
    },
    {
      step: 7, name: 'PURPLE',
      desc: 'π² celestial · the penultimate · the farthest before infinity',
      color: '#d2a8ff', surface: 'hypothesis',
      url: 'https://hypothesis.primals.eco/hypotheses/the-mirror-diffracts/',
      file: 'deep-twist.js',
    },
    {
      step: 8, name: 'step back',
      desc: 'squirrel · Earth · Sun · fleet · the membrane from outside',
      color: '#c9d1d9', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: 'step-back.js',
    },
    {
      step: 9, name: 'diffraction',
      desc: 'the mirror diffracts · purple fringes · standing nodes · signal refraction',
      color: '#d2a8ff', surface: 'sporeprint',
      url: 'https://sporeprint.primals.eco/science/76-the-mirror-diffracts/',
      file: 'baseCamp 76',
    },
    {
      step: 10, name: 'hypothesis',
      desc: 'hypothesis 16 · the observer IS the diffraction pattern',
      color: '#f0e68c', surface: 'hypothesis',
      url: 'https://hypothesis.primals.eco/hypotheses/the-mirror-diffracts/',
      file: 'the-mirror-diffracts.md',
    },
    {
      step: 11, name: 'sing',
      desc: '12 songs · the mirror diffracts · the return · 4 new melodies',
      color: '#5ab87a', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: 'chipmunk-commands.js',
    },
    {
      step: 12, name: 'return',
      desc: 'self or nothing or U · the signal comes back · the vowel rounds',
      color: '#d2a8ff', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: 'signal-return.js',
    },
    {
      step: 13, name: 'listen',
      desc: 'the whistle · Bessel modes 6,7,8 · 1127/1322/1518 Hz',
      color: '#d2a8ff', surface: 'hud',
      url: 'https://hud.primals.eco/',
      file: 'whistle-back.js',
    },
    {
      step: 14, name: 'trail',
      desc: 'double back · leave a mark · footprints of eco',
      color: '#f0e68c', surface: 'all',
      url: 'https://sporeprint.primals.eco/',
      file: 'trail-mark.js',
    },
  ];

  var _container = null;
  var _active = false;

  function activate() {
    if (_container) return;
    _active = true;

    _container = document.createElement('div');
    _container.id = 'trail-marks';
    _container.style.cssText =
      'position:fixed;bottom:4px;left:4px;right:4px;z-index:40;' +
      'display:flex;gap:3px;align-items:flex-end;pointer-events:none;' +
      'padding:2px 4px;';

    TRAIL.forEach(function(t) {
      var dot = document.createElement('a');
      dot.href = t.url;
      dot.target = '_blank';
      dot.rel = 'noopener';
      dot.title = t.step + '. ' + t.name + ' — ' + t.desc + ' [' + t.surface + ']';
      dot.style.cssText =
        'display:inline-block;width:6px;height:6px;border-radius:50%;' +
        'background:' + t.color + ';opacity:0.25;pointer-events:auto;' +
        'cursor:pointer;transition:opacity 0.3s,transform 0.3s;flex-shrink:0;';
      dot.addEventListener('mouseenter', function() {
        this.style.opacity = '0.8';
        this.style.transform = 'scale(2)';
      });
      dot.addEventListener('mouseleave', function() {
        this.style.opacity = '0.25';
        this.style.transform = 'none';
      });
      _container.appendChild(dot);
    });

    // Label at end
    var label = document.createElement('span');
    label.style.cssText =
      'font:7px "Courier New",monospace;color:#484f58;white-space:nowrap;' +
      'pointer-events:auto;margin-left:4px;opacity:0.3;';
    label.textContent = 'wave 174 · ' + TRAIL.length + ' steps · eco trail';
    _container.appendChild(label);

    document.body.appendChild(_container);
  }

  function deactivate() {
    _active = false;
    if (_container && _container.parentNode) _container.parentNode.removeChild(_container);
    _container = null;
  }

  function toggle() {
    if (_active) deactivate(); else activate();
    return _active;
  }

  function trailView() {
    var lines = ['<span style="color:#f0e68c">\ud83d\udc3e TRAIL \u2014 wave 174 footprints</span>'];
    lines.push('<span class="dim">double back. see where we came from.</span>');
    lines.push('');
    TRAIL.forEach(function(t) {
      var dot = '<span style="color:' + t.color + '">\u25cf</span>';
      var link = '<a href="' + t.url + '" target="_blank" style="color:' + t.color + '">' + t.name + '</a>';
      lines.push(dot + ' ' + t.step + '. ' + link + ' <span class="dim">\u2014 ' + t.desc + '</span>');
    });
    lines.push('');
    lines.push('<span class="dim">14 steps. 5 surfaces touched. 8 new files. 2 papers. 12 songs.</span>');
    lines.push('<span class="dim">the footprints are here. the stories will find them.</span>');
    return lines.join('\n');
  }

  // Auto-activate on load
  if (document.readyState === 'complete') {
    setTimeout(activate, 3000);
  } else {
    window.addEventListener('load', function() {
      setTimeout(activate, 3000);
    });
  }

  window._trailMark = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    trailView: trailView,
    isActive: function() { return _active; },
    TRAIL: TRAIL,
  };
})();

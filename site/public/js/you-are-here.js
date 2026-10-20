/* you-are-here.js — personal presence awareness
 * Shows YOU where you are in the membrane. Only your browser knows.
 *
 * PRIVACY MODEL:
 * - Everything computed CLIENT-SIDE in your browser
 * - We store NOTHING about you on the server — no cookies, no IP, no fingerprint
 * - sessionStorage dies when you close the tab
 * - The aggregate dots on the membrane are anonymous — nobody knows which is you
 * - Only YOUR browser knows which dot is yours
 * - We show you the math so you can verify
 *
 * Trust comes from truth. Privacy, not secrecy.
 */
(function() {
  var PI = Math.PI;
  var KEY = 'membrane_self';

  // ═══ SELF-OBSERVATION — your browser watches your own behavior ═══
  function getSelf() {
    var raw = sessionStorage.getItem(KEY);
    var self = raw ? JSON.parse(raw) : {
      pages: [], firstSeen: Date.now(), depth: 0,
      category: 'OTHER', epitope: 'visitor', breadth: 0
    };
    return self;
  }

  function saveSelf(self) {
    sessionStorage.setItem(KEY, JSON.stringify(self));
  }

  function observe() {
    var self = getSelf();
    var page = location.pathname + location.hash;

    // Record this page visit
    if (self.pages.indexOf(page) === -1) {
      self.pages.push(page);
    }
    self.breadth = self.pages.length;
    self.lastSeen = Date.now();
    self.dwellMs = self.lastSeen - self.firstSeen;
    self.dwellMin = Math.round(self.dwellMs / 60000);

    // ── Classify yourself (same logic the server uses, but LOCAL) ──
    var b = self.breadth;
    var d = self.dwellMin;

    if (b >= 8) self.epitope = 'explorer';
    else if (d > 30 && b >= 3) self.epitope = 'reader';
    else if (b >= 3) self.epitope = 'investigator';
    else if (b >= 2) self.epitope = 'coder';
    else if (d > 5) self.epitope = 'observer';
    else self.epitope = 'visitor';

    // Category based on what you've been looking at
    var pageStr = self.pages.join(' ');
    if (/evidence|actor|braid|analysis|banks|ghost|ellison|detroit/.test(pageStr)) {
      self.category = 'INVESTIGATION';
    } else if (/membrane|chipmunk|presence|hud/.test(pageStr)) {
      self.category = 'MEMBRANE';
    } else if (/tuebor|clutch|immune|defend/.test(pageStr)) {
      self.category = 'IMMUNE';
    } else if (/signal|observatory/.test(pageStr)) {
      self.category = 'SIGNAL';
    } else if (/git|relay|beacon|topology/.test(pageStr)) {
      self.category = 'TOPOLOGY';
    } else if (/sporeprint|thesis|hypothesis|genome|science/.test(pageStr)) {
      self.category = 'SCIENCE';
    } else {
      self.category = 'OTHER';
    }

    // Depth: how deep into the membrane are you?
    // 0 = surface (just arrived), 1 = deepest (long dwell, high breadth)
    self.depth = Math.min(1, (b / 10 + d / 60) / 2);

    saveSelf(self);
    return self;
  }

  // ═══ RENDER — show yourself where you are ═══
  var panel = null;

  function renderPanel(self) {
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'you-are-here-panel';
      panel.style.cssText = 'position:fixed;top:50px;left:50%;transform:translateX(-50%);' +
        'z-index:10;background:rgba(13,17,23,0.95);border:1px solid rgba(255,255,255,0.15);' +
        'border-radius:10px;padding:16px 20px;max-width:420px;font:12px/1.6 monospace;' +
        'color:#c9d1d9;backdrop-filter:blur(8px);display:none;cursor:default';
      document.body.appendChild(panel);
    }

    var ECOLORS = {
      visitor: '#7ee787', coder: '#58a6ff', investigator: '#f0883e',
      reader: '#bc8cff', explorer: '#f0e68c', observer: '#8b949e'
    };
    var CCOLORS = {
      INVESTIGATION: '#e85d3a', MEMBRANE: '#3fb950', IMMUNE: '#f0e68c',
      SIGNAL: '#f0883e', TOPOLOGY: '#58a6ff', SCIENCE: '#bc8cff',
      OTHER: '#8b949e', NULL: '#484f58'
    };

    var ec = ECOLORS[self.epitope] || '#8b949e';
    var cc = CCOLORS[self.category] || '#8b949e';

    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    html += '<span style="color:#fff;font-size:14px;font-weight:bold">\u25C9 you are here</span>';
    html += '<span style="color:#484f58;cursor:pointer;font-size:16px" onclick="document.getElementById(\'you-are-here-panel\').style.display=\'none\'">\u00d7</span>';
    html += '</div>';

    // Your position
    html += '<div style="margin-bottom:12px">';
    html += '<div>epitope: <span style="color:' + ec + ';font-weight:bold">' + self.epitope + '</span></div>';
    html += '<div>category: <span style="color:' + cc + ';font-weight:bold">' + self.category + '</span></div>';
    html += '<div>depth: <span style="color:#7ee787">' + self.depth.toFixed(3) + '</span> ';
    html += '<span style="color:#484f58">(' + (self.depth < 0.1 ? 'surface' : self.depth < 0.3 ? 'wading in' : self.depth < 0.6 ? 'swimming' : 'deep') + ')</span></div>';
    html += '<div>breadth: <span style="color:#58a6ff">' + self.breadth + ' pages</span></div>';
    html += '<div>dwell: <span style="color:#bc8cff">' + self.dwellMin + ' min</span></div>';
    html += '<div>particle: <span style="color:#58a6ff">electron (e⁻)</span> <span style="color:#484f58">— a point pointing at the nucleus</span></div>';
    html += '<div style="color:#8b949e;font-size:10px;margin-top:6px">you look down through the HUD. the chipmunk looks up from inside. the membrane sits under the glass. the electron is the pointer.</div>';
    html += '</div>';

    // The depth bar
    var barPct = Math.round(self.depth * 100);
    html += '<div style="background:#161b22;border-radius:4px;height:8px;margin-bottom:12px;overflow:hidden">';
    html += '<div style="width:' + barPct + '%;height:100%;background:linear-gradient(90deg,' + ec + ',' + cc + ');border-radius:4px;transition:width 1s"></div>';
    html += '</div>';

    // Privacy explanation
    html += '<div style="border-top:1px solid #21262d;padding-top:10px;margin-top:4px">';
    html += '<div style="color:#3fb950;font-weight:bold;font-size:11px;margin-bottom:6px">\ud83d\udd12 only you can see this</div>';
    html += '<div style="color:#8b949e;font-size:10px;line-height:1.5">';
    html += 'This panel is computed <b>entirely in your browser</b>. ';
    html += 'The server stores no cookies, no IP addresses, no fingerprints. ';
    html += 'Your session data lives in <code style="color:#58a6ff">sessionStorage</code> \u2014 ';
    html += 'it dies when you close this tab.<br><br>';
    html += 'The dots on the membrane are <b>anonymous aggregates</b> from server logs. ';
    html += 'Nobody \u2014 not us, not the chipmunk, not anyone \u2014 can tell which dot is you. ';
    html += 'Only your browser knows.<br><br>';
    html += '<span style="color:#c9d1d9">Trust comes from truth. We want privacy, not secrecy.</span><br>';
    html += 'You can verify: open DevTools \u2192 Application \u2192 Session Storage \u2192 <code style="color:#58a6ff">' + KEY + '</code>';
    html += '</div>';
    html += '</div>';

    // How it works
    html += '<div style="border-top:1px solid #21262d;padding-top:8px;margin-top:8px">';
    html += '<div style="color:#6e7681;font-size:10px;line-height:1.5">';
    html += '<b>How your epitope is classified:</b><br>';
    html += '\u2022 8+ pages \u2192 explorer<br>';
    html += '\u2022 30+ min dwell + 3 pages \u2192 reader<br>';
    html += '\u2022 3+ pages \u2192 investigator<br>';
    html += '\u2022 2+ pages \u2192 coder<br>';
    html += '\u2022 5+ min dwell \u2192 observer<br>';
    html += '\u2022 otherwise \u2192 visitor<br>';
    html += '<br><b>Your raw data (verify in console):</b><br>';
    html += '<code style="font-size:9px;color:#484f58">' + JSON.stringify(self).substring(0, 200) + '...</code>';
    html += '</div></div>';

    panel.innerHTML = html;
  }

  function show() {
    var self = observe();
    renderPanel(self);
    panel.style.display = 'block';
  }

  function hide() {
    if (panel) panel.style.display = 'none';
  }

  // Run observation on every page load
  observe();

  // Expose for the chipmunk
  window._youAreHere = { show: show, hide: hide, observe: observe, getSelf: getSelf };
})();
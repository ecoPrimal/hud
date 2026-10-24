// moon-localizer.js — the Moon is OUR localizer
//
// Instead of IP geolocation or GPS, we use the Moon.
// The Moon's sub-lunar point (where it's directly overhead on Earth)
// drifts across the planet. From 384,400 km up, you see REGIONS, not houses.
// The user's timezone gives approximate longitude (±15°).
// The Moon's declination oscillates ±28.5° latitude over its orbit.
// When the Moon is roughly "over" the user's region: "go see."
//
// Privacy: NO geolocation API. NO IP lookup. Just timezone offset + astronomy.
// Resolution: continental at best. The point is to be CLOSE ENOUGH
// that the user thinks "hey is that my area?" and can verify by going outside.
//
// The Moon is the shared reference frame:
//   - the digital membrane sees it (computed)
//   - the human sees it (look up)
//   - they're looking at the SAME thing from opposite sides
//
// scyBorg triple license. AGPL + ORC + CC-BY-SA.
(function() {
  'use strict';

  var PI = Math.PI, TWO_PI = PI * 2;
  var DEG = PI / 180;
  var RAD = 180 / PI;

  // ═══ MOON POSITION (ecliptic → equatorial → sub-lunar point) ═══
  // Simplified lunar position from Meeus Ch. 47
  function moonPosition(date) {
    var d = date || new Date();
    // Julian centuries from J2000.0
    var JD = julianDay(d);
    var T = (JD - 2451545.0) / 36525;

    // Moon's mean longitude (L')
    var Lp = mod360(218.3165 + 481267.8813 * T);
    // Mean anomaly of Moon (M')
    var Mp = mod360(134.9634 + 477198.8676 * T);
    // Mean anomaly of Sun (M)
    var M  = mod360(357.5291 + 35999.0503 * T);
    // Moon's argument of latitude (F)
    var F  = mod360(93.2720 + 483202.0175 * T);
    // Mean elongation of Moon (D)
    var D  = mod360(297.8502 + 445267.1115 * T);

    // Longitude corrections (simplified — main terms only)
    var dL = 6.289 * Math.sin(Mp * DEG)
           + 1.274 * Math.sin((2*D - Mp) * DEG)
           + 0.658 * Math.sin(2*D * DEG)
           + 0.214 * Math.sin(2*Mp * DEG)
           - 0.186 * Math.sin(M * DEG)
           - 0.114 * Math.sin(2*F * DEG);

    // Latitude corrections
    var dB = 5.128 * Math.sin(F * DEG)
           + 0.281 * Math.sin((Mp + F) * DEG)
           + 0.278 * Math.sin((Mp - F) * DEG)
           + 0.173 * Math.sin((2*D - F) * DEG);

    // Ecliptic coordinates
    var eclipLon = (Lp + dL) * DEG;
    var eclipLat = dB * DEG;

    // Obliquity of ecliptic
    var eps = (23.4393 - 0.0130 * T) * DEG;

    // Equatorial coordinates (RA, Dec)
    var sinDec = Math.sin(eclipLat) * Math.cos(eps) +
                 Math.cos(eclipLat) * Math.sin(eps) * Math.sin(eclipLon);
    var dec = Math.asin(sinDec);
    var ra = Math.atan2(
      Math.sin(eclipLon) * Math.cos(eps) - Math.tan(eclipLat) * Math.sin(eps),
      Math.cos(eclipLon)
    );
    if (ra < 0) ra += TWO_PI;

    // Greenwich Sidereal Time
    var GST = greenwichSiderealTime(JD);

    // Sub-lunar point: where the Moon is directly overhead
    var subLunarLat = dec * RAD;
    var subLunarLon = mod180((ra * RAD) - GST);

    return {
      ra: ra * RAD,
      dec: dec * RAD,
      eclipLon: (Lp + dL) % 360,
      eclipLat: dB,
      subLunarLat: subLunarLat,
      subLunarLon: subLunarLon,
      gst: GST,
    };
  }

  function julianDay(d) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
    var h = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
    if (m <= 2) { y--; m += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + h / 24 + B - 1524.5;
  }

  function greenwichSiderealTime(JD) {
    var T = (JD - 2451545.0) / 36525;
    var GST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T;
    return ((GST % 360) + 360) % 360;
  }

  function mod360(x) { return ((x % 360) + 360) % 360; }
  function mod180(x) { var v = ((x % 360) + 360) % 360; return v > 180 ? v - 360 : v; }

  // ═══ USER REGION — from timezone only, no geolocation ═══
  function estimateUserRegion() {
    var offset = new Date().getTimezoneOffset(); // minutes, negative = east of GMT
    var approxLon = -offset / 4; // 1 timezone = ~15° longitude, offset in minutes
    // Latitude: we DON'T know it. Assume temperate band (30-55° based on internet demographics)
    // This is intentionally fuzzy — continental resolution only
    var approxLat = 42; // default mid-latitude (close enough for most internet users)

    // Refine hemisphere from Intl if available
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch(e) {}

    var region = 'somewhere';
    var hemisphere = 'N';

    // Very rough region from timezone name — never an address, just a continent
    if (tz.includes('America')) { region = 'Americas'; approxLat = 40; }
    else if (tz.includes('Europe')) { region = 'Europe'; approxLat = 50; }
    else if (tz.includes('Asia')) { region = 'Asia'; approxLat = 35; }
    else if (tz.includes('Africa')) { region = 'Africa'; approxLat = 10; }
    else if (tz.includes('Australia')) { region = 'Oceania'; approxLat = -30; hemisphere = 'S'; }
    else if (tz.includes('Pacific')) { region = 'Pacific'; approxLat = -10; hemisphere = 'S'; }
    else if (tz.includes('Indian')) { region = 'Indian Ocean'; approxLat = 10; }
    else if (tz.includes('Atlantic')) { region = 'Atlantic'; approxLat = 30; }

    // Specific sub-regions from TZ (still city-level at best, never an address)
    if (tz.includes('New_York') || tz.includes('Detroit') || tz.includes('Chicago')) {
      region = 'Great Lakes';
      approxLat = 42;
    } else if (tz.includes('Los_Angeles') || tz.includes('Denver')) {
      region = 'Western Americas';
      approxLat = 37;
    } else if (tz.includes('London') || tz.includes('Paris') || tz.includes('Berlin')) {
      region = 'Western Europe';
      approxLat = 51;
    } else if (tz.includes('Tokyo') || tz.includes('Shanghai') || tz.includes('Seoul')) {
      region = 'East Asia';
      approxLat = 36;
    } else if (tz.includes('Sao_Paulo') || tz.includes('Buenos_Aires')) {
      region = 'South America';
      approxLat = -23;
      hemisphere = 'S';
    }

    return {
      lat: approxLat,
      lon: approxLon,
      region: region,
      hemisphere: hemisphere,
      tz: tz,
      fuzz: 15, // ±15° uncertainty radius — intentional
    };
  }

  // ═══ ANGULAR SEPARATION — how "close" is the Moon to user's region? ═══
  function angularSep(lat1, lon1, lat2, lon2) {
    var dLat = (lat2 - lat1) * DEG;
    var dLon = (lon2 - lon1) * DEG;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * RAD;
  }

  // ═══ MINI EARTH DISC — the Moon's view looking down ═══
  function renderLocalizer() {
    var now = new Date();
    var moon = moonPosition(now);
    var user = estimateUserRegion();
    var sep = angularSep(moon.subLunarLat, moon.subLunarLon, user.lat, user.lon);

    // Phase (reuse celestial clock if available)
    var phase = null;
    if (window._celestialClock) {
      phase = window._celestialClock.moonPhase(now);
    } else {
      // Minimal phase calc
      var synodic = 29.53058770576;
      var JD = julianDay(now);
      var daysSinceNew = JD - 2451550.26;
      var frac = ((daysSinceNew % synodic) + synodic) % synodic / synodic;
      phase = { fraction: frac, illumination: (1 - Math.cos(frac * TWO_PI)) / 2,
                emoji: frac < 0.25 ? '\u{1F312}' : frac < 0.5 ? '\u{1F314}' : frac < 0.75 ? '\u{1F316}' : '\u{1F318}' };
    }

    // Proximity tiers
    var proximity, proxyColor, proxyMsg;
    if (sep < 15) {
      proximity = 'overhead';
      proxyColor = '#3fb950';
      proxyMsg = 'the Moon is looking at your region right now. go see.';
    } else if (sep < 40) {
      proximity = 'near';
      proxyColor = '#58a6ff';
      proxyMsg = 'the Moon is nearby — ' + sep.toFixed(0) + '° away from your sky.';
    } else if (sep < 90) {
      proximity = 'horizon';
      proxyColor = '#d29922';
      proxyMsg = 'the Moon is low — ' + sep.toFixed(0) + '° from your zenith.';
    } else {
      proximity = 'far';
      proxyColor = '#6e7681';
      proxyMsg = 'the Moon is on the other side — ' + sep.toFixed(0) + '° away. wait.';
    }

    // Is the Moon above the user's horizon?
    var moonAlt = 90 - sep; // simplified — positive = above horizon
    var visible = moonAlt > 0;

    // ── Build the mini Earth disc (80×80 SVG) ──
    var R = 34; // earth radius in SVG units
    var cx = 40, cy = 40;

    // Project sub-lunar point onto disc (orthographic from Moon's POV)
    var mLat = moon.subLunarLat * DEG;
    var mLon = moon.subLunarLon * DEG;
    var uLat = user.lat * DEG;
    var uLon = user.lon * DEG;

    // Center the projection on the sub-lunar point
    var projCenterLat = mLat, projCenterLon = mLon;

    // Project user's region onto the disc
    var dLon = uLon - projCenterLon;
    var ux = R * Math.cos(uLat) * Math.sin(dLon);
    var uy = R * (Math.cos(projCenterLat) * Math.sin(uLat) -
                  Math.sin(projCenterLat) * Math.cos(uLat) * Math.cos(dLon));
    var onFrontSide = Math.sin(projCenterLat) * Math.sin(uLat) +
                      Math.cos(projCenterLat) * Math.cos(uLat) * Math.cos(dLon);

    var svg = [];
    svg.push('<svg viewBox="0 0 80 80" width="80" height="80" style="display:block;margin:0 auto">');

    // Earth disc
    svg.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#0d1117" stroke="#21262d" stroke-width="1"/>');

    // Terminator (night side) — approximate from Moon's perspective
    svg.push('<path d="M ' + cx + ' ' + (cy - R) + ' A ' + R + ' ' + R + ' 0 0 1 ' + cx + ' ' + (cy + R) +
             ' A ' + (R * 0.3) + ' ' + R + ' 0 0 0 ' + cx + ' ' + (cy - R) + '" fill="rgba(0,0,0,0.3)"/>');

    // Sub-lunar point (where the Moon looks directly)
    svg.push('<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + proxyColor + '" opacity="0.7">');
    svg.push('<animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/>');
    svg.push('</circle>');
    svg.push('<circle cx="' + cx + '" cy="' + cy + '" r="1.5" fill="#e6edf3"/>');

    // User's fuzzy region (only if on the visible side)
    if (onFrontSide > 0) {
      var userX = cx + ux;
      var userY = cy - uy; // flip Y
      // Fuzz circle — intentionally large (15° ≈ ~1670km on Earth)
      var fuzzR = R * Math.sin(user.fuzz * DEG);
      svg.push('<circle cx="' + userX.toFixed(1) + '" cy="' + userY.toFixed(1) + '" r="' + fuzzR.toFixed(1) + '" fill="' + proxyColor + '" opacity="0.1" stroke="' + proxyColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>');
      svg.push('<text x="' + userX.toFixed(1) + '" y="' + (userY + 2).toFixed(1) + '" text-anchor="middle" fill="' + proxyColor + '" font-size="5" font-family="monospace" opacity="0.8">you?</text>');
    }

    // Latitude lines
    for (var lat = -60; lat <= 60; lat += 30) {
      var ly = cy - R * Math.sin(lat * DEG) * Math.cos(0); // simplified
      if (Math.abs(ly - cy) < R) {
        var halfW = Math.sqrt(R*R - (ly-cy)*(ly-cy));
        svg.push('<line x1="' + (cx - halfW).toFixed(1) + '" y1="' + ly.toFixed(1) + '" x2="' + (cx + halfW).toFixed(1) + '" y2="' + ly.toFixed(1) + '" stroke="#21262d" stroke-width="0.3"/>');
      }
    }

    svg.push('</svg>');

    // ── Build panel HTML ──
    var panel = document.getElementById('moon-localizer');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'moon-localizer';
      panel.style.cssText = 'position:fixed;top:50%;right:var(--rail-r,20px);transform:translateY(-50%);z-index:6;' +
        'background:rgba(13,17,23,0.94);backdrop-filter:blur(10px);' +
        'border:1px solid rgba(88,166,255,0.15);border-radius:10px;' +
        'padding:8px;width:120px;font:9px "SF Mono",monospace;color:#8b949e;' +
        'pointer-events:auto;display:none;transition:opacity 0.6s;';
      document.body.appendChild(panel);
    }

    var html = [];
    html.push(svg.join(''));
    html.push('<div style="text-align:center;margin-top:4px">');
    html.push('<div style="color:' + proxyColor + ';font-size:10px">' + (phase ? phase.emoji : '🌙') + ' ' + proximity + '</div>');
    html.push('<div style="font-size:8px;color:#6e7681;margin-top:2px">' + user.region + '</div>');
    html.push('<div style="font-size:8px;margin-top:3px;line-height:1.4;color:' + proxyColor + '">' + proxyMsg + '</div>');

    // Sub-lunar coordinates (the Moon's ground truth — public data)
    html.push('<div style="font-size:7px;color:#30363d;margin-top:4px">');
    html.push('sub-lunar: ' + moon.subLunarLat.toFixed(1) + '°' + (moon.subLunarLat >= 0 ? 'N' : 'S'));
    html.push(' ' + Math.abs(moon.subLunarLon).toFixed(1) + '°' + (moon.subLunarLon >= 0 ? 'E' : 'W'));
    html.push('<br>sep: ' + sep.toFixed(1) + '° · alt: ' + moonAlt.toFixed(0) + '°');
    html.push('<br>visible: ' + (visible ? 'yes — look up' : 'below horizon'));
    html.push('</div>');

    html.push('</div>');
    panel.innerHTML = html.join('');

    // Expose for other modules
    window._moonLocalizer = {
      moon: moon,
      user: user,
      separation: sep,
      proximity: proximity,
      visible: visible,
      moonAlt: moonAlt,
    };
  }

  // ═══ TOGGLE BUTTON ═══
  function createToggle() {
    if (document.getElementById('moon-loc-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'moon-loc-toggle';
    btn.innerHTML = '🌙';
    btn.title = 'Moon localizer — where is the Moon relative to you?';
    btn.style.cssText = 'position:fixed;top:50%;right:var(--rail-r,20px);transform:translateY(-50%);z-index:7;' +
      'background:rgba(22,27,34,.9);border:1px solid rgba(88,166,255,.3);' +
      'color:#58a6ff;padding:6px 10px;border-radius:20px;cursor:pointer;' +
      'font-size:14px;font-family:monospace;transition:opacity 0.3s;';
    btn.onclick = function() {
      var panel = document.getElementById('moon-localizer');
      if (!panel) {
        renderLocalizer();
        panel = document.getElementById('moon-localizer');
      }
      if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
        btn.style.display = 'none';
        renderLocalizer();
      } else {
        panel.style.display = 'none';
        btn.style.display = '';
      }
    };
    document.body.appendChild(btn);
  }

  // Close on click outside
  document.addEventListener('click', function(e) {
    var panel = document.getElementById('moon-localizer');
    var btn = document.getElementById('moon-loc-toggle');
    if (panel && panel.style.display === 'block' &&
        !panel.contains(e.target) && e.target !== btn) {
      panel.style.display = 'none';
      if (btn) btn.style.display = '';
    }
  });

  // ═══ STYLE ═══
  var s = document.createElement('style');
  s.textContent = '#moon-localizer svg{filter:drop-shadow(0 0 4px rgba(88,166,255,0.15))}';
  document.head.appendChild(s);

  // ═══ INIT ═══
  function boot() {
    createToggle();
    // Auto-update every 60s
    setInterval(function() {
      var panel = document.getElementById('moon-localizer');
      if (panel && panel.style.display === 'block') renderLocalizer();
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 1800);
  }
})();

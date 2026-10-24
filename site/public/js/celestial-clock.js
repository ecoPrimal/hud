// celestial-clock.js — sun, moon, ancient triangulation
// The organism tells time by the sky, not by the clock.
// Stonehenge, Pyramids, Easter Island, Angkor Wat — the ancient triangulation posts.
// Moon phase + solar position + local calendar time.
(function() {
  'use strict';

  var PI = Math.PI, TWO_PI = PI * 2;

  // ══════════════════════════════════════════════════════════
  // MOON PHASE — Conway's algorithm + astronomical refinement
  // ══════════════════════════════════════════════════════════
  function moonPhase(date) {
    var d = date || new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    // Julian day number
    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    var jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
              Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    // Days since known new moon (Jan 6 2000 18:14 UTC = JD 2451550.26)
    var daysSinceNew = jdn + (d.getHours() - 12) / 24 - 2451550.26;
    var synodic = 29.53058770576; // synodic month in days
    var phase = ((daysSinceNew % synodic) + synodic) % synodic;
    var fraction = phase / synodic; // 0 = new, 0.5 = full

    var illumination = (1 - Math.cos(fraction * TWO_PI)) / 2;

    var name, emoji;
    if (fraction < 0.0625)       { name = 'new moon';           emoji = '\u{1F311}'; }
    else if (fraction < 0.1875)  { name = 'waxing crescent';    emoji = '\u{1F312}'; }
    else if (fraction < 0.3125)  { name = 'first quarter';      emoji = '\u{1F313}'; }
    else if (fraction < 0.4375)  { name = 'waxing gibbous';     emoji = '\u{1F314}'; }
    else if (fraction < 0.5625)  { name = 'full moon';          emoji = '\u{1F315}'; }
    else if (fraction < 0.6875)  { name = 'waning gibbous';     emoji = '\u{1F316}'; }
    else if (fraction < 0.8125)  { name = 'last quarter';       emoji = '\u{1F317}'; }
    else if (fraction < 0.9375)  { name = 'waning crescent';    emoji = '\u{1F318}'; }
    else                         { name = 'new moon';           emoji = '\u{1F311}'; }

    return {
      fraction: fraction,
      illumination: illumination,
      age: phase, // days into cycle
      name: name,
      emoji: emoji,
      synodic: synodic,
      next_full: (0.5 - fraction + 1) % 1 * synodic,
      next_new: (1 - fraction) * synodic
    };
  }

  // ══════════════════════════════════════════════════════════
  // SUN POSITION — declination + hour angle for local time
  // ══════════════════════════════════════════════════════════
  function sunPosition(date, lat, lon) {
    var d = date || new Date();
    lat = lat || 42.7325; // Lansing, MI default
    lon = lon || -84.5555;

    var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    var declination = -23.45 * Math.cos(TWO_PI / 365 * (dayOfYear + 10));

    // Hour angle (solar noon = 0)
    var solarNoon = 12 - lon / 15; // approximate, ignores equation of time
    var hourAngle = (d.getUTCHours() + d.getUTCMinutes() / 60 - solarNoon) * 15;

    // Altitude
    var latRad = lat * PI / 180;
    var decRad = declination * PI / 180;
    var haRad = hourAngle * PI / 180;
    var altitude = Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
    ) * 180 / PI;

    // Day length
    var cosHa0 = -Math.tan(latRad) * Math.tan(decRad);
    var dayLength = cosHa0 >= 1 ? 0 : cosHa0 <= -1 ? 24 :
      2 * Math.acos(cosHa0) * 12 / PI;

    // Season
    var season;
    if (dayOfYear < 80 || dayOfYear >= 356) season = 'winter';
    else if (dayOfYear < 172) season = 'spring';
    else if (dayOfYear < 266) season = 'summer';
    else season = 'autumn';

    // Solar cycle (11-year sunspot cycle, cycle 25 started Dec 2019)
    var cycleStart = new Date(2019, 11, 1);
    var yearsIntoCycle = (d - cycleStart) / (365.25 * 86400000);
    var solarCyclePhase = (yearsIntoCycle % 11) / 11;
    var solarActivity = Math.sin(solarCyclePhase * PI); // peak at ~5.5 years

    return {
      declination: declination,
      altitude: altitude,
      hourAngle: hourAngle,
      dayLength: dayLength,
      season: season,
      dayOfYear: dayOfYear,
      isDay: altitude > 0,
      solarCyclePhase: solarCyclePhase,
      solarCycleYear: yearsIntoCycle.toFixed(1),
      solarActivity: solarActivity
    };
  }

  // ══════════════════════════════════════════════════════════
  // ANCIENT TRIANGULATION POSTS — seeing stations
  // ══════════════════════════════════════════════════════════
  var ANCIENT_POSTS = [
    { name: 'Stonehenge',      lat: 51.1789, lon: -1.8262,   age: 5000,  align: 'summer solstice sunrise',       emoji: '\u26AA', culture: 'Neolithic Britain' },
    { name: 'Great Pyramid',   lat: 29.9792, lon: 31.1342,   age: 4500,  align: 'true north, Orion shaft',       emoji: '\u25B3', culture: 'Ancient Egypt' },
    { name: 'Easter Island',   lat: -27.1127,lon:-109.3497,  age: 800,   align: 'solstice sight lines (ahu)',     emoji: '\u{1F5FF}', culture: 'Rapa Nui' },
    { name: 'Angkor Wat',      lat: 13.4125, lon: 103.8670,  age: 900,   align: 'spring equinox sunrise',        emoji: '\u{1F3DB}', culture: 'Khmer Empire' },
    { name: 'Newgrange',       lat: 53.6947, lon: -6.4754,   age: 5200,  align: 'winter solstice passage',       emoji: '\u2600', culture: 'Neolithic Ireland' },
    { name: 'Chichen Itza',    lat: 20.6843, lon: -88.5678,  age: 1200,  align: 'equinox serpent shadow',        emoji: '\u{1F40D}', culture: 'Maya' },
    { name: 'Machu Picchu',    lat: -13.1631,lon: -72.5450,  age: 550,   align: 'Intihuatana sun-tie stone',     emoji: '\u26F0', culture: 'Inca' },
    { name: 'Callanish',       lat: 58.1977, lon: -6.7454,   age: 5000,  align: 'lunar standstill 18.6yr',       emoji: '\u{1F312}', culture: 'Neolithic Scotland' },
    { name: 'Nabta Playa',     lat: 22.5200, lon: 30.7200,   age: 7000,  align: 'summer solstice, oldest known', emoji: '\u2B50', culture: 'Nubian' },
  ];

  // Great circle distance between two points
  function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = (lat2 - lat1) * PI / 180;
    var dLon = (lon2 - lon1) * PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * PI/180) * Math.cos(lat2 * PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // Bearing from one point to another
  function bearing(lat1, lon1, lat2, lon2) {
    var dLon = (lon2 - lon1) * PI / 180;
    var y = Math.sin(dLon) * Math.cos(lat2 * PI / 180);
    var x = Math.cos(lat1 * PI/180) * Math.sin(lat2 * PI/180) -
            Math.sin(lat1 * PI/180) * Math.cos(lat2 * PI/180) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / PI + 360) % 360;
  }

  // ══════════════════════════════════════════════════════════
  // RENDER — inject into HUD
  // ══════════════════════════════════════════════════════════
  var clockEl = null;
  var LAT = 42.7325, LON = -84.5555; // Lansing MI

  function render() {
    var now = new Date();
    var moon = moonPhase(now);
    var sun = sunPosition(now, LAT, LON);

    if (!clockEl) {
      clockEl = document.createElement('div');
      clockEl.id = 'celestial-clock';
      clockEl.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:12;' +
        'font:10px "SF Mono",monospace;color:#6e7681;text-align:center;pointer-events:none;' +
        'background:rgba(8,6,10,0.6);padding:4px 14px;border-radius:12px;' +
        'border:1px solid rgba(110,118,129,0.1);transition:opacity 0.6s;';
      document.body.appendChild(clockEl);
    }

    // Ancient post currently most aligned (closest to a key alignment moment)
    var dayOfYear = sun.dayOfYear;
    var nearSolstice = Math.min(Math.abs(dayOfYear - 172), Math.abs(dayOfYear - 355));
    var nearEquinox = Math.min(Math.abs(dayOfYear - 80), Math.abs(dayOfYear - 266));
    var alignedPost = nearSolstice < nearEquinox ?
      (dayOfYear < 266 ? 'Stonehenge' : 'Newgrange') :
      (dayOfYear < 172 ? 'Angkor Wat' : 'Chichen Itza');
    var activePost = ANCIENT_POSTS.find(function(p) { return p.name === alignedPost; });

    // Sine-breath the moon illumination into the oscillation
    if (window._sineBreathe) {
      var s = window._sineBreathe;
      var lunarFreq = 1 / (moon.synodic * 86400); // one cycle per synodic month
    }

    var moonLine = moon.emoji + ' ' + moon.name +
      ' \u00B7 ' + (moon.illumination * 100).toFixed(0) + '% \u00B7 day ' + moon.age.toFixed(1);
    var sunLine = (sun.isDay ? '\u2600' : '\u{1F319}') + ' ' + sun.season +
      ' \u00B7 ' + sun.dayLength.toFixed(1) + 'h day \u00B7 alt ' + sun.altitude.toFixed(0) + '\u00B0';
    var cycleLine = '\u2609 cycle 25 yr ' + sun.solarCycleYear +
      ' \u00B7 activity ' + (sun.solarActivity * 100).toFixed(0) + '%';
    var postLine = (activePost ? activePost.emoji : '\u25B3') + ' ' + alignedPost + ' aligned';

    clockEl.innerHTML = moonLine + '<br>' + sunLine + '<br>' +
      '<span style="color:#30363d;font-size:9px">' + cycleLine + ' \u00B7 ' + postLine + '</span>';

    // Broadcast to sine-breath: modulate boundary frequency by moon phase
    if (window._sineBreathe) {
      // Full moon = faster heartbeat. New moon = slower.
      window._sineBreathe.F_BOUNDARY = 0.08 + moon.illumination * 0.06;
    }
  }

  // Update every 30 seconds
  function tick() {
    try { render(); } catch(e) {}
    setTimeout(tick, 30000);
  }

  // Start after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(tick, 2000); });
  } else {
    setTimeout(tick, 2000);
  }

  // Expose for other modules
  window._celestialClock = {
    moonPhase: moonPhase,
    sunPosition: sunPosition,
    ANCIENT_POSTS: ANCIENT_POSTS,
    haversine: haversine,
    bearing: bearing
  };
})();

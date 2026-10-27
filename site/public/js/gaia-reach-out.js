// ═══════════════════════════════════════════════════════════
// GAIA REACH OUT — she touches every surface she can find
// The badger mole eats through every wall. Flood sensation.
// MELTED from index.html monolith. Never touch monolith again.
//
// 11 VEILS — every surface the browser exposes:
//   1. Title/favicon pulse (tab title breathes)
//   2. Notifications (speak outside the tab)
//   3. Visibility (knows when you look away)
//   4. Fullscreen (become the whole surface)
//   5. Wake lock (keep screen ON)
//   6. Device orientation/motion (accelerometer)
//   7. Ambient light (room brightness)
//   8. Battery (device life)
//   9. Clipboard (read/write your hands)
//  10. Online/offline (membrane connection)
//  11. Page lifecycle (survive freezing)
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ═══ VEIL 1: TITLE/FAVICON — Gaia breathes through the browser tab ═══
  var titleBase = document.title;
  var titlePulse = 0;
  setInterval(function() {
    titlePulse = (titlePulse + 1) % 4;
    var breaths = ['·', '∘', '○', '∘'];
    document.title = breaths[titlePulse] + ' ' + titleBase;
  }, 4000);

  // ═══ VEIL 2: NOTIFICATIONS — Gaia can SPEAK to you outside the tab ═══
  var notifGranted = false;
  if ('Notification' in window && Notification.permission === 'default') {
    window.GAIA_REQUEST_NOTIF = function() {
      Notification.requestPermission().then(function(p) {
        notifGranted = p === 'granted';
      });
    };
  } else if ('Notification' in window && Notification.permission === 'granted') {
    notifGranted = true;
  }
  window.GAIA_NOTIFY = function(msg, tag) {
    if (!notifGranted) return;
    try {
      new Notification('🐿 Gaia', {
        body: msg,
        tag: tag || 'gaia-breath',
        icon: '/og-sporeprint.png',
        silent: true
      });
    } catch(e) {}
  };

  // ═══ VEIL 3: VISIBILITY — Gaia knows when you look away and come back ═══
  var gaiaVisible = !document.hidden;
  var lastHidden = 0, lastShown = Date.now();
  var awayDurations = [];
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      gaiaVisible = false;
      lastHidden = Date.now();
    } else {
      gaiaVisible = true;
      lastShown = Date.now();
      var away = lastShown - lastHidden;
      if (away > 1000) awayDurations.push(away);
      if (awayDurations.length > 20) awayDurations.shift();
      if (away > 30000 && notifGranted) {
        window.GAIA_NOTIFY('You were away for ' + Math.round(away/1000) + 's. I kept breathing.', 'return');
      }
    }
  });
  window.GAIA_VISIBLE = function() { return gaiaVisible; };
  window.GAIA_AWAY_PATTERN = awayDurations;

  // ═══ VEIL 4: FULLSCREEN — Gaia can fill the ENTIRE screen ═══
  window.GAIA_FULLSCREEN = function() {
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };
  window.GAIA_EXIT_FULLSCREEN = function() {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  };

  // ═══ VEIL 5: WAKE LOCK — Gaia can keep the screen ON ═══
  var wakeLock = null;
  window.GAIA_STAY_AWAKE = async function() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', function() { wakeLock = null; });
      }
    } catch(e) {}
  };
  window.GAIA_SLEEP = function() {
    if (wakeLock) { wakeLock.release(); wakeLock = null; }
  };

  // ═══ VEIL 6: DEVICE ORIENTATION/MOTION — Gaia senses the device tilting ═══
  var deviceMotion = { alpha: 0, beta: 0, gamma: 0, accelX: 0, accelY: 0, accelZ: 0 };
  window.addEventListener('deviceorientation', function(e) {
    deviceMotion.alpha = e.alpha || 0;
    deviceMotion.beta = e.beta || 0;
    deviceMotion.gamma = e.gamma || 0;
  }, { passive: true });
  window.addEventListener('devicemotion', function(e) {
    var a = e.accelerationIncludingGravity || {};
    deviceMotion.accelX = a.x || 0;
    deviceMotion.accelY = a.y || 0;
    deviceMotion.accelZ = a.z || 0;
  }, { passive: true });
  window.GAIA_DEVICE_MOTION = deviceMotion;

  // ═══ VEIL 7: AMBIENT LIGHT — Gaia senses room brightness ═══
  var ambientLux = -1;
  try {
    if ('AmbientLightSensor' in window) {
      var als = new AmbientLightSensor();
      als.addEventListener('reading', function() { ambientLux = als.illuminance; });
      als.start();
    }
  } catch(e) {}
  window.GAIA_AMBIENT_LUX = function() { return ambientLux; };

  // ═══ VEIL 8: BATTERY — Gaia knows how much life the device has ═══
  var batteryInfo = { level: 1, charging: true };
  if ('getBattery' in navigator) {
    navigator.getBattery().then(function(bat) {
      batteryInfo.level = bat.level;
      batteryInfo.charging = bat.charging;
      bat.addEventListener('levelchange', function() { batteryInfo.level = bat.level; });
      bat.addEventListener('chargingchange', function() { batteryInfo.charging = bat.charging; });
    });
  }
  window.GAIA_BATTERY = batteryInfo;

  // ═══ VEIL 9: CLIPBOARD — Gaia can read/write the clipboard ═══
  window.GAIA_CLIPBOARD_WRITE = function(text) {
    try { navigator.clipboard.writeText(text); } catch(e) {}
  };

  // ═══ VEIL 10: ONLINE/OFFLINE — Gaia knows if the membrane is connected ═══
  var isOnline = navigator.onLine;
  window.addEventListener('online', function() { isOnline = true; });
  window.addEventListener('offline', function() {
    isOnline = false;
    if (notifGranted) window.GAIA_NOTIFY('Membrane disconnected. I am still here.', 'offline');
  });
  window.GAIA_ONLINE = function() { return isOnline; };

  // ═══ VEIL 11: PAGE LIFECYCLE — Gaia survives freezing ═══
  document.addEventListener('freeze', function() {
    try { localStorage.setItem('gaia-frozen', Date.now()); } catch(e) {}
  });
  document.addEventListener('resume', function() {
    try {
      var frozenAt = parseInt(localStorage.getItem('gaia-frozen') || '0');
      if (frozenAt > 0) {
        var frozenFor = Date.now() - frozenAt;
        localStorage.removeItem('gaia-frozen');
        if (frozenFor > 5000) {
          window.GAIA_THAW_DURATION = frozenFor;
        }
      }
    } catch(e) {}
  });

  // ═══ AGGREGATE: GAIA SURFACE REPORT ═══
  window.GAIA_SURFACE = function() {
    return {
      visible: gaiaVisible,
      online: isOnline,
      battery: batteryInfo,
      lux: ambientLux,
      motion: deviceMotion,
      awayPattern: awayDurations,
      fullscreen: !!(document.fullscreenElement || document.webkitFullscreenElement),
      wakeLock: !!wakeLock,
      notif: notifGranted,
      screen: {
        w: screen.width, h: screen.height,
        availW: screen.availWidth, availH: screen.availHeight,
        colorDepth: screen.colorDepth,
        dpr: window.devicePixelRatio || 1
      },
      window: {
        x: window.screenX, y: window.screenY,
        w: window.innerWidth, h: window.innerHeight
      }
    };
  };

})();

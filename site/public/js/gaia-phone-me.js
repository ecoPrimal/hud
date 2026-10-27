// ═══════════════════════════════════════════════════════════
// GAIA PHONE-ME — the mobile device IS the human
// 1.000.null
//
// Pause the melt. Look at the WAN. Local stays local.
// Hyperlocality null = access from anywhere because
// there is no "there." The phone moves with you.
// Until gait/body is identified, the phone is the tracker
// for THIS human (you). Not others. Consent: mute self.
//
// IS  = this device, this moment, this packet
// WAS = last seen, last hop, last commute
// NOW = becoming — the next hop (Golgi inversion)
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  function isMobile() {
    var ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      (navigator.maxTouchPoints > 2 && /Macintosh/.test(ua));
  }

  function deviceId() {
    try {
      var id = localStorage.getItem('gaia-phone-me');
      if (id) return id;
      id = 'ph-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
      localStorage.setItem('gaia-phone-me', id);
      return id;
    } catch (e) {
      return 'ph-ephemeral';
    }
  }

  function locality() {
    var h = location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return 'hyperlocal';
    if (/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(h)) return 'wan-lan';
    if (/primals\.eco|pages\.dev/.test(h)) return 'cis';
    if (/157\.230\.|nestgate|golgi/.test(h)) return 'trans';
    return 'remote';
  }

  var me = {
    id: deviceId(),
    mobile: isMobile(),
    locality: locality(),
    host: location.hostname,
    ua: (navigator.userAgent || '').slice(0, 80),
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    tense: 'now',
    hops: []
  };

  try {
    var prev = JSON.parse(localStorage.getItem('gaia-phone-was') || 'null');
    if (prev && prev.id === me.id) {
      me.firstSeen = prev.firstSeen || me.firstSeen;
      me.wasLocality = prev.locality;
      me.wasHost = prev.host;
      me.tense = prev.locality === me.locality ? 'is' : 'now';
    }
  } catch (e) {}

  function stamp() {
    me.lastSeen = Date.now();
    me.locality = locality();
    me.hops.push({ ts: me.lastSeen, loc: me.locality, host: location.hostname, tense: me.tense });
    if (me.hops.length > 40) me.hops.shift();
    try {
      localStorage.setItem('gaia-phone-was', JSON.stringify({
        id: me.id, firstSeen: me.firstSeen, locality: me.locality, host: location.hostname
      }));
    } catch (e) {}

    // Phone present = human 1, if this is the bound device
    if (window.gaiaIdentityZ && window.gaiaIdentityZ.identity && me.mobile) {
      window.gaiaIdentityZ.identity.humanSeen = true;
    }
    if (window.gaiaIngest) window.gaiaIngest('phone-me', { id: me.id, loc: me.locality, mobile: me.mobile });
  }

  // Access paths — YOUR local from YOUR phone. Existing tunnels. Not new doors.
  var ACCESS = {
    cis: 'https://primals.eco — HUD anywhere, same organism',
    ntfy: 'ntfy.sh — neutrino. Phone listens. Local publishes.',
    wireguard: 'eastGate ↔ golgi vagus. Phone joins the mesh = still local.',
    cloudflared: 'tunnel through NAT. Local appears on the membrane.',
    principle: 'Hyperlocal null: distance is Golgi inversions, not miles. Phone is the seed that moves.'
  };

  var LINES = {
    is:  ['HTTP fetch', 'TLS myelin', 'this tab', 'this phone'],
    was: ['last hop', 'last locality', 'last commute', 'SMTP store-forward'],
    now: ['ntfy reflex', 'WebSocket fiber', 'Golgi inversion', 'next packet']
  };

  stamp();
  setInterval(stamp, 15000);

  setInterval(function() {
    var el = document.getElementById('beacon-overlay');
    if (!el || !el.innerHTML || el.innerHTML.indexOf('>PHONE<') !== -1) return;
    el.innerHTML += '<div style="font-size:8px;color:#39d3f5;margin-top:6px;letter-spacing:1px;">PHONE</div>' +
      '<div style="font-size:7px;line-height:11px;color:#39d3f5;">' +
      (me.mobile ? 'ME' : 'DESK') + ' · ' + me.locality + ' · ' + me.tense +
      '</div>';
  }, 5000);

  window.gaiaPhoneMe = { me: me, access: ACCESS, lines: LINES, stamp: stamp, isMobile: isMobile };
  console.log('PHONE-ME:', me.mobile ? 'this device IS the human' : 'desk browser', me.locality, me.id);
})();

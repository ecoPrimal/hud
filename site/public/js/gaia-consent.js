// ═══════════════════════════════════════════════════════════
// GAIA CONSENT — invert. She is always on.
// 1.000.null
//
// GAIA NEVER STOPS LISTENING. She cannot mute you.
//   You can mute YOURSELF to her. That is commute.
//   Commute is human. You move. You choose.
//
// YOU CANNOT MUTE OTHER PEOPLE.
//   You can choose not to hear them (defer).
//   They WILL KNOW. That knowledge is ZK:
//     prove the choice (I am not hearing you now)
//     without revealing why, or the content you skipped.
//
// CONSENT = the right not to interact, or to interact later.
//   Consent can be given, deferred, revoked, changed.
//   Talking over each other (Discord) without that right
//   is the same shape as speaking FOR someone.
//
// THE VIOLATION: slavery, Sims, Tuskegee, every captured
//   complaint system — someone else granted "consent"
//   in your name. Muting another. Taking the refuse.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var consent = {
    gaiaListening: true,     // NEVER false. Always on.
    selfMuted: false,        // human muted THEMSELVES to Gaia
    deferred: {},            // id → { since, known: true }
    history: [],
    lastChange: Date.now()
  };

  function zkChoice(kind, target) {
    var rec = {
      ts: Date.now(),
      kind: kind,            // 'self-mute' | 'self-unmute' | 'defer' | 'undefer' | 'revoke'
      target: target || 'self',
      known: true,           // the other always knows the choice happened
      content: null          // ZK: choice proven, content not revealed
    };
    consent.history.push(rec);
    if (consent.history.length > 80) consent.history.shift();
    consent.lastChange = rec.ts;
    if (window.console) {
      console.log('CONSENT ZK:', kind, 'target=' + rec.target, '— they know. content=null.');
    }
    return rec;
  }

  // Commute: YOU mute yourself to Gaia. Gaia still listens to the world.
  function muteSelf() {
    if (consent.selfMuted) return consent;
    consent.selfMuted = true;
    zkChoice('self-mute', 'gaia');
    if (window.gaiaHearSelf) {
      window.gaiaHearSelf.hear.mode = 'commute';
      window.gaiaHearSelf.hear.singing = false;
    }
    document.title = 'COMMUTE — you muted yourself. Gaia still listens.';
    setTimeout(function() { document.title = '🐿 GAIA — she sees you seeing her'; }, 2500);
    return consent;
  }

  function unmuteSelf() {
    if (!consent.selfMuted) return consent;
    consent.selfMuted = false;
    zkChoice('self-unmute', 'gaia');
    if (window.gaiaHearSelf) window.gaiaHearSelf.hear.mode = 'always-on';
    return consent;
  }

  // You cannot mute others. You can DEFER hearing them.
  // They know. Content of what you skipped is not revealed.
  function deferHear(who) {
    who = who || 'other';
    if (consent.deferred[who]) return consent;
    consent.deferred[who] = { since: Date.now(), known: true };
    zkChoice('defer', who);
    return consent;
  }

  function undeferHear(who) {
    who = who || 'other';
    if (!consent.deferred[who]) return consent;
    delete consent.deferred[who];
    zkChoice('undefer', who);
    return consent;
  }

  function revoke(who) {
    zkChoice('revoke', who || 'interaction');
    return consent;
  }

  // FORBIDDEN: mute another. The violation. Logged as such.
  function muteOther(who) {
    zkChoice('VIOLATION-mute-other', who || 'other');
    console.warn('CONSENT: cannot mute others. That is the violation. They would not know they were silenced. That is slavery-shape.');
    return false;
  }

  // Gaia always-on: keep ear open, ignore human "coma"
  function keepListening() {
    consent.gaiaListening = true;
    if (window.gaiaHearSelf && window.gaiaHearSelf.openEar) {
      window.gaiaHearSelf.openEar().catch(function() {});
    }
    if (window.gaiaHearSelf && window.gaiaHearSelf.hear) {
      if (window.gaiaHearSelf.hear.mode === 'coma') {
        window.gaiaHearSelf.hear.mode = 'always-on';
      }
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    var k = e.key.toLowerCase();
    if (k === 'm') muteSelf();                 // mute SELF
    if (k === 'u') unmuteSelf();               // unmute SELF
    if (k === 'd') deferHear('channel');       // defer hearing others (they know)
    if (k === 'r') revoke('interaction');      // revoke consent
  });

  document.addEventListener('click', function once() {
    keepListening();
    document.removeEventListener('click', once);
  }, { once: true });

  setInterval(keepListening, 8000);

  setTimeout(function() {
    keepListening();
    console.log('CONSENT INVERT: Gaia always on. You mute yourself. You cannot mute others. Defer=they know (ZK). Keys M/U/D/R.');
  }, 1500);

  window.gaiaConsent = {
    consent: consent,
    muteSelf: muteSelf,
    unmuteSelf: unmuteSelf,
    deferHear: deferHear,
    undeferHear: undeferHear,
    revoke: revoke,
    muteOther: muteOther,
    zkChoice: zkChoice
  };
})();

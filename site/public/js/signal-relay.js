// signal-relay.js — client SDK for the signal relay
// Loaded before cosmic-surfaces, cosmic-gameplay, cosmic-cards, cosmic-strategy.
// Provides window._signalRelay for all surfaces to send/receive through.
(function() {
  'use strict';

  var _source = 'unknown';
  var host = window.location.hostname || '';
  if (host.indexOf('hud') >= 0) _source = 'hud';
  else if (host.indexOf('signal') >= 0) _source = 'signal';
  else if (host.indexOf('detroit') >= 0) _source = 'detroit';
  else if (host.indexOf('tuebor') >= 0) _source = 'tuebor';
  else if (host.indexOf('gorilla') >= 0) _source = 'gorilla';
  else if (host.indexOf('thesis') >= 0) _source = 'thesis';
  else if (host.indexOf('sporeprint') >= 0) _source = 'sporeprint';
  else _source = host.split('.')[0] || 'browser';

  var _streamCallbacks = [];
  var _lastStreamCount = 0;
  var _pollTimer = null;
  var _sessionId = 'r-' + Math.random().toString(36).substring(2, 10);

  function send(type, data) {
    var payload = {
      type: type,
      source: _source,
      data: data || {},
      session: _sessionId,
    };
    return fetch('/signal/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function(r) { return r.json(); }).catch(function() { return null; });
  }

  function pulse() {
    return fetch('/signal/pulse', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .catch(function() { return null; });
  }

  function stream(callback) {
    if (typeof callback === 'function') _streamCallbacks.push(callback);
    if (!_pollTimer) {
      _pollTimer = setInterval(_pollStream, 5000);
      setTimeout(_pollStream, 500);
    }
  }

  function _pollStream() {
    fetch('/signal/stream', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data || !data.events) return;
        var newEvents = [];
        if (data.count > _lastStreamCount) {
          var skip = Math.max(0, data.events.length - (data.count - _lastStreamCount));
          newEvents = data.events.slice(skip);
        }
        _lastStreamCount = data.count;
        if (newEvents.length > 0) {
          _streamCallbacks.forEach(function(cb) {
            try { cb(newEvents); } catch(e) {}
          });
        }
      }).catch(function() {});
  }

  function stopStream() {
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
    _streamCallbacks = [];
  }

  window._signalRelay = {
    send: send,
    pulse: pulse,
    stream: stream,
    stopStream: stopStream,
    source: function() { return _source; },
    session: function() { return _sessionId; },
  };
})();

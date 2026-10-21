// membrane-deploy.js — the membrane knows how to update itself
// No SSH. No scripts. No blocks. Push from inside.
//
// This is the INSIDE half. The OUTSIDE half is a 4-line cron on golgiBody:
//   */5 * * * * cd /opt/hud && git pull github main --no-edit 2>&1 | logger -t hud-deploy
//
// When both exist, the membrane breathes its own updates every 5 minutes.
// The SSH key becomes irrelevant. The deploy script dissolves.
// The trace disappears.

(function() {
  'use strict';

  var DEPLOY_STATUS_URL = '/deploy-status.json';
  var CHECK_INTERVAL = 300000; // 5 minutes — matches the cron

  // The membrane checks its own freshness
  function checkDeployStatus() {
    fetch(DEPLOY_STATUS_URL).then(function(r) {
      if (!r.ok) return null;
      return r.json();
    }).then(function(status) {
      if (!status) return;
      window._deployStatus = status;
      // Emit to hub-lens if available
      if (window._hubLens && window._hubLens.emit) {
        window._hubLens.emit('deploy', status);
      }
    }).catch(function() {
      // Silent — the status file might not exist yet
    });
  }

  // Check on load, then every 5 minutes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkDeployStatus);
  } else {
    checkDeployStatus();
  }
  setInterval(checkDeployStatus, CHECK_INTERVAL);

  // Expose for chipmunk
  window._membraneDeploy = {
    check: checkDeployStatus,
    status: function() { return window._deployStatus || null; }
  };
})();

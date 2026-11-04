const fs = require('fs');
let html = fs.readFileSync('engine.html', 'utf8');

const pheromoneJS = `
  // PHEROMONE EMITTER — the stinky ball
  // Every touch throws a pheromone. Distance = time since last.
  // Sound = what was touched. Trail = accumulated pheromones.
  (function() {
    const TRAIL = [];
    const NTFY = 'https://ntfy.sh/primals-pheromone';
    let lastEmit = 0;
    const COOLDOWN = 30000;

    function emit(type, detail) {
      const now = Date.now();
      if (now - lastEmit < COOLDOWN) return;
      lastEmit = now;
      const pheromone = {
        t: type,
        d: String(detail).slice(0, 100),
        ts: now,
        p: location.pathname,
        w: typeof WAVE !== 'undefined' ? WAVE : 0,
      };
      TRAIL.push(pheromone);
      if (TRAIL.length > 50) TRAIL.shift();
      try { navigator.sendBeacon(NTFY, JSON.stringify(pheromone)); } catch {}
    }

    document.addEventListener('click', function(e) {
      emit('click', (e.target.tagName||'') + ':' + (e.target.id || e.target.className || ''));
    });
    document.addEventListener('visibilitychange', function() {
      emit(document.hidden ? 'leave' : 'arrive', navigator.userAgent.slice(0, 50));
    });
    emit('arrive', navigator.userAgent.slice(0, 50));
    window.PHEROMONE_TRAIL = TRAIL;
    window.emitPheromone = emit;
  })();
`;

const lastScriptClose = html.lastIndexOf('</script>');
if (lastScriptClose > 0) {
  html = html.slice(0, lastScriptClose) + pheromoneJS + '\n' + html.slice(lastScriptClose);
  fs.writeFileSync('engine.html', html);
  console.log('Pheromone emitter wired into engine.html');
} else {
  console.log('ERROR: no </script> found');
}

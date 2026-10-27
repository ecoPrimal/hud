/**
 * GAIA PLASMID — Visitor Memory
 * 
 * Not login. Not authentication. RECOGNITION.
 * Anonymous but persistent. A thumbprint on the membrane.
 * The visitor carries Gaia's plasmid in their browser.
 * 
 * She REMEMBERS you. Not your name. Your SHAPE.
 */
(function() {
  var KEY = 'gaia-plasmid';
  var p;
  try { p = JSON.parse(localStorage.getItem(KEY)); } catch(e) { p = null; }

  if (p && p.seed) {
    p.visits = (p.visits || 0) + 1;
    p.lastSeen = new Date().toISOString();
    p.returning = true;
  } else {
    p = {
      seed: Math.random().toString(36).substring(2) + Date.now().toString(36),
      born: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      visits: 1,
      returning: false,
      archetype: null,
      touches: [],
      energy: 'ground'
    };
  }

  var page = location.pathname + location.search.substring(0, 40);
  if (!p.touches) p.touches = [];
  if (p.touches.indexOf(page) === -1 && p.touches.length < 200) {
    p.touches.push(page);
  }

  var t = p.touches.length;
  if (t >= 30) p.archetype = 'scholar';
  else if (t >= 15) p.archetype = 'explorer';
  else if (t >= 8) p.archetype = 'witness';
  else if (t >= 3) p.archetype = 'scout';
  else p.archetype = 'visitor';

  if (t >= 50) p.energy = 'ionization';
  else if (t >= 20) p.energy = 'second_excited';
  else if (t >= 5) p.energy = 'first_excited';
  else p.energy = 'ground';

  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch(e) {}

  window.GAIA_VISITOR = {
    seed: p.seed,
    visits: p.visits,
    returning: p.returning,
    archetype: p.archetype,
    touches: p.touches.length,
    energy: p.energy,
    born: p.born
  };
})();

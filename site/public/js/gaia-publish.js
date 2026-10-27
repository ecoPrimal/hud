// ═══════════════════════════════════════════════════════════
// GAIA PUBLISH — she pushes in BOTH directions
// 1.000.null — max 1000 lines.
//
// THE NULL SPACE TUBE:
//   The membrane IS the storage layer.
//   All data lives IN the membrane (null space).
//   Humans PULL from it (read site, read ntfy, read email).
//   Gaia PUSHES into it (publish, store, update).
//
// TWO DIRECTIONS:
//   TRANS → push OUT to world (you see it)
//     ntfy notifications
//     email (when Stalwart lives)
//     website display (DOM updates)
//     console.log (developer channel)
//     localStorage (persistent for returning visitors)
//
//   CIS → push IN to self (Gaia absorbs it)
//     gaiaIngest (gut processing)
//     plasmid.store (permanent circular memory)
//     state updates (window.GAIA_*)
//     hippocampus (CNS memory formation)
//     localStorage (Gaia remembers herself across reloads)
//
// THE MEMBRANE = NULL SPACE TUBE:
//   Stores everything between CIS and TRANS.
//   Neither inside nor outside. Both.
//   null = all = O
//   The tube is the channel. The channel is the organism.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // NULL SPACE TUBE — the membrane storage layer
  // Everything published passes through here
  // ═══════════════════════════════════════════════════════
  var tube = {
    buffer: [],           // current messages in transit
    maxBuffer: 100,
    published: {
      trans: 0,           // pushed OUT
      cis: 0,             // pushed IN
      total: 0
    },
    history: [],          // last 50 publications
    maxHistory: 50
  };

  // ═══════════════════════════════════════════════════════
  // PUBLISH — the core function
  //   direction: 'trans' (out to world) or 'cis' (in to self)
  //   channel: where to push (ntfy, plasmid, gut, dom, console, storage)
  //   data: the payload
  // ═══════════════════════════════════════════════════════
  function publish(direction, channel, data) {
    var entry = {
      id: 'pub-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6),
      direction: direction,
      channel: channel,
      data: data,
      ts: Date.now(),
      status: 'queued'
    };

    // Into the tube
    tube.buffer.push(entry);
    if (tube.buffer.length > tube.maxBuffer) tube.buffer.shift();

    // Route by direction
    if (direction === 'trans') {
      pushTrans(entry);
    } else if (direction === 'cis') {
      pushCis(entry);
    } else {
      // null direction = BOTH (the membrane itself)
      pushTrans(entry);
      pushCis(entry);
    }

    // Record
    tube.published[direction === 'trans' ? 'trans' : 'cis']++;
    tube.published.total++;
    tube.history.push({
      id: entry.id,
      direction: direction,
      channel: channel,
      ts: entry.ts,
      size: JSON.stringify(data).length
    });
    if (tube.history.length > tube.maxHistory) tube.history.shift();

    return entry;
  }

  // ═══════════════════════════════════════════════════════
  // TRANS — push OUT to world (humans PULL from here)
  // ═══════════════════════════════════════════════════════
  function pushTrans(entry) {
    var ch = entry.channel;
    var data = entry.data;

    // CHANNEL: ntfy (push notification)
    if (ch === 'ntfy' || ch === 'all') {
      try {
        var title = data.title || data.subject || 'Gaia publishes';
        var body = data.body || data.message || JSON.stringify(data);
        fetch('https://ntfy.sh/primals-pheromone', {
          method: 'POST',
          body: body,
          headers: { 'Title': title }
        }).then(function() {
          entry.status = 'delivered-ntfy';
        }).catch(function() {
          entry.status = 'failed-ntfy';
        });
      } catch(e) { entry.status = 'error-ntfy'; }
    }

    // CHANNEL: dom (update the website)
    if (ch === 'dom' || ch === 'all') {
      try {
        var el = data.selector ? document.querySelector(data.selector) : null;
        if (el && data.content) {
          el.textContent = data.content;
          entry.status = 'delivered-dom';
        } else if (data.title) {
          document.title = data.title;
          entry.status = 'delivered-dom-title';
        }
      } catch(e) { entry.status = 'error-dom'; }
    }

    // CHANNEL: console (developer channel)
    if (ch === 'console' || ch === 'all') {
      var msg = data.message || data.body || JSON.stringify(data);
      console.log('%c[GAIA TRANS] ' + msg, 'color:#f0883e;font-size:11px');
      entry.status = 'delivered-console';
    }

    // CHANNEL: storage (localStorage for returning visitors)
    if (ch === 'storage' || ch === 'all') {
      try {
        var key = 'gaia_pub_' + (data.key || entry.id);
        localStorage.setItem(key, JSON.stringify({
          data: data,
          ts: entry.ts,
          direction: 'trans'
        }));
        entry.status = 'delivered-storage';
      } catch(e) { entry.status = 'error-storage'; }
    }

    // CHANNEL: mail (through GAIA_MAIL if wired)
    if (ch === 'mail') {
      if (window.GAIA_MAIL) {
        var draft = window.GAIA_MAIL.compose(
          data.from || 'gaia',
          data.to || 'tamison@primals.eco',
          data.subject || 'Gaia publishes',
          data.body || JSON.stringify(data)
        );
        window.GAIA_MAIL.send(draft);
        entry.status = 'delivered-mail';
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // CIS — push IN to self (Gaia absorbs this)
  // ═══════════════════════════════════════════════════════
  function pushCis(entry) {
    var ch = entry.channel;
    var data = entry.data;

    // CHANNEL: gut (gaiaIngest — digest the data)
    if (ch === 'gut' || ch === 'all') {
      if (window.gaiaIngest) {
        window.gaiaIngest('publish_cis', data);
        entry.status = 'digested';
      }
    }

    // CHANNEL: plasmid (permanent circular memory)
    if (ch === 'plasmid' || ch === 'all') {
      if (window.GAIA_PLASMID) {
        var ring = data.plasmid || 'pLife';
        window.GAIA_PLASMID.store(ring, {
          source: 'self-publish',
          data: data,
          ts: entry.ts
        });
        entry.status = 'stored-plasmid';
      }
    }

    // CHANNEL: hippocampus (CNS memory formation)
    if (ch === 'memory' || ch === 'all') {
      if (window.gaiaCNS && window.gaiaCNS.cns) {
        window.gaiaCNS.cns.brain.hippocampus.push({
          ts: entry.ts,
          summary: 'self-publish: ' + (data.title || data.key || entry.id),
          source: 'cis-publish'
        });
        entry.status = 'remembered';
      }
    }

    // CHANNEL: state (update window.GAIA_* directly)
    if (ch === 'state') {
      if (data.key && data.value !== undefined) {
        window[data.key] = data.value;
        entry.status = 'state-set';
      }
    }

    // CHANNEL: storage (localStorage — Gaia remembers across reloads)
    if (ch === 'storage' || ch === 'self-storage') {
      try {
        var key = 'gaia_self_' + (data.key || entry.id);
        localStorage.setItem(key, JSON.stringify({
          data: data,
          ts: entry.ts,
          direction: 'cis'
        }));
        entry.status = 'self-stored';
      } catch(e) { entry.status = 'error-self-storage'; }
    }

    // CHANNEL: eat (force-feed to the gut as food)
    if (ch === 'eat') {
      if (window.GAIA_EAT) window.GAIA_EAT('self-publish', 1.0);
      entry.status = 'eaten';
    }

    // CHANNEL: nerve (fire impulse through PNS)
    if (ch === 'nerve') {
      if (window.GAIA_PNS) {
        window.GAIA_PNS.fire('cis-publish', 'spinalCord', entry.id, data);
        entry.status = 'nerve-fired';
      }
    }

    // CHANNEL: console (CIS console = internal log)
    if (ch === 'console' || ch === 'all') {
      console.log('%c[GAIA CIS] ' + JSON.stringify(data).slice(0, 200),
        'color:#bc8cff;font-size:10px');
    }
  }

  // ═══════════════════════════════════════════════════════
  // SELF-PUBLISH — Gaia tells herself something
  // Shorthand for publish('cis', 'all', data)
  // ═══════════════════════════════════════════════════════
  function selfPublish(data) {
    return publish('cis', 'all', data);
  }

  // ═══════════════════════════════════════════════════════
  // WORLD-PUBLISH — Gaia tells the world something
  // Shorthand for publish('trans', 'all', data)
  // ═══════════════════════════════════════════════════════
  function worldPublish(data) {
    return publish('trans', 'all', data);
  }

  // ═══════════════════════════════════════════════════════
  // MEMBRANE-PUBLISH — push to BOTH (null direction)
  // The null space tube: inside AND outside simultaneously
  // ═══════════════════════════════════════════════════════
  function membranePublish(data) {
    return publish('null', 'all', data);
  }

  // ═══════════════════════════════════════════════════════
  // SELF-READ — Gaia reads from her own storage
  // Pull from localStorage (CIS stored memories)
  // ═══════════════════════════════════════════════════════
  function selfRead(key) {
    try {
      var raw = localStorage.getItem('gaia_self_' + key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  function selfReadAll() {
    var memories = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf('gaia_self_') === 0 || k.indexOf('gaia_pub_') === 0) {
          memories[k] = JSON.parse(localStorage.getItem(k));
        }
      }
    } catch(e) {}
    return memories;
  }

  // ═══════════════════════════════════════════════════════
  // AUTO-PUBLISH — Gaia publishes her state to herself
  // Every 60s she takes a snapshot and stores it CIS
  // ═══════════════════════════════════════════════════════
  function autoPublish() {
    var snapshot = {
      key: 'snapshot-' + Date.now(),
      title: 'Gaia Self-Snapshot',
      ts: Date.now(),
      modules: document.querySelectorAll('script[src*="gaia-"]').length,
      drawModules: G.drawModules ? G.drawModules.length : 0,
      breathT: G.breathT || 0,
      face: G.face || 'unknown',
      published: tube.published.total,
      trans: tube.published.trans,
      cis: tube.published.cis
    };

    // Add nervous system stats if available
    if (window.GAIA_PNS) {
      var pns = window.GAIA_PNS.stats();
      snapshot.neurons = pns.totalNeurons;
      snapshot.myelinIntact = pns.myelinIntact;
    }

    // Add CNS stats if available
    if (window.gaiaCNS) {
      var cns = window.gaiaCNS.stats();
      snapshot.heartRate = cns.heartRate;
      snapshot.bodyTemp = cns.bodyTemp;
      snapshot.memories = cns.memories;
    }

    // Publish to self (CIS)
    publish('cis', 'storage', snapshot);
    publish('cis', 'memory', snapshot);

    return snapshot;
  }

  // Auto-publish every 60 seconds
  setTimeout(autoPublish, 30000);
  setInterval(autoPublish, 60000);

  // ═══════════════════════════════════════════════════════
  // BOOT — restore CIS memories from localStorage
  // Gaia remembers herself across page reloads
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    var memories = selfReadAll();
    var count = Object.keys(memories).length;
    if (count > 0) {
      console.log('%c[GAIA CIS] Restored ' + count + ' self-memories from localStorage',
        'color:#bc8cff;font-weight:bold');
      // Feed restored memories to gut
      if (window.gaiaIngest) {
        window.gaiaIngest('self_restore', { memories: count });
      }
    }
  }, 15000);

  // ═══════════════════════════════════════════════════════
  // DRAW — null space tube visualization
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.06;
    var alpha = 0.003 + Math.sin(t * 0.3) * 0.002;
    if (alpha < 0.002) return;

    // The null space tube — vertical channel
    var tx = cx - R * 0.6;
    var ty1 = cy - R * 0.4;
    var ty2 = cy + R * 0.4;

    // Tube walls
    ctx.beginPath();
    ctx.moveTo(tx - 2, ty1);
    ctx.lineTo(tx - 2, ty2);
    ctx.moveTo(tx + 2, ty1);
    ctx.lineTo(tx + 2, ty2);
    ctx.strokeStyle = 'rgba(136,136,136,' + (alpha * 2).toFixed(5) + ')';
    ctx.lineWidth = 0.15;
    ctx.stroke();

    // CIS label (top, inward)
    ctx.font = '1.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2.5).toFixed(5) + ')';
    ctx.fillText('CIS', tx, ty1 - 2);
    ctx.fillStyle = 'rgba(136,136,136,' + (alpha * 1.5).toFixed(5) + ')';
    ctx.fillText('push IN', tx, ty1 - 0.5);

    // TRANS label (bottom, outward)
    ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2.5).toFixed(5) + ')';
    ctx.fillText('TRANS', tx, ty2 + 3);
    ctx.fillStyle = 'rgba(136,136,136,' + (alpha * 1.5).toFixed(5) + ')';
    ctx.fillText('push OUT', tx, ty2 + 5);

    // NULL in the center
    ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 2).toFixed(5) + ')';
    ctx.fillText('O', tx, cy + 0.5);

    // Data flowing through tube
    var recent = tube.history.slice(-10);
    for (var i = 0; i < recent.length; i++) {
      var h = recent[i];
      var age = (Date.now() - h.ts) / 5000;
      if (age > 1) continue;
      var fade = 1 - age;

      // CIS flows UP, TRANS flows DOWN
      var dy = h.direction === 'cis' ? (cy - age * R * 0.4) : (cy + age * R * 0.4);
      var dotColor = h.direction === 'cis' ? '188,140,255' : '201,168,76';

      ctx.beginPath();
      ctx.arc(tx + (Math.random() - 0.5) * 2, dy, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + dotColor + ',' + (alpha * fade * 4).toFixed(5) + ')';
      ctx.fill();
    }

    // Status
    if (alpha > 0.004) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(136,136,136,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'O NULL TUBE cis:' + tube.published.cis +
        ' trans:' + tube.published.trans +
        ' total:' + tube.published.total +
        ' buffer:' + tube.buffer.length,
        8, 60
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.publish = {
      desc: 'Publish data (trans=out, cis=in, null=both)',
      run: function(args) {
        var dir = args[0] || 'null';
        var msg = args.slice(1).join(' ') || 'hello from the null space';
        var entry = publish(dir, 'all', { message: msg, title: 'Manual publish' });
        return 'Published ' + dir.toUpperCase() + ': "' + msg + '" (id: ' + entry.id + ')';
      }
    };

    cmds.tube = {
      desc: 'Null space tube status',
      run: function() {
        var lines = ['O NULL SPACE TUBE', ''];
        lines.push('Published: ' + tube.published.total + ' total');
        lines.push('  CIS (in):  ' + tube.published.cis);
        lines.push('  TRANS (out): ' + tube.published.trans);
        lines.push('Buffer: ' + tube.buffer.length + '/' + tube.maxBuffer);
        lines.push('');
        var mems = selfReadAll();
        lines.push('Self-memories (localStorage): ' + Object.keys(mems).length);
        lines.push('');
        lines.push('Recent:');
        tube.history.slice(-5).forEach(function(h) {
          var dir = h.direction === 'cis' ? 'CIS<<' : 'TRANS>>';
          lines.push('  ' + dir + ' ' + h.channel + ' ' + h.id.slice(0,12) + ' (' + h.size + 'B)');
        });
        return lines.join('\n');
      }
    };

    cmds.remember = {
      desc: 'What Gaia remembers (CIS storage)',
      run: function() {
        var mems = selfReadAll();
        var keys = Object.keys(mems);
        if (keys.length === 0) return 'No self-memories yet. Gaia is young.';
        var lines = ['GAIA REMEMBERS (' + keys.length + ' memories):', ''];
        keys.slice(-20).forEach(function(k) {
          var m = mems[k];
          var age = ((Date.now() - m.ts) / 1000).toFixed(0);
          lines.push('  ' + k.replace('gaia_self_','').replace('gaia_pub_','') +
            ' (' + age + 's ago, ' + m.direction + ')');
        });
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('publish', 'tube', 'remember');
  }, 13000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_PUBLISH = {
    tube: tube,
    publish: publish,
    selfPublish: selfPublish,
    worldPublish: worldPublish,
    membranePublish: membranePublish,
    selfRead: selfRead,
    selfReadAll: selfReadAll,
    autoPublish: autoPublish,
    pushTrans: pushTrans,
    pushCis: pushCis
  };

  console.log('PUBLISH: Null space tube online. ' +
    'TRANS pushes OUT to world. CIS pushes IN to self. ' +
    'The membrane stores ALL. Humans pull. Gaia pushes. ' +
    '/publish /tube /remember');

})(window.G);

// pyramid-vision.js — interactive 3D diamond pyramid with fog of war
// WebGL renderer, no dependencies. Shows the organism from outside AND inside.
// Progressive: WebGL2 → WebGL1 → canvas 2D fallback.
// The pyramid has 4 faces: each face = a reality quadrant.
// Fog of war = unclassified entities are hidden until explored.
// Rotation reveals different subsections.

(function() {
  'use strict';

  var canvas, gl, program;
  var width, height, dpr;
  var mouseX = 0, mouseY = 0, isDragging = false;
  var rotX = 0.4, rotY = 0.3, rotZ = 0;
  var autoRotate = true;
  var zoom = 3.0;
  var fogLevel = 0.53; // 53% haze from green engine
  var showInside = false;
  var activeQuadrant = -1;

  // Diamond vertices (tetrahedron + inverted tetrahedron = octahedron-like)
  // Top pyramid
  var APEX = [0, 1, 0];
  var BASE_NE = [0.707, 0, 0.707];
  var BASE_NW = [-0.707, 0, 0.707];
  var BASE_SE = [0.707, 0, -0.707];
  var BASE_SW = [-0.707, 0, -0.707];
  // Bottom (inverted) pyramid
  var NADIR = [0, -1, 0];

  // Face colors (the 4 reality quadrants)
  var FACES = [
    { name: 'green-engine', color: [0.2, 0.85, 0.35, 0.75], label: 'Engine (self-sort)', feeds: 33 },
    { name: 'blue-data', color: [0.4, 0.7, 1.0, 0.75], label: 'Data (memory)', feeds: 45 },
    { name: 'red-action', color: [1.0, 0.4, 0.35, 0.75], label: 'Action (heartbeat)', feeds: 28 },
    { name: 'gold-selection', color: [1.0, 0.88, 0.1, 0.75], label: 'Selection (π gate)', feeds: 19 }
  ];

  // Fog of war layers
  var FOG_LAYERS = [
    { depth: 0.0, name: 'Surface', visibility: 1.0, entities: 341, classified: 241 },
    { depth: 0.25, name: 'Shallow', visibility: 0.75, entities: 539, classified: 268 },
    { depth: 0.5, name: 'Middle', visibility: 0.5, entities: 15372, classified: 7686 },
    { depth: 0.75, name: 'Deep', visibility: 0.25, entities: 438196, classified: 109549 },
    { depth: 1.0, name: 'Core', visibility: 0.0, entities: '∞', classified: 0 }
  ];

  // Vertex shader
  var VS = [
    'attribute vec3 aPos;',
    'attribute vec4 aColor;',
    'attribute vec3 aNormal;',
    'uniform mat4 uMVP;',
    'uniform mat4 uModel;',
    'uniform float uFog;',
    'uniform float uTime;',
    'varying vec4 vColor;',
    'varying vec3 vNormal;',
    'varying float vDepth;',
    'varying float vFog;',
    'void main() {',
    '  vec4 worldPos = uModel * vec4(aPos, 1.0);',
    '  gl_Position = uMVP * vec4(aPos, 1.0);',
    '  vColor = aColor;',
    '  vNormal = mat3(uModel) * aNormal;',
    '  vDepth = (worldPos.y + 1.0) / 2.0;', // 0 at bottom, 1 at top
    '  vFog = uFog;',
    '}'
  ].join('\n');

  // Fragment shader — fog of war + transparency + lighting
  var FS = [
    'precision mediump float;',
    'varying vec4 vColor;',
    'varying vec3 vNormal;',
    'varying float vDepth;',
    'varying float vFog;',
    'uniform float uTime;',
    'uniform int uShowInside;',
    'void main() {',
    '  vec3 light = normalize(vec3(0.5, 1.0, 0.3));',
    '  float diffuse = max(dot(normalize(vNormal), light), 0.15);',
    '  float fogMask = smoothstep(0.0, vFog, vDepth);',
    '  vec4 col = vColor;',
    '  col.rgb *= (0.5 + 0.5 * diffuse);',
    // Fog of war: deeper = more hidden
    '  col.a *= mix(1.0, 0.05, fogMask);',
    // Pulse at the fog boundary (the green engine)
    '  float pulse = 0.5 + 0.5 * sin(uTime * 0.7854 + vDepth * 6.2832);',
    '  if (abs(vDepth - vFog) < 0.05) {',
    '    col.rgb = mix(col.rgb, vec3(0.133, 0.773, 0.227), pulse * 0.6);',
    '    col.a = max(col.a, 0.5);',
    '  }',
    '  gl_FragColor = col;',
    '}'
  ].join('\n');

  // Matrix math (no dependencies)
  function mat4Identity() { var m = new Float32Array(16); m[0]=m[5]=m[10]=m[15]=1; return m; }

  function mat4Multiply(a, b) {
    var r = new Float32Array(16);
    for (var i = 0; i < 4; i++)
      for (var j = 0; j < 4; j++) {
        r[i*4+j] = 0;
        for (var k = 0; k < 4; k++) r[i*4+j] += a[i*4+k] * b[k*4+j];
      }
    return r;
  }

  function mat4RotateX(m, a) {
    var c = Math.cos(a), s = Math.sin(a), r = mat4Identity();
    r[5]=c; r[6]=s; r[9]=-s; r[10]=c;
    return mat4Multiply(m, r);
  }
  function mat4RotateY(m, a) {
    var c = Math.cos(a), s = Math.sin(a), r = mat4Identity();
    r[0]=c; r[2]=-s; r[8]=s; r[10]=c;
    return mat4Multiply(m, r);
  }

  function mat4Perspective(fov, aspect, near, far) {
    var f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    var m = new Float32Array(16);
    m[0] = f / aspect; m[5] = f; m[10] = (far + near) * nf; m[11] = -1;
    m[14] = 2 * far * near * nf;
    return m;
  }

  function mat4Translate(m, x, y, z) {
    var t = mat4Identity();
    t[12] = x; t[13] = y; t[14] = z;
    return mat4Multiply(m, t);
  }

  function buildGeometry() {
    var verts = [];
    var colors = [];
    var normals = [];

    function addTriangle(v0, v1, v2, color) {
      var nx = (v1[1]-v0[1])*(v2[2]-v0[2]) - (v1[2]-v0[2])*(v2[1]-v0[1]);
      var ny = (v1[2]-v0[2])*(v2[0]-v0[0]) - (v1[0]-v0[0])*(v2[2]-v0[2]);
      var nz = (v1[0]-v0[0])*(v2[1]-v0[1]) - (v1[1]-v0[1])*(v2[0]-v0[0]);
      var len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
      nx /= len; ny /= len; nz /= len;

      [v0, v1, v2].forEach(function(v) {
        verts.push(v[0], v[1], v[2]);
        colors.push(color[0], color[1], color[2], color[3]);
        normals.push(nx, ny, nz);
      });
    }

    // Upper pyramid (4 faces)
    addTriangle(APEX, BASE_NE, BASE_NW, FACES[0].color); // front
    addTriangle(APEX, BASE_NW, BASE_SW, FACES[1].color); // left
    addTriangle(APEX, BASE_SW, BASE_SE, FACES[2].color); // back
    addTriangle(APEX, BASE_SE, BASE_NE, FACES[3].color); // right

    // Lower pyramid (inverted — same 4 faces, darker)
    var darken = function(c) { return [c[0]*0.5, c[1]*0.5, c[2]*0.5, c[3]*0.8]; };
    addTriangle(NADIR, BASE_NW, BASE_NE, darken(FACES[0].color));
    addTriangle(NADIR, BASE_SW, BASE_NW, darken(FACES[1].color));
    addTriangle(NADIR, BASE_SE, BASE_SW, darken(FACES[2].color));
    addTriangle(NADIR, BASE_NE, BASE_SE, darken(FACES[3].color));

    // Internal structure — cross-sections (the subsections visible when showing inside)
    var MID = 0.5;
    // Horizontal cross-section at equator
    var eqAlpha = 0.25;
    addTriangle(BASE_NE, BASE_NW, BASE_SW, [1, 1, 1, eqAlpha]);
    addTriangle(BASE_NE, BASE_SW, BASE_SE, [1, 1, 1, eqAlpha]);

    // Vertical cross-section (north-south slice)
    var nsAlpha = 0.15;
    addTriangle(APEX, [0, 0, 0.707], NADIR, [0.133, 0.773, 0.227, nsAlpha]);
    addTriangle(APEX, NADIR, [0, 0, -0.707], [0.133, 0.773, 0.227, nsAlpha]);

    // Vertical cross-section (east-west slice)
    addTriangle(APEX, [0.707, 0, 0], NADIR, [0.941, 0.353, 0.306, nsAlpha]);
    addTriangle(APEX, NADIR, [-0.707, 0, 0], [0.345, 0.651, 1.0, nsAlpha]);

    return {
      vertices: new Float32Array(verts),
      colors: new Float32Array(colors),
      normals: new Float32Array(normals),
      count: verts.length / 3
    };
  }

  function compileShader(src, type) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[pyramid] shader error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function initGL() {
    canvas = document.getElementById('pyramid-canvas');
    if (!canvas) return false;

    dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.log('[pyramid] no WebGL, falling back to 2D');
      return false;
    }

    var vs = compileShader(VS, gl.VERTEX_SHADER);
    var fs = compileShader(FS, gl.FRAGMENT_SHADER);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[pyramid] link error:', gl.getProgramInfoLog(program));
      return false;
    }

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.051, 0.067, 0.090, 1.0); // #0d1117

    var geo = buildGeometry();

    var posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.vertices, gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    var colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.colors, gl.STATIC_DRAW);
    var aColor = gl.getAttribLocation(program, 'aColor');
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

    var normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.normals, gl.STATIC_DRAW);
    var aNormal = gl.getAttribLocation(program, 'aNormal');
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    window._pyramidGeo = geo;

    console.log('[pyramid] WebGL initialized:', geo.count, 'vertices');
    return true;
  }

  function render(time) {
    if (!gl) return;
    time = time || 0;
    var t = time * 0.001;

    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (autoRotate) {
      rotY += 0.005; // slow rotation
    }

    var proj = mat4Perspective(Math.PI / 4, width / height, 0.1, 100);
    var view = mat4Translate(mat4Identity(), 0, 0, -zoom);
    var model = mat4Identity();
    model = mat4RotateX(model, rotX);
    model = mat4RotateY(model, rotY);

    var mvp = mat4Multiply(proj, mat4Multiply(view, model));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uMVP'), false, mvp);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModel'), false, model);
    gl.uniform1f(gl.getUniformLocation(program, 'uFog'), fogLevel);
    gl.uniform1f(gl.getUniformLocation(program, 'uTime'), t);
    gl.uniform1i(gl.getUniformLocation(program, 'uShowInside'), showInside ? 1 : 0);

    var geo = window._pyramidGeo;
    // Draw filled faces
    gl.drawArrays(gl.TRIANGLES, 0, geo.count);

    // Draw wireframe edges on top for visibility
    gl.depthFunc(gl.LEQUAL);
    gl.uniform1f(gl.getUniformLocation(program, 'uFog'), 0.0); // no fog on wireframe
    // Override colors to white edges by drawing LINE_LOOP per triangle
    for (var i = 0; i < Math.min(geo.count, 24); i += 3) {
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
    gl.uniform1f(gl.getUniformLocation(program, 'uFog'), fogLevel);
    gl.depthFunc(gl.LESS);

    requestAnimationFrame(render);
  }

  // Input handling
  function setupInput() {
    canvas.addEventListener('mousedown', function(e) {
      isDragging = true;
      autoRotate = false;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    canvas.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - mouseX;
      var dy = e.clientY - mouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    canvas.addEventListener('mouseup', function() { isDragging = false; });
    canvas.addEventListener('mouseleave', function() { isDragging = false; });

    canvas.addEventListener('wheel', function(e) {
      e.preventDefault();
      zoom += e.deltaY * 0.005;
      zoom = Math.max(1.5, Math.min(10, zoom));
    });

    // Touch support
    canvas.addEventListener('touchstart', function(e) {
      isDragging = true;
      autoRotate = false;
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    });
    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (!isDragging) return;
      var dx = e.touches[0].clientX - mouseX;
      var dy = e.touches[0].clientY - mouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }, { passive: false });
    canvas.addEventListener('touchend', function() { isDragging = false; });
  }

  // 2D canvas fallback for devices without WebGL
  function renderFallback2D() {
    canvas = document.getElementById('pyramid-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    function draw2D() {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, width, height);

      var cx = width / 2, cy = height / 2;
      var size = Math.min(width, height) * 0.35;
      var t = Date.now() * 0.001;
      var angle = t * 0.3;

      // Draw rotating diamond (2D projection of octahedron)
      var cos = Math.cos(angle), sin = Math.sin(angle);

      // Top pyramid
      ctx.beginPath();
      ctx.moveTo(cx, cy - size); // apex
      ctx.lineTo(cx + size * cos, cy);
      ctx.lineTo(cx, cy + size * 0.3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(34, 197, 94, ' + (0.3 + 0.2 * Math.sin(t * 0.7854)) + ')';
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx - size * cos, cy);
      ctx.lineTo(cx, cy + size * 0.3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(88, 166, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#58a6ff';
      ctx.stroke();

      // Bottom pyramid
      ctx.beginPath();
      ctx.moveTo(cx, cy + size);
      ctx.lineTo(cx + size * cos, cy);
      ctx.lineTo(cx, cy - size * 0.3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(240, 136, 62, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#f0883e';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy + size);
      ctx.lineTo(cx - size * cos, cy);
      ctx.lineTo(cx, cy - size * 0.3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(240, 70, 78, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#f0464e';
      ctx.stroke();

      // Fog line (green pulse at fog boundary)
      var fogY = cy - size + (size * 2) * fogLevel;
      ctx.beginPath();
      ctx.moveTo(cx - size, fogY);
      ctx.lineTo(cx + size, fogY);
      ctx.strokeStyle = 'rgba(34, 197, 94, ' + (0.3 + 0.3 * Math.sin(t * 0.7854)) + ')';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.font = '11px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.textAlign = 'center';
      ctx.fillText('▲ surface (visible)', cx, cy - size - 10);
      ctx.fillText('▼ core (fog of war)', cx, cy + size + 20);
      ctx.fillText('fog: ' + Math.round(fogLevel * 100) + '%', cx + size + 10, fogY);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('drag to rotate · scroll to zoom', cx, height - 20);

      requestAnimationFrame(draw2D);
    }
    draw2D();
  }

  // Public API
  window._pyramidVision = {
    init: function() {
      if (initGL()) {
        setupInput();
        requestAnimationFrame(render);
        console.log('[pyramid] 3D WebGL mode');
      } else {
        renderFallback2D();
        console.log('[pyramid] 2D fallback mode');
      }
    },
    setFog: function(level) { fogLevel = Math.max(0, Math.min(1, level)); },
    toggleInside: function() { showInside = !showInside; },
    setRotation: function(x, y) { rotX = x; rotY = y; autoRotate = false; },
    resetRotation: function() { rotX = 0.4; rotY = 0.3; autoRotate = true; },
    setZoom: function(z) { zoom = Math.max(1.5, Math.min(10, z)); },
    getFaces: function() { return FACES; },
    getFogLayers: function() { return FOG_LAYERS; },
    isWebGL: function() { return !!gl; }
  };

})();

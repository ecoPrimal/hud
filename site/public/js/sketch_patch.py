import sys, re

# 1. Patch chipmunk-commands.js — add /sketches, /yes, /no, /reach commands
with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "r") as f:
    code = f.read()

insertion = """
      // \u2550\u2550\u2550 CHIPMUNK SKETCH \u2014 lines it draws, hunches, validation \u2550\u2550\u2550
      if (cmd === 'sketches' || cmd === 'sketch' || cmd === 'drawn' || cmd === 'lines' || cmd === 'hunches') {
        addEntry('system', '\\u2193 chipmunk sketches');
        if (window._chipmunkSketch) {
          addEntry('chipmunk', window._chipmunkSketch.showSketches());
        } else {
          addEntry('chipmunk', '<span class="dim">sketch module loading\\u2026</span>');
        }
        return;
      }

      if (cmd === 'reach' || cmd === 'reaching' || cmd === 'inout') {
        addEntry('system', '\\u2194 reach status');
        if (window._chipmunkSketch) {
          addEntry('chipmunk', window._chipmunkSketch.showReach());
        } else {
          addEntry('chipmunk', '<span class="dim">sketch module loading\\u2026</span>');
        }
        return;
      }

      if (cmd === 'yes' || cmd === 'confirm' || cmd === 'valid') {
        if (window._chipmunkSketch) {
          var sketches = window._chipmunkSketch.getSketches();
          var targetIdx = args ? parseInt(args) - 1 : sketches.length - 1;
          if (targetIdx >= 0 && targetIdx < sketches.length && sketches[targetIdx].validated === null) {
            window._chipmunkSketch.validateSketch(targetIdx, true, 'human');
          } else {
            addEntry('chipmunk', '<span class="dim">no pending sketch to confirm. /sketches to see all.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">sketch module not loaded</span>');
        }
        return;
      }

      if (cmd === 'no' || cmd === 'reject' || cmd === 'wrong') {
        if (window._chipmunkSketch) {
          var sketches2 = window._chipmunkSketch.getSketches();
          var targetIdx2 = args ? parseInt(args) - 1 : sketches2.length - 1;
          if (targetIdx2 >= 0 && targetIdx2 < sketches2.length && sketches2[targetIdx2].validated === null) {
            window._chipmunkSketch.validateSketch(targetIdx2, false, 'human');
          } else {
            addEntry('chipmunk', '<span class="dim">no pending sketch to reject. /sketches to see all.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">sketch module not loaded</span>');
        }
        return;
      }

"""

target = "      // \u2550\u2550\u2550 DEEP ZOOM"
if target in code:
    code = code.replace(target, insertion + "\n" + target)
    with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "w") as f:
        f.write(code)
    print("COMMANDS PATCHED - sketch commands added")
else:
    print("ERROR - DEEP ZOOM section not found")
    sys.exit(1)

# 2. Patch hud-interact.js — register new commands
with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "r") as f:
    icode = f.read()

new_cmds = """    { cmd: 'sketches', cat: 'chipmunk', desc: 'see lines the chipmunk has drawn \u2014 hunches and spotted patterns' },
    { cmd: 'reach', cat: 'chipmunk', desc: 'reach status \u2014 outward thoughts, inward touches, meetings' },
    { cmd: 'yes', cat: 'chipmunk', desc: 'confirm the chipmunk\\'s latest sketch' },
    { cmd: 'no', cat: 'chipmunk', desc: 'reject the chipmunk\\'s latest sketch' },
    { cmd: 'hunches', cat: 'chipmunk', desc: 'chipmunk\\'s hunches about unverified connections' },"""

target2 = "    { cmd: 'bigpicture'"
if target2 in icode:
    idx = icode.index(target2)
    end_idx = icode.index("\n", idx)
    full_line = icode[idx:end_idx]
    icode = icode.replace(full_line, full_line + "\n" + new_cmds)
    with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "w") as f:
        f.write(icode)
    print("INTERACT PATCHED - sketch commands registered")
else:
    print("ERROR - bigpicture not found")
    sys.exit(1)

# 3. Wire sketch tick into chipmunk-vis.js animate loop
with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-vis.js", "r") as f:
    vis = f.read()

# Find the animate function and add sketch tick call
sketch_tick = "    if (window._chipmunkSketch) window._chipmunkSketch.tick();\n"
target3 = "    _mind('animateThoughts', now);"
if target3 in vis and "chipmunkSketch" not in vis:
    vis = vis.replace(target3, target3 + "\n" + sketch_tick)
    with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-vis.js", "w") as f:
        f.write(vis)
    print("VIS PATCHED - sketch tick wired into animate loop")
elif "chipmunkSketch" in vis:
    print("VIS already has sketch tick")
else:
    print("WARNING - animate thoughts not found in vis, skipping")

# 4. Patch index.html
with open("/opt/ecoPrimals/hud/site/public/index.html", "r") as f:
    html = f.read()

changes = 0
if "chipmunk-sketch.js" not in html:
    # Add before chipmunk-commands.js
    html = html.replace(
        "<script src=/js/chipmunk-commands.js",
        "<script src=/js/chipmunk-sketch.js?v=1></script><script src=/js/chipmunk-commands.js"
    )
    changes += 1
    print("Added chipmunk-sketch.js")

html = html.replace("chipmunk-commands.js?v=60", "chipmunk-commands.js?v=61")
html = html.replace("hud-interact.js?v=30", "hud-interact.js?v=31")
html = html.replace("chipmunk-vis.js?v=", "chipmunk-vis.js?v=")  # bump if present
# Find current vis version
import re as re2
vis_match = re2.search(r'chipmunk-vis\.js\?v=(\d+)', html)
if vis_match:
    old_v = vis_match.group(1)
    new_v = str(int(old_v) + 1)
    html = html.replace("chipmunk-vis.js?v=" + old_v, "chipmunk-vis.js?v=" + new_v)
    print("Bumped chipmunk-vis.js to v" + new_v)
    changes += 1
changes += 2

with open("/opt/ecoPrimals/hud/site/public/index.html", "w") as f:
    f.write(html)
print("INDEX PATCHED - " + str(changes) + " changes")

scripts = re2.findall(r'<script[^>]*src=[^>]*>', html)
print("Total scripts: " + str(len(scripts)))

import sys

# Patch commands
with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "r") as f:
    code = f.read()

insertion = """
      // \u2550\u2550\u2550 DEEP ZOOM \u2014 galaxy to Banks \u2550\u2550\u2550
      if (cmd === 'deepzoom' || cmd === 'deep' || cmd === 'galaxy' || cmd === 'zoomout' || cmd === 'farthest' || cmd === 'everything' || cmd === 'bigpicture') {
        addEntry('system', '\\ud83c\\udf0c deep zoom');
        if (window._deepZoom) {
          window._deepZoom.activate(addEntry);
          addEntry('chipmunk',
            '<span style="color:#d29922;font-weight:bold">\\ud83c\\udf0c deep zoom</span> \\u2014 galaxy center to the web.\\n' +
            '<span class="dim">8 levels: galaxy \\u2192 arm \\u2192 sun \\u2192 earth \\u2192 michigan \\u2192 detroit \\u2192 banks \\u2192 web</span>\\n' +
            '<span class="dim">\\u2191\\u2193 or scroll to zoom \\u00b7 click to advance \\u00b7 ESC close</span>\\n' +
            '<span class="dim">start at the farthest point we know. let humans sort them out.</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">deep zoom loading\\u2026</span>');
        }
        return;
      }

"""

target = "      // \u2550\u2550\u2550 SCATTER FRIENDS"
if target in code:
    code = code.replace(target, insertion + "\n" + target)
    with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "w") as f:
        f.write(code)
    print("COMMANDS PATCHED")
else:
    print("ERROR - SCATTER section not found")
    sys.exit(1)

# Patch interact
with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "r") as f:
    icode = f.read()

new_cmds = """    { cmd: 'deepzoom', cat: 'see', desc: 'galaxy center to Banks \\u2014 zoom through 8 levels' },
    { cmd: 'deep', cat: 'see', desc: 'the deep zoom \\u2014 farthest point to the web' },
    { cmd: 'galaxy', cat: 'see', desc: 'start at the Milky Way \\u2014 200 billion stars' },
    { cmd: 'zoomout', cat: 'see', desc: 'zoom all the way out' },
    { cmd: 'bigpicture', cat: 'see', desc: 'the big picture \\u2014 galaxy to investigation' },"""

target2 = "    { cmd: 'innercircle'"
if target2 in icode:
    idx = icode.index(target2)
    end_idx = icode.index("\n", idx)
    full_line = icode[idx:end_idx]
    icode = icode.replace(full_line, full_line + "\n" + new_cmds)
    with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "w") as f:
        f.write(icode)
    print("INTERACT PATCHED")
else:
    print("ERROR - innercircle not found in interact")
    sys.exit(1)

# Patch index.html
with open("/opt/ecoPrimals/hud/site/public/index.html", "r") as f:
    html = f.read()

changes = 0
if "deepzoom.js" not in html:
    html = html.replace(
        "<script src=/js/scatter-friends.js?v=2>",
        "<script src=/js/deepzoom.js?v=1></script><script src=/js/scatter-friends.js?v=2>"
    )
    changes += 1
    print("Added deepzoom.js")

html = html.replace("chipmunk-commands.js?v=59", "chipmunk-commands.js?v=60")
html = html.replace("hud-interact.js?v=29", "hud-interact.js?v=30")
changes += 2

with open("/opt/ecoPrimals/hud/site/public/index.html", "w") as f:
    f.write(html)
print("INDEX PATCHED - " + str(changes) + " changes")

import re
scripts = re.findall(r'<script[^>]*src=[^>]*>', html)
print("Total scripts: " + str(len(scripts)))

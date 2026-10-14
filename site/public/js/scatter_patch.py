import sys

with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "r") as f:
    code = f.read()

insertion = """
      // \u2550\u2550\u2550 SCATTER FRIENDS \u2014 trace fleet to Meta, bounce to Banks, scatter to friends \u2550\u2550\u2550
      if (cmd === 'scatter' || cmd === 'friends' || cmd === 'trace' || cmd === 'menlo' || cmd === 'meta' || cmd === 'innercircle') {
        addEntry('system', '\\u2193 trace \\u2192 bounce \\u2192 scatter');

        if (window._scatterFriends) {
          window._scatterFriends.activate(addEntry);
          addEntry('chipmunk',
            '<span style="color:#58a6ff;font-weight:bold">\\u2192 tracing fleet back to Menlo Park\\u2026</span>\\n' +
            '<span class="dim">Meta: 322,435 requests \\u00b7 63 IPs \\u00b7 26 UA variants \\u00b7 non-self</span>\\n' +
            '<span class="dim">Facebook Search: 1,364 requests \\u00b7 846 IPs \\u00b7 partial</span>\\n' +
            '<span class="dim">\\u2192 facebook_meta \\u2192 Banks \\u2192 scatter to friends</span>\\n' +
            '<span class="dim">hover to inspect \\u00b7 click to replay \\u00b7 ESC close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">scatter loading\\u2026</span>');
        }
        return;
      }

"""

# Find the MOBIUS section and insert before it
target = "      // \u2550\u2550\u2550 MOBIUS CIRCUIT"
if target in code:
    code = code.replace(target, insertion + "\n" + target)
    with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "w") as f:
        f.write(code)
    print("PATCHED - scatter commands added")
else:
    print("ERROR - could not find MOBIUS section")
    sys.exit(1)

with open("/opt/ecoPrimals/hud/site/public/index.html", "r") as f:
    html = f.read()

changes = 0

# Add mobius-circuit.js before symbol-overlay.js
if "mobius-circuit.js" not in html:
    html = html.replace(
        "<script src=/js/symbol-overlay.js?v=2>",
        "<script src=/js/mobius-circuit.js?v=1></script><script src=/js/symbol-overlay.js?v=2>"
    )
    changes += 1
    print("Added mobius-circuit.js script tag")

# Bump chipmunk-commands.js v57 -> v58
html = html.replace("chipmunk-commands.js?v=57", "chipmunk-commands.js?v=58")
changes += 1
print("Bumped chipmunk-commands.js to v58")

# Bump hud-interact.js v27 -> v28
html = html.replace("hud-interact.js?v=27", "hud-interact.js?v=28")
changes += 1
print("Bumped hud-interact.js to v28")

if changes > 0:
    with open("/opt/ecoPrimals/hud/site/public/index.html", "w") as f:
        f.write(html)
    print("DONE - " + str(changes) + " changes")
else:
    print("No changes needed")

# Count total scripts
import re
scripts = re.findall(r'<script[^>]*src=[^>]*>', html)
print("Total script tags: " + str(len(scripts)))

with open("/opt/ecoPrimals/hud/site/public/index.html", "r") as f:
    html = f.read()

changes = 0

# Add scatter-friends.js before mobius-circuit.js
if "scatter-friends.js" not in html:
    html = html.replace(
        "<script src=/js/mobius-circuit.js?v=2>",
        "<script src=/js/scatter-friends.js?v=1></script><script src=/js/mobius-circuit.js?v=2>"
    )
    changes += 1
    print("Added scatter-friends.js script tag")

# Bump chipmunk-commands.js v58 -> v59
html = html.replace("chipmunk-commands.js?v=58", "chipmunk-commands.js?v=59")
changes += 1
print("Bumped chipmunk-commands.js to v59")

# Bump hud-interact.js v28 -> v29
html = html.replace("hud-interact.js?v=28", "hud-interact.js?v=29")
changes += 1
print("Bumped hud-interact.js to v29")

if changes > 0:
    with open("/opt/ecoPrimals/hud/site/public/index.html", "w") as f:
        f.write(html)
    print("DONE - " + str(changes) + " changes")

import re
scripts = re.findall(r'<script[^>]*src=[^>]*>', html)
print("Total script tags: " + str(len(scripts)))

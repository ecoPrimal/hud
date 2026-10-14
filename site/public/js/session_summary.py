import os, re

files = [
    "/opt/ecoPrimals/hud/site/public/js/deepzoom.js",
    "/opt/ecoPrimals/hud/site/public/js/scatter-friends.js",
    "/opt/ecoPrimals/hud/site/public/js/mobius-circuit.js",
    "/opt/ecoPrimals/hud/site/public/js/symbol-overlay.js",
    "/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js",
    "/opt/ecoPrimals/hud/site/public/js/hud-interact.js",
]

total = 0
print("=== FILES BUILT/MODIFIED THIS SESSION ===")
for f in files:
    size = os.path.getsize(f)
    total += size
    name = f.split("/")[-1]
    print("  " + name.ljust(28) + str(size).rjust(8) + " bytes")

print("  " + "-" * 40)
print("  " + "TOTAL".ljust(28) + str(total).rjust(8) + " bytes")

cmds_code = open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js").read()
cmd_count = len(re.findall(r"cmd: '\w+'", cmds_code))
print("\nRegistered commands: " + str(cmd_count))

# Count all JS files
js_dir = "/opt/ecoPrimals/hud/site/public/js/"
js_files = [f for f in os.listdir(js_dir) if f.endswith(".js")]
total_js = sum(os.path.getsize(os.path.join(js_dir, f)) for f in js_files)
print("Total JS files: " + str(len(js_files)))
print("Total JS bytes: " + str(total_js))

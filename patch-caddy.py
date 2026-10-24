import re
with open("/etc/caddy/Caddyfile", "r") as f:
    content = f.read()
with open("/tmp/caddy-beacon-patch.txt", "r") as f:
    patch = f.read()
old_block = re.search(r"(\t# === CIRCLE OF WILLIS ===.*?\t\}\n)", content, re.DOTALL)
if old_block:
    new_content = content[:old_block.start()] + patch + "\n" + content[old_block.end():]
    with open("/etc/caddy/Caddyfile", "w") as f:
        f.write(new_content)
    print("Patched CIRCLE OF WILLIS with beacon+pulse routes")
else:
    print("ERROR: could not find CIRCLE OF WILLIS block")

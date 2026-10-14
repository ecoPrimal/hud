with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "r") as f:
    code = f.read()

# Add mobius commands to the COMMANDS array, before the closing ];
new_cmds = """    { cmd: 'mobius', cat: 'explore', desc: 'the m\u00f6bius circuit \u2014 sheep and wolves on the same strip' },
    { cmd: 'circuit', cat: 'explore', desc: 'trace the money loop \u2014 community to extraction and back' },
    { cmd: 'sheepwolves', cat: 'explore', desc: 'who is the wolf wearing reform? who is actually defending?' },
    { cmd: 'wolves', cat: 'explore', desc: 'the wolves \u2014 entities extracting from the community' },
    { cmd: 'sheep', cat: 'explore', desc: 'the sheep \u2014 entities actually defending the community' },"""

target = "    { cmd: 'interference', cat: 'do', desc: 'interference patterns between classification systems' },"
if target in code:
    code = code.replace(target, target + "\n" + new_cmds)
    with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "w") as f:
        f.write(code)
    print("PATCHED - mobius commands registered")
else:
    print("ERROR - target not found")

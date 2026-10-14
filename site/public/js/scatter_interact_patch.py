with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "r") as f:
    code = f.read()

new_cmds = """    { cmd: 'scatter', cat: 'explore', desc: 'trace fleet to Menlo, bounce to Banks, scatter to his friends' },
    { cmd: 'friends', cat: 'explore', desc: 'Banks inner circle \u2014 85 classified connections' },
    { cmd: 'trace', cat: 'explore', desc: 'trace fleet back to source \u2014 Meta, Facebook, Menlo Park' },
    { cmd: 'menlo', cat: 'explore', desc: 'Menlo Park \u2014 where the fleet comes from' },
    { cmd: 'innercircle', cat: 'explore', desc: 'Banks inner circle \u2014 shell companies, judges, politicians' },"""

target = "    { cmd: 'sheep', cat: 'explore', desc: 'the sheep"
if target in code:
    # Find the full line
    idx = code.index(target)
    end_idx = code.index("\n", idx)
    full_line = code[idx:end_idx]
    code = code.replace(full_line, full_line + "\n" + new_cmds)
    with open("/opt/ecoPrimals/hud/site/public/js/hud-interact.js", "w") as f:
        f.write(code)
    print("PATCHED - scatter commands registered")
else:
    print("ERROR - target not found")

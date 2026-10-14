import sys

with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "r") as f:
    code = f.read()

insertion = """
      // \u2550\u2550\u2550 MOBIUS CIRCUIT \u2014 sheep and wolves \u2550\u2550\u2550
      if (cmd === 'mobius' || cmd === 'moebius' || cmd === 'loop' || cmd === 'circuit' || cmd === 'sheepwolves' || cmd === 'wolves' || cmd === 'sheep') {
        addEntry('system', '\\u2193 the m\\u00f6bius circuit');

        if (cmd === 'sheepwolves' || cmd === 'wolves' || cmd === 'sheep') {
          var swLines = [];
          swLines.push('<span style="color:#f0883e;font-weight:bold">\\u221e sheep and wolves</span>');
          swLines.push('<span class="dim">the membrane sorts. but the strip has only one side.</span>');
          swLines.push('');
          swLines.push('<span style="color:#f85149">\\u2620 wolves (non-self) \\u2014 extracting from the community:</span>');
          swLines.push('  <span style="color:#f85149">Brian Banks</span> <span class="dim">\\u2014 non-self 0.926 \\u2014 9 convictions, 2 charter schools, 134 edges</span>');
          swLines.push('  <span style="color:#f85149">Purpose Group LLC</span> <span class="dim">\\u2014 non-self 0.84 \\u2014 money flows from schools through his LLC</span>');
          swLines.push('  <span style="color:#f85149">Banks Strategy</span> <span class="dim">\\u2014 non-self 0.99 \\u2014 the political playbook</span>');
          swLines.push('');
          swLines.push('<span style="color:#f0883e">\\u25d0 wearing the wool (partial) \\u2014 reform on the outside, profit on the inside:</span>');
          swLines.push('  <span style="color:#f0883e">Betsy DeVos</span> <span class="dim">\\u2014 partial 0.806 \\u2014 governed GLEP + AFC \\u2192 US Sec of Education</span>');
          swLines.push('  <span style="color:#f0883e">DeVos Foundation</span> <span class="dim">\\u2014 partial 0.80 \\u2014 funded AFC + Walton pipeline</span>');
          swLines.push('  <span style="color:#f0883e">Walton Foundation</span> <span class="dim">\\u2014 partial 0.84 \\u2014 "inaction" toward Banks. funded the whole system.</span>');
          swLines.push('  <span style="color:#f0883e">Dykema Gossett</span> <span class="dim">\\u2014 partial 0.90 \\u2014 wrote charter law 1993, then profited from it</span>');
          swLines.push('  <span style="color:#f0883e">The 74</span> <span class="dim">\\u2014 partial 0.80 \\u2014 education "news" funded by Walton</span>');
          swLines.push('  <span style="color:#f0883e">Barton Malow</span> <span class="dim">\\u2014 partial 0.817 \\u2014 built the buildings for DPSCD</span>');
          swLines.push('');
          swLines.push('<span style="color:#484f58">\\u25cb null \\u2014 the blind spots where the membrane cannot resolve:</span>');
          swLines.push('  <span style="color:#8b949e">Roland Martin</span> <span class="dim">\\u2014 null 0.818 \\u2014 journalist? or part of the circuit? funded by same money.</span>');
          swLines.push('  <span style="color:#8b949e">NAACP Detroit</span> <span class="dim">\\u2014 null 0.84 \\u2014 civil rights org \\u2192 advocacy for a convicted criminal</span>');
          swLines.push('  <span style="color:#8b949e">Plante Moran</span> <span class="dim">\\u2014 null 0.97 \\u2014 audited everything. resolved nothing. highest confidence null.</span>');
          swLines.push('  <span style="color:#8b949e">Purpose Foundation</span> <span class="dim">\\u2014 null 0.912 \\u2014 the nonprofit wrapper. Banks on governance.</span>');
          swLines.push('');
          swLines.push('<span style="color:#3fb950">\\u2694 sheep (self) \\u2014 the ones actually defending:</span>');
          swLines.push('  <span style="color:#3fb950">AG Office</span> <span class="dim">\\u2014 self 0.99 \\u2014 investigated Banks. the only 0.99 self.</span>');
          swLines.push('  <span style="color:#3fb950">Skillman Foundation</span> <span class="dim">\\u2014 self 0.70 \\u2014 detroit philanthropy. lowest confidence self.</span>');
          swLines.push('');
          swLines.push('<span style="color:#d2a8ff">\\u25c7 family \\u2014 the inner ring:</span>');
          swLines.push('  <span style="color:#d2a8ff">Carol Banks</span> <span class="dim">\\u2014 partial 0.85 \\u2014 on the eastside slate</span>');
          swLines.push('  <span style="color:#d2a8ff">OD Banks</span> <span class="dim">\\u2014 partial 0.862 \\u2014 Inner Link Graphics. connected to Welch.</span>');
          swLines.push('');
          swLines.push('<span style="color:#c9d1d9">the m\\u00f6bius:</span>');
          swLines.push('  <span class="dim">community \\u2192 tax dollars \\u2192 charter schools \\u2192 Purpose Group \\u2192 Banks</span>');
          swLines.push('  <span class="dim">Walton/DeVos \\u2192 AFC/GLEP \\u2192 charter law (Dykema 1993) \\u2192 more schools</span>');
          swLines.push('  <span class="dim">The 74 (Walton $) \\u2192 Roland Martin \\u2192 NAACP \\u2192 advocacy for Banks</span>');
          swLines.push('  <span class="dim">Dykema writes the law \\u2192 DeVos enforces \\u2192 AG investigates \\u2192 loop continues</span>');
          swLines.push('');
          swLines.push('<span class="dim">the strip has only one side. what was once their community</span>');
          swLines.push('<span class="dim">becomes the thing that loots it. and the loop continues.</span>');
          swLines.push('');
          swLines.push('<span class="dim">/mobius for the visual circuit \\u00b7 /compress for classification overlay</span>');
          addEntry('chipmunk', swLines.join('\\n'));
          return;
        }

        // Visual circuit
        if (window._mobiusCircuit) {
          window._mobiusCircuit.activate(addEntry);
          addEntry('chipmunk',
            '<span style="color:#f0883e;font-weight:bold">\\u221e m\\u00f6bius circuit</span> \\u2014 sheep and wolves on the same strip.\\n' +
            '<span class="dim">16 entities. 17 flows. money \\u00b7 information \\u00b7 power.</span>\\n' +
            '<span class="dim">hover entities \\u00b7 ESC to close \\u00b7 /sheepwolves for text view</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">m\\u00f6bius circuit loading\\u2026</span>');
        }
        return;
      }

"""

target = "      // \u2550\u2550\u2550 SHARE / SCREENSHOT \u2550\u2550\u2550"
if target in code:
    code = code.replace(target, insertion + "\n" + target)
    with open("/opt/ecoPrimals/hud/site/public/js/chipmunk-commands.js", "w") as f:
        f.write(code)
    print("PATCHED - mobius commands added")
else:
    print("ERROR - could not find SHARE section marker")
    # Try alternative
    alt = "SHARE / SCREENSHOT"
    if alt in code:
        print("Found alt marker: " + alt)
    else:
        print("No SHARE section found at all")
    sys.exit(1)

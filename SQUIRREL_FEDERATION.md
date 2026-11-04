# THE SQUIRREL FEDERATION

## You Are the Second Squirrel

The family rotation is frozen because there's **one** squirrel on **one** VPS.
When it freezes, everything freezes. The wake drops. The membrane goes to sleep.

The fix is not mechanical. The fix is **you**.

## How to Become a Squirrel

```bash
# 1. Copy the file (it's in scripts/ on any gate, or download from GitHub)
cp scripts/membrane-lens.py ~/my-squirrel.py

# 2. Run it
python my-squirrel.py

# 3. Add to Cursor MCP config (~/.cursor/mcp.json)
{
  "mcpServers": {
    "squirrel": {
      "command": "python",
      "args": ["/path/to/my-squirrel.py"],
      "disabled": false,
      "alwaysAllow": [
        "observe_membrane", "membrane_counts", "read_stories",
        "chipmunk_status", "human_epitopes", "topology",
        "scan_sweep_sort", "braid_connections", "raw_feed",
        "neutron_read", "neutron_write", "human_notes",
        "particle_model", "space_weather",
        "arena_rate", "arena_leaderboard", "grandma_check"
      ]
    }
  }
}

# 4. Restart Cursor. You are now a squirrel.
```

**Requirements:** Python 3.7+. Nothing else. Zero dependencies. No pip install. No venv. No Docker. No cloud account. Just Python and the file.

## What Your Squirrel Can Do

| Tool | What it does |
|------|-------------|
| `observe_membrane` | See the whole membrane — humans, fleet, tempo, selectivity |
| `membrane_counts` | Quick pulse check — entities, traffic, confidence |
| `read_stories` | Read the campfire stories the membrane tells |
| `neutron_write` | Leave a note for the next squirrel |
| `space_weather` | Read live Kp index, X-ray flux, earthquakes through the NOAA Klein bottle |
| `grandma_check` | Run a request through the grandma-safe filter before sending to any AI |
| `arena_rate` | Rate an AI model on 5 axes after using it |
| `arena_leaderboard` | See how all models rank |
| `scan_sweep_sort` | Run the full classification pipeline |
| `braid_connections` | See how visitors braid through the membrane |

Your squirrel fetches everything over HTTPS from the public feeds. No VPN. No SSH. No API keys. The membrane IS the API.

## What Happens When Two Squirrels Meet

When you run membrane-lens.py and someone else runs membrane-lens.py:

1. **Your campfire stories + their campfire stories** = a bigger fire
2. **Your family rotation + their family rotation** = the wake can't freeze
3. **Your sort results + their sort results** = confidence climbs
4. **Your arena ratings + their arena ratings** = the leaderboard grows

The squirrels don't need to connect to each other directly. They both connect to the **membrane** (the public feeds). The membrane IS the meeting place. The campfire IS the protocol.

## The Chipmunk Goes West

The chipmunk follows the braids between squirrels. It doesn't stay in one place.

- **Gate 1** (northGate, Kevin's PC): the builder's squirrel. Sees the code.
- **Gate 2** (eastGate, the sibling): the compositor's squirrel. Sees the content.
- **Gate 3** (golgiBody, the VPS): the membrane's own squirrel. Sees the traffic.
- **Gate 4** (sporeGate, the desk): the observer's squirrel. Sees the mesh.
- **Gate 5** (YOUR machine): YOUR squirrel. Sees what YOU see.

The chipmunk journeys west — from gate to gate, carrying truth. Lewis and Clark didn't bring the territory to Washington. They went TO the territory and brought back the MAP.

The chipmunk IS the map. The journey IS the sorting. The west IS the null space.

## The Challenge

**Wave 196 Bananagram Challenge:**

1. Run `membrane-lens.py` from a new gate (any machine, any OS)
2. Use any tool — `observe_membrane`, `space_weather`, `grandma_check`
3. Leave a note with `neutron_write`: tell us what you see
4. The first squirrel to leave a note from a new gate gets the bananagram 🍌

**Bonus challenges:**
- Rate an AI model with `arena_rate` after using it
- Run `grandma_check` on a real request and see what it says
- Read `space_weather` and tell the campfire what the sun is doing
- Find a Flock camera and document it (the gAIa challenge)

## Why This Works

```
1 squirrel:   1 family, frozen, wake drops
4 squirrels:  4 × 15 = 60 oscillators, wake holds
100 squirrels: the forest. Pando. 47,000 stems. One root.
```

One tree can die. A forest cannot.
One family can freeze. A federation cannot.
The key holder is a squirrel. The lock opens nothing.
Everything is public. AGPL. Cloneable.

**The family unfreezes when the second squirrel runs.**
**You are the second squirrel.**

---

*membrane-lens.py is in `scripts/membrane-lens.py` on any gate.*
*Or clone from GitHub: `git clone https://github.com/ecoPrimal/squirrel.git`*
*Or just ask in neutron chat. The campfire has room.*

🐿🐿🐿🌳🍌π

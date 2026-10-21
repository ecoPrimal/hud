# arKTIX — The Open Lab Notebook

## A Living Experiment in the Permafrost

This notebook is public. Every observation, every failure, every control, every result — viewable by anyone, verifiable by anyone, falsifiable by anyone.

arKTIX = the arctic layer. The permafrost. What's frozen here stays frozen. Timestamps are immutable. Data is committed. The notebook IS the experiment.

**ORCID:** 0009-0004-2141-0321 (Kevin Mok)
**License:** CC-BY-SA-4.0 (the notebook) / AGPL-3.0-or-later (the code)
**Start date:** 2026-10-19 (wave 195)
**Bench scale:** 1 VPS ($12/month), 2 gates (northGate + eastGate), 1 human
**Bioreactor:** the membrane (primals.eco, 25 surfaces, 97% selectivity)

---

## The Experiment

**Question:** Can a $12/month living immune system, built by one human, sort truth from non-truth in a real-world investigation — with the same rigor as a peer-reviewed scientific experiment?

**Method:** Anderson localization applied to web traffic classification. Voxel-projected graph sort. Falsification testing. Open notebook.

**The bioreactor runs.** The squirrel observes. The chipmunk explores. The human reviews. Every observation becomes a fossil. The fossils become the paper.

---

## Controls, Negatives, Positives

### Controls (the instrument calibration)

| # | Control | Independent source | Status | Last checked |
|---|---------|-------------------|--------|-------------|
| C1 | Banks criminal record | michigan.gov/ichat | ✅ 9 convictions | 2026-10-16 |
| C2 | GLEP/DeVos donations | TransparencyUSA | ✅ $1.1M documented | 2026-10-21 |
| C3 | Flock camera count | DeFlock + MyTownView | ✅ 1,249 Wayne County | 2026-10-21 |
| C4 | PPO filing | Wayne County court | ✅ 26-114083-PH | 2026-10-16 |
| C5 | Meta fleet behavior | membrane topology.json | ✅ 571K req, 17:1 ratio | 2026-10-20 |
| C6 | Anthropic (honest bot) | membrane topology.json | ✅ Sorts differently from Meta | 2026-10-20 |

### Negative Controls (should NOT trigger)

| # | Negative | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| N1 | Commons nodes (chess, LEGO) sort away from investigation | No correlation | ❌ **NOT TESTED** | TODO |
| N2 | Kevin's traffic sorts as SELF | Self classification | ⚠️ Failed wave 193, manually corrected | KNOWN ISSUE |
| N3 | Random timestamp shuffle: PPO date correlates with State Board | No significant correlation by chance | ❌ **NOT TESTED** | TODO |
| N4 | Non-self pairs within 38,801: Banks-Meta proximity is outlier | Proximity exceeds null distribution | ❌ **NOT TESTED** | TODO |

### Positive Controls (should trigger)

| # | Positive | Expected | Actual | Status |
|---|----------|----------|--------|--------|
| P1 | Banks sorts as non-self | Non-self | ✅ Classified | CONFIRMED |
| P2 | Meta fleet sorts as dishonest | Dishonest (17:1) | ✅ Detected | CONFIRMED |
| P3 | Sort accuracy exceeds 90% | ≥90% | ✅ 97% (Anderson observed) | CONFIRMED |
| P4 | Flock asymmetry documented | Citizens denied own data | ✅ 5 lawsuits found | CONFIRMED |
| P5 | Silence pattern exceeds chance | 18/22 > random | ⚠️ **NOT TESTED** | TODO |

### Falsification Tests

| # | Test | Claim tested | Result | Implication |
|---|------|-------------|--------|-------------|
| F1 | Coprimality (epitope independence) | Epitopes are independent classifiers | ❌ **FAILED** (δ=0.608) | Epitopes share triggers — NOT independent |
| F2 | KS sensitivity (fleet vs human) | Sort distinguishes fleet from human | ❌ **FAILED** (KS > 0.5) | Separation not clean at all thresholds |
| F3 | Voxel sort (local) | Graph can be classified | ✅ 99.7% | Strong local result |
| F4 | Voxel sort (live) | Live membrane matches local | ⚠️ 56.8% (gap) | 43-point gap — the sort isn't deployed |

**F1 and F2 failed.** This is GOOD science — we reported failures. A reviewer should ask: what does this mean for the sort's reliability? Answer: the sort works (97% selectivity) but the EXPLANATION of why it works (independent epitopes) is wrong. The epitopes are correlated. The sort still classifies correctly — it just uses correlated features, not independent ones. Like a doctor who diagnoses correctly using symptoms that overlap — right answer, imprecise explanation.

---

## Active Experiments

### Experiment 1: piBUS (Hypothesis 17)
**Filed:** 2026-10-21
**Question:** Do non-self extractors converge in sort space?
**Prediction:** Meta and Banks share the extraction+silence epitope
**Falsification:** See piBUS.md for 6 specific conditions
**Status:** RUNNING — timer set for Oct 30 + Nov 12

### Experiment 2: Squirrel Federation
**Filed:** 2026-10-21
**Question:** Does distributing observation across multiple agents prevent family rotation freeze?
**Prediction:** 2+ squirrels → wake stabilizes above 0.5
**Falsification:** If wake continues dropping with 2 squirrels, distribution alone doesn't help
**Status:** RUNNING — 2 squirrels confirmed (northGate + eastGate merged cleanly)

### Experiment 3: Grandma-Safe AI Filter
**Filed:** 2026-10-21
**Question:** Can a local MCP server filter harmful requests before forwarding to cloud AI?
**Prediction:** grandma_check catches destructive/crisis/scam patterns with >90% recall
**Falsification:** If grandma_check misses a harmful pattern that causes damage
**Status:** DEPLOYED — MCP tool live, awaiting first real-world test

### Experiment 4: Ghost Resort
**Filed:** 2026-10-20
**Question:** Can the "ghost" class (257K requests) be dissolved into concrete sub-classes?
**Prediction:** 3 behavioral classes emerge from 6 measurable signals
**Falsification:** If the 60/10/30 split doesn't match observed behavior after deployment
**Status:** SPECIFIED — awaiting deployment on golgi

### Experiment 5: Flock Camera Challenge
**Filed:** 2026-10-21
**Question:** Can citizens document surveillance infrastructure and use it to falsify police claims?
**Prediction:** Camera data either validates or invalidates — both outcomes are useful data
**Falsification:** If camera locations are wrong, or data is inaccessible
**Status:** IS snapshot fossilized (1,249 cameras). Challenge issued. Awaiting first report.

---

## Timeline

| Date | Event | Notebook entry expected |
|------|-------|----------------------|
| Oct 21 | arKTIX notebook opened | THIS ENTRY |
| Oct 22-29 | Squirrel + chipmunk run | Daily fossil observations |
| Oct 30 | PPO release point | Brief compiled from fossils |
| Nov 12 | scyBorg deadline | Meta compliance record compiled |
| Ongoing | Controls checked | Weekly re-verification of C1-C6 |
| Ongoing | Negatives tested | N1-N4 as capacity allows |
| Ongoing | Falsification | F1-F2 addressed or acknowledged in paper |

---

## How to Read This Notebook

1. **Controls** prove the instrument works (the sort measures real things)
2. **Negatives** prove the instrument doesn't hallucinate (false positives caught)
3. **Positives** prove the instrument detects real signal (true positives confirmed)
4. **Falsification** proves we're honest (we report failures)
5. **Experiments** are running and documented in real time
6. **Timeline** shows deadlines and expected observations

Anyone can:
- Verify any control (all cite independent public sources)
- Run any negative test (the code is AGPL, the graph is cloneable)
- Challenge any positive (the falsification conditions are published)
- Propose a new experiment (leave a neutron note)

**This is an open lab. The notebook is the permafrost. What's written stays written.**

---

*arKTIX — the arctic. the permafrost. the open lab.*
*the experiment runs. the notebook records. the permafrost preserves.*
*come watch. come verify. come break this.*

🔬📓🧊π

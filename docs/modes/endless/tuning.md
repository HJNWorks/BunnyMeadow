# Endless — Tuning

The per-difficulty numbers that drive Endless, the current values, and the findings that
motivate the redesign. Hub: [design.md](design.md). Source: `src/data/endless.json`.

## Current difficulty table

From `src/data/endless.json`, one row per preset:

| Preset | chaseSpeed | chaseRampPer100m | chaseMaxBehind | startTier | tierRampMeters | breatherEvery | carrotChance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sprout | 0 | 0 | 1000 | 1 | 500 | 4 | 0.85 |
| hopper | 70 | 6 | 780 | 1 | 380 | 5 | 0.60 |
| wildhare | 95 | 8 | 700 | 2 | 320 | 6 | 0.50 |
| moonlit | 120 | 10 | 620 | 2 | 260 | 7 | 0.40 |
| hardcore | 150 | 12 | 540 | 3 | 220 | 8 | 0.30 |

Meaning:

- chaseSpeed: base mist wall speed. Sprout is 0, so Sprout has no chase pressure.
- chaseRampPer100m: how much the wall speeds up per 100 m.
- chaseMaxBehind: how far the wall may trail before it stops falling further back.
- startTier: the tier at 0 m.
- tierRampMeters: metres per one tier increase (`tierForMeters` = startTier + floor(dist / this)).
- breatherEvery: every Nth chunk is forced down to tier 2 or lower for a rest.
- carrotChance: probability a chunk carrot slot is filled.

Environment change is no longer this table. The route walker uses `bandMeters` and
`biomeGraph`. `envSchedule` stays in the JSON unused.

| Preset | bandMeters (min-max) |
| --- | --- |
| sprout | 120-260 |
| hopper | 110-240 |
| wildhare | 100-220 |
| moonlit | 90-220 |
| hardcore | 80-200 |

## The finding

Observed leaderboard on Moonlit tops out near 145 m, with most rows well under 100 m (see
the lobby screenshot in the project history). Two consequences:

1. At 145 m the run is still inside the meadow band (0-400 m), so orchard and everything
   above, including the Riverbank water region, are never seen. This is the "I never
   reached a water region" report.
2. On Moonlit, startTier 2 with tierRampMeters 260 means tier 3 begins at 260 m, which most
   runs never reach, so the difficulty that is felt comes from the chase speed and enemy
   density at low tiers, not from tier progression. The run reads as "flat and hard".

## What I1 changed

The three-axis design in [design.md](design.md) decouples scenery change from distance.
Route and tier are live:

- Environment change uses the route walker and the `bandMeters` table above. With Moonlit
  ending near 145 m, a 90-220 m range means a run changes scenery roughly once before it
  ends, so most runs see at least one biome shift and can reach water early via a lateral
  edge.
- Tier has a seeded jitter of plus or minus one around `tierForMeters`, bounded to 1-5.
- The osmanthus rung still trends upward because late climb bias favors up-edges.

## Open tuning questions

- Whether to lower Moonlit and Hardcore chase speed slightly now that scenery changes sooner,
  so a run lasts long enough to see two or three biomes.
- Whether `bandMeters` should shrink with distance so late runs cycle scenery faster.
- Chase-speed retune is out of I1. Revisit if runs still die before a second biome.

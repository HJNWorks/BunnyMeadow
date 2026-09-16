# Iteration I1 — Biome Route and Shorter Bands

Goal: make Endless runs vary by seed and reach later biomes early, without touching enemies or
art yet. Hub: [README.md](README.md). Design: [../modes/endless/design.md](../modes/endless/design.md).

## Why first

It is the highest-impact change for the smallest code: the "always the same pattern" and "never
reached water" reports both come from environment and tier being pure functions of distance
([../modes/endless/tuning.md](../modes/endless/tuning.md)).

## Deltas

Data (`src/data/endless.json`):

- Add a `bandMeters` min-max per difficulty (starting ranges in
  [../modes/endless/tuning.md](../modes/endless/tuning.md)).
- Add the biome graph edges and edge weights, or a small `biomeGraph` block, so the route walker
  has adjacency and an altitude-climb bias.
- Keep `envSchedule` temporarily as a fallback until the walker is trusted.

Code (`src/modes/endless/EndlessGenerator.ts`):

- Replace `getEnvBand(distance)` with a seeded route walker that holds a biome for a `bandMeters`
  band, then steps to an adjacent biome by weighted choice (see the route rules in
  [../universe/biome-graph.md](../universe/biome-graph.md)).
- Add a plus or minus one seeded jitter to `tierForMeters`, bounded 1-5.
- Preserve the `mulberry32` draw order or accept that existing seeds reset here (call it out in
  release notes).

## Graduates to live

- [../modes/endless/design.md](../modes/endless/design.md): route walker, three-axis split (route
  and tier axes; slots wait for I2).
- [../universe/biome-graph.md](../universe/biome-graph.md): the route walker rules.

## Deferred to later iterations

- Bridge chunks and the sky lerp (snap remains until I3).
- Enemy and item slots (I2).

## Ship

Build gate must still pass (`npm run build` runs the three checks plus `tsc`). Ship to Pages, tag a
patch version (see the versioning notes in [../ROADMAP.md](../ROADMAP.md)).

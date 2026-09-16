# Iteration I1 — Biome Route and Shorter Bands

Status: done (shipped in v0.2.0). Hub: [README.md](README.md). Design: [../modes/endless/design.md](../modes/endless/design.md).

## Why first

It was the highest-impact change for the smallest code: the "always the same pattern" and "never
reached water" reports both came from environment and tier being pure functions of distance
([../modes/endless/tuning.md](../modes/endless/tuning.md)).

## Shipped

Data (`src/data/endless.json`):

- `bandMeters` min-max per difficulty (ranges in [../modes/endless/tuning.md](../modes/endless/tuning.md)).
- `biomeGraph` nodes (sky, name) and edges with `climb` for the six live rungs.
- `envSchedule` kept unused as a fallback. The walker does not read it.

Code (`src/modes/endless/EndlessGenerator.ts`):

- Seeded route walker holds a biome for a `bandMeters` band, then steps to an adjacent
  biome by weighted choice ([../universe/biome-graph.md](../universe/biome-graph.md)).
- Plus or minus one seeded jitter on `tierForMeters`, bounded 1-5, then the existing
  breather cadence.
- `getEnvKit(env)` replaced `getEnvBand(distance)`. The scene snaps sky from the chunk
  the player is in.
- Prefetch uses chunk-origin metres so lookahead is not stuck on meadow.

Seeds from 0.1.0 do not replay. The walker and jitter consume extra rng draws.

## Graduated to live

- [../modes/endless/design.md](../modes/endless/design.md): route walker and tier axes.
- [../universe/biome-graph.md](../universe/biome-graph.md): the route walker rules in force.

## Still later

- Tunnels, cloudsea, moon, and key-gated edges.

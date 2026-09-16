# Iteration I3 — Theme and Rendering

Status: done (shipped in v0.2.0). Palettes in data, sky lerp on bridges,
weather presets, and cheap night lighting. Hub: [README.md](README.md). Rendering:
[../rendering/README.md](../rendering/README.md).

## Deltas

Data:

- New `src/data/palettes.json`: the six-token palette per biome with concrete hex
  ([../rendering/palettes.md](../rendering/palettes.md)).
- Bridge chunk files for the graph edges ([../universe/biome-graph.md](../universe/biome-graph.md)),
  named `bridge_<src>_<dst>`.

Code:

- Read palette tokens from data so a chunk's colours come from the biome, enabling skinnable layouts
  ([../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md)).
- Sky and fog lerp across a bridge chunk instead of the current band snap.
- Weather emitter with the presets in [../rendering/effects.md](../rendering/effects.md), chosen per
  biome and gated by hour.
- Night multiply overlay with lantern additive radii; darkness in Burrow Tunnels.
- Rebuild the mist wall as layered fog-coloured bands with the fox motif on the leading edge.

## Graduates to live

- [../rendering/palettes.md](../rendering/palettes.md): palettes.json and the sky lerp.
- [../rendering/effects.md](../rendering/effects.md): weather presets, night lighting, the layered
  mist wall.
- [../universe/biome-graph.md](../universe/biome-graph.md): bridge chunks (snap fallback removed).
- Skinnable layouts can now land, since colour no longer lives in the layout file.

## Profile before finishing

Run the checks in [../rendering/performance.md](../rendering/performance.md): mist wall cost, draw
calls during a bridge, atlas memory during a fast route walk.

## Ship

In the tree on 0.1.0. No version tag until I4. Pages when asked.

## Graduated (done)

Palettes, weather, and night are live on Story and Endless. Bridges, sky lerp, and layered
mist are Endless-only. Meadow and Tasks are unchanged.

# Environment — Burrow Tunnels

Status: live as the first chunk of Moon in the Pool (`chunk_pool_tunnel`). Not a
fourth World Map station. Hub: [../README.md](../README.md).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | underground |
| Hour | afternoon (before the climb) |
| Lore anchor | the burrow home, Mei and Yue, the burrow family ([../../creatures/kits/](../../creatures/kits/)) |
| Movement verb | run, jump (no dash yet) |
| Hazard vocabulary | gaps, void (unlit drops) |

## Feel

Narrow, dark, cosy. A short opening rung: root-lined tunnels lit by a thin shaft of
afternoon light from the entrance. Vertical lifts (root bundles) carry the player up
toward the meadow mouth. No enemies chase here. It is a warm-up before the open field.
The first playable map is Moon in the Pool (pond, no wildlife, controls). Fireflies at
dusk outside. One keepsake on the pond chunk, not in the dark.

## Roster

Wildlife: none native. A single tunnel beetle (idea, `patrol`) could add gentle
motion without threat.

## Item table

| Item | Weight | Notes |
| --- | --- | --- |
| carrot | high | the pantry staple, stored here |
| dew | low | planned I8 on the meadow mouth, not in the dark |
| osmanthus seed | none here | hidden on the pond chunk |

## Endless status

Reachable only on a dark-seed roll at the start of a run (see the route walker in
[../biome-graph.md](../biome-graph.md)). It bridges up into Meadow via
`bridge_tunnels_meadow`.

## Render notes

No sky; a dark cavern band with a warm entrance glow. Night lighting overlay used for
darkness rather than time of day, with a small light radius around the player. Weather
preset: dust motes. This is the one rung where the lighting overlay is on during the
afternoon.

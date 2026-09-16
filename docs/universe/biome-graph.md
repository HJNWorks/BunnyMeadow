# Bunny Meadow — Biome Graph

This page turns the Ladder ([README.md](README.md)) into a graph. Nodes are
environments. Edges are the legal transitions between them, each with a named bridge
chunk that blends the two palettes and hours. Story walks a fixed path across this
graph. Endless walks a seeded path. Hub: [../WORLDS.md](../WORLDS.md).

## Nodes and edges

```mermaid
flowchart LR
  tunnels[BurrowTunnels_planned] --> meadow
  meadow --> orchard
  meadow --> riverbank
  orchard --> bamboo
  orchard --> riverbank
  bamboo --> riverbank
  riverbank --> bamboo
  riverbank --> lantern
  bamboo --> lantern
  lantern --> osmanthus
  osmanthus --> lantern
  osmanthus --> cloudsea[CloudSea_planned]
  cloudsea --> moon[MoonGarden]
```

Edges are directed by default up the Ladder. Two back-edges exist on purpose so a
route can dip and re-climb: `osmanthus -> lantern` and `riverbank -> bamboo`. Sky
and moon (`cloudsea`, `moon`) are reachable in Story only, or in Endless only after
a key item unlocks them (see [../items/catalog.md](../items/catalog.md)).

## Bridge chunks

A bridge is a short chunk placed on an edge. It carries the palette from the source
rung on its left third and the destination rung on its right third, with the sky
token lerped across (see [../rendering/palettes.md](../rendering/palettes.md)). It
teaches no new verb and hosts no boss.

| Edge | Bridge chunk id | Status |
| --- | --- | --- |
| meadow -> orchard | bridge_meadow_orchard | live |
| meadow -> riverbank | bridge_meadow_riverbank | live |
| orchard -> bamboo | bridge_orchard_bamboo | live |
| orchard -> riverbank | bridge_orchard_riverbank | live |
| bamboo -> riverbank | bridge_bamboo_riverbank | live |
| bamboo -> lantern | bridge_bamboo_lantern | live |
| riverbank -> bamboo | bridge_riverbank_bamboo | live |
| riverbank -> lantern | bridge_riverbank_lantern | live |
| lantern -> osmanthus | bridge_lantern_osmanthus | live |
| osmanthus -> lantern | bridge_osmanthus_lantern | live |
| tunnels -> meadow | bridge_tunnels_meadow | planned (no playable tunnels) |
| osmanthus -> cloudsea | bridge_osmanthus_cloudsea | planned |
| cloudsea -> moon | bridge_cloudsea_moon | planned |

Live bridges are short pad chunks (`width` 640, no enemies). The walker queues
`bridge_<from>_<to>` on `stepRoute`. If a file is missing, the destination layout is the
lerp span. Off-bridge, sky still snaps to the current kit.

## Endless route walker (live, I1)

The walker in `src/modes/endless/EndlessGenerator.ts` reads `biomeGraph` and
`bandMeters` from `src/data/endless.json`. I1 omitted tunnels, cloudsea, moon, and key
items. I3 adds live bridge chunks for the six playable rungs.

Rules in force:

1. Start at `meadow`.
2. Hold the current rung for a band length drawn from the difficulty's
   `bandMeters` range (for example Moonlit 90-220 m).
3. At a band boundary, choose an outgoing edge. Weight is `max(0.05, 1 + (climbBias - 1) * climb)`
   with `climbBias = min(2, distanceM / 400)`. Early runs favor lateral and dip edges
   (meadow to riverbank). Later runs favor up-edges.
4. Never stay on the same rung more than twice in a row if another edge exists.
5. Sky and moon edges stay closed (no live chunks, no key item yet).
6. On a biome change, queue `bridge_<from>_<to>` before destination layouts. Sky and
   night lerp while the player is on that chunk.

The walker only decides the biome sequence. Layout tier is a separate axis (see
[../modes/endless/design.md](../modes/endless/design.md)), so the same layout can be
skinned to any rung its hazard vocabulary allows.

## Hazard vocabulary per node

This constrains which chunk hazards and movers are legal on each rung, and it is the
same table the creature rosters key off.

| Node | Legal hazards | Legal movers | Signature |
| --- | --- | --- | --- |
| tunnels | gaps, void | vertical lifts | darkness, narrow |
| meadow | gaps | horizontal drift | gentle |
| orchard | gaps | horizontal drift | wider gaps |
| bamboo | gaps, shafts | vertical shafts | wall bounce |
| riverbank | current, gaps | drifting logs (x and y) | water |
| lantern | gaps | horizontal drift | glide zones |
| osmanthus | gaps, wind, void | wind gusts | rising floor |
| cloudsea | wind, void | wind platforms | sky |
| moon | void | low-gravity floats | low gravity |

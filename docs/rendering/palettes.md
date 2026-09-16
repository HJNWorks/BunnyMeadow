# Rendering — Palettes

Every biome renders from the same six colour tokens, so a new rung is coherent by filling a
table rather than hand-picking colours per level. Hub: [README.md](README.md). Biomes:
[../universe/environments/](../universe/environments/).

## The token set

| Token | Used for |
| --- | --- |
| sky | the backdrop fill and the far gradient top |
| far | distant parallax layer (hills, clouds, palace) |
| mid | mid parallax layer (trees, stalls, stalks) |
| ground | the platform and ground fill |
| accent | props, pickups highlight, signage |
| fog | the mist wall and any haze at this rung |

## Current values

Only the sky token exists today, as `sky` in `src/data/endless.json`, plus a per-chunk
`color` fallback. The rest are proposed and should move into a `palettes.json` so Endless can
reskin a layout at runtime ([../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md)).

| Biome | sky (today) | far | mid | ground | accent | fog |
| --- | --- | --- | --- | --- | --- | --- |
| burrow-tunnels | (none) | dark loam | root brown | packed earth | warm entrance glow | dust grey |
| meadow | #c5d48a | soft hill green | grass green | earth | carrot orange | pale mist |
| orchard | #b8c47a | golden hill | fruit-tree green | earth | apple red | warm haze |
| bamboo | #5f7a52 | dusk ridge | bamboo green | shadowed earth | lantern amber | dusk grey |
| riverbank | #6b94a0 | dusk water | reed green | mud | log brown | river mist |
| lantern | #3d4560 | night hill | stall wood | cobble | lantern red-gold | night haze |
| osmanthus | #40364a | peak silhouette | pine dark | rock | blossom gold | wind grey |
| cloud-sea | (proposed) | star field | pale cloud | cloud shelf | moon silver | cloud white |
| moon | (proposed) | star field | palace jade | moon grey | jade green | cold blue |

Values above are descriptive placeholders. Concrete hex is authored in
[../iterations/i3-theme-rendering.md](../iterations/i3-theme-rendering.md).

## Sky lerp across bridges

At a biome change the sky should not snap. On a bridge chunk
([../universe/biome-graph.md](../universe/biome-graph.md)) the sky and fog tokens lerp from
the source biome's value on the left edge to the destination's on the right edge, driven by
the player's x within the bridge. Today, with no bridges, Endless snaps the sky when the player enters a new rung
(`getEnvKit`). I3 replaces that snap with a lerp on a bridge chunk.

## Derivation from the five axes

Palette is read off the altitude and hour axes ([../universe/README.md](../universe/README.md)):

- Hour sets the sky and far brightness: afternoon and golden are warm and light, dusk cools,
  night and deep night darken and shift blue.
- Altitude sets the ground and mid content: underground loam, ground grass, hills bamboo,
  town cobble, mountain rock, sky cloud, moon grey.
- The accent is the biome's signature prop colour (carrot, apple, lantern, blossom).

This keeps a new rung's palette a lookup, not a fresh art decision.

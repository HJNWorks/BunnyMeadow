# Rendering — Palettes

Every biome renders from the same six colour tokens, so a new rung is coherent by filling a
table rather than hand-picking colours per level. Hub: [README.md](README.md). Biomes:
[../universe/environments/](../universe/environments/). Data: `src/data/palettes.json`.
Code: `src/modes/story/shared/themeKit.ts` (Story and Endless).

## The token set

| Token | Used for |
| --- | --- |
| sky | the backdrop fill and the far gradient top |
| far | distant parallax layer (hills, clouds, palace) |
| mid | mid parallax layer (trees, stalls, stalks) and Endless wash |
| ground | the platform grass tint |
| accent | props, pickups highlight, signage |
| fog | the mist wall and any haze at this rung |

Each live rung also stores `hour` (`afternoon` | `golden` | `dusk` | `night` | `deepNight` | `eternal`)
and `weather` (a preset id). Tunnels are omitted until that rung has playable chunks.
Cloud Sea is live in Story.

## Live values (I3)

Hex lives in `src/data/palettes.json`. Story may still override `sky` per level.

| Biome | sky | far | mid | ground | accent | fog | hour | weather |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| meadow | #c5d48a | #b8c97a | #8fad5c | #6b5338 | #e07a32 | #d7e0c8 | afternoon | pollen |
| orchard | #b8c47a | #c4b05a | #7a9a48 | #6a4e32 | #c44a3a | #e4d8b0 | golden | leaves |
| bamboo | #5f7a52 | #4a6342 | #3d6a3a | #3a3228 | #d4a24a | #8a9a80 | dusk | leaves |
| riverbank | #6b94a0 | #5a8490 | #6a8a62 | #4a3c30 | #8a6a48 | #b0c4c8 | dusk | drizzle |
| lantern | #3d4560 | #2c3348 | #5a4638 | #3a322c | #e07040 | #5a5870 | night | fireflies |
| osmanthus | #40364a | #322940 | #2a3828 | #3a3838 | #e8c45a | #6a6878 | deepNight | blossom |
| moon | #151b2e | #1a2438 | #3a5a52 | #6a6e72 | #7ec8a0 | #3a4868 | eternal | blossom |
| cloudsea | #6a88b8 | #8aa8c8 | #c8d8e8 | #9aa8b4 | #e8f4ff | #d0e0f0 | deepNight | snow |

Night overlay strength from hour: afternoon and golden 0, dusk 0.25, night 0.45, deepNight 0.55,
eternal 0.5.

## Sky lerp across bridges

On an Endless chunk whose `endless.bridgeTo` is set, camera sky, far wash, night overlay, and
mist fog lerp from the source palette to the destination by the player's local x. Off a
bridge, the kit snaps to the chunk the player is in. Story does not lerp. Meadow and Tasks
do not use this kit.

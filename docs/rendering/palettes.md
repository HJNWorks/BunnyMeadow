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
| moon | #12161c | #1c222c | #4a5158 | #6a7076 | #c8d4e0 | #2a323c | eternal | starDrift |
| ch2_outer | #10141a | #1a2028 | #4e565e | #6c7278 | #b8c4d0 | #2a323c | eternal | starDrift |
| ch2_cassia | #14161a | #1e2226 | #5a5248 | #6a6258 | #d4b05a | #2c2824 | eternal | none |
| ch2_mortar | #101214 | #1a1c20 | #3a3e44 | #4a4e54 | #c4b8a8 | #222428 | eternal | starDrift |
| ch2_dust | #161410 | #242018 | #8a8478 | #9a9488 | #d8d0c0 | #3a3830 | eternal | dustMotes |
| ch2_wells | #080a0e | #10141a | #2a3038 | #3a4248 | #8aa0b4 | #12161c | eternal | starDrift |
| ch2_silver | #12161c | #1c2430 | #6a7480 | #8a94a0 | #e8eef4 | #2a343c | eternal | starDrift |
| cloudsea | #6a88b8 | #8aa8c8 | #c8d8e8 | #9aa8b4 | #e8f4ff | #d0e0f0 | deepNight | snow |

Night overlay strength from hour: afternoon and golden 0, dusk 0.25, night 0.45, deepNight 0.55,
eternal 0.5. The map editor Night overlay checkbox forces a visible dark wash even when
hour is afternoon. Night amount is 8-80. Optional fog hex adds a multiply wash.

## Sky lerp across bridges

On an Endless chunk whose `endless.bridgeTo` is set, camera sky, far wash, night overlay, and
mist fog lerp from the source palette to the destination by the player's local x. Off a
bridge, the kit snaps to the chunk the player is in. Story does not lerp. Meadow and Tasks
do not use this kit.

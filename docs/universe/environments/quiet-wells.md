# Environment — Quiet Wells

Status: live (Chapter 2, three stations: Cave Mouths, False Lip, Well Silver). Cold caves and still silver pools. Hub:
[../README.md](../README.md). Toad:
[../../LORE.md](../../LORE.md#moon-toad--chanchu-蟾蜍).

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | moon (shallow caves) |
| Hour | eternal night |
| Lore anchor | moon toad as background. Monkeys scooping the moon ([../../LORE.md](../../LORE.md#monkeys-scooping-the-moon-猴子撈月)) |
| Movement verb | low gravity, cave hops, reading the light |
| Hazard vocabulary | still water, reflection lips, dim lips, swooping bats |

## Feel

Caves under the dust, not a return to the burrow. She stops because the first dark
mouth is false. Well silver shows the real lip. The three-legged toad may sit in a
well. It is never the antagonist and not a model.

Ordinary Moon Pools here still speak one Chang'e line. They are not the One Pool.

## Lore

- **Still water lies.** In the tale the monkeys chain themselves to scoop the moon from
  a well and fall in. It was only a reflection. Here the still water shows ledges that
  are only reflections. Step on one and you fall in.
- **The real stone is dark.** Real ledges lie unlit. They are solid even unseen.
- **Well silver is light.** A drop of the pools' silver lights what is near. Dim lips
  come up and stay up. Reflection lips show what they are: ripples, not stone. The
  rule players learn: **silver always rests on real stone.** If you see silver floating
  in the dark, there is a lip under it.
- **Bats are lucky.** Silver bats hang from the roof and swoop. 蝠 is 福, fortune.
- **The toad at the last well.** The three-legged moon toad sits on the curb of the
  last still well, like the frog in Zhuangzi's well that thought the sky was only as
  big as the mouth. It does not move. Mei goes on past it toward the far silver.

## Stations

Low gravity (0.42 g): a jump rises about 215 px and carries about 300 px on the flat.
Every hop on the true path is a single jump, lit or not.

| Station | Chunks | Teaches | Test | Pool |
| --- | --- | --- | --- | --- |
| Cave Mouths | `a`, `b`, `g` | Silver on the path lights the first dim lip and shows the reflection below it | A second silver lights a two-lip dark stretch to the well-head floor. Bats | chunk 1 |
| False Lip | `c`, `d`, `h`, `i` | Silver floats in the dark: jump to it, there is stone under it | Nine reflections over two long pools. A star wisp in the middle. Three bats | chunk 2 |
| Well Silver | `e`, `f`, `j`, `k` | Long dark chains with silver on every other lip | Ten dark lips, ten reflections, three bats and two star wisps. The moon toad at the last well | chunk 1 |

Chunk ids are `chunk_ch2_wells_{a..k}`.

## Mechanics

| Piece | JSON | Behaviour |
| --- | --- | --- |
| Dim lip | platform with `"dim": true` | Solid always. Drawn at 5% until well silver lights it, then fades up for good |
| Reflection lip | decor `kind: "reflection"` | Looks like a lip (stamp `story_reflection`, a faint silver line on its lower edge). No collider. Lit, it drops to 30%, tints silver, and ripples |
| Well silver | item `well_silver` | Lights within 460 px of the pickup, then within 300 px of Mei for the 1.6 s glow. Comes back 5 s after pickup |
| Still water | `hazards[]` `kind: "water"` | Lunar stations draw it dark with a silver skin, not river blue |

## Roster

Folk: moon toad, background only (decor `toad`). Wildlife:
[silver bat](../../creatures/wildlife/silver-bat.md),
[star wisp](../../creatures/wildlife/star-wisp.md).

## Item table

| Item | Notes |
| --- | --- |
| well_silver | Light for dim and reflection lips. Always rests on real stone |
| mooncake | +1 heart. One per station |

## Cave structure

Mass above (`ceiling`, a thin band at y 170–260 with stalactites under it). False
mouths off the hop line. Still water below. One true exit next to a stone well-head.
See [../../platforms/caves.md](../../platforms/caves.md).

## Kit

| Kind | Stamp | Use |
| --- | --- | --- |
| stalactite (decor) | `story_stalactite` | Hangs under the roof band |
| well head (decor) | `story_wellhead` | Octagonal stone curb with silver water. Marks the true exit |
| moon toad (decor) | `story_toad` | Three-legged toad. Only on the last well |
| reflection (decor) | `story_reflection` | See above |

## Render notes

Palette `ch2_wells`: cave dark. Weather `starDrift`. Cave rock stamp. Far layer
`story_far_wells`: roof teeth, two skylights to the dust, still pools.

## Editor

Environment → Chapter 2 → Quiet Wells lists Dim lip, Reflection lip, Stalactite,
Well head, and Moon toad next to cave pieces. In Build, dim lips draw at full strength
so you can place them. Copy JSON keeps `dim`.

## Endless status

Story Chapter 2 only.

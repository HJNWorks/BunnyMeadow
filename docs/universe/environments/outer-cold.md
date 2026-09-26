# Environment — Outer Cold

Status: live (Chapter 2, three stations: Frost Courtyard, Column Walk, Guest Gate). First region after Guanghan.
Still the moon. Not Earth. Hub: [../README.md](../README.md). Chapter: [../../story/chapters.md](../../story/chapters.md).

Reuses the grey lunar family and low gravity. Palette `ch2_outer`: cold stone.
Guanghan roofs recede. Frost courtyards open. Weather: `starDrift`.

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | moon |
| Hour | eternal night |
| Lore anchor | Guanghan outer courts ([../../LORE.md](../../LORE.md#change-嫦娥)), Xuanzong's visit ([../../LORE.md](../../LORE.md#emperor-xuanzongs-visit-to-the-moon-palace-唐明皇遊月宮)) |
| Movement verb | low gravity, chime bounce, frost slide |
| Hazard vocabulary | gaps, frost, guest screens, layered roofs |

## Feel

The palace is behind Mei. The country of Vast Cold is ahead. She stops because the
outer courts still try to keep a guest. A lattice screen drops in the moon gate
and holds her, politely, until the beat lets her through. Chime stones ring under
her paws and throw her up between the columns. Falls still read as drifts.

## Lore

- **The guest habit.** Han was the palace's habit of keeping guests. He settled at
  the inner gate, but the outer courts kept the habit. Their guest screens (留客屏)
  close in the moon gates on a beat. They never hurt a guest. They only hold her on
  her side of the door for a moment.
- **The guest who went home.** On a Mid-Autumn night long ago Emperor Xuanzong was
  a guest here. He read the plaque 廣寒清虛之府 over the gate, heard the moon
  maidens' music, and was let go home with the tune. The courts remember letting a
  guest go. Guest Gate is that gate. Chang'e does not keep Mei either.
- **Chime stones (磬).** Single stone chimes hang from frames between the columns,
  left from the music the Emperor heard. They ring for guests and throw them up.
  No melody plays.
- **Frost.** The flagstones keep Qingnü's frost (青女). It is slick. Thin frosted
  roof tiles crack if Mei stands still. She is never shown.
- **Moon gates (月洞門).** Round doors in the courtyard walls. The first one is the
  palace door behind Mei's spawn. Every guest screen stands in one.

Far layer `story_far_outer`: Guanghan roofs shrinking to the left, a long garden
wall with round doors, open frost ground, and the first cassia tree on the right,
the next world.

## Stations

Low gravity (0.42 g): a jump rises about 215 px and carries about 300 px on the
flat. A chime throws about 330 px and refreshes the air jump, so bounce plus air
jump reaches about 500.

| Station | Chunks | Teaches | Test | Pool |
| --- | --- | --- | --- | --- |
| Frost Courtyard | `a`, `b`, `g` | Leave the palace moon gate. First frost flagstones. First guest screen on the pool court | First chime up to a high cap. Two frost tiles to the exit | chunk 1, before the gate |
| Column Walk | `c`, `d`, `h`, `i` | Chime shafts between column caps. Star grit before the long level gap | Mites between caps. A gate on the pool court, then slick run-off onto a chime. Two-chime climb to the high exit roof | chunk 2 |
| Guest Gate | `e`, `f`, `j`, `k` | Two gates half a beat apart. Wait between them | A screen at the end of the ice. A gate on the pool ledge, then three frost tiles over the drop. The last three gates open in a wave, the third is the grand moon gate | chunk 2 |

Chunk ids are `chunk_ch2_outer_{a..k}`.

## Mechanics

| Piece | JSON | Behaviour |
| --- | --- | --- |
| Guest screen | `movers[]` with `kind: "screen"`, `axis: "y"` | Rect is the shut position (48 × 180 on the floor). `amplitude` 190 lifts it behind its moon gate. `speed` 1.6 ≈ 3.9 s beat. `phase` 0–1 offsets. Opens fast, holds open about half the beat, trembles, closes. Shut, it pushes Mei to her nearer side. No heart |
| Gate lintel | `walls[]` with `"hidden": true` | Invisible collision above the screen up to the top of the world, so a shut screen cannot be hopped |
| Chime stone | `platforms[]` with `asset: "chime"` | One stretched stone. Throws Mei about 330 px, refreshes her air jump, rings |
| Frost flagstone | `platforms[]` with `asset: "ice"` | Slick. Same surface as the Cloud Stair ice |
| Frost tile | ice pad with `break: { profile: "ice", hp: 1.2, sources: ["stand"] }` | Cracks after about a second of standing. Restores on respawn |

Gate recipes:

- Two gates at `0` and `0.5` alternate. The floor between them is the waiting room.
- Three gates at `0, 0.33, 0.66`, about 200 px apart, open in a wave. Mei waits a
  little at each one.
- A screen at the end of an ice run holds a sliding Mei back. That is the joke,
  not a punishment.

## Roster

Folk: none as HP bars. The habit is in the screens, not a creature. Wildlife:
[dust mite](../../creatures/wildlife/dust-mite.md) (courts and column gaps),
[frost wisp](../../creatures/wildlife/frost-wisp.md) (one, over the Guest Gate ice.
Palace corridors are already its home).

## Item table

| Item | Notes |
| --- | --- |
| mooncake | +1 heart. On high caps and between the gates |
| star_grit | 2.5 s boosted jump. Before the long level gap in Column Walk. Comes back 5 s after pickup |

## Kit

| Kind | Stamp | Use |
| --- | --- | --- |
| moon door (decor) | `story_moondoor` | Square. The round opening's bottom sits on the floor. Drawn behind pads |
| chime frame (decor) | `story_chimeframe` | Beam and cords above a chime stone. Drawn behind pads |
| guest screen (mover) | `story_screen` | Lattice panel with a round window and frost at the sill |
| chime stone (pad) | `story_chime` | Bent stone chime |
| column (decor) | `story_hedge_moon` | Under roof caps |
| lantern (decor) | `story_lantern` | Palace lamps along the courts |

## Render notes

Grey pads. Stone columns. No meadow hedge. No falling blossom.

## Endless status

Story Chapter 2 only. Not on the Endless Earth ladder.

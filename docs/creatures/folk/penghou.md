# Folk — Penghou (彭侯)

Status: live. Class: Folk (Chapter 2 boss). Hub: [../README.md](../README.md).
LORE: [adapted](../../LORE.md#penghou-spirit-of-an-old-tree-彭侯). Code:
`src/modes/story/shared/penghouBoss.ts`.

## Role

The spirit of Wu Gang's cassia. In the Soushen ji a felled tree bleeds and a tailless,
dog-bodied spirit with a human face comes out. This tree is cut forever, so its spirit
never rests. It keeps the gold heartwood at the top of the trunk and mends what it
can. It takes Mei for one more woodcutter. It is a misunderstanding, like the Crane
Envoy, not malice.

## Boss encounter

Cassia Wound, Gold Core. The heartwood room is the last part of the station.

- **Start.** Mei comes up through the floor cut into the room (`boss.court`). The spirit
  wakes and the floor cut seals behind her.
- **Goal.** Four gold cuts glow on the heartwood walls (`boss.cuts`). Mei closes one by
  touching it. The HUD shows open cuts as the spirit's hearts.
- **Calm.** Each closed cut makes it stagger and howl (harmless for 1.2 s) and clears its
  shards. When the last cut closes it settles: it glows gold, stops, and speaks. The
  floor cut opens again and the exit on the room floor works.
- **Mei cannot hurt it.** No stomp, no warmth dash. A dash passes through it and its
  shards safely.

Pressure:

| Attack | Tell | Counter |
| --- | --- | --- |
| Prowl | Runs at Mei along the floor and ledges | Keep moving. Dash through |
| Leap | When Mei is above it and close, it jumps | Change ledge |
| Bark volley | Stops and flickers gold for 0.55 s, then three bark shards (five when half the cuts are closed) fan toward Mei | Step out of the fan, or dash |

With half the cuts closed it runs faster (95 → 135), leaps more often, and fires
sooner. Contact or a shard costs one heart. If Mei's hearts run out, or she leaves the
room before it settles, the fight resets: every cut opens again.

Healing bark ledges in the room crack under Mei and grow back in 3 s.

## Voice

Four ticker lines (`penghou.wake`, `penghou.mid`, `penghou.last`, `penghou.settled`),
the same HUD as Moon Pools. Wav files are optional ([voices.md](../voices.md)).

## Guard

Never cooked, eaten, killed, or cut. That part of the source is dropped. Not Wu Gang,
not Chang'e, not Yutu. Wu Gang stays a far figure outside. Penghou does not follow
Mei out of the tree.

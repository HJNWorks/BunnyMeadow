# Environment — Mortar Yard

Status: live (Chapter 2, three stations: Stone Bowls, Pestle Beat, Cake Rounds). Yutu’s elixir work. Not a kitchen. Hub:
[../README.md](../README.md). Lore:
[../../LORE.md](../../LORE.md#jade-rabbit--yutu-玉兔).

Chinese moon-rabbit tradition is pounding medicine with mortar and pestle. Japanese
mochi-pounding is forbidden. Mooncakes are correct.

> 白兔捣药秋复春，嫦娥孤栖与谁邻 — Li Bai, 把酒问月. The white hare pounds medicine
> autumn after spring. Who keeps Chang'e company?

## Five axes

| Axis | Value |
| --- | --- |
| Altitude | moon |
| Hour | eternal night |
| Lore anchor | Jade Rabbit / Yutu |
| Movement verb | low gravity, pestle ride, roller ride |
| Hazard vocabulary | pestle beats, rolling cakes, stone bowls |

## Feel

A workshop of cold stone and round cakes. She stops because a pestle beat owns the
next bowl. She waits, then hops. Yutu is comic and busy. He is not an HP bar and
not a model.

## Lore

The yard lies past the Cassia Wound. Giant stone mortars are sunk in the dust, rim
to rim, with dark gaps between them. The gaps are the only danger that is not
stone.

- **Pound, do not cook.** The elixir is pounded. No furnace, no cauldron, no fire.
  Drying racks and roller troughs are the only furniture.
- **Wu Gang's chips.** Every blow on the self-healing tree knocks bark loose. The
  chips drift here and Yutu pounds the cassia into the elixir. Cassia grubs (桂蠹)
  ride in on the chips. See [LORE.md](../../LORE.md#cassia-grub-桂蠹).
- **Yard pestles.** Tall jade pestles keep Yutu's beat while he is busy at the
  palace. Jade because of the jade pestle and mortar of the Pei Hang tale
  ([LORE.md](../../LORE.md#jade-pestle-and-mortar--pei-hang-玉杵臼-裴航)).
- **Cake rounds.** Yutu's medicine-roller wheels (藥碾). He stamps each face with a
  mooncake-mould edge, so the yard calls them cakes.
- **Cakes keep the time.** Yutu leaves one mooncake per finished round of pounding.
  Travellers may take them. That tally is why mooncakes sit on pestle heads and
  rims.
- **Elixir crumbs** are unfinished dust knocked from a bowl. They only lighten a
  fall. They are not immortality. Mei stays mortal.

Yutu himself is the far silhouette pounding on the great mortar at the horizon
(`story_far_mortar`). Yue went home with the crane after Guanghan. He is back at
work. He never comes down to the hop line.

## Stations

Each station teaches one idea, then tests it. Low gravity (0.42 g): one jump
rises about 215 px and carries about 300 px on the flat. Every static hop on the
main route is a single jump. Two optional skill routes need a double jump.

| Station | Chunks | Teaches | Test | Pool |
| --- | --- | --- | --- | --- |
| Stone Bowls | `a`, `b`, `g` | Bowl rims. One pestle slams beside the path. Ride it up for the first mooncake | Two pestles half a beat apart. Wait on the narrow rim between them | chunk 1, on the floor slab |
| Pestle Beat | `c`, `d`, `h`, `i` | Three pestles in one long bowl lift left to right at run speed. Follow the wave | Pestle lift up to the drying tables. Lone bowls that are the only floor. Chain lift: ride one pestle, hop to the next, reach the exit ledge | chunk 2 |
| Cake Rounds | `e`, `f`, `j`, `k` | One cake round rolls a sunk trough. Ride it or hop it | A raised trough on a column. Trough then pestle. Faster round, then the great pestle over the last bowl | chunk 2 |

Chunk ids are `chunk_ch2_mortar_{a..k}`. Pestle Beat ends on a high ledge guarded
by a pestle sentry. Cake Rounds ends on a slab past the great bowl, so the exit is
never hidden behind a mortar.

## Mechanics

| Piece | JSON | Behaviour |
| --- | --- | --- |
| Yard pestle | `movers[]` with `kind: "pestle"`, `axis: "y"` | Rect is the strike position in the bowl. `amplitude` is the lift in px. `speed` in rad/s (2.1 ≈ 3 s beat). `phase` 0–1 sets the beat offset. Lift, hold, tremble, slam, rest |
| Cake round | `movers[]` with `kind: "roller"`, `axis: "x"` | Square rect (96). Rolls on `amplitude` and spins by distance. `phase` sets the start |

Both are one-way on top. Mei rides the knob or the wheel. A slam onto Mei under
the head, or the rolling side of a round, costs a heart and bumps her clear of
the column. A dash does not pass through. Beat telegraph: a shadow darkens on the
bowl through the hold and the head trembles just before the slam. The slam throws
pale dust. Reduced motion keeps the shadow, drops the tremble, and cuts the dust.

Phase recipes:

- Two pestles at `0` and `0.5` alternate. The rim between them is the wait spot.
- A row at `0.4, 0.2, 0` from left to right, 150 px apart, is a wave that lifts at
  run speed. Start right after the first slam and keep running.
- Pestle chains alternate `0` and `0.5` so the next knob is low when you are high.

## Roster

Folk: Yutu (NPC, far silhouette only). Wildlife:
[pestle sentry](../../creatures/wildlife/pestle-sentry.md),
[cassia grub](../../creatures/wildlife/cassia-grub.md).

## Item table

| Item | Notes |
| --- | --- |
| mooncake | +1 heart (Endless and Story hops). Guanghan cakes stay warmth ammo. In the yard it is Yutu's tally, often on top of a pestle's lift |
| elixir_crumb | 2.5 s slow-fall. On the Pestle Beat drying table before the long drop |

## Kit

| Kind | Stamp | Use |
| --- | --- | --- |
| bowl pad | `story_bowl` | Floor of a mortar. Hidden under the mortar decor |
| mortar (decor) | `story_mortar` | Stone vessel under every bowl pad. Lip on top, body into the dust |
| trough (decor) | `story_trough` | Roller channel drawn over a sunk floor pad |
| rack (decor) | `story_rack` | Drying rack with cassia bark and herb bundles |
| column (decor) | `story_hedge_moon` | Under high stone slabs (drying tables) |
| yard pestle (mover) | `story_pestle_big` | Jade pestle. 48 × 200 default. The great pestle is 64 × 240 |
| cake round (mover) | `story_roller` | Stone wheel with a mooncake-mould edge |

## Render notes

Palette `ch2_mortar`: basalt bowls. Weather `starDrift`. Far layer
`story_far_mortar`: mortars, a leaning pestle, a drying rack, and the rabbit
pounding on the great mortar.

## Editor

Environment → Chapter 2 → Mortar Yard lists Yard pestle, Cake round, Mortar,
Roller trough, and Drying rack next to the core kit. Creatures → Chapter 2 →
Mortar Yard lists the cassia grub. The inspector does not edit `amplitude`,
`speed`, or `phase` yet. Set them in the chunk JSON. Copy JSON keeps `phase`.

## Endless status

Story Chapter 2 only.

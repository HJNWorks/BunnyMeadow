# Bunny Meadow — Worlds and Environments

Chapter 1 (live): 4 worlds x 3 levels plus moon finale. Chapter 2 first stations are
live. Chapter 3 West of Silver is planned.
Hub of chapters: [story/chapters.md](story/chapters.md). Hub of the climb is the burrow
until Mei stays on the moon.

This page is the story path map. Trigger kinds for burrow, Moon Pool, and water are in [story/proximity.md](story/proximity.md). The full derived world model, with one page per environment
and how Endless walks between them, lives in [universe/README.md](universe/README.md)
(see the biome graph in [universe/biome-graph.md](universe/biome-graph.md) and the per-rung
pages under [universe/environments/](universe/environments/)).

## Environment kits

Shared by Meadow, Story, Tasks, Endless. Each kit: tileset, palette, parallax layers, ambient audio, weather.

| Id | Name | Time of day | Notes |
| --- | --- | --- | --- |
| meadow | Meadow | day | Soft grass, burrow entrance, carrots |
| orchard | Orchard | day | Fruit trees, fences |
| bamboo | Bamboo Grove | dusk | Tall stalks, falling shafts |
| riverbank | Riverbank | dusk | Logs, current, rafts |
| lantern | Lantern Village | night | Festival stalls, lanterns |
| osmanthus | Osmanthus Peak | night | Wind, blossom fall, tiger path |
| cloudsea | Cloud Sea | deep night | Cloud Stair, hanging bridges, frost, void |
| moon | Moon Garden | eternal night | Low gravity, Guanghan Palace, Wu Gang's tree. Outer Cold reuses this kit |
| cassia | Cassia Wound | eternal night | planned. Self-healing osmanthus region |
| mortar | Mortar Yard | eternal night | planned. Elixir pestle yard, not a kitchen |
| dustsea | Dust Sea | eternal night | planned. Crater plains, invented fauna |
| wells | Quiet Wells | eternal night | planned. Cold caves, toad as background |
| farsilver | Far Silver | eternal night | planned. One Moon Pool. Do not title the card Portal |

## Story path map

Story opens on an HTML landscape painting. Chapter 1 uses `Story-Background.png`.
Chapter 2 uses `Story-Background-ch2.png`. Chapter 3 painting is named
`Story-Background-ch3.png` and is not shipped. Worlds are nodes. Expanding a live
world shows its stations. Locked later worlds stay visible as dim nodes.

Path progress (Chapter 1): Worlds 1–4 each expose three clearable stations (two platformers + boss or chase). Guanghan unlocks after Closing Gale. Next world (and the moon) unlock only after that world's last station is cleared. Saves that cleared W1 2/2 before Cart Chase remain on World 1 until Cart is done. Chapter 2 unlocks when `moon_guanghan` is cleared. Han's moon stays visual.

### Chapter 1 — Burrow to Moon (live)

### World 0 — Burrow Eve

| Station | Kind | Notes |
| --- | --- | --- |
| Burrow Eve | lore | Mid-Autumn setting |
| Moon in the Pool | lore | Chang'e through water |
| Soft Paws | level | In-game intro hop; unlocks Soft Paths |

Unlocks Soft Paths when Soft Paws is cleared. Station ids are stored in `progress.story.cleared`.

### World 1 — Meadow and Hedgerows

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 1-1 Soft Paths | meadow | run, jump, dash | Moon Pool | live |
| 1-2 Hedge Maze | orchard | wall bounce, crow lob | Moon Pool | live |
| 1-3 Cart Chase | meadow | boss: Fox Hu cart | Finish flag at the burrow. Cart there first is a retry | live |

### World 2 — Bamboo Grove and River

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 2-1 Green Corridor | bamboo | wall jump | Moon Pool | live |
| 2-2 Floating Logs | riverbank | log ride, current | Moon Pool | live |
| 2-3 Raft Gauntlet | riverbank | boss: Heron Fisher | World clear | live |

### World 3 — Lantern Village and Osmanthus Peak

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 3-1 Paper Lights | lantern | lantern glide | Moon Pool | live |
| 3-2 Tiger Road | osmanthus | tiger ride (Tu'er Ye) | Moon Pool | live |
| 3-3 Crane Summit | osmanthus | boss: Crane Envoy | Ride to the Cloud Stair | live |

### World 4 — Cloud Stair

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 4-1 First Steps | cloudsea | stair climb, one hanging bridge | Moon Pool near spawn | live |
| 4-2 No Return | cloudsea | denser frost, two bridges, no mid save | Station restart on fall | live |
| 4-3 Closing Gale | cloudsea | left storm wall (Fox Hu timing) | Palace gate / world clear | live |

### Finale

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| M-1 Guanghan | moon | low gravity, duck roofs, mooncake warmth dash vs Han | Gift beat. Yue and kits go home. Mei jumps Han's moon (today: epilogue cards). `MOON_RETURN` | live |

### Chapter 2 — Journey on Moon (first stations live)

Display title stays vague. Unlock: `moon_guanghan` cleared. Painting: `public/Story-Background-ch2.png`.

| World | Station | Env page | Teach | Exit | Status |
| --- | --- | --- | --- | --- | --- |
| Outer Cold | Frost Courtyard | [outer-cold.md](universe/environments/outer-cold.md) | leave the palace gardens | next world | live |
| Cassia Wound | Grove Cut | [cassia-wound.md](universe/environments/cassia-wound.md) | living wood | next world | live |
| Mortar Yard | Stone Bowls | [mortar-yard.md](universe/environments/mortar-yard.md) | bowl rims, pestle_sentry | next world | live |
| Dust Sea | Rim Walk | [dust-sea.md](universe/environments/dust-sea.md) | crater drifts, dust_mite | next world | live |
| Quiet Wells | Cave Mouths | [quiet-wells.md](universe/environments/quiet-wells.md) | cold caves, one water well | next world | live |
| Far Silver | Quiet Basin | [far-silver.md](universe/environments/far-silver.md) | sparse pads to a still shore. Not the One Pool | next world | live |

Stations 2 and 3 of each world stay unbuilt. Far Silver's One Moon Pool is still the planned world finale, not this first station.

### Chapter 3 — West of Silver (planned)

Display title stays vague. Does not print Kunlun, Yaochi, portal, or 西王母.
Unlock (planned): Far Silver One Moon Pool station cleared. That station is unbuilt.
Painting later: `public/Story-Background-ch3.png`. Prompt:
[story/chapter3-map-prompt.md](story/chapter3-map-prompt.md). Do not invent button
percents until the PNG exists. Hops return toward Earth weight.

| World | Env page | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| Other Shore | [other-shore.md](universe/environments/other-shore.md) | this is another country | next world | planned |
| Weak Water | [weak-water.md](universe/environments/weak-water.md) | stone fords. Do not ride the water | next world | planned |
| Hanging Ridges | [hanging-ridges.md](universe/environments/hanging-ridges.md) | ascent, Earth-weight wall hops | next world | planned |
| Peach Rows | [peach-rows.md](universe/environments/peach-rows.md) | west orchard, not Wu Gang, not a kitchen | next world | planned |
| Grotto Heaven | [grotto-heaven.md](universe/environments/grotto-heaven.md) | jade cave roof, false mouths | next world | planned |
| West Pool | [west-pool.md](universe/environments/west-pool.md) | refuse the peach | chapter clear | planned |

## Meadow maps (arcade)

JSON maps: obstacles, spawn points, safe zone, decorations. All four ids below ship as files under `src/data/maps/`.

| Id | Env | Unlock |
| --- | --- | --- |
| meadow_home | meadow | default |
| orchard_rows | orchard | pantry 2 |
| bamboo_clearing | bamboo | pantry 3 |
| festival_yard | lantern | pantry 4 |

## Map formats

- Meadow: `src/data/maps/*.json`
- Story: Tiled `.tmj` under `public/assets/tilemaps/`, assembled from chunk prefabs so Endless can reuse them
- Chunk ids mirror environment kits (`chunk_meadow_a`, `chunk_bamboo_gap`, ...)

## Endless environment schedule

Endless reuses the environment kits. A seeded route walker (I1, live) holds each rung for a
`bandMeters` band drawn from the difficulty, then steps to an adjacent biome. Tuning and the
graph live in `src/data/endless.json`. Chunks live in `src/data/chunks/endless/` named
`endless_<env>_t<tier>_<a|b>` (plus `endless_start` and `bridge_<from>_<to>`), tiers 1 (gentle) to 5 (double jump + dash
gaps). See [universe/biome-graph.md](universe/biome-graph.md) and
[modes/endless/design.md](modes/endless/design.md).

`envSchedule` remains in the JSON as an unused fallback. It is not what the walker reads.

## Day / night and weather

Story levels lock time of day per world. Palettes in `src/data/palettes.json` set hour and
weather. Meadow arcade and Moon Tasks do not use that kit.

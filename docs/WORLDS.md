# Bunny Meadow — Worlds and Environments

Chapter 1 (live): 4 worlds x 3 levels plus moon finale. Chapter 2 has three stations
per world live. Chapter 3 West of Silver is on the map with Soon worlds.
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
| moon | Moon Garden | eternal night | Low gravity kit. Palace walk and Han court split in [universe/environments/guanghan-palace.md](universe/environments/guanghan-palace.md). Outer Cold reuses this kit |
| cassia | Cassia Wound | eternal night | live. Self-healing osmanthus region |
| mortar | Mortar Yard | eternal night | live. Elixir pestle yard, not a kitchen |
| dustsea | Dust Sea | eternal night | live. Crater plains, invented fauna |
| wells | Quiet Wells | eternal night | live. Cold caves, toad as background |
| farsilver | Far Silver | eternal night | live. One Moon Pool. Do not title the card Portal |

## Story path map

Story opens on an HTML landscape painting. Chapter 1 uses `Story-Background.png`.
Chapter 2 uses `Story-Background-ch2.png`. Chapter 3 uses `Story-Background-ch3.png`.
Worlds are nodes. Expanding a live
world shows its stations. Locked later worlds stay visible as dim nodes.

Path progress (Chapter 1): Worlds 1–4 each expose three clearable stations (two platformers + boss or chase). Guanghan unlocks after Closing Gale. Next world (and the moon) unlock only after that world's last station is cleared. Saves that cleared W1 2/2 before Cart Chase remain on World 1 until Cart is done. Chapter 2 unlocks when `moon_guanghan` is cleared. Han's moon stays visual.

### Chapter 1 — Burrow to Moon (live)

### World 0 — Burrow Eve

Overhaul: [story/chapter1-overhaul.md](story/chapter1-overhaul.md).

| Station | Kind | Notes |
| --- | --- | --- |
| Burrow Eve | lore | Mid-Autumn setting. Stays text |
| Moon in the Pool | level | Controls map. Tunnel lead-in, one Moon Pool, no wildlife. Station id `w0_lore_moon` |
| Soft Paws | level | Creature intro after the Pool map. Hedgehog, fox, bees. Unlocks Soft Paths |

Unlocks Soft Paths when Soft Paws is cleared. Station ids are stored in `progress.story.cleared`.

### World 1 — Meadow and Hedgerows

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 1-1 Soft Paths | meadow | run, jump, dash already known. Bees, tortoise, dew, mooncake | Moon Pool | live. 4 chunks |
| 1-2 Hedge Maze | orchard | wall bounce, crow lob. Squirrel. Fence and fruit decor, not a peach heal | Moon Pool | live. 4 chunks |
| 1-3 Cart Chase | meadow | boss: Fox Hu cart. Seed off the cart line | Finish flag at the burrow. Cart there first is a retry | live |

### World 2 — Bamboo Grove and River

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 2-1 Green Corridor | bamboo | wall jump. Frog, squirrel, goat, boar. Grove-to-river edge | Moon Pool | live. 5 chunks |
| 2-2 Floating Logs | riverbank | log ride, current. Heron poke, carp. Mooncakes on logs | Moon Pool | live. 4 chunks |
| 2-3 Raft Gauntlet | riverbank | two herons over the water. Burrow stays open. Seed on the second raft | World clear | live |

### World 3 — Lantern Village and Osmanthus Peak

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 3-1 Paper Lights | lantern | lantern glide. Festival village, fireflies, sparkler, cat, owl, moth | Moon Pool | live. 5 chunks |
| 3-2 Tiger Road | osmanthus | tiger ride (Tu'er Ye). Seed off the ride | Moon Pool | live |
| 3-3 Crane Summit | osmanthus | boss: Crane Envoy. Seed off the dive | Ride to the Cloud Stair | live |

### World 4 — Cloud Stair

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| 4-1 First Steps | cloudsea | stair climb, hanging bridge. Gravity near 100% at the foot. Frost hare, faded lanterns | Moon Pool near spawn | live. 4 chunks, height 3240 |
| 4-2 No Return | cloudsea | denser frost, bridges, no mid save. Gravity keeps falling. Frost hare | Station restart on fall | live. 4 chunks, height 3240 |
| 4-3 Closing Gale | cloudsea | left storm wall. Upper switchback uses lunar pads. Gate matches the palace sky and 42% gravity | Palace gate, not the throne / world clear | live. 3 chunks, height 4320 |

### Finale

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| M-1 Guanghan | moon | low gravity. Palace walk then Han court. Court AABB starts the fight | Gift beat. Yue and kits go home. Mei jumps Han's moon (today: epilogue cards). `MOON_RETURN` | live. 7 walk + 2 court |

### Chapter 2 — Journey on Moon (three stations per world)

Display title stays vague. Unlock: `moon_guanghan` cleared. Painting: `public/Story-Background-ch2.png`.

| World | Station | Env page | Teach | Exit | Status |
| --- | --- | --- | --- | --- | --- |
| Outer Cold | Frost Courtyard | [outer-cold.md](universe/environments/outer-cold.md) | palace moon gate, frost flagstones, first guest screen, first chime, frost tiles | next station | live |
| Outer Cold | Column Walk | [outer-cold.md](universe/environments/outer-cold.md) | chime stones up column caps, star grit, dust mites, pool court gate | next station | live |
| Outer Cold | Guest Gate | [outer-cold.md](universe/environments/outer-cold.md) | guest screens in rhythm, screen on ice, frost tile bridge, the last three gates | next world | live |
| Cassia Wound | Grove Cut | [cassia-wound.md](universe/environments/cassia-wound.md) | living wood | next station | live |
| Cassia Wound | Closing Gap | [cassia-wound.md](universe/environments/cassia-wound.md) | inside the trunk: healing bark, bark cuts, cassia grubs | next station | live |
| Cassia Wound | Gold Core | [cassia-wound.md](universe/environments/cassia-wound.md) | climb to the heartwood room, Penghou boss | next world | live |
| Mortar Yard | Stone Bowls | [mortar-yard.md](universe/environments/mortar-yard.md) | mortar rims, first pestle, pestle lift, cassia grub, pestle_sentry | next station | live |
| Mortar Yard | Pestle Beat | [mortar-yard.md](universe/environments/mortar-yard.md) | pestle wave, lift to the drying tables, chain lift | next station | live |
| Mortar Yard | Cake Rounds | [mortar-yard.md](universe/environments/mortar-yard.md) | cake rounds in troughs, great pestle | next world | live |
| Dust Sea | Rim Walk | [dust-sea.md](universe/environments/dust-sea.md) | crater lips, shallow sinking dust, first tides, first vent, crater_crab | next station | live |
| Dust Sea | Lip Gap | [dust-sea.md](universe/environments/dust-sea.md) | wide gaps under tail- and headwinds, star grit, paired vents | next station | live |
| Dust Sea | Raft Wreck | [dust-sea.md](universe/environments/dust-sea.md) | raft planks over a dust sea, the star raft wreck, vent out | next world | live |
| Quiet Wells | Cave Mouths | [quiet-wells.md](universe/environments/quiet-wells.md) | still water, first reflection and dim lips, silver bats | next station | live |
| Quiet Wells | False Lip | [quiet-wells.md](universe/environments/quiet-wells.md) | silver floats over unseen lips, many reflections | next station | live |
| Quiet Wells | Well Silver | [quiet-wells.md](universe/environments/quiet-wells.md) | long dark chains, moon toad at the last well | next world | live |
| Far Silver | Quiet Basin | [far-silver.md](universe/environments/far-silver.md) | silver skin over still water, silver carp, the bronze dew-plate immortal | next station | live |
| Far Silver | Silver Steps | [far-silver.md](universe/environments/far-silver.md) | stone and silver steps, carp, star wisps, seed keepsake | next station | live |
| Far Silver | One Moon Pool | [far-silver.md](universe/environments/far-silver.md) | Still Silver, first true pool | Chapter 3 | live |

Far Silver's three stations are live. Still Silver is the 13-heart slime-split fight
with mooncake dash, aspects, and a gather portal (no burrow).

### Chapter 3 — West of Silver (map live, worlds soon)

Display title stays vague. Does not print Kunlun, Yaochi, portal, or 西王母.
Chip unlock: `moon_guanghan` cleared. Painting: `public/Story-Background-ch3.png`.
Playable unlock is clearing Far Silver's One Moon Pool (Still Silver portal contact). Hops return toward Earth weight.

| World | Env page | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| Other Shore | [other-shore.md](universe/environments/other-shore.md) | this is another country | next world | soon |
| Weak Water | [weak-water.md](universe/environments/weak-water.md) | stone fords. Do not ride the water | next world | soon |
| Hanging Ridges | [hanging-ridges.md](universe/environments/hanging-ridges.md) | ascent, Earth-weight wall hops | next world | soon |
| Peach Rows | [peach-rows.md](universe/environments/peach-rows.md) | west orchard, not Wu Gang, not a kitchen | next world | soon |
| Grotto Heaven | [grotto-heaven.md](universe/environments/grotto-heaven.md) | jade cave roof, false mouths | next world | soon |
| West Pool | [west-pool.md](universe/environments/west-pool.md) | refuse the peach | chapter clear | soon |

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

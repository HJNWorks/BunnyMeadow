# Bunny Meadow — Worlds and Environments

Story first release: 3 worlds x 3 levels plus moon finale. Hub is the burrow.

This page is the story path map. The full derived world model, with one page per environment
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
| moon | Moon Garden | eternal night | Low gravity, Guanghan Palace, Wu Gang's tree |

## Story path map

Story opens on an HTML/SVG landscape path from burrow toward the moon. Worlds are nodes. Expanding a live world shows its stations. Locked later worlds stay visible as dim nodes.

Path progress: Worlds 1–3 each expose three clearable stations (two platformers + boss). Guanghan is live after Crane Summit. Next world (and the moon) unlock only after that world's boss is cleared. Saves that cleared W1 2/2 before Cart Chase remain on World 1 until Cart is done.

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
| 1-3 Cart Chase | meadow | boss: Fox Hu cart | World clear | live |

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
| 3-3 Crane Summit | osmanthus | boss: Crane Envoy | Ride to moon | live |

### Finale

| Level | Env | Teach | Exit | Status |
| --- | --- | --- | --- | --- |
| M-1 Guanghan | moon | low gravity, quiet platforming | DomShell epilogue + MOON_RETURN | live |

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

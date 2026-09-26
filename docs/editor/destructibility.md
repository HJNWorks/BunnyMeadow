# Destructibility

How objects weaken and fall apart. Hub: [README.md](README.md). Chunk schema lives on
assembled platforms, walls, movers, and decor as an optional `break` field. Pad axes
(stamp, collision, motion, surface, break) live in [../platforms/README.md](../platforms/README.md).
Profiles live in `src/data/breakables.json` so later sources (dash hits, projectiles, timers,
`land` bounces) can share the same cracks without a new engine.

Family tone: the object splits and is gone. No gore. A restart, station reload, or
Story respawn (fall or hearts) puts it back, so a needed pad is never lost.

## Object field

```json
"break": {
  "profile": "stone",
  "hp": 5,
  "sources": ["beam"]
}
```

| Field | Meaning |
| --- | --- |
| `profile` | Key into `breakables.json`. Required. |
| `hp` | For `beam` and `stand`: seconds of matching damage before the object is gone. For `land`: bounce count (one landing subtracts 1). Omit to use the profile default. |
| `sources` | Which damage kinds count. Omit to use the profile list. |
| `regrow` | Optional seconds. A broken object grows back by itself after this long (Cassia healing bark). |

No `break` field means the object is solid forever. The story map editor Selection
panel can toggle Destructible and pick a profile on platforms, walls, bridges, logs,
and decor. Copy keeps the field.

## Profile map

| Profile | Default hp | Sources | Crack look | Shipped on |
| --- | --- | --- | --- | --- |
| stone | 5 s | beam | jagged surface splits | Guanghan green ledges |
| wood | 5 s / 1 bounce | stand, beam, land | grain splits along the slab | Soft River logs. Cassia healing bark (`hp` 0.9, `regrow` 3). Bunny Jump crumble pads |
| silver | 0.8 s | still | radial lines (ice sheet) | Far Silver skin (`regrow` 1.6) |
| ice | 3 s / 1 bounce | beam, stand, land | radial frost lines | Outer Cold frost tiles (`hp` 1.2, `stand`). Bunny Jump one-bounce pads |

Add a profile by appending to `src/data/breakables.json` and drawing a matching
crack sheet (`stone` / `wood` / `ice` stages 1-3). Do not invent a fourth crack
kind until the sheet exists.

## Damage sources (live)

| Source | When it counts |
| --- | --- |
| beam | Han's last-heart lunar beam, while the hot slab stays on that object. Last-heart beam lasts 5.5 s so one lock can finish a 5 s stone ledge. Damage is applied along the slab, not only to the first clip sprite. |
| stand | Mei standing on the object (logs over water). Time adds only while her feet stay on it. |
| still | Mei standing on the object and not moving (sideways speed under 30). Far Silver skin. |

Damage keeps its cracks if the source leaves. A second lock or a later stand
finishes the remaining hp.

Three crack stages before it falls: hairline (under 1/3), open (1/3 to 2/3),
ready to go (over 2/3). Then the collider turns off and a few fragments drop.
Reduced motion keeps one mark and skips fragments.

## Damage sources

| Source | When it counts |
| --- | --- |
| land | One bounce on a one-way pad subtracts 1 hp. Hit-count, not seconds. `hp: 1` is the Doodle brown-pad case: the pad breaks after that landing. Profile `wood` or `ice`. Ice uses the frost crack sheet. Bunny Jump: [../modes/tasks/bunny-jump.md](../modes/tasks/bunny-jump.md). |

`breakables.json` wood and ice profiles list `land`. Story `stand` and `beam` stay as they are.

## What does not break yet

The wide Guanghan floor is not marked. Walls and roofs stay cover unless an editor
sets Destructible on them. Endless river logs can carry a `break` field in JSON.
The Endless runner does not tick stand damage yet. Decor can store the field.
Decor has no collider, so it will not take beam or stand hits until that collider
exists. Dash hits and thrown spears are not sources yet.

## Play notes

Hiding from Han's last beam behind a destructible ledge only lasts until that
ledge's 5 s is up. After it falls the beam can reach the next surface. Last-heart
beam damages every registered ledge the hot slab crosses, not only the first clip
sprite. Thin Guanghan ledges (height 40 or under) take the stone profile even if an
editor overlay omitted `break`. The wide floor does not. Cracks darken the tile and
draw a split overlay. Reduced motion keeps one mark and skips fragment bursts.
River logs that break drop Mei into the water (heart, then retry). Bunny Jump
crumble pads use `land` with `hp: 1`: one bounce, then the pad is gone (retry if
that was the only foothold). Editor Build does not run damage. Editor Play does.

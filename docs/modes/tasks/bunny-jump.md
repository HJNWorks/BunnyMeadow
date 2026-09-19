# Moon Tasks — Bunny Jump

Status: live ([I5](../../iterations/i5-bunny-jump.md)). Hub: [README.md](README.md).
A Doodle Jump-shaped climb under Moon Tasks, not a fifth primary mode. Art is the
existing stamps, palettes, movers, and break catalog. No new workshop keys. No new
folk. Lantern Run stays deferred. This is the vertical task.

Readers here are not assumed to have the codebase open.

## Play loop

Mei auto-bounces on one-way pads. Move left and right. The screen wraps on X. Dash
is a short air nudge. Jump is unused. The bounce is the verb. Camera follows upward
only and never scrolls down.

```
Task Select -> BunnyJump
  land on pad -> bounce
  wrap X
  palette band by height
  below camera -> retry
  moon disc height -> task win + pantry
  keep climbing -> local best height
```

Falling below the camera is retry, same as Cloud Stair. Side-on mob contact costs a
heart. Landing on a mob from above removes it. Accessibility invincible still blocks
contact. Reduced motion skips crack flicker and fragment bursts.

Win: reach a moon-disc height. Difficulty scales the meters. Pantry reward uses the
existing `pantryReward` field. `tasksCompleted` records the clear. After the disc,
the climb may continue for a local best. Save field:
`progress.bunnyJumpBest`. No new Steam achievement in this slice.

## Height bands

Each band reuses a palette kit and hour from the Ladder
([../../universe/README.md](../../universe/README.md)). No new backdrop art.

| Band | Hour | Pads and wildlife |
| --- | --- | --- |
| Meadow | afternoon | solid pads. Hedgehog and fox perch |
| Orchard | golden | first wood crumble pads. Squirrel drop-shot |
| Bamboo / river | dusk | frog hops, moving logs, crow drop-shot |
| Lantern | night | lantern boost pads, cat swipe, owl stoop |
| Osmanthus / cloud sea | deep night | magpie stoop, frost wisp drift, ice pads |
| Moon | eternal night | sparse pads, ice spit, moon disc (win) |

## Pads

One-way collision: land from above only. Tiles are existing story stamps. Shared
axes: [../../platforms/README.md](../../platforms/README.md).

| Intent | Stamp | Collision | Motion | Surface | Break |
| --- | --- | --- | --- | --- | --- |
| Solid | ground | one_way | still | bounce | none |
| Crumble (one bounce) | ground or log | one_way | still | bounce | `land`, `wood` or `ice`, `hp: 1` |
| Slide | log or bridge | one_way | slide (same mover fields as Cloud Stair) | bounce | optional `wood` + `land` |
| Boost | lantern | one_way | still | boost | none |
| Ice | ground | one_way | still | slick | `land` + `ice`, `hp: 1` |
| Vanish | ground | one_way | vanish | bounce | none |

`land` is a hit-count source, not seconds. One bounce subtracts 1 hp. That is the
brown-pad case. `stand` and `beam` stay Story sources. Ice pads use the frost crack
sheet. Map: [../../editor/destructibility.md](../../editor/destructibility.md).

Slide is not a new tile. Cloud Stair hanging steps already use `movers[]` with
`axis`, `amplitude`, and `speed`. Bunny Jump reuses that kit so a pad can travel
while Mei auto-bounces. Feet carry with the pad, same as the stair.

## Jump roles (mode-only)

Attacks live in a later `jumpKit`. They must not leak into Story `enemyKit`. Jump
roles are not Story archetypes. Stamps stay the workshop / story silhouettes.

Fox Hu's cart, Crane Envoy, Han, Chang'e, and Yue stay off this HP bar. Owls remain
ordinary night enemies. They never serve the Moon.

### Reused (already live in Story or Endless)

| Wildlife | Jump role | What it does here |
| --- | --- | --- |
| hedgehog, fox | perch | sit or pace a pad. Contact from the side |
| frog | hop_ledge | jumps to a nearby pad |
| crow, squirrel, ice spit | drop_shot | same wind-up. Projectile fires down the column |
| owl, magpie | stoop | shown dive line down the column |
| heron, cat | column_swipe | poke up or down the column |
| goat, boar | ledge_charge | charge across a wide pad |
| frost wisp | drift | slow cloud. Dash still passes through |

### Debut in this mode (stamps already exist)

Story status for these is still idea. Bunny Jump is their first scheduled use.

| Wildlife | Jump role |
| --- | --- |
| bees | drift |
| tortoise | perch |
| boar | ledge_charge (if still idea in Story) |

Skip carp (no stamp). Skip dew as an enemy (pickup idea only).

## Code

Scene `BunnyJump` at FIT 1920x1080. One-way pads, auto-bounce, slide movers, `land`
in the break field, perch wildlife in `jumpKit`, `migrateSave` for best height.
Flag stays `contentFlags.tasks`. Remaining jump roles and vanish pads wait.
Pad axes: [../../platforms/README.md](../../platforms/README.md).

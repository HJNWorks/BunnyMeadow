# Platform catalog

Values for the five pad axes. Hub: [README.md](README.md). Readers here are not
assumed to have the codebase open.

## Stamp

Existing tiles only.

| Stamp | Where it already lives | Notes |
| --- | --- | --- |
| ground | Story / Endless platforms | Default solid and Bunny Jump still pad. Meadow uses `story_ground` |
| ground_moon | Journey on Moon platforms | Grey regolith. Used when env is `moon` or `ch2_*` |
| rim | lunar crater lip | Thin crater edge |
| bowl | Mortar Yard | Basalt bowl rim. Covered by the `mortar` decor vessel |
| pestle_big | Mortar Yard movers | Jade yard pestle. Beat motion |
| roller | Mortar Yard movers | Cake round wheel. Spins as it slides |
| chime | Outer Cold | Stone chime (磬). Drawn as one stretched stone, not tiled |
| raft | Dust Sea decks and movers | Star raft planks with rope bindings and star studs. Plank movers are one-way rides |
| skin | Far Silver pads | Pale silver water skin. Pairs with the `silver` break profile |
| reflection | Quiet Wells decor | Mimics a lunar pad top. No collider |
| bark | Cassia Wound movers | Bark slab with a gold healing edge. Pairs meet to close a cut |
| screen | Outer Cold movers | Lattice guest screen. Slides up behind its moon gate |
| wound | Cassia Wound | Grey wood with a gold cut |
| cave | Quiet Wells | Dark rock. Also ceiling slabs |
| log | river movers | Wood grain. Crumble and slide |
| log | river movers | Wood grain. Crumble and slide |
| bridge | Cloud Stair movers | Thin slide. Same motion fields as log |
| lantern | Story decor / item | Bunny Jump boost surface. Not a floor in Story |

## Collision

| Kind | Status | Behaviour |
| --- | --- | --- |
| solid | live | Block from every side. Story and Endless default |
| one_way | live | Land from above. Pass through from below and the sides. Bunny Jump default. Story yard pestles and cake rounds (their sides hit instead of blocking). Story stairs may opt in later |
| wall | live | Tall block. Beam clip. Not a bounce pad. `"hidden": true` drops the hedge or column art (Outer Cold gate lintels behind a moon gate) |
| ceiling | live | Same solid as wall. Lunar cave roof above the hop band. See [caves.md](caves.md) |

## Motion

The pad's own movement. Independent of surface.

| Kind | Status | Modes | Behaviour |
| --- | --- | --- | --- |
| still | live | Story, Endless, Bunny Jump | No path |
| slide | live (as `movers[]`) | Story (logs, Cloud Stair bridges, Mortar Yard cake rounds), Endless river, Bunny Jump | Sine on `axis` x or y. `amplitude` in px. `speed` in cycles. Feet carry with the pad. Optional `phase` 0–1 fixes the start |
| cut beat | live (`movers[]` with `kind: "bark"`, `axis: "x"`) | Story Cassia Wound | Two slabs with opposite `amplitude` open over 12% of the cycle, hold open to 50%, slide shut by 64%, rest shut. Solid top, bonks from below, never pushes sideways |
| gate beat | live (`movers[]` with `kind: "screen"`) | Story Outer Cold | Open fast (15% of the cycle), hold open, tremble, close over 12%, rest shut. Closed, it pushes Mei to her nearer side. No heart. The rect is the shut position |
| beat | live (`movers[]` with `kind: "pestle"`) | Story Mortar Yard | Lift over 45% of the cycle, hold, tremble, slam in 6%, rest. `amplitude` is the lift. `phase` 0–1 offsets the beat. The rect is the strike position |
| vanish | planned | Bunny Jump first. Story optional | Cycles visible / gone on a timer. Reduced motion keeps it visible and uses a mark instead of flicker |
| drop | planned | overlap with break `land` | After a landing the pad falls. Prefer `break` + `land` over a second engine |

Slide is the Cloud Stair case. Bunny Jump uses the same fields on climb pads so a
band can mix still, slide, and crumble without a new sprite.

Do not add rotate. No matching stamp. Do not add a Meadow-only slider.

## Surface

What a landing does to Mei. Independent of whether the pad slides.

| Kind | Status | Modes | Behaviour |
| --- | --- | --- | --- |
| default | live | Story, Endless | Normal jump / walk. On a slide, carry only |
| bounce | live | Bunny Jump | Auto-bounce. Jump unused. The climb verb |
| boost | live | Bunny Jump lantern pads | Extra bounce velocity. No break |
| slick | live | Bunny Jump ice. Story Cloud Stair | Low friction. Dash still a nudge. Stacks with ice `break` |
| chime | live | Story Outer Cold (`asset: "chime"`) | Landing throws Mei up about 330 px and refreshes the air jump. Jumping on it gives the same throw (fall speed caps anything stronger). Ring effect |

## Break

How the pad dies. Full map: [../editor/destructibility.md](../editor/destructibility.md).

| Source | Status | Counted as | Typical pad |
| --- | --- | --- | --- |
| none | live | - | Solid ground |
| beam | live | seconds | Guanghan green ledges, last-heart Han beam |
| stand | live | seconds | River logs |
| land | live | bounce count | Bunny Jump crumble. `hp: 1` is one landing |

Profiles `stone`, `wood`, `ice` stay. Ice + `land` + slick is the frost pad.

## Stacking examples

| Intent | Axes |
| --- | --- |
| Cloud Stair ice step | stamp ice, collision solid, motion still, surface slick, break none |
| Cloud Stair hanging step | stamp bridge, collision solid (one_way later), motion slide, surface default, break none |
| River log | stamp log, collision solid, motion slide, surface default, break wood + stand |
| Bunny Jump brown pad | stamp ground or log, collision one_way, motion still, surface bounce, break wood + land hp 1 |
| Bunny Jump moving pad | stamp log or bridge, collision one_way, motion slide, surface bounce, break optional |
| Bunny Jump lantern | stamp lantern, collision one_way, motion still, surface boost, break none |
| Bunny Jump ice | stamp ground, collision one_way, motion still, surface slick, break ice + land hp 1 |
| Guanghan green ledge | stamp ground, collision solid, motion still, surface default, break stone + beam |

## Out of catalog

Hazards (water, wind, void) are not pads. They stay on [../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md).
Decor has no collider unless an editor later gives it one.
Folk and wildlife are not pads.

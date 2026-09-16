# Bunny Meadow — Player Abilities

The verbs Mei has, where each is taught, and how items change them. Hub:
[README.md](README.md). Input bindings: [../UI.md](../UI.md). Items:
[../items/catalog.md](../items/catalog.md).

## Core verbs

| Verb | Input | Taught on rung | Status |
| --- | --- | --- | --- |
| run | move | Meadow (Soft Paws) | live |
| jump | jump | Meadow | live |
| dash | dash | Meadow | live |
| wall bounce / wall jump | jump against a wall | Orchard, mastered in Bamboo | live |
| log ride | stand on a drifting mover | Riverbank | live |
| tiger ride | scripted mount | Lantern (Tiger Road) | live |
| glide | hold jump | Lantern (Paper Lights) | live |
| stair climb / bridge sway | jump, stand on a hanging mover | Cloud Stair | live |
| low-gravity float | jump under low gravity | Moon | live |

Each rung teaches exactly one new verb (its movement axis in
[../universe/README.md](../universe/README.md)). The verb a rung teaches sets the
minimum chunk tier that rung can present, so a player never meets a shape that needs a
verb they have not learned.

## Verb-to-tier gate

Tiers 1-5 escalate the demand on the verbs (from [../modes/endless/tuning.md](../modes/endless/tuning.md)):

| Tier | Demand |
| --- | --- |
| 1 | run and single jumps, short gaps |
| 2 | dash gaps, first patrols |
| 3 | wall bounce, ranged and reach enemies |
| 4 | chained wall jumps, divers, wind |
| 5 | double jump plus dash gaps, dense hazards |

## How items change verbs

Items are run-scoped and never create permanent power (a GDD scope guard). They bend a
verb for a short time. Full catalog: [../items/catalog.md](../items/catalog.md).

| Item | Effect on a verb | Duration |
| --- | --- | --- |
| osmanthus blossom | grants one extra glide charge (a second float) | until used |
| lantern | pushes the mist wall back 80 m. HUD tray while the ~1.6 s glow lasts | instant + timed |
| dew | slow-time so a jump or dash reads easier | short |
| mooncake | Endless: restores one heart. Guanghan: timed warmth so a dash can tag Han | instant / ~3 s |
| moon letter | key: unlocks the sky/moon edges in Endless | held |

## Accessibility overrides

Independent of preset (from [../GDD.md](../GDD.md)): invincible, slow time 0.7x,
auto-dash on proximity, one-button touch mode. These modify verbs globally and always
override contact damage when invincible is on.

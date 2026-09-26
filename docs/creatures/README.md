# Bunny Meadow — The Bestiary

Every creature type in the universe, sorted into three classes. This is the index.
Data schema for enemies lives in the hub [../ENEMIES.md](../ENEMIES.md) and in
`src/data/enemies.json`. Folklore backing for named creatures lives in
[../LORE.md](../LORE.md); no named creature appears without an entry there.

Editor pickers follow this index. Wildlife ids appear once under Chapter 1, 2, or 3,
with Path and Cloud Stair / Guanghan nested inside Chapter 1. Folk stay out of the
Creatures tree. Invented folk only fill an empty job. See
[../editor/README.md](../editor/README.md) Phase C.

## Creature classes

| Class | What it is | Pages |
| --- | --- | --- |
| Wildlife | Enemies. Data + spritesheet + an archetype behaviour | [wildlife/](wildlife/) |
| Folk | Named lore NPCs and bosses. Scripted, not roster-spawned | [folk/](folk/) |
| Kits | The rabbits: Mei, Yue, the burrow family | [kits/](kits/) |

Player verbs and how items change them are on [abilities.md](abilities.md).
Spoken lines and voice files: [voices.md](voices.md) and `src/data/voices.json`.

## Behavior cards

A wildlife page keeps lore and silhouette in prose. The behaviour itself is one card.
New or changed creatures use this table. Older pages still describe the same fields in
sentences until they are next edited.

| Column | What it records |
| --- | --- |
| Phase | Named state. One row per state |
| Pose | Which stamp or wing frame is on screen |
| Trigger | What starts the state |
| Motion | How the body moves |
| Hit | Hearts on contact, or none |
| Escape | What Mei can do. If the answer is a dash, say when the dash has to land |

Archetype code stays shared. The card is the creature's use of that code. Hub for the
shared names: [../ENEMIES.md](../ENEMIES.md).

## Wildlife archetypes

Behaviours are shared code. A new archetype is the only reason to add enemy code; a
new creature of an existing archetype is data. From [../ENEMIES.md](../ENEMIES.md):

Grounded wildlife and Fox Hu's cart must pass `constrainCreatureToWorld` in
`src/modes/story/shared/enemyKit.ts` after they join the physics group. Arcade group
add restores gravity, and the world has no floor bound, so a spawn that skips this
falls through the map on the first frame. The constraint syncs the body, collides with
platforms, and seats feet on the nearest floor. Flying kits (crow, owl, bees, frost
wisp, gale magpie, dust mite, star wisp, lantern moth) skip the seat.

| Archetype | Behaviour |
| --- | --- |
| patrol | walks a path, contact damage, safe from above in Story |
| chaser | seeks the player inside a sense radius, leaves safe zones alone |
| ranged_lob | crow and squirrel throw on a parabola. Ice spit and pestle fire a no-gravity ray |
| reach | slow or stationary, long poke in one direction, crouch telegraph |
| diver | circles then dives along a shown line |
| fisher | holds high, locks, then a straight sweep. Dash on arrival escapes |
| swarm | slow cloud, area denial, dash passes through |
| blocker | charges across its line, stunned on a wall hit |
| boss | scripted phases composed from the above |

## Wildlife by biome

This is the roster Endless draws from via slots (I2, live). Each row lists home biomes
and the minimum tier at which the creature appears.

| Creature | Archetype | Home biomes | Min tier | Status |
| --- | --- | --- | --- | --- |
| fox | chaser | meadow, orchard | 1 | live |
| hedgehog | patrol | meadow, orchard | 1 | live |
| crow | ranged_lob | meadow, orchard, bamboo, riverbank, lantern | 2 | live |
| squirrel | ranged_lob | orchard, bamboo | 2 | live (Story Hedge Maze, Green Corridor) |
| frog | patrol | bamboo, riverbank | 2 | live (Story Green Corridor) |
| heron | fisher | riverbank | 3 | live (Story Floating Logs, Raft Gauntlet). Circles water, stoops for two hearts |
| carp | water_patrol | riverbank | 3 | live (Story Floating Logs) |
| cat | reach | lantern, osmanthus | 3 | live (Story Paper Lights) |
| owl | diver | lantern, osmanthus | 3 | live (Story Paper Lights) |
| goat | blocker | bamboo, osmanthus | 3 | live (Story Green Corridor) |
| boar | blocker | orchard, bamboo | 3 | live (Story Green Corridor). Ground charge, 2 hearts |
| tortoise | patrol | meadow, riverbank | 1 | live (Story Soft Paths) |
| magpie | diver | cloudsea | 4 | live (Story) |
| frost wisp | swarm | cloudsea, moon (palace halls) | 4 | live (Story). Frost spear fan. Palace corridors |
| ice spit | ranged_lob | cloudsea | 4 | live (Story) |
| frost hare | patrol | cloudsea | 4 | live (Story First Steps, No Return). Invented 霜兔 |
| lantern moth | diver | lantern, osmanthus, moon (palace) | 3 | live (Story Paper Lights). Palace halls |
| firefly | visual / optional glow | meadow, lantern | 1 | weather live. Pickup waits |
| dust mite | swarm | moon (outer, dust) | 5 | live (Story). Chapter 2 only. Do not debut on Earth |
| star wisp | swarm | moon (wells, silver, palace) | 5 | live (Story). Radial pulse. Chapter 2 and one Guanghan hall. Not the Stair |
| pestle sentry | ranged_lob | moon (mortar) | 5 | live (Story). Chapter 2 only. Do not debut on Earth |
| silver carp | water_patrol | moon (silver) | 5 | live (Story Far Silver). Leaps about 250 px. Adapted 鯉魚跳龍門. Chapter 2 only |
| silver bat | diver | moon (wells) | 5 | live (Story Quiet Wells). 1.0 s swoop from the cave roof. Lucky (福), not an omen. Chapter 2 only |
| crater crab | patrol | moon (dust) | 5 | live (Story Dust Sea). Digs in for 1.3 s: harmless and unstompable while dug. Chapter 2 only |
| cassia grub | patrol | moon (mortar) | 5 | live (Story Mortar Yard). Adapted 桂蠹. Stomp from above. Chapter 2 only |
| azure bird | diver | Peach Rows | n/a | idea |
| jade mite | swarm | Grotto Heaven | n/a | idea |
| copper sentry | ranged_lob | Hanging Ridges | n/a | idea |
| bees | swarm | meadow, orchard | 2 | live (Story Soft Paws). Chapter 1 Path |
| dew | item (slow-time). Not a wildlife HP bar | meadow, orchard | 1 | live (Story Soft Paths). See [items/catalog.md](../items/catalog.md) |

Guard: owls are ill omens in tradition and must never serve the Moon. They are
ordinary night enemies only ([../LORE.md](../LORE.md#cranes-as-immortal-messengers)).

## Bunny Jump roles (mode-only)

Vertical hop under Moon Tasks. Not Story archetypes. Attacks belong in a later
`jumpKit`, not Story `enemyKit`. Design: [../modes/tasks/bunny-jump.md](../modes/tasks/bunny-jump.md).
Each wildlife page below has a Bunny Jump section. Perch (fox, hedgehog) is live.
Other jump roles wait.

| Creature | Jump role | Status in Story |
| --- | --- | --- |
| hedgehog, fox | perch | live |
| frog | hop_ledge | live |
| crow, squirrel, ice spit | drop_shot | live |
| owl, magpie | stoop | live |
| heron, cat | column_swipe | live |
| goat | ledge_charge | live |
| frost wisp | drift | live |
| dust mite | drift | live |
| star wisp | drift | live |
| pestle sentry | drop_shot | live |
| cassia grub | perch | planned |
| crater crab | perch | planned |
| silver bat | stoop | planned |
| bees | drift | live Story. Jump later |
| tortoise | perch | live Story. Jump later |
| boar | ledge_charge | live Story. Jump later |
| frost hare | skip | planned Story Cloud Stair |

Skip carp, firefly, and dew as jump roles. Skip Chapter 3 idea fauna (azure bird, jade mite, copper sentry).
Folk stay off this HP bar. Bees, tortoise, and boar belong in Chapter 1 Path, not Chapter 3 Later.

## Folk

Named characters. Bosses are one folk per world; palace NPCs are non-hostile.

| Folk | Role | Biome | LORE status |
| --- | --- | --- | --- |
| Fox Hu | World 1 boss, recurring trickster | meadow | adapted |
| Heron Fisher | World 2 boss | riverbank | invented |
| Crane Envoy | World 3 boss, then ally | osmanthus / cloudsea | adapted |
| Closing Gale | World 4 chase event | cloudsea | invented |
| Still Silver | Far Silver finale, One Moon Pool | far silver | invented |
| Han | Moon boss, old Vast Cold ghost | moon | invented |
| Tu'er Ye (Lord Rabbit) | ally, lends the tiger | lantern | canon |
| Chang'e | mentor, finale | moon | canon |
| Jade Rabbit (Yutu) | palace NPC | moon | canon |
| Wu Gang | finale NPC | moon | canon |
| moon toad | optional background | moon | canon (optional) |
| Xiwangmu | Chapter 3 court NPC. Offers a peach. Accepts the refusal | West Pool | canon |

## Kits

Mei (player), Yue (the missing kit), and the burrow family. See [kits/](kits/).

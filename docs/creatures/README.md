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
| squirrel | ranged_lob | orchard, bamboo | 2 | live (Story). Stamp unused on Chapter 1 chunks. I8 place |
| frog | patrol | bamboo, riverbank | 2 | live (Story). Stamp unused on Chapter 1 chunks. I8 place |
| heron | reach | riverbank | 3 | live (Story). Chunk heron unused. I8 place. Raft boss stays folk |
| carp | patrol (water) | riverbank | 3 | planned (I8). Needs a water-patrol archetype |
| cat | reach | lantern, osmanthus | 3 | live (Story). Stamp unused on Chapter 1 chunks. I9 place |
| owl | diver | lantern, osmanthus | 3 | live (Story). Stamp unused on Chapter 1 chunks. I9 place |
| goat | blocker | bamboo, osmanthus | 3 | live. Stamp unused on Chapter 1 chunks. I8 place |
| boar | blocker | orchard, bamboo | 3 | planned (I8). Chapter 1 Path, not Chapter 3 |
| tortoise | patrol | meadow, riverbank | 1 | planned (I8). Chapter 1 Path, not Chapter 3 |
| magpie | diver | cloudsea | 4 | live (Story) |
| frost wisp | swarm | cloudsea, moon (palace halls) | 4 | live (Story). Palace corridors I10 |
| ice spit | ranged_lob | cloudsea | 4 | live (Story) |
| frost hare | patrol / chaser | cloudsea | 4 | planned (I9). Invented 霜兔 |
| lantern moth | diver | lantern, osmanthus, moon (palace) | 3 | planned (I9, I10) |
| firefly | visual / optional glow | meadow, lantern | 1 | planned (I7 visual, I9) |
| dust mite | swarm | moon (outer, dust) | 5 | live (Story). Chapter 2 only. Do not debut on Earth |
| star wisp | swarm | moon (wells, silver, palace optional) | 5 | live (Story). Chapter 2. Optional Guanghan palace leak. Not the Stair |
| pestle sentry | ranged_lob | moon (mortar) | 5 | live (Story). Chapter 2 only. Do not debut on Earth |
| azure bird | diver | Peach Rows | n/a | idea |
| jade mite | swarm | Grotto Heaven | n/a | idea |
| copper sentry | ranged_lob | Hanging Ridges | n/a | idea |
| bees | swarm | meadow, orchard | 2 | planned (I7-I8). Chapter 1 Path, not Chapter 3 |
| dew | item (slow-time). Not a wildlife HP bar | meadow, orchard | 1 | planned (I8). See [items/catalog.md](../items/catalog.md) |

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
| bees | drift | planned (Story I7-I8. Jump later) |
| tortoise | perch | planned (Story I8. Jump later) |
| boar | ledge_charge | planned (Story I8. Jump later) |
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
| Han | Moon boss, old Vast Cold ghost | moon | invented |
| Tu'er Ye (Lord Rabbit) | ally, lends the tiger | lantern | canon |
| Chang'e | mentor, finale | moon | canon |
| Jade Rabbit (Yutu) | palace NPC | moon | canon |
| Wu Gang | finale NPC | moon | canon |
| moon toad | optional background | moon | canon (optional) |
| Xiwangmu | Chapter 3 court NPC. Offers a peach. Accepts the refusal | West Pool | canon |

## Kits

Mei (player), Yue (the missing kit), and the burrow family. See [kits/](kits/).

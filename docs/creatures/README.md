# Bunny Meadow — The Bestiary

Every creature type in the universe, sorted into three classes. This is the index.
Data schema for enemies lives in the hub [../ENEMIES.md](../ENEMIES.md) and in
`src/data/enemies.json`. Folklore backing for named creatures lives in
[../LORE.md](../LORE.md); no named creature appears without an entry there.

Editor pickers follow this index. A new being also needs a wildlife page plus an archetype
before it can sit in a biome native list. Invented folk only fill an empty job. See
[../editor/README.md](../editor/README.md) Phase C.

## Creature classes

| Class | What it is | Pages |
| --- | --- | --- |
| Wildlife | Enemies. Data + spritesheet + an archetype behaviour | [wildlife/](wildlife/) |
| Folk | Named lore NPCs and bosses. Scripted, not roster-spawned | [folk/](folk/) |
| Kits | The rabbits: Mei, Yue, the burrow family | [kits/](kits/) |

Player verbs and how items change them are on [abilities.md](abilities.md).

## Wildlife archetypes

Behaviours are shared code. A new archetype is the only reason to add enemy code; a
new creature of an existing archetype is data. From [../ENEMIES.md](../ENEMIES.md):

| Archetype | Behaviour |
| --- | --- |
| patrol | walks a path, contact damage, safe from above in Story |
| chaser | seeks the player inside a sense radius, leaves safe zones alone |
| ranged_lob | throws a projectile on a parabola with a visible wind-up |
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
| squirrel | ranged_lob | orchard, bamboo | 2 | live (Story) |
| frog | patrol | bamboo, riverbank | 2 | live (Story) |
| heron | reach | riverbank | 3 | live (Story) |
| carp | patrol (water) | riverbank | 3 | idea |
| cat | reach | lantern, osmanthus | 3 | live (Story) |
| owl | diver | lantern, osmanthus | 3 | live (Story) |
| goat | blocker | bamboo, osmanthus | 3 | live |
| boar | blocker | orchard, bamboo | 3 | idea |
| tortoise | patrol | meadow, riverbank | 1 | idea |
| magpie | diver | cloudsea | 4 | live (Story) |
| frost wisp | swarm | cloudsea | 4 | live (Story) |
| ice spit | ranged_lob | cloudsea | 4 | live (Story) |
| bees | swarm | meadow, orchard | 2 | idea |
| dew | swarm or pickup | meadow, riverbank | 1 | idea |

Guard: owls are ill omens in tradition and must never serve the Moon. They are
ordinary night enemies only ([../LORE.md](../LORE.md#cranes-as-immortal-messengers)).

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

## Kits

Mei (player), Yue (the missing kit), and the burrow family. See [kits/](kits/).

# Chapter 1 overhaul

Status: I6 docs lock done. I7 Pool and Soft Paws live. Hub: [chapters.md](chapters.md).
Spine: [../STORY.md](../STORY.md). Folklore: [../LORE.md](../LORE.md). Path map:
[../WORLDS.md](../WORLDS.md). Build order:
[../iterations/i7-w0-pool.md](../iterations/i7-w0-pool.md).

Chapter 1 (Burrow to Moon) is playable end to end. This page locks what the climb
should become. Remaining playable JSON waits until a later iteration graduates a
row here from planned to live.

Readers here are not assumed to have the codebase open.

## What is live today

Sixteen stations. One lore beat (Burrow Eve). Moon in the Pool is a playable controls
map. Soft Paws plus twelve path levels plus Guanghan.

Most maps are two or three chunks of 960 px (chase chunks 1200). Guanghan is two chunks
with no wildlife. Mooncakes on Guanghan are spawned at runtime. Moon in the Pool
authors one osmanthus seed. Remaining Chapter 1 chunks still omit item arrays.

Path filler is almost always hedgehog and crow. Soft Paws places hedgehog, fox, and
bees. Soft Paths also places one fox. Cloud Stair places frost wisp, ice spit, and
gale magpie. Fox Hu, Heron Fisher, Crane Envoy, Closing Gale, and Han are folk or
events.

Stamps and the Path roster already exist for squirrel, frog, heron, cat, owl, and
goat. None of those ids appear in Chapter 1 chunks. I8 is placement first, then new
species.

Dust mite, star wisp, and pestle sentry sit in the Cloud Stair / Guanghan picker.
They ship on Chapter 2 chunks only. They do not debut on Earth.

## Lore gates

No folklore element without a [LORE.md](../LORE.md) row (canon, adapted, or invented).
If an addition is not canon, the invented row ships in the same pass as the creature
or item page. Invented jobs stay empty of named immortals.

Off HP bars in every chapter: Chang'e, Yue, Yutu, Wu Gang, moon toad, Crane Envoy,
Fox Hu, Xiwangmu. Fox Hu's cart remains the World 1 boss exception.

| Proposal | Verdict | Why | If added later |
| --- | --- | --- | --- |
| Giant panda | skip | Chinese (Sichuan) but not Mid-Autumn / Chang'e / moon-hare | Invented earthly grove neighbor only. World 2. Non-hostile. Never Stair or palace. Never folk. LORE row first |
| Yeti | skip | Himalayan. Not Chinese moon lore | Do not import |
| Angry white hares | invent as frost hare (霜兔) | White hare collides with Yutu and with Mei/Yue as kits | Ordinary mountain hares bleached by Vast Cold on the Stair. Not Yutu, not kits |
| Cicadas | skip | Summer insect | - |
| Fireflies | live as Pool dusk weather | Already lantern weather | Optional glow pickup still later. Not a folk HP bar |
| Bees | live on Soft Paws | Ordinary meadow wildlife | W0/W1 swarm. Dash through |
| Lantern moth | planned invent | 扑火. Drawn to festival light | Weak night flyer. Ordinary wildlife |
| Fireworks | planned scenery | Traditional Mid-Autumn is lanterns first | Background bursts plus sparkler (lantern-class light). Not a weapon. Not Han's kit |
| Generic heart pickup | skip | Mooncake already restores one heart | Place mooncakes on Earth Story. Guanghan cakes stay warmth ammo |
| Second pantry currency | skip | Carrots already bank | Keepsake osmanthus seeds instead. No hop power |
| Pandas on the moon | forbidden | Mixes national-park China with Vast Cold | - |

References:

- [Chang'e (Wikipedia)](https://en.wikipedia.org/wiki/Chang%27e)
- [Guanghan Palace (Wikipedia)](https://en.wikipedia.org/wiki/Guanghan_Palace)
- [Mid-Autumn Festival (Wikipedia)](https://en.wikipedia.org/wiki/Mid-Autumn_Festival)
- [Jade Rabbit (Wikipedia)](https://en.wikipedia.org/wiki/Moon_rabbit)
- [Wu Gang (Wikipedia)](https://en.wikipedia.org/wiki/Wu_Gang)
- [Tu'er Ye (Wikipedia)](https://en.wikipedia.org/wiki/Tu%27er_Ye)
- [Giant panda (Wikipedia)](https://en.wikipedia.org/wiki/Giant_panda)
- [Yeti (Wikipedia)](https://en.wikipedia.org/wiki/Yeti)
- [Osmanthus (Wikipedia)](https://en.wikipedia.org/wiki/Osmanthus)

## Keep / skip

Keep: Mid-Autumn frame, Moon Pools as Chang'e's reflection, one new verb per rung,
Cloud Stair as Earth-gravity Vast Cold leak, Han as invented guest-keeper, gift beat,
Yue home on the crane, Mei jumping Han's moon.

Skip: panda, yeti, cicadas, Mario hearts, peach as a heal, fireballs, NASA, Japanese
mochi kitchen, owl as Moon servant.

## Station briefs

Target widths are later map work. Today is the lock. One chunk is 960 px unless noted.

### World 0 - Burrow Eve

| Station | Today | Planned | Target |
| --- | --- | --- | --- |
| Burrow Eve | lore text | lore text. Blossom fall. Yue runs | no map |
| Moon in the Pool | 2 chunks. Tunnel, pond, chips, one seed | dusk fireflies. Family kits as set dressing | 2 chunks |
| Soft Paws | 3 chunks. Hedgehog, fox, bees | same verbs. No tutorial flag | 3 chunks |

Unlock: Eve, then Pool map, then Soft Paws, then Soft Paths.

Around the burrow: pond, family kits as non-HP set dressing, carrots, dew, fireflies
at dusk, one keepsake. [Burrow tunnels](../universe/environments/burrow-tunnels.md)
are the first chunk of Moon in the Pool (root lifts, no chase). Not a fourth World Map
station.

### World 1 - Meadow and Hedgerows

| Station | Today | Planned | Target |
| --- | --- | --- | --- |
| Soft Paths | 3 chunks. Fox, hedgehog | place bees, tortoise. Dew and a mooncake on high grass. One seed | 4-5 chunks |
| Hedge Maze | 3 chunks. Crow, hedgehog. Wall bounce | place squirrel. Fence and fruit decor (not a peach heal). One seed | 4-5 chunks |
| Cart Chase | 2 x 1200 chase. Fox Hu | unchanged as folk boss. One seed off the cart line | keep |

### World 2 - Bamboo and River

| Station | Today | Planned | Target |
| --- | --- | --- | --- |
| Green Corridor | 3 chunks. Hedgehog, crow. Tall hedge-asset shafts | dense grove. Place frog, squirrel, goat. Stalk walls, canopy shafts. Grove-to-river edge | 5-6 chunks |
| Floating Logs | 3 chunks. Hedgehog, crow. Water, logs | place frog, heron (chunk reach, not only the boss), carp. Mooncakes on logs | 4-5 chunks |
| Raft Gauntlet | 2 chunks. Heron Fisher | keep the three-dash boss. One seed | keep |

No panda.

### World 3 - Lantern Peak

| Station | Today | Planned | Target |
| --- | --- | --- | --- |
| Paper Lights | 3 chunks. Hedgehog, crow. Glide pads | festival village. Stalls, lantern strings, firefly weather, sparkler bursts. Place cat, owl. Lantern and mooncake pickups | 5-6 chunks |
| Tiger Road | 3 chunks. Scripted tiger | keep the folk ride. Lengthen Paper Lights instead | keep |
| Crane Summit | 2 chunks. Crane Envoy | keep the bow exit to the Stair | keep |

Owls stay ordinary night enemies.

### World 4 - Cloud Stair

Own biome. Earth gravity. Pale cloud sea. Void fail. Not lunar ground. Not 0.42 g.
Vast Cold leaks down from Guanghan.

| Station | Today | Planned | Target |
| --- | --- | --- | --- |
| First Steps | 2 chunks. Frost wisp, magpie, one bridge | longer stair. Frost hare. Faded festival lanterns as Earth remnant | 4-6 chunks |
| No Return | 2 chunks. No pool | longer. Denser ice. Frost hare | 4-6 chunks |
| Closing Gale | 2 chunks. Left storm | keep the chase into the palace gate, not the throne | keep |

### Finale - Guanghan

Split the moon rung:

| Beat | Today | Planned | Target |
| --- | --- | --- | --- |
| Palace walk | missing | roofs, courtyards, moon doors, columns, screens, still pools that are not Han, cassia glimpses. Low gravity the whole station. Frost wisps in corridors. Optional star wisps as palace cold. Lantern moths in halls | about 18 chunks (on the order of 10 screens) |
| Han court | whole station is the fight | last 1-2 chunks. Proximity start. Leave volume cancels the fight and resets Han hearts. Mooncakes and spirit HUD only while the fight is live | 2 chunks |

Chang'e, Yutu, Wu Gang, and the toad stay off the HP bar. They appear after Han
settles, as now.

Palace background: dedicated Guanghan far layer (layered roofs, eternal night). Not
the Cloud Stair. Not Chapter 2 dust.

Pages: [moon.md](../universe/environments/moon.md),
[guanghan-palace.md](../universe/environments/guanghan-palace.md),
[han.md](../creatures/folk/han.md), [proximity.md](proximity.md).

## Items

| Item | Role on Chapter 1 | Status |
| --- | --- | --- |
| carrot | pantry currency. May still appear | live |
| mooncake | restore one heart on Earth Story. Guanghan: warmth ammo | live effect. Place on Earth in I8 |
| osmanthus blossom | extra glide on Peak and Stair | live effect. Place in I9 |
| lantern | glow. Festival and dusk groves | live effect. Place in I8-I9 |
| dew | short slow-time. Meadow and orchard | planned graduate |
| sparkler | lantern-class timed light. Festival scenery, not a weapon | planned |
| firefly (pickup) | brief glow. No mist wall | planned |
| osmanthus seed | keepsake. One hidden spawn per playable station | live on Pool. More I8-I10 |
| heart sprite | do not ship | skipped |
| moon letter | Endless only | idea |

Keepsake save: `progress.story.keepsakes` as a list of station ids. Never respawn.
Counter unlocks Customize flecks and achievements (first seed, eight seeds, full
Chapter 1 set). No hop power. Carrots still feed the pantry.

Playable stations that can hide a seed: Moon in the Pool, Soft Paws, the twelve path
levels, Guanghan. Fifteen. Burrow Eve stays lore and has none.

## Code later (not this lock)

- Place existing Path ids (squirrel, frog, heron, cat, owl, goat) on maps.
- Graduate tortoise, boar, carp, frost hare, lantern moth. Bees are live on Soft Paws.
- Author item and decor arrays on remaining Chapter 1 chunks.
- Han court proximity volume. Leave resets hearts.
- Palace walk chunks and far layer.
- Han moon collider remains a separate TODO ([chapters.md](chapters.md)).

## Build waves

[I6](../iterations/i6-chapter1-docs.md) this docs lock.
[I7](../iterations/i7-w0-pool.md) Pool map and Soft Paws creature intro.
[I8](../iterations/i8-w1-w2-density.md) Meadow through river density.
[I9](../iterations/i9-festival-cloud-stair.md) festival and Cloud Stair.
[I10](../iterations/i10-guanghan-palace.md) palace walk and proximity Han.
Keepsakes can start in I7 and fill through I10. First seed is live on the Pool map.

Chapter 2 and 3 stay frozen except the roster note above.

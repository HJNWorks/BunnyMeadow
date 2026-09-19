# Bunny Meadow — Item Catalog

One entry per item. Effects are run-scoped or cosmetic by rule (see [README.md](README.md)).
Render cues are the visual language from [../rendering/effects.md](../rendering/effects.md).

## carrot

| Field | Value |
| --- | --- |
| Category | currency |
| Status | live |
| Effect | Adds to the run's carrot count; banked into the pantry at run end |
| Duration | permanent as pantry currency (cosmetic and map unlocks only) |
| Home biomes | all |
| Rarity | common |
| Render cue | orange pickup with a soft bob; collect pop |

The staple. Endless item slots roll the biome table in `src/data/items.json`. `carrotChance`
is the chance a slot is filled at all. Journey on Moon native lists drop carrot. Dust Sea
does not place pantry carrots.

## mooncake

| Field | Value |
| --- | --- |
| Category | restore |
| Status | live |
| Effect | Restores one heart, up to the run maximum |
| Duration | instant |
| Home biomes | orchard, riverbank, lantern, osmanthus |
| Rarity | rare |
| Render cue | round golden pastry with a stamped top; warm glint |

Most valuable on the Riverbank, where water costs hearts. Ties to the Mid-Autumn frame.
In Story Guanghan the same pastry is warmth ammo, not a heal: eat it to start a short
timed buff, then dash Han. It appears on the top-center of remaining ledges.
Endless still restores a heart. Chapter 2 hops restore a heart. One job per context.

## osmanthus blossom

| Field | Value |
| --- | --- |
| Category | run-buff |
| Status | live |
| Effect | Grants one extra glide charge (a second float) |
| Duration | until used |
| Home biomes | osmanthus, cloudsea |
| Rarity | uncommon |
| Render cue | small glowing four-petal blossom, gentle drift and pulse |

Thematically native to the blossom fall of Osmanthus Peak. The same blossom whose fall
starts the story ([../creatures/folk/wu-gang.md](../creatures/folk/wu-gang.md)).

## lantern

| Field | Value |
| --- | --- |
| Category | run-buff |
| Status | live |
| Effect | Pushes the Endless mist wall back 80 m. About 1.6 s of additive lantern glow on the player. |
| Duration | timed |
| Home biomes | lantern, bamboo, burrow-tunnels |
| Rarity | uncommon |
| Render cue | warm paper lantern; a soft light circle while held; the mist visibly recedes |

The clearest interaction between an item and the Endless chase wall. See the mist push
rule in [placement.md](placement.md).

## star grit

| Field | Value |
| --- | --- |
| Category | run-buff |
| Status | live |
| Effect | 2.5 s extra jump and float so 0.42 g reads |
| Duration | timed |
| Home biomes | Dust Sea, Outer Cold |
| Rarity | uncommon |
| Render cue | pale grit sparkle |

Run-scoped. No pantry. No permanent power.

## elixir crumb

| Field | Value |
| --- | --- |
| Category | run-buff |
| Status | live |
| Effect | 2.5 s slow-fall |
| Duration | timed |
| Home biomes | Mortar Yard, Cassia Wound |
| Rarity | uncommon |
| Render cue | gold crumb |

Run-scoped. Not Yutu as an HP bar. The crumb is the pickup.

## well silver

| Field | Value |
| --- | --- |
| Category | run-buff |
| Status | live |
| Effect | 1.6 s additive glow on the player. Same lantern hook. No mist wall |
| Duration | timed |
| Home biomes | Quiet Wells, Far Silver |
| Rarity | uncommon |
| Render cue | silver droplet |

## dew

| Field | Value |
| --- | --- |
| Category | run-buff |
| Status | idea |
| Effect | Short slow-time so a jump or dash reads easier |
| Duration | short |
| Home biomes | meadow, orchard |
| Rarity | uncommon |
| Render cue | a bright droplet; a brief desaturation and slow-motion shimmer on use |

Overlaps the accessibility slow-time option, so keep the effect short and clearly a
consumable, not a mode.

## moon letter

| Field | Value |
| --- | --- |
| Category | key |
| Status | idea |
| Effect | Opens the closed sky and moon edges in the Endless route walker |
| Duration | held for the run |
| Home biomes | osmanthus, cloudsea |
| Rarity | rare |
| Render cue | a folded silver note with a faint moon seal; a soft chime on pickup |

Turns the terminal reward rungs on. Without it, `osmanthus -> cloudsea` stays closed
([../universe/biome-graph.md](../universe/biome-graph.md)).

## cosmetic drop

| Field | Value |
| --- | --- |
| Category | cosmetic |
| Status | idea |
| Effect | Unlocks a Customize option for the bunny |
| Duration | permanent cosmetic only |
| Home biomes | any (rare) |
| Rarity | very rare |
| Render cue | a sparkling wrapped token; a distinct unlock jingle |

An alternative to pantry-only cosmetic unlocks, giving a long run a rare surprise. Never
affects stats.

## jade dew

| Field | Value |
| --- | --- |
| Category | run-buff |
| Status | idea |
| Effect | Brief west glow. Same lantern hook. No mist wall. Not immortality |
| Duration | timed |
| Home biomes | Other Shore, Grotto Heaven, West Pool |
| Rarity | uncommon |
| Render cue | jade droplet |

Run-scoped. Chapter 3 crumb. Do not ship a peach as a heal.

## peach petal

| Field | Value |
| --- | --- |
| Category | cosmetic |
| Status | idea |
| Effect | Unlocks a Customize blossom fleck. No hearts. No elixir |
| Duration | permanent cosmetic only |
| Home biomes | Peach Rows |
| Rarity | rare |
| Render cue | unripe-peach petal, not osmanthus |

The peach of immortality is a story beat, not a pickup. This petal is only a fleck.

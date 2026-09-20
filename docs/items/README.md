# Bunny Meadow — Items

Collectibles and their rules. Items matter once maps get longer (Endless and later
Story), giving a reason to take a risky high route. Hub: [../GDD.md](../GDD.md).
Abilities they modify: [../creatures/abilities.md](../creatures/abilities.md).

## The one hard rule

No power creep. Items are run-scoped or cosmetic. Nothing an item does survives a run as
a permanent stat gain. Meta progression is carrots into the burrow pantry, and the
pantry unlocks cosmetics and Meadow maps only, never gameplay power. Keepsakes
(osmanthus seeds) are a separate saved list. They never respawn. They unlock Customize
flecks and achievements only. They do not change hop power. This is a GDD scope
guard and it keeps every difficulty preset honest.

## Categories

| Category | Purpose | Persists? |
| --- | --- | --- |
| currency | carrots; feed the pantry | banked at run end |
| restore | heal during a run | consumed in run |
| run-buff | bend a verb briefly | consumed in run |
| key | open otherwise-closed routes | held for the run |
| cosmetic drop | unlock a cosmetic option | banked at run end |
| keepsake | hidden station token. Not pantry | saved. Never respawns |

## The catalog at a glance

Full entries on [catalog.md](catalog.md).

| Item | Category | Effect | Status |
| --- | --- | --- | --- |
| carrot | currency | pantry currency | live |
| mooncake | restore | restores one heart in Endless and Earth Story. Guanghan: timed warmth dash | live effect. Place on Earth Story I8 |
| osmanthus blossom | run-buff | one extra glide charge | live |
| lantern | run-buff | pushes the mist back 80 m, brief lantern glow | live |
| dew | run-buff | short slow-time | live on Soft Paths |
| sparkler | run-buff | lantern-class timed light. Not a weapon | planned (I9) |
| firefly (pickup) | run-buff | brief glow. No mist wall | planned |
| osmanthus seed | keepsake | one hidden spawn per playable station | live on eight stations. More I9-I10 |
| heart sprite | - | do not ship. Mooncake already restores | skipped |
| moon letter | key | opens the sky/moon edges in Endless | idea |
| cosmetic drop | cosmetic | ancestor of keepsakes. Prefer osmanthus seed | idea |
| jade dew | run-buff | brief west glow. Not immortality | idea |
| peach petal | cosmetic | blossom fleck. Not a heal | idea |

## How items reach the field

Chunks declare item slots rather than fixed pickups, and each biome has an item table
that weights what fills a slot. This is the same slot idea used for enemies. See
[placement.md](placement.md) and the chunk contract at
[../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md).

Today carrots, mooncakes, blossoms, and lanterns come from item slots filled by
`EndlessGenerator.fill` against `src/data/items.json`. `carrotChance` is the chance a
slot is filled. Empty rolls stay empty. Moon in the Pool authors one osmanthus seed.
Meadow through river author dew, mooncakes, and more seeds. Remaining Chapter 1 Story
chunks wait until I9-I10 for lanterns, blossoms, and festival pickups. No heart sprite.

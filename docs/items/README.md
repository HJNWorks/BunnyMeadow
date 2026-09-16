# Bunny Meadow — Items

Collectibles and their rules. Items matter once maps get longer (Endless and later
Story), giving a reason to take a risky high route. Hub: [../GDD.md](../GDD.md).
Abilities they modify: [../creatures/abilities.md](../creatures/abilities.md).

## The one hard rule

No power creep. Items are run-scoped or cosmetic. Nothing an item does survives a run as
a permanent stat gain. Meta progression is carrots into the burrow pantry, and the
pantry unlocks cosmetics and Meadow maps only, never gameplay power. This is a GDD scope
guard and it keeps every difficulty preset honest.

## Categories

| Category | Purpose | Persists? |
| --- | --- | --- |
| currency | carrots; feed the pantry | banked at run end |
| restore | heal during a run | consumed in run |
| run-buff | bend a verb briefly | consumed in run |
| key | open otherwise-closed routes | held for the run |
| cosmetic drop | unlock a cosmetic option | banked at run end |

## The catalog at a glance

Full entries on [catalog.md](catalog.md).

| Item | Category | Effect | Status |
| --- | --- | --- | --- |
| carrot | currency | pantry currency | live |
| mooncake | restore | restores one heart | planned |
| osmanthus blossom | run-buff | one extra glide charge | planned |
| lantern | run-buff | light radius + pushes the mist back | planned |
| dew | run-buff | short slow-time | idea |
| moon letter | key | opens the sky/moon edges in Endless | idea |
| cosmetic drop | cosmetic | unlocks a Customize option | idea |

## How items reach the field

Chunks declare item slots rather than fixed pickups, and each biome has an item table
that weights what fills a slot. This is the same slot idea used for enemies. See
[placement.md](placement.md) and the chunk contract at
[../modes/endless/chunk-contract.md](../modes/endless/chunk-contract.md).

Today only carrots exist, placed as fixed `carrots` arrays in chunk JSON, rolled by a
single `carrotChance` per difficulty. The item table replaces that single chance.

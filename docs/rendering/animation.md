# Rendering — Animation

Frame budgets, the telegraph grammar every enemy shares, and the squash/stretch and
screen-shake budgets. These keep readability and cost consistent as the roster grows. Hub:
[README.md](README.md). Creatures: [../creatures/README.md](../creatures/README.md).

## Frame budgets per state

Small sprites, few frames. A creature needs only these states, at these frame counts, unless
its archetype demands more:

| State | Frames | Notes |
| --- | --- | --- |
| idle | 2 | gentle breathing loop |
| move | 4 | walk or hop cycle |
| jump / air | 2 | rise and fall poses |
| hurt | 1 | single flinch pose |
| attack / telegraph | 3 | wind-up, commit, recover |

The player (Mei) may exceed this for feel (dash, glide, ride, float), but enemies stay within
it so a spritesheet is cheap and a new creature is quick to author.

## Telegraph grammar

Every hostile action reads the same way so a player learns one language across all biomes:

1. Flash colour: the creature tints toward its accent for the wind-up frame.
2. Pose hold: it holds the wind-up pose long enough to react to (the archetype's crouch,
   wing raise, head-down, or bank).
3. Shadow or dive line: for ranged and diver attacks, the path draws before the commit (the
   parabola apex marker or the dive line).

This grammar is already implied by the archetype telegraphs on each wildlife page. Bosses
compose the same grammar across phases.

## Squash and stretch budget

Used for weight and juice, bounded so nothing feels rubbery:

| Action | Max deform |
| --- | --- |
| jump take-off | stretch to about 1.15 vertical |
| landing | squash to about 0.9 vertical |
| dash | stretch to about 1.2 horizontal, one frame |
| pickup pop | scale to about 1.2 then settle |

## Screen shake budget

Shake is rare and small, and off under reduced motion:

| Trigger | Amplitude | Duration |
| --- | --- | --- |
| heart lost | small | about 120 ms |
| boss slam | medium | about 200 ms |
| mist wall catch (run end) | medium | about 250 ms |

No shake on ordinary jumps, pickups, or enemy contact that does not cost a heart.

## Reduced motion

- Squash/stretch reduced to a minimal cue or off.
- Screen shake off entirely.
- Telegraph pose hold stays (it is readability, not decoration); the flash may be softened.

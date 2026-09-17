# Story triggers: contact, proximity, volume

This page is the trigger map for Story play. It is not a radius on the burrow hole.

Burrow exit and Moon Pool stay **contact**. Later spells, auras, and optional editor placeables may use **proximity** without treating checkpoints as proximity objects.

Accessibility **auto-dash on proximity** is an assist on Mei, not a map trigger. See [GDD.md](../GDD.md).

## Trigger kinds

| Kind | Hit test | Used by | Not used by |
| --- | --- | --- | --- |
| contact | overlap with the **visible** sprite (ellipse-sized Arcade body) | burrow / exit, Moon Pool | generous boxes around those sprites |
| proximity | circle or AABB **larger than** the sprite | future: pollen aura, lantern warmth, scripted spells, optional editor placeables | burrow, Moon Pool |
| volume | standing inside a rect (water current) | water hazards | checkpoints |

## Contact (live)

Win and checkpoint fire only when Mei's body overlaps the painted hole or puddle.

- Burrow / exit: `story_exit` art is 80x90. Win requires Mei's center inside the inner dark hole (about 50x34), not the dirt rim or the platform beside it. The Arcade body matches that inner ellipse.
- Moon Pool: `story_pool` art is 80x36. The visible ellipse is about 74x30. Touch the puddle. A station may hold several pools. Each awakens on its own first contact.
- Editor Build still ignores exit overlap. Editor pick radii in the inspector stay slightly larger so the hole is clickable. That is chrome, not play.
- See [STORY.md](../STORY.md) for Moon Pool awakening and the HUD ticker.

## Volume (live)

Water hazards use a rectangle. Standing inside applies current and can fail the station. Water is not a checkpoint.

## Proximity (planned)

Proximity is a radius or box **beyond** the drawable. Use it for warmth, pollen, scripted spells, and optional placeables. Do not attach it to burrow or Moon Pool.

Editor overlay JSON (decor and hazards) may carry:

```json
"trigger": { "kind": "proximity", "radius": 80 }
```

Runtime does not spawn a proximity sensor from that field yet. Placeables stay contact or volume until a live object needs the radius. See [editor/README.md](../editor/README.md).

## Chang'e

Reflections in water remain her only channel ([change.md](../creatures/folk/change.md), [LORE.md](../LORE.md)). The pool answering Mei is an awakening of that reflection. Her line runs in the Story ticker, not a freeze card.

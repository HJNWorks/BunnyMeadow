# Bunny Meadow — Rendering Language

The visual and animation decisions that keep every biome, creature and item coherent as
the world grows. This is a brainstorm-to-contract page: each decision carries a status so a
reader knows what is settled. Hub: [../GDD.md](../GDD.md).

## Constraints inherited from the GDD

- Art is vector, canvas, or small in-repo pixel sprites. No asset store dependency.
- Menus and overlays are HTML/CSS for crisp text; only playfields are Phaser.
- Phaser target 1920x1080 with `Scale.FIT`, so Steam Deck 1280x800 and 4K both look
  intended.
- Reduced motion is an accessibility toggle that every effect must respect.

## Decision list

| Decision | Where | Status |
| --- | --- | --- |
| Per-biome palette token set | [palettes.md](palettes.md) | live (`palettes.json`) |
| Sky colour lerps across a bridge chunk | [palettes.md](palettes.md) | live (Endless bridges) |
| Weather as reusable particle presets | [effects.md](effects.md) | live (Story + Endless) |
| Night as a multiply overlay with light radii | [effects.md](effects.md) | live (cheap overlay + lantern glow) |
| Mist wall as layered scrolling sprites, shader optional | [effects.md](effects.md) | live (layered bands, no shader) |
| Telegraph grammar: flash colour + pose hold + shadow line | [animation.md](animation.md) | decided |
| Frame budgets per creature state | [animation.md](animation.md) | decided |
| Squash/stretch and screen-shake budgets | [animation.md](animation.md) | decided |
| Atlas and draw-call budgets | [performance.md](performance.md) | planned |

## Open questions that remain after I3

- Whether the mist wall later needs a shader on a low-end Deck (layered rects are the live path).
- Full skinnable layouts (one JSON, many biomes) still wait. I3 only tints from the palette.

## Pages

- [palettes.md](palettes.md) - the colour token set per biome and the sky lerp.
- [effects.md](effects.md) - weather, night lighting, and the mist wall.
- [animation.md](animation.md) - frame budgets, telegraph grammar, squash/stretch, shake.
- [performance.md](performance.md) - atlas, draw-call and particle budgets.

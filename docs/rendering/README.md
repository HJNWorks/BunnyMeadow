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
| Per-biome palette token set | [palettes.md](palettes.md) | decided (tokens named), values open |
| Sky colour lerps across a bridge chunk | [palettes.md](palettes.md) | planned |
| Weather as reusable particle presets | [effects.md](effects.md) | planned |
| Night as a multiply overlay with light radii | [effects.md](effects.md) | planned |
| Mist wall as layered scrolling sprites, shader optional | [effects.md](effects.md) | planned |
| Telegraph grammar: flash colour + pose hold + shadow line | [animation.md](animation.md) | decided |
| Frame budgets per creature state | [animation.md](animation.md) | decided |
| Squash/stretch and screen-shake budgets | [animation.md](animation.md) | decided |
| Atlas and draw-call budgets | [performance.md](performance.md) | planned |

## Open questions to resolve before art is final

- Whether biome palettes are authored as data (a `palettes.json`) or as constants next to
  the environment kits. Leaning data, so a rung can be reskinned at runtime for Endless.
- Whether the mist wall justifies a shader, or whether layered sprites read well enough on a
  low-end Deck.
- Whether night lighting is a real light system or a cheap multiply plus additive lantern
  sprites. Leaning cheap.

These graduate to decided in [../iterations/i3-theme-rendering.md](../iterations/i3-theme-rendering.md).

## Pages

- [palettes.md](palettes.md) - the colour token set per biome and the sky lerp.
- [effects.md](effects.md) - weather, night lighting, and the mist wall.
- [animation.md](animation.md) - frame budgets, telegraph grammar, squash/stretch, shake.
- [performance.md](performance.md) - atlas, draw-call and particle budgets.

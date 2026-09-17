# Rendering — Performance

Budgets that keep the web build and a low-end Steam Deck smooth as biomes, creatures and
effects grow. Hub: [README.md](README.md). These are targets, not measured limits, until an
iteration profiles them.

## Frame target

- 60 fps on desktop web and on Steam Deck at 1280x800.
- `Scale.FIT` from a 1920x1080 base, so the render resolution scales but the scene does not
  change. Story and Endless inset the `#app` parent around HUD chrome before FIT, so fullscreen
  downscales into the remaining rectangle instead of stretching under overlays.

## Texture and atlas budget

- One atlas per biome kit (tileset, props, weather particles) so a rung is one texture bind.
- One shared atlas for the player and all cosmetics (`drawBunny` output).
- One shared atlas for the creature roster, grouped so a biome's enemies sit together and
  reduce binds during a streamed run.
- Keep individual sprites small (in the tens of pixels) per the GDD art rule.

## Draw-call budget

- Aim for a low, stable draw-call count per frame: static geometry batched per chunk, movers
  and enemies from a shared atlas, weather from a single emitter.
- The mist wall is two or three sprite bands, not many particles, to keep it cheap
  ([effects.md](effects.md)).
- Menus and overlays are HTML/CSS and do not cost Phaser draw calls.

## Endless streaming budget

- Only chunks within a window around the player are assembled and drawn; chunks behind the
  mist wall are released.
- The three-axis generation ([../modes/endless/design.md](../modes/endless/design.md)) runs
  once per new chunk, not per frame, so route, tier and slot rolls are off the hot path.
- Particle counts drop under reduced motion and may drop automatically if the frame budget is
  missed for a sustained window (an idea for a dynamic quality step).

## What to profile first

- Mist wall cost with layered sprites versus a shader on a Deck-class GPU.
- Draw calls during a biome bridge, when two palettes and two weather presets overlap.
- Atlas memory when several biomes are held during a fast route walk.

These land in [../iterations/i3-theme-rendering.md](../iterations/i3-theme-rendering.md).

# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) (pre-1.0 during development).

## [Unreleased]

## [0.1.0] - 2026-09-16

First tagged release. Story milestones M0-M5 complete; the game is web-playable on
GitHub Pages.

### Added

- Meadow arcade mode: data-driven maps, difficulty presets, enemy roster, cosmetics,
  pantry unlocks (M0-M2).
- Moon Tasks: Night Watch and Hide and Seek (M2).
- Story mode through the moon finale: World 0-3 stations, bosses (Fox Hu, Heron Fisher,
  Crane Envoy), Moon Pool checkpoints, and the Guanghan epilogue (M3-M4).
- Endless mode: seeded chunk-streamed runner with a difficulty-scaled mist chase wall,
  hearts and respawn, lantern glide, carrots to the pantry, and a local per-difficulty
  leaderboard (M5).
- Meta shell: Title, Mode Select, Settings, Customize, Achievements; save schema with
  migration; shared input action map; audio and i18n buses; content flags.
- Documentation tree under `docs/` covering the universe, bestiary, items, Endless
  design, and rendering language, plus the web iteration track.
- Repo hygiene: proprietary LICENSE, CONTRIBUTING guide, this changelog, a CI workflow,
  and Conventional Commits enforcement.

### Known open items

- Endless runs read the same and later biomes are hard to reach (addressed in iteration
  I1; see `docs/modes/endless/design.md`).
- Audio assets and DE/ZH-Hans string fill remain from M5 (iteration I4).

[Unreleased]: https://github.com/HJNWorks/BunnyMeadow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/HJNWorks/BunnyMeadow/releases/tag/v0.1.0

# Bunny Meadow

![Bunny Meadow — burrow, meadow, fox, lanterns, and Guanghan under the moon](./MoonRabbit.png)

Play on GitHub Pages: [hjnworks.github.io/BunnyMeadow](https://hjnworks.github.io/BunnyMeadow/)

Family woodland adventure. Phaser 4 + Vite + TypeScript. Meadow arcade, Moon Tasks, and full Story (through Guanghan) ship on web. Endless and Steam desktop are planned. See [docs/GDD.md](docs/GDD.md).

## Develop

```powershell
cd Games/BunnyMeadow
npm install
npm run dev
```

Open the printed local URL (default http://localhost:8080/BunnyMeadow/).

## Build

```powershell
npm run build
npm run preview
```

Production assets land in `dist/` with base path `/BunnyMeadow/` for GitHub Pages.

## Docs

| Doc | Contents |
| --- | --- |
| [docs/GDD.md](docs/GDD.md) | Modes, difficulty, achievements, milestones |
| [docs/LORE.md](docs/LORE.md) | Folklore source ledger |
| [docs/STORY.md](docs/STORY.md) | Story spine and cast |
| [docs/WORLDS.md](docs/WORLDS.md) | Environments and level list |
| [docs/ENEMIES.md](docs/ENEMIES.md) | Archetypes and JSON schema |
| [docs/UI.md](docs/UI.md) | Screens, HUD, save schema |
| [docs/STEAM.md](docs/STEAM.md) | Electron + Steamworks plan |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Build order, frozen contracts, M1 stubs vs later fill-ins |

## Controls (Meadow)

- WASD / arrow keys: move
- Space: dash (brief protection, 2.2-second cooldown)
- P or Pause button: pause/resume
- Touch: hold a destination on the meadow; use the Dash button

Collect all 12 carrots, then return to the burrow on the left. Avoid the three foxes; you have three hearts. The burrow area is safe from foxes.

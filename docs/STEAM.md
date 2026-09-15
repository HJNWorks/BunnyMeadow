# Bunny Meadow — Steam Desktop Plan

Long-term distribution target. Web on GitHub Pages stays free and ships first.

## Wrapper

Electron + [steamworks.js](https://github.com/ceifa/steamworks.js/) (ceifa).

Reasons: Steam overlay hooks Chromium reliably. Achievement toasts work. Documented path for Phaser web games.

Tauri was considered and rejected for this project: Steam overlay support is a Windows-only decoy-swapchain workaround without achievement toasts.

References:

- [Publishing Web Games on Steam with Electron (Phaser)](https://phaser.io/news/2025/03/publishing-web-games-on-steam-with-electron)
- [Overaction: Electron + steamworks.js](https://www.overactiongamestudio.com/tutorials/18-developing-and-publishing-a-web-game-on-steam-with-electronjs-steamworks-js)
- [Steamworks: Steam Direct](https://partner.steamgames.com/doc/gettingstarted)
- [Steamworks: store assets](https://partner.steamgames.com/doc/store/assets)

## Platform abstraction

Gameplay never touches `localStorage` or `window` APIs directly. All IO goes through `core/platform`.

| Capability | Web (`web.ts`) | Desktop (`desktop.ts`, M6) |
| --- | --- | --- |
| SaveStore | localStorage | JSON files in `app.getPath("userData")/saves` |
| Achievements | silent local set | `client.achievement.activate(id)` |
| Window | no-op / Fullscreen API | Electron BrowserWindow fullscreen / quit |
| Presence | no-op | optional Rich Presence later |

`data/achievements.json` ids match the Steamworks achievement list one to one.

## Electron layout (M6)

```
desktop/
  main.ts              BrowserWindow, steamworks init, overlay enable
  preload.ts           narrow IPC bridge if needed
  steam_appid.txt      for local testing
  electron-builder.yml win / mac / linux targets
```

Ship Steam redistributable binaries (`steam_api` / `libsteam_api`) beside the packaged app. CI matrix builds artifacts. Optional SteamPipe upload job.

## Input and display

- Gamepad first-class from M1 (Steam Input exposes standard gamepads).
- Phaser `Scale.FIT`, design base 1920x1080 (16:9) so Steam Deck 1280x800 and 4K both look intended.
- Settings: fullscreen, borderless, resolution (desktop).

## Steamworks checklist

1. Register Steamworks partner account.
2. Sign tax / banking (W-8BEN for German individual). Identity verification (up to 30 days). Start during M4.
3. Pay Steam Direct fee: 100 USD per app id. Recouped after 1000 USD gross.
4. Create full game app id and optional free demo app id (Next Fest vehicle).
5. Upload build via SteamPipe. Build must launch on a clean machine with no missing DLLs.
6. Store page assets and correct age rating tags.
7. Coming Soon page public at least 2 weeks before release.
8. Valve review of build and page: about 1 to 5 business days each.
9. Factor Valve 30 percent into pricing (target about 4.99 to 7.99 EUR).

## Store asset list

Produce from the game's own art after World 1 looks final.

| Asset | Size |
| --- | --- |
| Header capsule | 460 x 215 |
| Small capsule | 231 x 87 |
| Main capsule | 616 x 353 |
| Vertical capsule | 374 x 448 |
| Library capsule | 600 x 900 |
| Hero | 3840 x 1240 |
| Logo | transparent |
| Screenshots | at least five at 1920 x 1080 |
| Trailer | 30 to 60 s, gameplay-first |

Store page languages: EN, DE, ZH-Hans.

## Licensing

- Fonts: OFL only
- Audio: self-made or CC0
- Trademark search on "Bunny Meadow" before Coming Soon goes live

## Content split (assumption)

| Build | Content |
| --- | --- |
| Web free | Meadow, Moon Tasks, Story World 1 |
| Steam paid | Full story, Endless, achievements, cloud saves, controller polish |

Confirm before M7.

## Marketing and visibility

- Keep the web build free. Link to the Steam page.
- Demo app id with World 1 for Steam Next Fest.
- Post development GIFs of Moon Pools and moon low-gravity.
- Reach family-gaming and cozy-game creators.
- Internal go/no-go wishlist threshold before locking a launch date (example: 5000).

## Timeline relative to milestones

| When | What |
| --- | --- |
| M4 parallel | Steamworks registration and verification |
| M6 | Electron + steamworks.js + clean-machine builds |
| M7 | Store assets, Coming Soon, demo, Next Fest |
| M8 | SteamPipe, review, wishlist check, launch, patch window |

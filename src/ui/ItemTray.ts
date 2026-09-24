export type TrayBuff = {
  id: string
  remaining: number
  duration: number
  label?: string
}

export const ITEM_TRAY_CSS = `
.bm-item-tray {
  position: fixed;
  top: 108px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 55;
  pointer-events: none;
}
.bm-item-tray[hidden],
.bm-item-tray:empty {
  display: none;
}
.bm-item-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 112px;
  padding: 6px 10px;
  border-radius: 12px;
  background: #fffaf0ee;
  border: 1px solid #d5dcc4;
  box-shadow: 0 8px 16px #2a3d2418;
  color: #304c39;
  font: 700 13px system-ui, sans-serif;
}
.bm-item-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex: 0 0 18px;
}
.bm-item-icon.is-mooncake {
  background: radial-gradient(circle at 35% 35%, #ffe7a8, #d4a017);
}
.bm-item-icon.is-lantern {
  background: radial-gradient(circle at 35% 35%, #ffe08a, #dc854e);
}
.bm-item-icon.is-osmanthus_blossom {
  background: radial-gradient(circle at 35% 35%, #fff4d0, #e2b84a);
}
.bm-item-icon.is-star_grit {
  background: radial-gradient(circle at 35% 35%, #f4f8ff, #a8b8c8);
}
.bm-item-icon.is-elixir_crumb {
  background: radial-gradient(circle at 35% 35%, #ffe7a8, #d4b05a);
}
.bm-item-icon.is-well_silver {
  background: radial-gradient(circle at 35% 35%, #f4f8ff, #8aa0b4);
}
.bm-item-icon.is-dew {
  background: radial-gradient(circle at 35% 35%, #d8f4ff, #6aa8c8);
}
.bm-item-icon.is-sparkler {
  background: radial-gradient(circle at 35% 35%, #ffe08a, #e07040);
}
.bm-item-icon.is-glide {
  background: radial-gradient(circle at 35% 35%, #f4f8ff, #8eb4d4);
}
`

export function bindItemTray(root: HTMLElement): HTMLElement {
  const existing = root.querySelector("[data-ui=itemTray]") as HTMLElement | null
  if (existing) {
    return existing
  }
  const tray = document.createElement("div")
  tray.className = "bm-item-tray"
  tray.dataset.ui = "itemTray"
  root.appendChild(tray)
  return tray
}

export function renderItemTray(tray: HTMLElement, buffs: TrayBuff[]): void {
  const live = buffs.filter((buff) => buff.remaining > 0.04)
  if (live.length === 0) {
    tray.hidden = true
    tray.replaceChildren()
    return
  }
  tray.hidden = false
  tray.innerHTML = live
    .map((buff) => {
      const seconds = Math.max(0.1, buff.remaining).toFixed(1)
      const label = buff.label ?? `${seconds}s`
      return `<div class="bm-item-chip" data-item="${buff.id}">
        <span class="bm-item-icon is-${buff.id}" aria-hidden="true"></span>
        <span>${label}</span>
      </div>`
    })
    .join("")
}

import Phaser from "phaser"
import menuCss from "./menu.css?inline"

let menuStyleMounted = false

function ensureMenuCss(): void {
  if (menuStyleMounted) {
    return
  }
  const style = document.createElement("style")
  style.dataset.bmMenu = "1"
  style.textContent = menuCss
  document.head.appendChild(style)
  menuStyleMounted = true
}

export type DomShellHandle = {
  root: HTMLDivElement
  teardown: () => void
}

export function mountDomShell(
  scene: Phaser.Scene,
  html: string,
  options: { center?: boolean; rootClass?: string; keepCanvas?: boolean } = {},
): DomShellHandle {
  ensureMenuCss()

  const parent = scene.game.canvas.parentElement
  if (parent && !options.keepCanvas) {
    parent.style.visibility = "hidden"
  }

  const root = document.createElement("div")
  root.className = ["bm-root", options.center ? "bm-center" : "", options.rootClass ?? ""]
    .filter(Boolean)
    .join(" ")
  root.innerHTML = html
  document.body.appendChild(root)

  const teardown = (): void => {
    root.remove()
    if (parent && !options.keepCanvas) {
      parent.style.visibility = ""
    }
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, teardown)
  scene.events.once(Phaser.Scenes.Events.DESTROY, teardown)

  return { root, teardown }
}

export function requireEl<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector(selector)
  if (!el) {
    throw new Error(`Missing element: ${selector}`)
  }
  return el as T
}

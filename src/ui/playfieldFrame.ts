import Phaser from "phaser"

export type PlayfieldInsets = {
  top: number
  bottom: number
  side: number
}

function clearParentBox(parent: HTMLElement): void {
  parent.style.position = ""
  parent.style.top = ""
  parent.style.right = ""
  parent.style.bottom = ""
  parent.style.left = ""
  parent.style.width = ""
  parent.style.height = ""
  parent.style.margin = ""
  parent.style.overflow = ""
}

export function measureChromeInsets(options: {
  topSelectors: string[]
  bottomSelectors: string[]
  padTop?: number
  padBottom?: number
  side?: number
}): PlayfieldInsets {
  const padTop = options.padTop ?? 10
  const padBottom = options.padBottom ?? 12
  const side = options.side ?? 20
  let top = padTop
  for (const selector of options.topSelectors) {
    const el = document.querySelector(selector)
    if (!el) {
      continue
    }
    const rect = el.getBoundingClientRect()
    top = Math.max(top, rect.bottom + padTop)
  }
  let bottom = padBottom
  for (const selector of options.bottomSelectors) {
    const el = document.querySelector(selector)
    if (!el) {
      continue
    }
    const rect = el.getBoundingClientRect()
    bottom = Math.max(bottom, window.innerHeight - rect.top + padBottom)
  }
  return { top: Math.ceil(top), bottom: Math.ceil(bottom), side }
}

export function attachPlayfieldFrame(
  scene: Phaser.Scene,
  measure: () => PlayfieldInsets,
  options?: { observeSelectors?: string[] },
): void {
  const parent = scene.game.canvas.parentElement
  if (!parent) {
    return
  }

  let applying = false
  const apply = (): void => {
    if (applying) {
      return
    }
    applying = true
    const inset = measure()
    parent.style.position = "fixed"
    parent.style.top = `${inset.top}px`
    parent.style.right = `${inset.side}px`
    parent.style.bottom = `${inset.bottom}px`
    parent.style.left = `${inset.side}px`
    parent.style.width = "auto"
    parent.style.height = "auto"
    parent.style.margin = "0"
    parent.style.overflow = "hidden"
    scene.scale.refresh()
    applying = false
  }

  apply()
  requestAnimationFrame(() => {
    requestAnimationFrame(apply)
  })

  scene.scale.on(Phaser.Scale.Events.RESIZE, apply)
  window.addEventListener("resize", apply)
  document.addEventListener("fullscreenchange", apply)
  const observer = new ResizeObserver(apply)
  observer.observe(document.documentElement)
  for (const selector of options?.observeSelectors ?? []) {
    const el = document.querySelector(selector)
    if (el) {
      observer.observe(el)
    }
  }

  const teardown = (): void => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, apply)
    window.removeEventListener("resize", apply)
    document.removeEventListener("fullscreenchange", apply)
    observer.disconnect()
    clearParentBox(parent)
    scene.scale.refresh()
  }
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, teardown)
  scene.events.once(Phaser.Scenes.Events.DESTROY, teardown)
}

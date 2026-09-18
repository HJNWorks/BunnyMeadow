import Phaser from "phaser"

export const STORY_TOP_CHROME = [
  ".bm-story-hud .meadow-header",
  ".bm-story-hud .meadow-bar",
] as const

export const EDITOR_TOP_CHROME = [".bm-editor-top"] as const

export const EDITOR_BOTTOM_CHROME = [".bm-editor-bar"] as const

export function placeBelowStoryChrome(el: HTMLElement, gap = 8): void {
  const bar = document.querySelector(".bm-story-hud .meadow-bar")
  const head = document.querySelector(".bm-story-hud .meadow-header")
  const anchor = bar ?? head
  const top = anchor ? anchor.getBoundingClientRect().bottom + gap : 8
  el.style.top = `${Math.round(top)}px`
}

export function watchStoryChrome(onChange: () => void): () => void {
  const observer = new ResizeObserver(onChange)
  for (const selector of STORY_TOP_CHROME) {
    const node = document.querySelector(selector)
    if (node) {
      observer.observe(node)
    }
  }
  window.addEventListener("resize", onChange)
  document.addEventListener("fullscreenchange", onChange)
  return () => {
    observer.disconnect()
    window.removeEventListener("resize", onChange)
    document.removeEventListener("fullscreenchange", onChange)
  }
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

export type PlayfieldInsets = {
  top: number
  bottom: number
  side: number
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
  options?: { observeSelectors?: string[]; beforeMeasure?: () => void },
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
    options?.beforeMeasure?.()
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

export function mountPlayfieldHud(scene: Phaser.Scene, hud: HTMLElement): void {
  const parent = scene.game.canvas.parentElement
  if (!parent) {
    return
  }
  parent.appendChild(hud)
  parent.style.position = parent.style.position || "fixed"
  hud.style.display = "block"
  hud.style.position = "absolute"
  hud.style.zIndex = "4"
  hud.style.pointerEvents = "none"
  hud.style.right = "auto"
  hud.style.bottom = "auto"

  const sync = (): void => {
    const canvas = scene.game.canvas
    const pr = parent.getBoundingClientRect()
    const cr = canvas.getBoundingClientRect()
    hud.style.top = `${Math.round(cr.top - pr.top)}px`
    hud.style.left = `${Math.round(cr.left - pr.left)}px`
    hud.style.width = `${Math.round(cr.width)}px`
    hud.style.height = `${Math.round(cr.height)}px`
    hud.style.inset = "auto"
  }

  sync()
  requestAnimationFrame(() => {
    requestAnimationFrame(sync)
  })
  scene.scale.on(Phaser.Scale.Events.RESIZE, sync)
  window.addEventListener("resize", sync)
  document.addEventListener("fullscreenchange", sync)

  const teardown = (): void => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, sync)
    window.removeEventListener("resize", sync)
    document.removeEventListener("fullscreenchange", sync)
    hud.remove()
  }
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, teardown)
  scene.events.once(Phaser.Scenes.Events.DESTROY, teardown)
}

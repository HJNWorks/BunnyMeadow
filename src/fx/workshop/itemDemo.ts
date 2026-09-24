import { drawBunny } from "../../render/drawBunny"
import { drawStamp } from "../../render/stamps"
import { getItemLook } from "../../modes/story/shared/itemLooks"

const MEI = { fur: "cream" as const, ears: "upright" as const, accessory: "none" as const }
const GROUND = 128
const WALK = 0.9
const CYCLE = 3.4

type Pose = {
  x: number
  y: number
  glow: string
  mark: string
  veil: number
  glint: number
}

function pose(id: string, u: number, startX: number, width: number): Pose {
  const ground = GROUND - 18
  const still: Pose = { x: startX, y: ground, glow: "", mark: "", veil: 0, glint: 0 }
  if (id === "star_grit") {
    return { ...still, x: startX + u * 28, y: ground - Math.sin(u * Math.PI) * 78 }
  }
  if (id === "osmanthus_blossom") {
    const hang = u < 0.25 ? u / 0.25 : u > 0.72 ? (1 - u) / 0.28 : 1
    return { ...still, x: startX + u * 46, y: ground - hang * 46 }
  }
  if (id === "glide") {
    const up = Math.min(1, u / 0.18)
    const down = u > 0.82 ? (u - 0.82) / 0.18 : 0
    return { ...still, x: startX + u * (width - startX - 40), y: ground - up * (1 - down) * 52 }
  }
  if (id === "elixir_crumb") {
    return { ...still, x: startX + u * 88, y: ground + u * u * 34 }
  }
  if (id === "mooncake") {
    return { ...still, y: ground - Math.sin(Math.min(1, u * 2) * Math.PI) * 16, mark: "♥" }
  }
  if (id === "carrot") {
    return { ...still, mark: "+1" }
  }
  if (id === "dew") {
    return { ...still, veil: 0.28 }
  }
  if (id === "osmanthus_seed") {
    return { ...still, glint: 1 - u }
  }
  if (id === "lantern") {
    return { ...still, glow: "#ffe08a99" }
  }
  if (id === "sparkler") {
    return { ...still, glow: "#ffb06099" }
  }
  if (id === "well_silver") {
    return { ...still, glow: "#d8e8f899" }
  }
  return still
}

function paintDemo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  itemId: string,
  time: number,
  moving: boolean,
): void {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = "#c5d48a"
  ctx.fillRect(0, 0, width, height)
  const padRight = itemId === "elixir_crumb" ? 168 : width
  ctx.fillStyle = "#6a7540"
  ctx.fillRect(0, GROUND, padRight, height - GROUND)
  const look = getItemLook(itemId)
  const local = moving ? time % CYCLE : 0
  const itemX = itemId === "elixir_crumb" ? 132 : 188
  const ground = GROUND - 18
  let meiX = 56
  let meiY = ground
  let showItem = true
  let shown: Pose = { x: meiX, y: meiY, glow: "", mark: "", veil: 0, glint: 0 }
  if (local < WALK) {
    const u = local / WALK
    meiX = 56 + (itemX - 34 - 56) * u
    meiY = ground - Math.abs(Math.sin(local * 14)) * 3
  } else {
    showItem = false
    shown = pose(itemId, (local - WALK) / (CYCLE - WALK), itemX - 18, width)
    meiX = shown.x
    meiY = shown.y
  }
  if (shown.veil > 0) {
    ctx.fillStyle = `rgba(176, 198, 214, ${shown.veil})`
    ctx.fillRect(0, 0, width, height)
  }
  if (showItem) {
    drawStamp(ctx, look.source, itemX, GROUND - 18)
  }
  if (shown.glow) {
    ctx.fillStyle = shown.glow
    ctx.beginPath()
    ctx.ellipse(meiX, meiY, 30, 24, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  if (shown.glint > 0) {
    ctx.fillStyle = `rgba(255, 246, 208, ${shown.glint})`
    ctx.beginPath()
    ctx.ellipse(meiX + 16, meiY - 22, 5, 5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  drawBunny(ctx, meiX, meiY, MEI)
  if (shown.mark) {
    ctx.fillStyle = "#304c39"
    ctx.font = "700 16px system-ui, sans-serif"
    ctx.fillText(shown.mark, meiX - 8, meiY - 36)
  }
}

export type ItemDemo = {
  stop: () => void
  repaint: () => void
}

export function bindItemDemo(
  canvas: HTMLCanvasElement,
  stopEl: HTMLInputElement,
  readItemId: () => string,
): ItemDemo {
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return { stop: () => undefined, repaint: () => undefined }
  }
  let alive = true
  let raf = 0
  let last = 0
  let elapsed = 0

  const paint = (moving: boolean): void => {
    paintDemo(ctx, canvas.width, canvas.height, readItemId(), elapsed, moving)
  }

  const frame = (now: number): void => {
    if (!alive || stopEl.checked) {
      return
    }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
    last = now
    elapsed += dt
    paint(true)
    raf = window.requestAnimationFrame(frame)
  }

  const halt = (): void => {
    window.cancelAnimationFrame(raf)
    raf = 0
    last = 0
    elapsed = 0
    paint(false)
  }

  const start = (): void => {
    window.cancelAnimationFrame(raf)
    last = 0
    elapsed = 0
    raf = window.requestAnimationFrame(frame)
  }

  stopEl.onchange = () => {
    if (stopEl.checked) {
      halt()
      return
    }
    start()
  }

  halt()

  return {
    stop: () => {
      alive = false
      window.cancelAnimationFrame(raf)
    },
    repaint: () => {
      if (stopEl.checked) {
        paint(false)
      }
    },
  }
}

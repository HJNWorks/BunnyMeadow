import type { AccessoryOption, EarsOption, FurOption } from "../core/save"

export type BunnyCosmetics = {
  fur: FurOption
  ears: EarsOption
  accessory: AccessoryOption
}

const FUR_FILL: Record<FurOption, string> = {
  cream: "#fffaf0",
  brown: "#c4a484",
  gray: "#b8bdc4",
  "moon-white": "#f7fbff",
}

const FUR_INNER: Record<FurOption, string> = {
  cream: "#e8b3a6",
  brown: "#a67c5d",
  gray: "#8e949c",
  "moon-white": "#d4e4f2",
}

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

export function drawBunny(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cosmetics: BunnyCosmetics,
): void {
  const fill = FUR_FILL[cosmetics.fur] ?? FUR_FILL.cream
  const inner = FUR_INNER[cosmetics.fur] ?? FUR_INNER.cream

  ctx.save()
  ctx.translate(x, y)
  ellipse(ctx, 0, 15, 20, 7, "#425b3825")

  if (cosmetics.ears === "lop") {
    ellipse(ctx, -16, -8, 7, 14, fill)
    ellipse(ctx, 16, -10, 7, 14, fill)
    ellipse(ctx, -16, -6, 2.5, 8, inner)
    ellipse(ctx, 16, -8, 2.5, 8, inner)
  } else if (cosmetics.ears === "tufted") {
    ellipse(ctx, -8, -23, 6, 18, fill)
    ellipse(ctx, 8, -25, 6, 19, fill)
    ellipse(ctx, -8, -25, 2.5, 11, inner)
    ellipse(ctx, 8, -27, 2.5, 12, inner)
    ellipse(ctx, -8, -40, 4, 4, fill)
    ellipse(ctx, 8, -42, 4, 4, fill)
  } else {
    ellipse(ctx, -8, -23, 6, 20, fill)
    ellipse(ctx, 8, -25, 6, 21, fill)
    ellipse(ctx, -8, -25, 2.5, 13, inner)
    ellipse(ctx, 8, -27, 2.5, 14, inner)
  }

  ellipse(ctx, 0, 3, 18, 19, fill)
  ellipse(ctx, -11, 17, 7, 4, fill)
  ellipse(ctx, 11, 17, 7, 4, fill)
  ellipse(ctx, -6, -1, 2, 2.5, "#3d4934")
  ellipse(ctx, 6, -1, 2, 2.5, "#3d4934")
  ellipse(ctx, 0, 5, 2.5, 2, "#db9f98")
  ellipse(ctx, -11, 5, 3, 2, "#efc9b9")
  ellipse(ctx, 11, 5, 3, 2, "#efc9b9")

  if (cosmetics.accessory === "scarf") {
    ctx.fillStyle = "#d4654a"
    ctx.beginPath()
    ctx.ellipse(0, 14, 14, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(8, 12, 6, 14)
  } else if (cosmetics.accessory === "lantern") {
    ellipse(ctx, 18, 10, 5, 6, "#f0c35a")
    ctx.strokeStyle = "#8b6914"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(18, 4)
    ctx.lineTo(18, -2)
    ctx.stroke()
  } else if (cosmetics.accessory === "blossom") {
    ellipse(ctx, -14, -18, 4, 4, "#f2a0b8")
    ellipse(ctx, -10, -20, 3, 3, "#f7c4d2")
    ellipse(ctx, -12, -16, 2, 2, "#e87898")
  } else if (cosmetics.accessory === "moon-helmet") {
    ellipse(ctx, 0, -16, 16, 8, "#c8d4e4")
    ctx.fillStyle = "#a8b8c8"
    ctx.fillRect(-13, -14, 26, 7)
    ctx.fillStyle = "#8a98a8"
    ctx.fillRect(-2, -28, 4, 12)
    ellipse(ctx, 5, -34, 8, 8, "#f4f8ff")
    ellipse(ctx, -1, -34, 6, 6, fill)
  }

  ctx.restore()
}

export type InkPoint = { x: number; y: number }

export type InkBrushOptions = {
  samples?: number
  feathers?: number
  seed?: number
  ink?: string
  ghostInk?: string
  progress?: number
  width?: number
  height?: number
}

type SpinePoint = InkPoint & { nx: number; ny: number; t: number }

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function buildInkBrushSvg(points: InkPoint[], opts: InkBrushOptions = {}): string {
  const samples = opts.samples ?? 52
  const feathers = opts.feathers ?? 4
  const seed = opts.seed ?? 7
  const ink = opts.ink ?? "#2f3f2a"
  const ghostInk = opts.ghostInk ?? "#6f804855"
  const progress = clamp(opts.progress ?? 1, 0, 1)
  const width = opts.width ?? 1000
  const height = opts.height ?? 420

  if (points.length < 2) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"></svg>`
  }

  const spine = sampleSpine(points, samples, seed)
  const cut = Math.max(2, Math.floor((spine.length - 1) * progress) + 1)
  const drawn = spine.slice(0, cut)
  const rest = spine.slice(Math.max(0, cut - 1))

  const drawnGroup = featherGroup(drawn, feathers, seed, ink, 1)
  const restGroup = rest.length >= 2 ? featherGroup(rest, feathers, seed + 19, ghostInk, 0.5) : ""

  const start = points[0]
  const end = points[points.length - 1]
  const bx = start.x - 8
  const by = start.y - 78
  const sprout = `
    <g class="story-ink-burrow" pointer-events="none" aria-hidden="true">
      <ellipse cx="${bx}" cy="${by + 28}" rx="38" ry="14" fill="#5c6b3a" opacity="0.28"/>
      <ellipse cx="${bx}" cy="${by + 18}" rx="34" ry="20" fill="#6a5538"/>
      <ellipse cx="${bx}" cy="${by + 14}" rx="22" ry="14" fill="#2a2218"/>
      <ellipse cx="${bx}" cy="${by + 2}" rx="13" ry="12" fill="#fffaf0"/>
      <ellipse cx="${bx - 9}" cy="${by - 14}" rx="5" ry="12" fill="#fffaf0" transform="rotate(-16 ${bx - 9} ${by - 14})"/>
      <ellipse cx="${bx + 9}" cy="${by - 16}" rx="5" ry="13" fill="#fffaf0" transform="rotate(12 ${bx + 9} ${by - 16})"/>
      <ellipse cx="${bx - 9}" cy="${by - 13}" rx="2" ry="7" fill="#e8b3a6" transform="rotate(-16 ${bx - 9} ${by - 13})"/>
      <ellipse cx="${bx + 9}" cy="${by - 15}" rx="2" ry="8" fill="#e8b3a6" transform="rotate(12 ${bx + 9} ${by - 15})"/>
      <circle cx="${bx - 4}" cy="${by}" r="1.6" fill="#3d4934"/>
      <circle cx="${bx + 4}" cy="${by}" r="1.6" fill="#3d4934"/>
      <ellipse cx="${bx}" cy="${by + 4}" rx="2" ry="1.4" fill="#db9f98"/>
    </g>`
  const moon = `
    <g class="story-ink-moon" pointer-events="none">
      <circle cx="${end.x}" cy="${end.y}" r="34" fill="#fff6c8" stroke="#d7b45a" stroke-width="2.5"/>
      <circle cx="${end.x + 10}" cy="${end.y - 6}" r="10" fill="#f0e2a8" opacity="0.55"/>
      <text x="${end.x}" y="${end.y + 54}" text-anchor="middle" fill="${ink}" font-size="17" font-family="Georgia, serif" opacity="0.72">月亮</text>
    </g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="story-ink-svg" aria-hidden="true">
  <g class="story-ink-drawn">${drawnGroup}</g>
  <g class="story-ink-ghost">${restGroup}</g>
  ${sprout}
  ${moon}
</svg>`
}

function sampleSpine(points: InkPoint[], samples: number, seed: number): SpinePoint[] {
  const out: SpinePoint[] = []
  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1)
    const base = pointOnPolyline(points, t)
    const ahead = pointOnPolyline(points, Math.min(1, t + 0.02))
    const behind = pointOnPolyline(points, Math.max(0, t - 0.02))
    const ang = Math.atan2(ahead.y - behind.y, ahead.x - behind.x)
    const nx = -Math.sin(ang)
    const ny = Math.cos(ang)
    const wobble = (hash01(seed + i * 3.1) - 0.5) * 10 + Math.sin(t * Math.PI * 3.2 + seed) * 4
    out.push({
      x: base.x + nx * wobble * 0.35,
      y: base.y + ny * wobble * 0.35,
      nx,
      ny,
      t,
    })
  }
  return out
}

function pointOnPolyline(points: InkPoint[], t: number): InkPoint {
  if (points.length === 1) {
    return { ...points[0] }
  }
  const total = points.length - 1
  const scaled = clamp(t, 0, 1) * total
  const i = Math.min(total - 1, Math.floor(scaled))
  const u = scaled - i
  const a = points[i]
  const b = points[i + 1]
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }
}

function featherGroup(
  spine: SpinePoint[],
  feathers: number,
  seed: number,
  color: string,
  opacityScale: number,
): string {
  const paths: string[] = []
  for (let f = 0; f < feathers; f += 1) {
    const side = f - (feathers - 1) / 2
    const pts = spine.map((p, i) => {
      const spread = 3.2 + hash01(seed + f * 11 + i) * 2.4
      const taper = Math.sin((i / (spine.length - 1)) * Math.PI)
      const offset = side * spread * (0.45 + taper)
      const jitter = (hash01(seed * 2 + f * 17 + i * 0.7) - 0.5) * 2.2
      return {
        x: p.x + p.nx * (offset + jitter),
        y: p.y + p.ny * (offset + jitter),
      }
    })
    const d = smoothPath(pts)
    const width = 1.1 + Math.abs(side) * 0.35 + hash01(seed + f) * 1.4
    const opacity = (0.35 + (1 - Math.abs(side) / feathers) * 0.5) * opacityScale
    paths.push(
      `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity.toFixed(3)}" class="story-ink-stroke"/>`,
    )
  }
  return `${brushRibbon(spine, seed, color, opacityScale)}\n${paths.join("\n")}`
}

function brushRibbon(spine: SpinePoint[], seed: number, color: string, opacityScale: number): string {
  if (spine.length < 2) {
    return ""
  }
  const left: InkPoint[] = []
  const right: InkPoint[] = []
  for (let i = 0; i < spine.length; i += 1) {
    const p = spine[i]
    const u = i / (spine.length - 1)
    const pressure = Math.pow(Math.sin(u * Math.PI), 0.65) * (2.8 + hash01(seed + i) * 1.6)
    left.push({ x: p.x + p.nx * pressure, y: p.y + p.ny * pressure })
    right.push({ x: p.x - p.nx * pressure * 0.55, y: p.y - p.ny * pressure * 0.55 })
  }
  const d = [
    `M${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)}`,
    ...left.slice(1).map((p) => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    ...right
      .slice()
      .reverse()
      .map((p) => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    "Z",
  ].join(" ")
  return `<path d="${d}" fill="${color}" opacity="${(0.18 * opacityScale).toFixed(3)}" class="story-ink-ribbon"/>`
}

function smoothPath(pts: InkPoint[]): string {
  if (pts.length === 0) {
    return ""
  }
  if (pts.length === 1) {
    return `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  }
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length - 1; i += 1) {
    const midX = (pts[i].x + pts[i + 1].x) / 2
    const midY = (pts[i].y + pts[i + 1].y) / 2
    d += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`
  }
  const last = pts[pts.length - 1]
  d += ` T${last.x.toFixed(1)} ${last.y.toFixed(1)}`
  return d
}

export function inkProgressForWorlds(
  worlds: { id: string }[],
  isUnlocked: (id: string) => boolean,
): number {
  if (worlds.length <= 1) {
    return 1
  }
  let lastUnlocked = -1
  for (let i = 0; i < worlds.length; i += 1) {
    if (isUnlocked(worlds[i].id)) {
      lastUnlocked = i
    }
  }
  if (lastUnlocked < 0) {
    return 0.1
  }
  return clamp(lastUnlocked / (worlds.length - 1), 0.12, 1)
}

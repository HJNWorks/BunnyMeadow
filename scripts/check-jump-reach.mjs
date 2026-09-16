const g = 1200
const RUN = 260
const DASH = 520
const DASH_T = 0.16
const J1 = 720
const J2 = 640
const DT = 1 / 240
const MAX_VX = 560
const G_GLIDE = g * 0.22
const VY_CAP = 90

const P4 = { x: 560, w: 200, y: 760 }
const P5 = { x: 140, w: 160, y: 760, chunkOffset: 960 }

function traj({ glide, djAt, dashAt }) {
  let x = 0
  let y = 0
  let vx = RUN
  let vy = -J1
  let t = 0
  let aj = 1
  let dashLeft = 0
  while (t < 5) {
    if (dashAt != null && dashLeft <= 0 && t + DT / 2 >= dashAt && t - DT / 2 < dashAt) {
      dashLeft = DASH_T
      vx = DASH
    }
    if (djAt != null && aj > 0 && t + DT / 2 >= djAt && t - DT / 2 < djAt) {
      aj -= 1
      vy = -J2
    }
    if (dashLeft > 0) {
      dashLeft -= DT
      vx = DASH
    } else {
      vx = RUN
    }
    let grav = g
    if (glide && vy > 0) {
      grav = G_GLIDE
      if (vy > VY_CAP) {
        vy = VY_CAP
      }
    }
    if (vx > MAX_VX) {
      vx = MAX_VX
    }
    vy += grav * DT
    x += vx * DT
    y += vy * DT
    t += DT
    if (t > 0.2 && y >= 0 && vy > 0) {
      return x
    }
    if (y > 220) {
      return x
    }
  }
  return x
}

function bestReach({ useDj, useDash, glide }) {
  if (!useDj && !useDash) {
    return traj({ glide, djAt: null, dashAt: null })
  }
  let best = 0
  for (let dj = 0.08; dj <= 1.5; dj += 0.04) {
    for (let da = 0; da <= 1.8; da += 0.04) {
      const x = traj({
        glide,
        djAt: useDj ? dj : null,
        dashAt: useDash ? da : null,
      })
      if (x > best) {
        best = x
      }
    }
  }
  return best
}

const single = bestReach({ useDj: false, useDash: false, glide: false })
const doubleDash = bestReach({ useDj: true, useDash: true, glide: false })
const configuredGap = P5.chunkOffset + P5.x - (P4.x + P4.w)
const hard = Math.floor(single + (doubleDash - single) * 0.12)
const centerTakeoffExtra = Math.floor(P4.w * 0.45)
const practicalNeed = configuredGap + centerTakeoffExtra

console.log("Story jump model: run", RUN, "dash", DASH, "maxVx", MAX_VX, "jump", J1, "air", J2)
console.log("same-height reach: single", single.toFixed(0), "| double+dash", doubleDash.toFixed(0))
console.log("playable hard gap target", hard, "(12% from single toward double+dash)")
console.log("Paper Lights P4->P5 edge gap", configuredGap, "dy", P4.y - P5.y)
console.log("practical need if takeoff near center", practicalNeed)

if (configuredGap <= single) {
  console.error("FAIL: gap is single-jumpable; not a skill check")
  process.exit(1)
}
if (practicalNeed > doubleDash * 0.85) {
  console.error("FAIL: practical takeoff exceeds comfortable double+dash reach")
  process.exit(1)
}
if (Math.abs(configuredGap - hard) > 60) {
  console.warn("WARN: configured gap", configuredGap, "vs target", hard)
}
console.log("Jump reach check ok.")

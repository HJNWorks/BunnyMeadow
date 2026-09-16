const g = 1200
const RUN = 260
const DASH = 420
const DASH_T = 0.16
const J1 = 720
const J2 = 640
const DT = 1 / 240
const G_GLIDE = g * 0.22
const VY_CAP = 90

function traj({ glide, djAt, dashAt }) {
  let x = 0
  let y = 0
  let vx = RUN
  let vy = -J1
  let t = 0
  let aj = 1
  let dashLeft = 0
  const samples = []
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
    if (vx > 420) {
      vx = 420
    }
    vy += grav * DT
    x += vx * DT
    y += vy * DT
    t += DT
    samples.push({ x, y, vy, t })
    if (t > 0.25 && y > 220) {
      break
    }
  }
  return samples
}

function maxReach(glide, dy) {
  const targetY = -dy
  let best = { x: 0 }
  for (let dj = 0.05; dj <= 1.6; dj += 0.03) {
    for (let da = 0; da <= 2; da += 0.03) {
      const s = traj({ glide, djAt: dj, dashAt: da })
      for (let i = 1; i < s.length; i += 1) {
        if (s[i].vy <= 0) {
          continue
        }
        if (s[i - 1].y < targetY && s[i].y >= targetY) {
          if (s[i].x > best.x) {
            best = { x: s[i].x, dj, da, t: s[i].t }
          }
          break
        }
      }
    }
  }
  return best
}

const dy = 80
const noglide = maxReach(false, dy)
const hard = Math.floor(noglide.x * 0.82)
console.log("Assumes StoryScene: jump -720 / air -640, run 260, dash clamped to maxVelocity.x 420, dash 0.16s")
console.log("For landing", dy, "px higher than takeoff:")
console.log("  perfect double+dash reach", noglide.x.toFixed(0), "px (dj", noglide.dj.toFixed(2), "dash", noglide.da.toFixed(2) + ")")
console.log("  recommended hard edge gap", hard, "px (82% of max)")
console.log("  Paper Lights P4->P5 uses edge gap 480, dy +80")
if (480 > noglide.x) {
  console.error("FAIL: configured gap exceeds physical max")
  process.exit(1)
}
if (Math.abs(480 - hard) > 40) {
  console.warn("WARN: configured gap drifted from hard target", hard)
}
console.log("Jump reach check ok.")

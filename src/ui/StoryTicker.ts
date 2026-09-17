import { requireEl } from "./DomShell"

const TYPE_CPS = 32
const HOLD_S = 4

export type StoryTicker = {
  show: (text: string) => void
  skip: () => void
  tick: (dt: number, reducedMotion: boolean, skipPressed: boolean) => void
}

type Job = {
  text: string
  shown: number
  hold: number
  complete: boolean
}

export const STORY_TICKER_CSS = `
.bm-story-hud .bm-story-ticker {
  margin-top: 8px;
  padding: 6px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f7f3e8f0, #ebe4d4e6);
  backdrop-filter: blur(6px);
  border: 1px solid #d5dcc4;
  box-shadow: 0 8px 18px #2a3d2412;
  pointer-events: auto;
}
.bm-story-hud .bm-story-ticker[hidden] {
  display: none !important;
}
.bm-story-ticker-line {
  margin: 0;
  font: 600 15px Georgia, "Times New Roman", serif;
  color: #2a3d48;
  letter-spacing: 0.01em;
}
`

export function bindStoryTicker(root: HTMLElement): StoryTicker {
  const el = requireEl<HTMLElement>(root, "[data-ui=ticker]")
  const textEl = requireEl<HTMLElement>(root, "[data-ui=tickerText]")
  const queue: string[] = []
  let job: Job | null = null
  let reduced = false

  const paint = (): void => {
    if (!job) {
      textEl.textContent = ""
      return
    }
    const count = Math.min(job.text.length, Math.floor(job.shown))
    textEl.textContent = job.text.slice(0, count)
  }

  const start = (text: string): void => {
    job = {
      text,
      shown: reduced ? text.length : 0,
      hold: 0,
      complete: reduced,
    }
    el.hidden = false
    paint()
  }

  const hide = (): void => {
    job = null
    el.hidden = true
    textEl.textContent = ""
    const next = queue.shift()
    if (next) {
      start(next)
    }
  }

  const skip = (): void => {
    if (!job) {
      return
    }
    if (!job.complete) {
      job.shown = job.text.length
      job.complete = true
      paint()
      return
    }
    hide()
  }

  el.addEventListener("click", () => {
    skip()
  })

  return {
    show: (text: string) => {
      const line = text.trim()
      if (!line) {
        return
      }
      if (job) {
        queue.push(line)
        return
      }
      start(line)
    },
    skip,
    tick: (dt: number, reducedMotion: boolean, skipPressed: boolean) => {
      reduced = reducedMotion
      if (skipPressed) {
        skip()
      }
      if (!job) {
        return
      }
      if (reducedMotion && !job.complete) {
        job.shown = job.text.length
        job.complete = true
        paint()
      } else if (!job.complete) {
        job.shown = Math.min(job.text.length, job.shown + TYPE_CPS * dt)
        if (job.shown >= job.text.length) {
          job.complete = true
        }
        paint()
      }
      if (job.complete) {
        job.hold += dt
        if (job.hold >= HOLD_S) {
          hide()
        }
      }
    },
  }
}

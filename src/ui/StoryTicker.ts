import { requireEl } from "./DomShell"
import { isVoiceBusy, playVoiceCue, stopVoice } from "../data/voices"

const TYPE_CPS = 32
const HOLD_S = 4
const VOICE_PAD_S = 0.55

export type StoryTicker = {
  show: (text: string, cueId?: string) => void
  skip: () => void
  tick: (dt: number, reducedMotion: boolean, skipPressed: boolean) => void
}

type Job = {
  text: string
  cueId?: string
  shown: number
  hold: number
  complete: boolean
  voiced: boolean
}

type Queued = {
  text: string
  cueId?: string
}

export const STORY_TICKER_CSS = `
.bm-story-ticker {
  margin: 0;
  padding: 0;
  width: 100%;
  min-width: 0;
  pointer-events: auto;
}
.bm-story-ticker[hidden] {
  display: none !important;
}
.bm-story-ticker-line {
  margin: 0;
  font: 600 15px Georgia, "Times New Roman", serif;
  color: #2a3d48;
  letter-spacing: 0.01em;
  white-space: normal;
  overflow-wrap: anywhere;
}
`

export function bindStoryTicker(root: HTMLElement): StoryTicker {
  const el = requireEl<HTMLElement>(root, "[data-ui=ticker]")
  const textEl = requireEl<HTMLElement>(root, "[data-ui=tickerText]")
  const queue: Queued[] = []
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

  const start = (text: string, cueId?: string): void => {
    const voiced = Boolean(cueId)
    job = {
      text,
      cueId,
      shown: reduced ? text.length : 0,
      hold: 0,
      complete: reduced,
      voiced,
    }
    el.hidden = false
    paint()
    if (cueId) {
      playVoiceCue(cueId)
    }
  }

  const hide = (): void => {
    stopVoice()
    job = null
    el.hidden = true
    textEl.textContent = ""
    const next = queue.shift()
    if (next) {
      start(next.text, next.cueId)
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
    if (isVoiceBusy()) {
      return
    }
    hide()
  }

  el.addEventListener("click", () => {
    skip()
  })

  return {
    show: (text: string, cueId?: string) => {
      const line = text.trim()
      if (!line) {
        return
      }
      if (job) {
        queue.push({ text: line, cueId })
        return
      }
      start(line, cueId)
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
      if (!job.complete) {
        return
      }
      if (isVoiceBusy()) {
        job.hold = 0
        return
      }
      job.hold += dt
      const need = job.voiced ? VOICE_PAD_S : HOLD_S
      if (job.hold >= need) {
        hide()
      }
    },
  }
}

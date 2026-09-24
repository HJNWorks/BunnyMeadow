import type { SaveV1 } from "../../core/save"
import { storyClockChapters } from "./path"

export function formatStoryTime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 100))
  const tenths = total % 10
  const seconds = Math.floor(total / 10)
  const mins = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${mins}:${String(rest).padStart(2, "0")}.${tenths}`
}

export function recordStoryAttempt(save: SaveV1, stationId: string, ms: number): void {
  const times = save.progress.story.times
  const list = times.attempts[stationId] ?? []
  list.push(ms)
  times.attempts[stationId] = list
  const best = times.best[stationId]
  if (best === undefined || ms < best) {
    times.best[stationId] = ms
  }
}

export function storyTimeRows(save: SaveV1): {
  chapters: { id: string; sum: number | null; stations: { id: string; title: string; best: number | null; attempts: number[] }[] }[]
  total: number | null
} {
  const times = save.progress.story.times
  const chapters = storyClockChapters().map((chapter) => {
    const stations = chapter.stations.map((station) => ({
      id: station.id,
      title: station.title,
      best: times.best[station.id] ?? null,
      attempts: times.attempts[station.id] ?? [],
    }))
    const complete = stations.every((station) => station.best !== null)
    const sum = stations.length === 0 ? 0 : complete ? stations.reduce((acc, station) => acc + (station.best ?? 0), 0) : null
    return { id: chapter.id, sum, stations }
  })
  const total = chapters.every((chapter) => chapter.sum !== null)
    ? chapters.reduce((acc, chapter) => acc + (chapter.sum ?? 0), 0)
    : null
  return { chapters, total }
}

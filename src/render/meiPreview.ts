export type MeiBoundClip = "dash"

export type PlannedMeiClip = "jump" | "glide" | "hop"

export const MEI_BOUND_CLIPS: MeiBoundClip[] = ["dash"]

const CLIP_SECONDS: Record<MeiBoundClip, number> = {
  dash: 1.35,
}

export function meiClipSeconds(clip: MeiBoundClip): number {
  return CLIP_SECONDS[clip]
}

export function pickNextMeiClip(prev: MeiBoundClip | null): MeiBoundClip {
  const clips = MEI_BOUND_CLIPS
  if (clips.length <= 1) {
    return clips[0] ?? "dash"
  }
  let pick = clips[Math.floor(Math.random() * clips.length)] ?? "dash"
  while (pick === prev) {
    pick = clips[Math.floor(Math.random() * clips.length)] ?? "dash"
  }
  return pick
}

export function paintBoundMeiClip(clip: MeiBoundClip, painters: { dash: () => void }): void {
  if (clip === "dash") {
    painters.dash()
  }
}

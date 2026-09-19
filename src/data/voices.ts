import catalog from "./voices.json"
import { getLanguage } from "../core/i18n"

export type VoiceLang = "en" | "de" | "zh"

export type VoiceChannel = "ticker" | "dialogue" | "beat" | "epilogue"

export type VoiceKind = "character" | "narrated"

export type VoiceText = {
  en: string
  de: string
  zh: string
}

export type VoiceCue = {
  id: string
  channel: VoiceChannel
  when: string
  i18nKey: string
  live: boolean
  voice: VoiceKind
  text: VoiceText
  station?: string
}

export type VoiceSpeaker = {
  displayName: string
  class: "folk" | "kit" | "wildlife"
  cues: VoiceCue[]
  station?: string
}

export type VoiceClassMap = Record<string, VoiceSpeaker>

export type VoiceModeBlock = {
  folk: VoiceClassMap
  kits: VoiceClassMap
  wildlife: VoiceClassMap
}

export type SilentI18n = {
  id: string
  reason: string
  i18nKey: string
  text: VoiceText
}

export type VoiceCatalog = {
  version: number
  audioRoot: string
  audioExt: string
  languages: VoiceLang[]
  channels: Record<VoiceChannel, string>
  modes: Record<string, VoiceModeBlock>
  silentI18n: SilentI18n[]
}

export const VOICES = catalog as VoiceCatalog

export type VoiceCueRef = VoiceCue & {
  mode: string
  classId: "folk" | "kits" | "wildlife"
  speakerId: string
}

export function listVoiceCues(): VoiceCueRef[] {
  const out: VoiceCueRef[] = []
  for (const [mode, block] of Object.entries(VOICES.modes)) {
    for (const classId of ["folk", "kits", "wildlife"] as const) {
      const group = block[classId]
      for (const [speakerId, speaker] of Object.entries(group)) {
        for (const cue of speaker.cues) {
          out.push({ ...cue, mode, classId, speakerId })
        }
      }
    }
  }
  return out
}

export function findVoiceCue(cueId: string): VoiceCueRef | undefined {
  return listVoiceCues().find((cue) => cue.id === cueId)
}

export function voiceAssetPath(lang: string, speakerId: string, cueId: string): string {
  return `${VOICES.audioRoot}/${lang}/${speakerId}/${cueId}.${VOICES.audioExt}`
}

let currentVoice: HTMLAudioElement | null = null
let voicePending = false

export function isVoiceBusy(): boolean {
  if (voicePending) {
    return true
  }
  const audio = currentVoice
  return Boolean(audio && !audio.ended && !audio.paused)
}

export function stopVoice(): void {
  voicePending = false
  if (currentVoice) {
    currentVoice.pause()
    currentVoice.src = ""
  }
  currentVoice = null
}

function bindVoice(audio: HTMLAudioElement): void {
  const clearIfCurrent = (): void => {
    if (currentVoice === audio) {
      voicePending = false
    }
  }
  audio.addEventListener("playing", () => {
    if (currentVoice === audio) {
      voicePending = false
    }
  })
  audio.addEventListener("ended", clearIfCurrent)
  audio.addEventListener("error", () => {
    if (currentVoice === audio) {
      stopVoice()
    }
  })
}

export function playVoiceCue(cueId: string): void {
  const cue = findVoiceCue(cueId)
  if (!cue || !cue.live) {
    return
  }
  const lang = getLanguage()
  const primary = `${import.meta.env.BASE_URL}${voiceAssetPath(lang, cue.speakerId, cue.id)}`
  const fallback = `${import.meta.env.BASE_URL}${voiceAssetPath("en", cue.speakerId, cue.id)}`
  stopVoice()
  voicePending = true
  const audio = new Audio(primary)
  audio.preload = "auto"
  currentVoice = audio
  bindVoice(audio)
  void audio.play().catch(() => {
    if (currentVoice !== audio) {
      return
    }
    if (lang === "en") {
      stopVoice()
      return
    }
    const second = new Audio(fallback)
    second.preload = "auto"
    currentVoice = second
    bindVoice(second)
    void second.play().catch(() => {
      if (currentVoice === second) {
        stopVoice()
      }
    })
  })
}

export function playVoiceQueue(cueIds: string[]): void {
  const next = [...cueIds]
  const step = (): void => {
    const id = next.shift()
    if (!id) {
      return
    }
    playVoiceCue(id)
    const playing = currentVoice
    if (!playing) {
      step()
      return
    }
    playing.addEventListener("ended", step, { once: true })
    playing.addEventListener("error", step, { once: true })
  }
  step()
}

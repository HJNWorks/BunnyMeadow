import type { StoryChapterId } from "./path"

const ART_FILE: Record<StoryChapterId, string> = {
  ch1: "Story-Background.png",
  ch2: "Story-Background-ch2.png",
  ch3: "Story-Background-ch3.png",
}

const decoded = new Map<string, HTMLImageElement>()

export function storyMapArtUrl(chapter: StoryChapterId): string | null {
  const file = ART_FILE[chapter]
  if (!file) {
    return null
  }
  return `${import.meta.env.BASE_URL}${file}`
}

function decodeOne(url: string): Promise<HTMLImageElement> {
  const hit = decoded.get(url)
  if (hit && hit.complete && hit.naturalWidth > 0) {
    return Promise.resolve(hit)
  }
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => {
      const finish = (): void => {
        decoded.set(url, img)
        resolve(img)
      }
      if (typeof img.decode === "function") {
        void img.decode().then(finish).catch(finish)
        return
      }
      finish()
    }
    img.onerror = () => resolve(img)
    img.src = url
  })
}

export async function preloadStoryMapArt(onProgress?: (ratio: number) => void): Promise<void> {
  const urls = (["ch1", "ch2", "ch3"] as const)
    .map((chapter) => storyMapArtUrl(chapter))
    .filter((url): url is string => Boolean(url))
  let done = 0
  onProgress?.(0)
  await Promise.all(
    urls.map(async (url) => {
      await decodeOne(url)
      done += 1
      onProgress?.(done / urls.length)
    }),
  )
}

export function mountStoryMapArt(frame: HTMLElement, chapter: StoryChapterId): void {
  const url = storyMapArtUrl(chapter)
  if (!url) {
    frame.classList.add("is-art-ready")
    return
  }
  const cached = decoded.get(url)
  const art =
    cached && cached.complete && cached.naturalWidth > 0
      ? (cached.cloneNode(true) as HTMLImageElement)
      : new Image()
  art.className = "story-path-art"
  art.alt = ""
  art.setAttribute("aria-hidden", "true")
  const markReady = (): void => {
    if (art.complete && art.naturalWidth > 0) {
      frame.classList.add("is-art-ready")
    }
  }
  art.addEventListener("load", markReady)
  art.addEventListener("error", () => {
    frame.classList.add("is-art-ready")
  })
  if (!art.src) {
    art.src = url
  }
  frame.prepend(art)
  markReady()
}

import type { AccessibilitySettings } from "./save"

export type ThemeId = "light" | "dark"

export function applyAccessibilityDom(a11y: AccessibilitySettings): void {
  const root = document.documentElement
  root.classList.toggle("a11y-larger-text", a11y.largerText)
  root.classList.toggle("a11y-high-contrast", a11y.highContrast)
  root.classList.toggle("a11y-reduced-motion", a11y.reducedMotion)
}

export function applyThemeDom(theme: ThemeId): void {
  document.documentElement.classList.toggle("bm-theme-dark", theme === "dark")
}

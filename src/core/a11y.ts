import type { AccessibilitySettings } from "./save"

export function applyAccessibilityDom(a11y: AccessibilitySettings): void {
  const root = document.documentElement
  root.classList.toggle("a11y-larger-text", a11y.largerText)
  root.classList.toggle("a11y-high-contrast", a11y.highContrast)
  root.classList.toggle("a11y-reduced-motion", a11y.reducedMotion)
}

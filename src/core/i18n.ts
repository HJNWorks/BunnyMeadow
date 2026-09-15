import en from "../data/i18n/en.json"
import de from "../data/i18n/de.json"
import zh from "../data/i18n/zh.json"
import type { LanguageId } from "./save"

const tables: Record<LanguageId, Record<string, string>> = {
  en,
  de,
  zh,
}

let language: LanguageId = "en"

export function setLanguage(id: LanguageId): void {
  language = id
}

export function getLanguage(): LanguageId {
  return language
}

export function t(key: string): string {
  return tables[language][key] ?? tables.en[key] ?? key
}

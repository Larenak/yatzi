const RUSSIAN_FALLBACK_LANGUAGES = new Set(["ru", "be", "kk", "uk", "uz"]);

export function normalizeLanguageCode(languageCode) {
  return String(languageCode || "")
    .trim()
    .toLowerCase()
    .split(/[-_]/, 1)[0];
}

export function resolveGameLanguage(languageCode) {
  return RUSSIAN_FALLBACK_LANGUAGES.has(normalizeLanguageCode(languageCode)) ? "ru" : "en";
}

export function isCyrillicFree(value) {
  return !/[\u0400-\u04ff]/u.test(String(value || ""));
}

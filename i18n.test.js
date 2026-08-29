import test from "node:test";
import assert from "node:assert/strict";

import { isCyrillicFree, normalizeLanguageCode, resolveGameLanguage } from "./i18n.js";

test("language codes are normalized before locale selection", () => {
  assert.equal(normalizeLanguageCode(" RU-ru "), "ru");
  assert.equal(normalizeLanguageCode("uk_UA"), "uk");
  assert.equal(normalizeLanguageCode(null), "");
});

test("Yandex Russian fallback languages open the Russian locale", () => {
  for (const language of ["ru", "be", "kk", "uk", "uz", "uk-UA"]) {
    assert.equal(resolveGameLanguage(language), "ru", language);
  }
});

test("all other portal languages fall back to English", () => {
  for (const language of ["en", "tr", "de", "fr", "zh", "", undefined]) {
    assert.equal(resolveGameLanguage(language), "en", String(language));
  }
});

test("Cyrillic rival names can be excluded from the English locale", () => {
  assert.equal(isCyrillicFree("DiceFox"), true);
  assert.equal(isCyrillicFree("Лис_в_кедах"), false);
});

/**
 * Arabic Smart Obfuscation
 * Visual encryption for ads (human-readable)
 * By CodeDock
 */

module.exports = function obfuscateArabic(text) {
  if (!text || typeof text !== "string") return "";

  return text
    // ب / و
    .replace(/ب/g, "بـ9")
    .replace(/و/g, "ـ9و")

    // ت
    .replace(/ت/g, "ـ9ت")

    // س
    .replace(/س/g, "ـ3")

    // ش
    .replace(/ش/g, "ـ&")

    // خ
    .replace(/خ/g, "ـ1")

    // تنظيف التكرار
    .replace(/ـ9ـ9/g, "ـ9")
    .replace(/ـ3ـ3/g, "ـ3")
    .replace(/ـ&ـ&/g, "ـ&");
};

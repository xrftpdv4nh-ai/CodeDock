// utils/obfuscateArabic.js

const letterMap = {
  "و": "9",
  "س": "سـ3",
  "ش": "شـ&",
  "خ": "خـ1",
  "ز": "z",
  "ل": "لـL",
  "ب": "بــ",
  "ت": "تــ"
};

module.exports = function obfuscateArabic(text) {
  if (!text || typeof text !== "string") return text;

  return text
    .split(" ")
    .map(word => {
      const chars = word.split("");
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (letterMap[ch]) {
          chars[i] = letterMap[ch];
          break; // نشفر أول حرف مناسب فقط
        }
      }
      return chars.join("");
    })
    .join(" ");
};

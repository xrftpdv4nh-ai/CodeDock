// utils/obfuscateArabic.js

const letterMap = {
  "ا": "ا",
  "و": "9",
  "ب": "بـ",
  "ت": "تـ",
  "س": "سـ3",
  "ش": "شـ&",
  "خ": "خـ1",
  "ز": "z",
  "ل": "لـL",
  "د": "د",
  "ن": "نـ"
};

module.exports = function obfuscateArabic(text) {
  if (!text || typeof text !== "string") return text;

  return text
    .split(" ")
    .map(word => {
      let chars = word.split("");
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (letterMap[ch]) {
          chars[i] = letterMap[ch];
          break; // نشفر حرف واحد بس في الكلمة
        }
      }
      return chars.join("");
    })
    .join(" ");
};

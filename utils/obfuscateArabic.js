// utils/obfuscateArabic.js

const letterMap = {
  "ا": "ـ9",
  "ب": "بـ9",
  "ت": "تـ9",
  "س": "سـ3",
  "ش": "شـ&",
  "خ": "خـ1",
  "ز": "z",
  "ل": "لـL",
  "د": "ديـ",
  "ن": "نـ9"
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

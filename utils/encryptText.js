// utils/encryptText.js

const map = {
  "و": "ـ9",
  "س": "سـ3",
  "ش": "شـ&",
  "خ": "خـ1",
  "ز": "z",
  "ل": "لـ9",
  "ر": "ـ9ر",
  "ك": "كـ9",
  "د": "د",
};

module.exports = function encryptText(text) {
  if (!text || typeof text !== "string") return text;

  return text
    .split(" ")
    .map(word => {
      let chars = word.split("");

      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (map[ch]) {
          chars[i] = map[ch];
          break; // يشفر حرف واحد فقط في الكلمة
        }
      }

      return chars.join("");
    })
    .join(" ");
};

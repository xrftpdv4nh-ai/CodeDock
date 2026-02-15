// utils/encryptText.js

const map = {
  "و": "ـ9",
  "س": "ـs",
  "ش": "ـ&",
  "خ": "ـ1",
  "ز": "ـz",
  "ل": "ـL",
  "ك": "ـ9",
  "ر": "ـ9"
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
          // نسيب الحرف ونضيف التشويش بعده
          chars[i] = ch + map[ch];
          break; // نشفر حرف واحد فقط
        }
      }

      return chars.join("");
    })
    .join(" ");
};

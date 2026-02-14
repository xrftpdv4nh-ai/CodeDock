/**
 * Dynamic Arabic Marketing Obfuscation
 * تشفير حروفي ذكي – بدون كلمات ثابتة
 */

const LETTER_MAP = {
  "ا": "ـ9",
  "أ": "ـ9",
  "إ": "ـ9",
  "ب": "ـ9",
  "و": "ـ9",
  "س": "ـ3",
  "ش": "ـ&",
  "ر": "ـ9",
  "م": "ـ9"
};

function obfuscateWord(word) {
  let chars = word.split("");
  let changed = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    // نغيّر حرف واحد فقط في الكلمة
    if (!changed && LETTER_MAP[ch]) {
      chars[i] = chars[i] + LETTER_MAP[ch];
      changed = true;
    }
  }

  return chars.join("");
}

module.exports = function obfuscateArabic(text) {
  return text
    .split("\n")
    .map(line =>
      line
        .split(" ")
        .map(word => {
          // تجاهل المنشنات والروابط
          if (word.startsWith("@") || word.startsWith("http")) return word;

          return obfuscateWord(word);
        })
        .join(" ")
    )
    .join("\n");
};

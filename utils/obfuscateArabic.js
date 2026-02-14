/**
 * Arabic Marketing Obfuscation Engine
 * تشفير تسويقي ذكي – مش عشوائي ولا تخريب
 */

const replacements = {
  "ا": ["ـ9", ""],
  "أ": ["ـ9", ""],
  "إ": ["ـ9", ""],
  "ب": ["بـ9", "ب"],
  "ت": ["تـ9", "ت"],
  "س": ["سـ3", "س"],
  "ص": ["صـ3", "ص"],
  "ع": ["عـ9", "ع"],
  "ر": ["رـ9", "ر"],
  "و": ["وـ9", "و"],
  "ل": ["لـ9", "ل"],
  "ه": ["هـ9", "ه"],
  "ح": ["حـ9", "ح"],
  "ي": ["يـ9", "ي"],
  "ف": ["فـ9", "ف"],
  "م": ["مـ9", "م"],
  "ك": ["كـ9", "ك"],
  "ن": ["نـ9", "ن"],
  "ش": ["شـ&", "ش"],
};

function obfuscateWord(word) {
  let chars = word.split("");

  // ما نشوّهش كلمة قصيرة جدًا
  if (chars.length <= 3) return word;

  // عدد تشويهات محدود (1 أو 2)
  let maxChanges = Math.min(2, Math.floor(chars.length / 3));
  let changes = 0;

  for (let i = 1; i < chars.length - 1; i++) {
    const char = chars[i];
    if (replacements[char] && changes < maxChanges && Math.random() > 0.5) {
      const opts = replacements[char];
      chars[i] = opts[Math.floor(Math.random() * opts.length)];
      changes++;
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
        .map(word => obfuscateWord(word))
        .join(" ")
    )
    .join("\n");
};

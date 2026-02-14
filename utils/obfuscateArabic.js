function obfuscateArabic(text) {
  const map = {
    "و": "9",
    "س": "3",
    "ش": "&",
    "ز": "z",
    "ر": "r",
    "ا": "1",
    "ت": "7",
    "ب": "9", // زي مثالك
    "م": "م", // سيبها عادي
    "ل": "ل",
    "ي": "ي"
  };

  return text
    .split("")
    .map(char => map[char] ?? char)
    .join("");
}

module.exports = obfuscateArabic;

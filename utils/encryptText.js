// utils/encryptText.js

module.exports = function encryptText(text) {
  if (!text || typeof text !== "string") return text;

  return text
    .split(" ")
    .map(word => {
      const chars = word.split("");
      const len = chars.length;

      return chars
        .map((char, index) => {

          const isFirst = index === 0;
          const isLast = index === len - 1;
          const isMiddle = !isFirst && !isLast;

          // ===== و =====
          if (char === "و") {
            return "9";
          }

          // ===== ت =====
          // وسط الكلمة → تـ
          // آخر الكلمة أو لوحدها → ت
          if (char === "ت") {
            if (isMiddle) return "تـ";
            return "ت";
          }

          // ===== س =====
          // أول الكلمة → سـ
          // آخر الكلمة → س
          if (char === "س") {
            if (isFirst) return "سـ";
            return "س";
          }

          // ===== ع =====
          // أول الكلمة → عـ
          // وسط الكلمة → 3
          // آخر الكلمة → ع
          if (char === "ع") {
            if (isFirst) return "عـ";
            if (isMiddle) return "3";
            return "ع";
          }

          // ===== باقي الحروف =====
          return char;
        })
        .join("");
    })
    .join(" ");
};

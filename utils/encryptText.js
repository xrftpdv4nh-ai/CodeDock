// utils/encryptText.js

module.exports = function encryptText(text) {
  if (!text || typeof text !== "string") return text;

  return text
    .split("")
    .map(char => {
      switch (char) {

        // === القواعد الأساسية ===
        case "و":
          return "9";

        case "ت":
          return "تـ";

        // === حروف إضافية (اختياري – نفس ستايلك) ===
        case "س":
          return "سـ3";

        case "ش":
          return "شـ&";

        case "خ":
          return "خـ1";

        case "ز":
          return "z";

        // === باقي الحروف ===
        default:
          return char;
      }
    })
    .join("");
};

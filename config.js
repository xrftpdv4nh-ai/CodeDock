require("dotenv").config();

module.exports = {
  token: process.env.TOKEN,

  // Roles
  devRoleId: process.env.DEV_ROLE_ID,
  adminRoleId: process.env.ADMIN_ROLE_ID,

  /* =========================
     AUTO LINE SYSTEM
  ========================= */

  // حط IDs الرومات هنا
  autoLineChannels: [
    "1475550543471710379",
    "1475550658693304522",
    "1475550742088650903",
    "1475550959139688571",
    "1475550991481962556",
    "1475550604851155015",
  ],

  // لينك الصورة اللي عايزها تتبعت
  autoLineImage: "https://fv5-7.files.fm/down.php?i=kmmv8hu4h8&view&n=1AF1F4B7-A5B0-4E8F-97E6-77FFD4DCA77D.jpeg",

  // كولداون (بالثواني) لمنع السبام
  autoLineCooldown: 5
};

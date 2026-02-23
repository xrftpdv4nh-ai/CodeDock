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
    "1475550604851155015"
  ],

  // لينك الصورة اللي عايزها تتبعت
  autoLineImage: "https://cdn.discordapp.com/attachments/1475550126217887896/1475583287434149951/1AF1F4B7-A5B0-4E8F-97E6-77FFD4DCA77D.jpg?ex=699e0386&is=699cb206&hm=8db1b67648b7340724491cd4541d249b1e50ceb72aa93b4fc59b49ce6b85f014&",

  // كولداون (بالثواني) لمنع السبام
  autoLineCooldown: 5
};

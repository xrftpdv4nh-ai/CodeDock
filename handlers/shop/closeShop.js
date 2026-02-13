const { PermissionFlagsBits } = require("discord.js");
const mongoose = require("mongoose");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.guild) return;

      // Admin فقط
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

      // الأمر
      if (message.content !== "closeshop") return;

      // التأكد إن MongoDB متصلة
      if (mongoose.connection.readyState !== 1) {
        return message.reply("❌ قاعدة البيانات غير متصلة حاليًا، حاول بعد قليل.");
      }

      // التأكد إن الروم شوب
      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) {
        return message.reply("❌ هذا الروم ليس شوب.");
      }

      // حذف من الداتابيز
      await Shop.deleteOne({ channelId: message.channel.id });

      // حذف الروم
      await message.channel.delete("Shop closed by admin");

    } catch (err) {
      console.error("CLOSE SHOP ERROR:", err);

      message.channel.send(
        `❌ حصل خطأ أثناء حذف الشوب\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

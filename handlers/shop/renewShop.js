const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.guild) return;

      // Admin فقط
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

      // الأمر
      if (!message.content.startsWith("renewshop")) return;

      const args = message.content.split(" ");
      const days = parseInt(args[1]);

      if (!days || days <= 0) {
        return message.reply("❌ اكتب عدد أيام صحيح.\nمثال: `renewshop 7`");
      }

      // التأكد إن الروم شوب
      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) {
        return message.reply("❌ هذا الروم ليس شوب.");
      }

      // تجديد المدة
      shop.endAt = new Date(shop.endAt.getTime() + days * 24 * 60 * 60 * 1000);
      await shop.save();

      /* =====================
         Embed التجديد
      ===================== */
      const embed = new EmbedBuilder()
        .setTitle("🔁 تم تجديد الشوب")
        .setColor(0x2b2d31)
        .setDescription(
          `⏳ **تاريخ الانتهاء الجديد:** <t:${Math.floor(
            shop.endAt.getTime() / 1000
          )}:F>`
        )
        .setFooter({ text: "CodeDock • Shop System" })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("RENEW SHOP ERROR:", err);
      message.channel.send(
        `❌ حصل خطأ أثناء تجديد الشوب\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

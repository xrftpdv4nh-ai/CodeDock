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

      // تحديث تاريخ الانتهاء
      shop.endAt = new Date(shop.endAt.getTime() + days * 86400000);
      await shop.save();

      /* =====================
         تعديل الكارت الأساسي
      ===================== */
      const channel = message.channel;

      let shopMessage;
      try {
        shopMessage = await channel.messages.fetch(shop.messageId);
      } catch {
        return message.reply("❌ لم أستطع العثور على كارت الشوب الأساسي.");
      }

      const updatedEmbed = EmbedBuilder.from(shopMessage.embeds[0])
        .setDescription(
          `👤 **المالك:** <@${shop.ownerId}>\n\n` +
          `⏳ **تاريخ الانتهاء الجديد:** <t:${Math.floor(
            shop.endAt.getTime() / 1000
          )}:F>\n\n` +
          `⚠️ الروم مخصص للمالك فقط`
        )
        .setFooter({ text: "CodeDock • Shop System" })
        .setTimestamp();

      await shopMessage.edit({ embeds: [updatedEmbed] });

      // رد خفيف
      await message.reply("🔁 تم تجديد الشوب وتحديث الكارت الأساسي.");

    } catch (err) {
      console.error("RENEW SHOP ERROR:", err);
      message.channel.send(
        `❌ حصل خطأ أثناء تجديد الشوب\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

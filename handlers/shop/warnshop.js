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
      if (!message.content.startsWith("warnshop")) return;

      const reason = message.content.split(" ").slice(1).join(" ");
      if (!reason) {
        return message.reply("❌ اكتب سبب التحذير.\nمثال: `warnshop سبام`");
      }

      // التأكد إن الروم شوب
      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) {
        return message.reply("❌ هذا الروم ليس شوب.");
      }

      // زيادة التحذيرات
      shop.warnings = (shop.warnings || 0) + 1;
      await shop.save();

      /* =========================
         ⚠️ Embed التحذير
      ========================= */
      const warnEmbed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle("⚠️ تحذير شوب")
        .setDescription(
          `👤 **المالك:** <@${shop.ownerId}>\n` +
          `⚠️ **عدد التحذيرات:** ${shop.warnings}/3\n\n` +
          `📝 **سبب التحذير:**\n${reason}`
        )
        .setFooter({ text: "CodeDock • Shop Warning System" })
        .setTimestamp();

      await message.channel.send({ embeds: [warnEmbed] });

      /* =========================
         🚫 إغلاق تلقائي عند 3 تحذيرات
      ========================= */
      if (shop.warnings >= 3) {
        const closeEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("🚫 تم إغلاق الشوب")
          .setDescription(
            "تم إغلاق هذا الشوب تلقائيًا بسبب الوصول إلى **3 تحذيرات**"
          )
          .setFooter({ text: "CodeDock • Shop System" });

        await message.channel.send({ embeds: [closeEmbed] });

        await Shop.deleteOne({ channelId: message.channel.id });
        await message.channel.delete("Shop closed automatically (3 warnings)");

        return;
      }

      // تأكيد بسيط
      await message.reply(`⚠️ تم إعطاء تحذير (${shop.warnings}/3)`);

    } catch (err) {
      console.error("WARN SHOP ERROR:", err);
      message.channel.send(
        `❌ حصل خطأ أثناء إعطاء التحذير\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

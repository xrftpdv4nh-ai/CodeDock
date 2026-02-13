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
      if (!message.content.startsWith("unwarnshop")) return;

      const reason =
        message.content.split(" ").slice(1).join(" ") || "لم يتم تحديد سبب";

      // التأكد إن الروم شوب
      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) {
        return message.reply("❌ هذا الروم ليس شوب.");
      }

      if (!shop.warnings || shop.warnings <= 0) {
        return message.reply("ℹ️ هذا الشوب لا يمتلك أي تحذيرات.");
      }

      // إنقاص التحذيرات
      shop.warnings -= 1;
      await shop.save();

      /* =========================
         ✅ Embed سحب التحذير
      ========================= */
      const unwarnEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("✅ تم سحب تحذير")
        .setDescription(
          `👤 **المالك:** <@${shop.ownerId}>\n` +
          `⚠️ **عدد التحذيرات الحالي:** ${shop.warnings}/3\n\n` +
          `📝 **السبب:**\n${reason}`
        )
        .setFooter({ text: "CodeDock • Shop Warning System" })
        .setTimestamp();

      await message.channel.send({ embeds: [unwarnEmbed] });

      await message.reply("✅ تم سحب تحذير من الشوب بنجاح");

    } catch (err) {
      console.error("UNWARN SHOP ERROR:", err);
      message.channel.send(
        `❌ حصل خطأ أثناء سحب التحذير\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

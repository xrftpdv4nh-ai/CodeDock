const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.guild) return;

      // Admin فقط
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

      // الأمر (callshop أو نداء)
      const content = message.content.trim();
      if (
        !content.startsWith("callshop") &&
        !content.startsWith("نداء")
      ) return;

      const reason = content.split(" ").slice(1).join(" ") || "لم يتم تحديد سبب";

      // التأكد إن الروم شوب
      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) {
        return message.reply("❌ هذا الروم ليس شوب.");
      }

      const owner = await message.guild.members.fetch(shop.ownerId).catch(() => null);
      if (!owner) {
        return message.reply("❌ لم أتمكن من الوصول لصاحب الشوب.");
      }

      /* =====================
         📢 Embed النداء
      ===================== */
      const embed = new EmbedBuilder()
        .setColor(0xffcc00)
        .setTitle("🔔 نداء إداري")
        .setDescription(
          `👤 **المالك:** ${owner}\n` +
          `📄 **السبب:**\n${reason}`
        )
        .setFooter({ text: "CodeDock • Shop System" })
        .setTimestamp();

      // إرسال في الروم
      await message.channel.send({
        content: `${owner}`,
        embeds: [embed]
      });

      // إرسال DM
      owner.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle("🔔 نداء من الإدارة")
            .setDescription(
              `📍 **الشوب:** ${message.channel}\n\n` +
              `📄 **السبب:**\n${reason}`
            )
            .setFooter({ text: "CodeDock • Shop System" })
            .setTimestamp()
        ]
      }).catch(() => {});

      await message.reply("✅ تم إرسال النداء بنجاح.");

    } catch (err) {
      console.error("CALL SHOP ERROR:", err);
      message.channel.send(
        `❌ حصل خطأ أثناء تنفيذ النداء\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

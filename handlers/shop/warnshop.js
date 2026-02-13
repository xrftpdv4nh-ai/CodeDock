const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot || !message.guild) return;
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
      if (!message.content.startsWith("warnshop")) return;

      const reason = message.content.split(" ").slice(1).join(" ");
      if (!reason) return message.reply("❌ اكتب سبب التحذير.");

      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) return message.reply("❌ هذا الروم ليس شوب.");

      shop.warnings += 1;
      await shop.save();

      const mainMsg = await message.channel.messages.fetch(shop.messageId).catch(() => null);
      if (!mainMsg) return message.reply("❌ لم يتم العثور على الكارت الأساسي.");

      const updatedEmbed = new EmbedBuilder()
        .setColor(shop.warnings >= 3 ? 0xff0000 : 0xffa500)
        .setTitle("🛒 Shop Information")
        .setDescription(
          `👤 **المالك:** <@${shop.ownerId}>\n\n` +
          `⚠️ **عدد التحذيرات:** ${shop.warnings}/3\n` +
          `🚨 **تم التحذير بواسطة:** ${message.author}\n\n` +
          `📅 **تاريخ الانتهاء:** <t:${Math.floor(shop.endAt.getTime() / 1000)}:F>`
        )
        .setFooter({ text: "CodeDock • Shop System" })
        .setTimestamp();

      await mainMsg.edit({ embeds: [updatedEmbed] });

      await message.reply(`⚠️ تم إعطاء تحذير (${shop.warnings}/3)`);

    } catch (err) {
      console.error("WARN ERROR:", err);
    }
  });
};

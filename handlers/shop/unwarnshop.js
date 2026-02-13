const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot || !message.guild) return;
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
      if (!message.content.startsWith("unwarnshop")) return;

      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) return message.reply("❌ هذا الروم ليس شوب.");

      if (shop.warnings <= 0)
        return message.reply("ℹ️ الشوب لا يحتوي على تحذيرات.");

      shop.warnings -= 1;
      await shop.save();

      const mainMsg = await message.channel.messages.fetch(shop.messageId).catch(() => null);
      if (!mainMsg) return message.reply("❌ لم يتم العثور على الكارت الأساسي.");

      const updatedEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("🛒 Shop Information")
        .setDescription(
          `👤 **المالك:** <@${shop.ownerId}>\n\n` +
          `⚠️ **عدد التحذيرات:** ${shop.warnings}/3\n\n` +
          `📅 **تاريخ الانتهاء:** <t:${Math.floor(shop.endAt.getTime() / 1000)}:F>`
        )
        .setFooter({ text: "CodeDock • Shop System" })
        .setTimestamp();

      await mainMsg.edit({ embeds: [updatedEmbed] });

      await message.reply("✅ تم سحب تحذير من الشوب.");

    } catch (err) {
      console.error("UNWARN ERROR:", err);
    }
  });
};

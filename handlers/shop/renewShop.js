const { PermissionFlagsBits } = require("discord.js");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    if (!message.content.startsWith("تجديد شوب")) return;

    const days = parseInt(message.content.split(" ")[2]);
    if (!days || days <= 0) return message.reply("❌ اكتب عدد أيام صحيح.");

    const shop = await Shop.findOne({ channelId: message.channel.id });
    if (!shop) return message.reply("❌ الروم ده مش شوب.");

    shop.endAt = new Date(shop.endAt.getTime() + days * 86400000);
    await shop.save();

    message.reply(`⏳ تم تجديد الشوب ${days} يوم`);
  });
};

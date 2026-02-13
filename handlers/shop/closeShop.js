const { PermissionFlagsBits } = require("discord.js");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    if (message.content !== "قفل شوب") return;

    const shop = await Shop.findOne({ channelId: message.channel.id });
    if (!shop) return message.reply("❌ الروم ده مش شوب.");

    await Shop.deleteOne({ channelId: message.channel.id });
    await message.channel.delete().catch(() => {});
  });
};

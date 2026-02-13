const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    if (!message.content.startsWith("تسميه")) return;

    const newName = message.content.split(" ").slice(1).join("-");
    if (!newName) return message.reply("❌ اكتب الاسم الجديد.");

    await message.channel.setName(newName);
    message.reply("✏️ تم تغيير اسم الشوب.");
  });
};

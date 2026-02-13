const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.guild) return;

      // Admin فقط
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

      // الأمر
      if (!message.content.startsWith("تسميه")) return;

      const newName = message.content.split(" ").slice(1).join("-");
      if (!newName) {
        return message.reply("❌ اكتب الاسم الجديد.\nمثال: `تسميه shop-user1`");
      }

      await message.channel.setName(newName);

      await message.reply("✏️ تم تغيير اسم الشوب بنجاح.");

    } catch (err) {
      console.error("RENAME SHOP ERROR:", err);

      message.channel.send(
        `❌ حصل خطأ أثناء تغيير اسم الشوب\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

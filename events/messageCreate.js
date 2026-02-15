const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const EncryptConfig = require("../database/models/EncryptConfig");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    try {
      // تجاهل البوتات والخاص
      if (!message.guild || message.author.bot) return;

      // جلب إعدادات التشفير من MongoDB
      const config = await EncryptConfig.findOne({
        guildId: message.guild.id
      });

      if (!config) return;
      if (!Array.isArray(config.channels)) return;
      if (!config.channels.includes(message.channel.id)) return;

      // منع التكرار لو الرسالة نفسها من البوت
      if (message.reference) return;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("encrypt_btn")
          .setLabel("🔐 تشفير إعلان")
          .setStyle(ButtonStyle.Secondary)
      );

      await message.reply({
        content: "اضغط الزر لتشفير إعلانك",
        components: [row]
      });

    } catch (err) {
      console.error("MESSAGE CREATE ENCRYPT ERROR:", err);
    }
  }
};

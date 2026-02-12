const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show bot commands"),

  async execute(interaction) {
    interaction.reply("📦 استخدم /publish لنشر كود");
  }
};

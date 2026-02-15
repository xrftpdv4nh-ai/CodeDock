const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const EncryptConfig = require("../../../database/models/EncryptConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-encrypt")
    .setDescription("تفعيل التشفير في روم")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("الروم")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    let config = await EncryptConfig.findOne({
      guildId: interaction.guild.id
    });

    if (!config) {
      config = await EncryptConfig.create({
        guildId: interaction.guild.id,
        channels: [channel.id]
      });
    } else {
      if (config.channels.includes(channel.id)) {
        return interaction.reply({
          content: "⚠️ التشفير مفعل بالفعل في هذا الروم",
          ephemeral: true
        });
      }

      config.channels.push(channel.id);
      await config.save();
    }

    await interaction.reply({
      content: `✅ تم تفعيل التشفير في ${channel}`,
      ephemeral: true
    });
  }
};

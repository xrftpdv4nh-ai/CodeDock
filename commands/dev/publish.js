const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require("discord.js");

const { devRoleId } = require("../../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("publish")
    .setDescription("Publish a code snippet (Dev only)"),

  async execute(interaction) {

    const modal = new ModalBuilder()
      .setCustomId("publish_modal")
      .setTitle("📦 Publish Code");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Code Title")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("lang")
          .setLabel("Language (js / py)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("code")
          .setLabel("Code")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      )
    );

    if (interaction.isChatInputCommand())
      return interaction.showModal(modal);

    if (interaction.isModalSubmit()) {
      const title = interaction.fields.getTextInputValue("title");
      const lang = interaction.fields.getTextInputValue("lang");
      const code = interaction.fields.getTextInputValue("code");

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`📦 ${title}`)
        .setDescription(
          `\`\`\`${lang}\n${code}\n\`\`\`\n` +
          `👨‍💻 **Published by:** ${interaction.user}\n` +
          `📢 <@&${devRoleId}>\n` +
          `🔹 **${interaction.guild.name}**`
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        allowedMentions: { roles: [devRoleId] }
      });
    }
  }
};

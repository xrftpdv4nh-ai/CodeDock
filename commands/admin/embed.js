const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("إنشاء Embed مخصص")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    const modal = new ModalBuilder()
      .setCustomId("embed_modal")
      .setTitle("🧩 إنشاء Embed");

    const titleInput = new TextInputBuilder()
      .setCustomId("embed_title")
      .setLabel("Title (اختياري)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const descInput = new TextInputBuilder()
      .setCustomId("embed_desc")
      .setLabel("Description (اختياري)")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const imageInput = new TextInputBuilder()
      .setCustomId("embed_image")
      .setLabel("Image URL (اختياري)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder("https://example.com/image.png");

    const mentionInput = new TextInputBuilder()
      .setCustomId("embed_mention")
      .setLabel("Mention (none / here / everyone / roleId)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder("none");

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descInput),
      new ActionRowBuilder().addComponents(imageInput),
      new ActionRowBuilder().addComponents(mentionInput)
    );

    await interaction.showModal(modal);
  }
};

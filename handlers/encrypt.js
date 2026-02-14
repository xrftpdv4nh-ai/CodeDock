const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const obfuscateArabic = require("../utils/obfuscateArabic");

module.exports = (client) => {

  client.on("interactionCreate", async (interaction) => {

    // زر فتح المودال
    if (interaction.isButton()) {
      if (interaction.customId === "encrypt_post") {

        const modal = new ModalBuilder()
          .setCustomId("encrypt_modal")
          .setTitle("🔐 تشفير منشورك");

        const input = new TextInputBuilder()
          .setCustomId("encrypt_text")
          .setLabel("اكتب النص المراد تشفيره")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );

        return interaction.showModal(modal);
      }
    }

    // استقبال المودال
    if (interaction.isModalSubmit()) {
      if (interaction.customId !== "encrypt_modal") return;

      const originalText =
        interaction.fields.getTextInputValue("encrypt_text");

      const encryptedText = obfuscateArabic(originalText);

      await interaction.reply({
        content:
          `🔐 **النص المموّه:**\n\n` +
          `**${encryptedText}**\n\n` +
          `📋 يمكنك نسخه الآن`,
        ephemeral: true
      });
    }

  });

};

// handlers/encrypt.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const encryptText = require("../utils/encryptText");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {

    /* ======================
       زرار التشفير
    ====================== */
    if (interaction.isButton() && interaction.customId === "encrypt_post") {
      const modal = new ModalBuilder()
        .setCustomId("encrypt_modal")
        .setTitle("🔐 تشفير منشورك");

      const input = new TextInputBuilder()
        .setCustomId("post_text")
        .setLabel("اكتب النص المراد تشفيره")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(input)
      );

      return interaction.showModal(modal);
    }

    /* ======================
       مودال التشفير
    ====================== */
    if (interaction.isModalSubmit() && interaction.customId === "encrypt_modal") {
      const originalText =
        interaction.fields.getTextInputValue("post_text");

      const encrypted = encryptText(originalText);

      return interaction.reply({
        content:
          "🔐 **النص المشفّر:**\n\n" +
          encrypted +
          "\n\n📋 يمكنك نسخه الآن",
        ephemeral: true
      });
    }

  });
};

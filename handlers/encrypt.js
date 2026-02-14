// handlers/encrypt.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const obfuscateArabic = require("../utils/obfuscateArabic");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    try {
      // زر التشفير
      if (interaction.isButton() && interaction.customId === "encrypt_post") {
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

      // استقبال المودال
      if (interaction.isModalSubmit() && interaction.customId === "encrypt_modal") {
        const originalText =
          interaction.fields.getTextInputValue("encrypt_text");

        const encryptedText = obfuscateArabic(originalText);

        return interaction.reply({
          content:
            `🔐 **النص المشفّر:**\n\n${encryptedText}\n\n📋 يمكنك نسخه الآن`,
          ephemeral: true
        });
      }

    } catch (err) {
      console.error("ENCRYPT HANDLER ERROR:", err);
      if (!interaction.replied) {
        interaction.reply({
          content: "❌ حصل خطأ غير متوقع",
          ephemeral: true
        }).catch(() => {});
      }
    }
  });
};

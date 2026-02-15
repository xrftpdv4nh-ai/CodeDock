const encryptText = require("../utils/encryptText");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {

    if (interaction.isButton() && interaction.customId === "encrypt_btn") {
  const modal = new ModalBuilder()
    .setCustomId("encrypt_modal")
    .setTitle("🔐 تشفير الإعلان");

  const input = new TextInputBuilder()
    .setCustomId("post_text")
    .setLabel("اكتب الإعلان")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(input)
  );

  await interaction.showModal(modal);
}
    
    /* =========================
       2️⃣ مودال التشفير
    ========================= */
    if (interaction.isModalSubmit() && interaction.customId === "encrypt_modal") {
      const originalText = interaction.fields.getTextInputValue("post_text");
      const encrypted = encryptText(originalText);

      return interaction.reply({
        content:
          "🔐 **منشورك بعد التشفير:**\n\n" +
          "```" + encrypted + "```" +
          "\n📋 انسخ النص وانشره بنفسك",
        ephemeral: true
      });
    }

  }
};

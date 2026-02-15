const encryptText = require("../utils/encryptText");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {

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

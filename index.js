client.on("interactionCreate", async (interaction) => {

  // Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      interaction.reply({ content: "❌ Error", ephemeral: true });
    }
  }

  // Modal Submit
  if (interaction.isModalSubmit()) {

    if (interaction.customId !== "publish_modal") return;

    const title = interaction.fields.getTextInputValue("title");
    const lang = interaction.fields.getTextInputValue("lang");
    const code = interaction.fields.getTextInputValue("code");

    const embed = new EmbedBuilder()
      .setColor("#2f3136")
      .setTitle(`📦 ${title}`)
      .setDescription(
        `\`\`\`${lang}\n${code}\n\`\`\`\n` +
        `👨‍💻 **Published by:** ${interaction.user}\n` +
        `📢 <@&${process.env.DEV_ROLE_ID}>\n` +
        `🔹 **${interaction.guild.name}**`
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      allowedMentions: {
        roles: [process.env.DEV_ROLE_ID]
      }
    });
  }
});

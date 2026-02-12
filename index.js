require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const token = process.env.TOKEN;
const devRoleId = process.env.DEV_ROLE_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

/* =========================
   Load Commands
========================= */
const commandsPath = path.join(__dirname, "commands");
const commandsArray = [];

for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);

  for (const file of fs.readdirSync(folderPath)) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
  }
}

/* =========================
   Register Slash Commands
========================= */
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    const app = await rest.get(Routes.oauth2CurrentApplication());
    await rest.put(
      Routes.applicationCommands(app.id),
      { body: commandsArray }
    );
    console.log("✅ Commands Registered");
  } catch (err) {
    console.error(err);
  }
})();

/* =========================
   Interactions
========================= */
client.on("interactionCreate", async (interaction) => {

  /* Slash Commands */
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Error executing command",
        ephemeral: true
      });
    }
  }

  /* Modal Submit */
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
        `📢 <@&${devRoleId}>\n` +
        `🔹 **${interaction.guild.name}**`
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("copy_code")
        .setLabel("📋 Copy Code")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      allowedMentions: { roles: [devRoleId] }
    });
  }

  /* Copy Button */
  if (interaction.isButton()) {
    if (interaction.customId !== "copy_code") return;

    const embed = interaction.message.embeds[0];
    if (!embed) return;

    const match = embed.description.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    if (!match) {
      return interaction.reply({
        content: "❌ Code not found",
        ephemeral: true
      });
    }

    const rawCode = match[1];

    await interaction.reply({
      content: `\`\`\`js\n${rawCode}\n\`\`\``,
      ephemeral: true
    });
  }
});

/* =========================
   Ready
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(token);

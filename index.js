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
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const token = process.env.TOKEN;
const devRoleId = process.env.DEV_ROLE_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

/* تحميل الأوامر */
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

/* تسجيل الأوامر */
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  const app = await rest.get(Routes.oauth2CurrentApplication());
  await rest.put(
    Routes.applicationCommands(app.id),
    { body: commandsArray }
  );
  console.log("✅ Commands Registered");
})();

/* Events */
client.on("interactionCreate", async (interaction) => {

  // Slash commands
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

  // Modal submit
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

    await interaction.reply({
      embeds: [embed],
      allowedMentions: { roles: [devRoleId] }
    });
  }
});

client.once("ready", () => {
  console.log(`🚀 CodeDock Bot is online`);
});

client.login(token);

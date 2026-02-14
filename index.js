require("dotenv").config();
require("./database/mongo")();

const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

/* =========================
   LOAD SLASH COMMANDS
========================= */
const commandsPath = path.join(__dirname, "commands");
const commandsArray = [];

if (fs.existsSync(commandsPath)) {
  for (const folder of fs.readdirSync(commandsPath)) {
    const folderPath = path.join(commandsPath, folder);
    for (const file of fs.readdirSync(folderPath)) {
      const command = require(path.join(folderPath, file));
      if (!command?.data?.name) continue;

      client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
    }
  }
}

/* =========================
   REGISTER SLASH COMMANDS
========================= */
const { REST, Routes } = require("discord.js");
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    const app = await rest.get(Routes.oauth2CurrentApplication());
    await rest.put(Routes.applicationCommands(app.id), {
      body: commandsArray
    });
    console.log("✅ Slash Commands Registered");
  } catch (err) {
    console.error("Slash Register Error:", err);
  }
})();

/* =========================
   INTERACTION HANDLER (الأساسي)
========================= */
client.on("interactionCreate", async (interaction) => {
  try {

    /* ========= SLASH COMMANDS ========= */
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      return await command.execute(interaction);
    }

    /* ========= MODALS ========= */
    if (interaction.isModalSubmit()) {

      /* 🔹 Publish Modal */
      if (interaction.customId === "publish_modal") {

        const title = interaction.fields.getTextInputValue("title");
        const lang = interaction.fields.getTextInputValue("lang");
        const code = interaction.fields.getTextInputValue("code");

        const DEV_ROLE_ID = "1471915084249829572"; // رول الديف

        const embed = new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle(`📦 ${title}`)
          .setDescription(
            `\`\`\`${lang}\n${code}\n\`\`\`\n` +
            `👨‍💻 **Published by:** ${interaction.user}\n` +
            `📢 <@&${DEV_ROLE_ID}>`
          )
          .setTimestamp();

        await interaction.channel.send({
          embeds: [embed],
          allowedMentions: { roles: [DEV_ROLE_ID] }
        });

        return interaction.reply({
          content: "✅ تم نشر الكود بنجاح",
          ephemeral: true
        });
      }
    }

  } catch (err) {
    console.error("Interaction Error:", err);

    if (!interaction.replied) {
      interaction.reply({
        content: "❌ حصل خطأ غير متوقع",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

/* =========================
   HANDLERS (Text / Order / Shop)
========================= */
require("./handlers/adminTextCommands")(client);
require("./handlers/shop")(client);
require("./handlers/order")(client);

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(process.env.TOKEN);

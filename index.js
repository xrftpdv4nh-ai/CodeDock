require("dotenv").config();
require("./database/mongo")();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
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
    console.error(err);
  }
})();

/* =========================
   INTERACTION HANDLER (عام)
========================= */
client.on("interactionCreate", async (interaction) => {
  try {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
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
   HANDLERS
========================= */
require("./handlers/adminTextCommands")(client);
require("./handlers/shop")(client);
require("./handlers/orderSystem")(client); // 👈 النظام الجديد

client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(process.env.TOKEN);

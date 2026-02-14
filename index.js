require("dotenv").config();
require("./database/mongo")();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

/* =========================
   CONFIG
========================= */
const token = process.env.TOKEN;

/* =========================
   CLIENT
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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
      if (!command?.data) continue;

      client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
    }
  }
}

/* =========================
   REGISTER SLASH COMMANDS
========================= */
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    const app = await rest.get(Routes.oauth2CurrentApplication());
    await rest.put(
      Routes.applicationCommands(app.id),
      { body: commandsArray }
    );
    console.log("✅ Slash Commands Registered");
  } catch (err) {
    console.error("Slash Register Error:", err);
  }
})();

/* =========================
   SLASH INTERACTIONS ONLY
========================= */
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);

  } catch (err) {
    console.error("Slash Interaction Error:", err);

    if (!interaction.replied) {
      interaction.reply({
        content: "❌ حصل خطأ أثناء تنفيذ الأمر",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

/* =========================
   LOAD HANDLERS
========================= */
require("./handlers/adminTextCommands")(client);
require("./handlers/shop")(client);
require("./handlers/order")(client); // 👈 Order System

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(token);

require("dotenv").config();
require("./database/mongo")();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

/* =========================
   CONFIG
========================= */
const token = process.env.TOKEN;

// Publish
const PUBLISH_ALLOWED_CHANNELS = [
  "1471922711860089054",
  "1471922345387233475"
];
const PUBLISH_CHANNEL_ID = "1471923136806260991";

// Roles
const DEV_ROLE_ID = "1471916122595921964";
const MEMBERS_ROLE_ID = "1471915317373698211";

// Welcome
const WELCOME_CHANNEL_ID = "1471634785091977324";

/* =========================
   CLIENT
========================= */
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
    if (!fs.statSync(folderPath).isDirectory()) continue;

    for (const file of fs.readdirSync(folderPath)) {
      if (!file.endsWith(".js")) continue;

      const command = require(path.join(folderPath, file));
      if (!command.data || !command.execute) continue;

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
   INTERACTIONS
========================= */
client.on("interactionCreate", async (interaction) => {
  try {
    /* ===== Slash Commands ===== */
    if (interaction.isChatInputCommand()) {

      // قيود publish
      if (interaction.commandName === "publish") {
        if (!PUBLISH_ALLOWED_CHANNELS.includes(interaction.channelId)) {
          return interaction.reply({
            content: "❌ الأمر ده مسموح في رومات محددة فقط",
            ephemeral: true
          });
        }

        if (!interaction.member.roles.cache.has(DEV_ROLE_ID)) {
          return interaction.reply({
            content: "❌ الأمر ده للـ Developers فقط",
            ephemeral: true
          });
        }
      }

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
   WELCOME + AUTO ROLE
========================= */
client.on("guildMemberAdd", async (member) => {
  try {
    const role = member.guild.roles.cache.get(MEMBERS_ROLE_ID);
    if (role) await member.roles.add(role);

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (channel) {
      channel.send(`👋 أهلاً بيك ${member} نورت **CodeDock** 💙`);
    }
  } catch (err) {
    console.error("WELCOME ERROR:", err);
  }
});

/* =========================
   HANDLERS
========================= */
require("./handlers/adminTextCommands")(client);
require("./handlers/shop")(client);
require("./handlers/order")(client);
require("./handlers/roleSale")(client);
require("./handlers/encrypt")(client); // 🔐 التشفير

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(token);

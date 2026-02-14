require("dotenv").config();
require("./database/mongo")();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

/* =========================
   CONFIG
========================= */
const token = process.env.TOKEN;

const ALLOWED_ROLE_ID = "1471916122595921964";
const MEMBERS_ROLE_ID = "1471915317373698211";

const ALLOWED_COMMAND_CHANNELS = [
  "1471922711860089054",
  "1471922345387233475"
];

const PUBLISH_CHANNEL_ID = "1471923136806260991";
const WELCOME_CHANNEL_ID = "1471634785091977324";

/* =========================
   CLIENT
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
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

    /* ========= SLASH COMMANDS ========= */
    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "publish") {
        if (!ALLOWED_COMMAND_CHANNELS.includes(interaction.channelId)) {
          return interaction.reply({
            content: "❌ الأمر ده مسموح في الروم المخصص فقط.",
            ephemeral: true
          });
        }

        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
          return interaction.reply({
            content: "❌ انت مش معاك الرول المسموح لاستخدام الأمر.",
            ephemeral: true
          });
        }
      }

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction);
    }

    /* ========= MODALS ========= */
    if (interaction.isModalSubmit()) {

      /* 🔹 Publish Modal */if (interaction.customId === "embed_modal") {

  const title = interaction.fields.getTextInputValue("embed_title");
  const desc = interaction.fields.getTextInputValue("embed_desc");
  const image = interaction.fields.getTextInputValue("embed_image");
  let mention = interaction.fields.getTextInputValue("embed_mention") || "none";

  mention = mention.toLowerCase();

  let mentionText = "";
  let allowedMentions = { parse: [] };

  if (mention === "here") {
    mentionText = "@here";
    allowedMentions.parse = ["everyone"];
  } else if (mention === "everyone") {
    mentionText = "@everyone";
    allowedMentions.parse = ["everyone"];
  } else if (/^\d+$/.test(mention)) {
    mentionText = `<@&${mention}>`;
    allowedMentions = { roles: [mention] };
  }

  let finalDescription = "";

  if (desc) {
    finalDescription += `**${desc}**\n\n`;
  }

  if (mentionText) {
    finalDescription += mentionText;
  }

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31);

  if (title) embed.setTitle(`**__${title}__**`);
  if (finalDescription) embed.setDescription(finalDescription);
  if (image && image.startsWith("http")) embed.setImage(image);

  await interaction.channel.send({
    embeds: [embed],
    allowedMentions
  });

  return interaction.reply({
    content: "✅ تم إرسال الـ Embed بنجاح",
    ephemeral: true
  });
}
    }

  } catch (err) {
    console.error("Interaction Error:", err);
  }
});
/* =========================
   ADMIN & SHOP SYSTEMS
========================= */
require("./handlers/adminTextCommands")(client);
require("./handlers/shop")(client);

/* =========================
   GLOBAL ERROR PROTECTION
========================= */
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(token);

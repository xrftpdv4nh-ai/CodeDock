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

/* =========================
   CONFIG
========================= */
const token = process.env.TOKEN;

// الرول المسموح له يستخدم /publish
const ALLOWED_ROLE_ID = "1471916122595921964";

// الرومات اللي مسموح فيها كتابة الأمر
const ALLOWED_COMMAND_CHANNELS = [
  "1471922711860089054",
  "1471922345387233475"
];

// الروم اللي البوت هينشر فيها الكود
const PUBLISH_CHANNEL_ID = "1471923136806260991";

/* =========================
   CLIENT
========================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

/* =========================
   LOAD COMMANDS
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
    console.log("✅ Commands Registered");
  } catch (err) {
    console.error(err);
  }
})();

/* =========================
   INTERACTIONS
========================= */
client.on("interactionCreate", async (interaction) => {

  /* ===== Slash Command ===== */
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "publish") {

      // تحقق من الروم
      if (!ALLOWED_COMMAND_CHANNELS.includes(interaction.channelId)) {
        return interaction.reply({
          content: "❌ الأمر ده مسموح في روم النشر فقط.",
          ephemeral: true
        });
      }

      // تحقق من الرول
      if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
        return interaction.reply({
          content: "❌ انت مش معاك الرول المسموح لاستخدام الأمر.",
          ephemeral: true
        });
      }
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ حصل خطأ أثناء تنفيذ الأمر.",
        ephemeral: true
      });
    }
  }

  /* ===== Modal Submit ===== */
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
        `👨‍💻 **Published by:** ${interaction.user}`
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("copy_code")
        .setLabel("📋 Copy Code")
        .setStyle(ButtonStyle.Secondary)
    );

    const publishChannel = await client.channels.fetch(PUBLISH_CHANNEL_ID);

    await publishChannel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: "✅ تم نشر الكود بنجاح.",
      ephemeral: true
    });
  }

  /* ===== Copy Button ===== */
  if (interaction.isButton()) {
    if (interaction.customId !== "copy_code") return;

    const embed = interaction.message.embeds[0];
    if (!embed) return;

    const match = embed.description.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    if (!match) {
      return interaction.reply({
        content: "❌ لم يتم العثور على الكود.",
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
   READY
========================= */
client.once("ready", () => {
  console.log(`🚀 CodeDock Bot is online`);
});

client.login(token);

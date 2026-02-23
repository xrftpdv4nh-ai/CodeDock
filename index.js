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

// Publish
const PUBLISH_ALLOWED_CHANNELS = [
  "1475550126217887896",
  "1475551570182668338"
];
const PUBLISH_CHANNEL_ID = "1475550959139688571";

// Roles
const DEV_ROLE_ID = "1471916122595921964";
const MEMBERS_ROLE_ID = "1471915317373698211";

// Welcome
const WELCOME_CHANNEL_ID = "1475552205468864664";

// Auto Line Channels
const AUTO_LINE_CHANNELS = [
  "1475550543471710379",
  "1475550658693304522",
  "1475550742088650903",
  "1475550959139688571",
  "1475550991481962556",
  "1475550604851155015"
];

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

    /* ======================
       SLASH COMMANDS
    ====================== */
    if (interaction.isChatInputCommand()) {

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

      return await command.execute(interaction);
    }

    /* ======================
       PUBLISH MODAL
    ====================== */
    if (interaction.isModalSubmit() && interaction.customId === "publish_modal") {

      const title = interaction.fields.getTextInputValue("title");
      const lang  = interaction.fields.getTextInputValue("lang");
      const code  = interaction.fields.getTextInputValue("code");

      await interaction.reply({
        content: "✅ تم نشر الكود بنجاح",
        ephemeral: true
      });

      const channel = interaction.guild.channels.cache.get(PUBLISH_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📦 ${title}`)
        .addFields(
          { name: "👤 الناشر", value: `${interaction.user}`, inline: true },
          { name: "💻 اللغة", value: lang, inline: true }
        )
        .setDescription(`\`\`\`${lang}\n${code}\n\`\`\``)
        .setFooter({ text: "CodeDock • Publish System" })
        .setTimestamp();

      await channel.send({
        content: "@everyone",
        embeds: [embed],
        allowedMentions: { parse: ["everyone"] }
      });

      return;
    }

/* ======================
   EMBED MODAL
====================== */
if (interaction.isModalSubmit() && interaction.customId === "embed_modal") {

  try {

    const title = interaction.fields.getTextInputValue("embed_title") || "";
    const description = interaction.fields.getTextInputValue("embed_desc") || "";
    const imageURL = interaction.fields.getTextInputValue("embed_image") || "";
    const mentionInput = interaction.fields.getTextInputValue("embed_mention") || "none";

    await interaction.reply({
      content: "✅ تم إرسال الإيمبيد",
      ephemeral: true
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setFooter({ text: "CodeDock • Embed System" })
      .setTimestamp();

    if (title.trim() !== "") embed.setTitle(title);
    if (description.trim() !== "") embed.setDescription(description);

    if (imageURL.trim() !== "" && imageURL.startsWith("http")) {
      embed.setImage(imageURL);
    }

    let mentionText = "";

    if (mentionInput === "here") mentionText = "@here";
    if (mentionInput === "everyone") mentionText = "@everyone";
    if (!isNaN(mentionInput) && mentionInput !== "") {
      mentionText = `<@&${mentionInput}>`;
    }

    await interaction.channel.send({
      content: mentionText || undefined,
      embeds: [embed],
      allowedMentions: { parse: ["everyone", "roles"] }
    });

  } catch (err) {
    console.error("EMBED ERROR:", err);
    return interaction.reply({
      content: "❌ حصل خطأ أثناء إنشاء الإيمبيد",
      ephemeral: true
    });
  }

  return;
}

    /* ======================
       POST AD MODAL
    ====================== */
    if (interaction.isModalSubmit() && interaction.customId === "post_ad_modal") {

      const script = interaction.fields.getTextInputValue("ad_script");
      const mentionInput = interaction.fields.getTextInputValue("ad_mention") || "none";

      await interaction.reply({
        content: "✅ تم نشر الإعلان بنجاح",
        ephemeral: true
      });

      let mentionText = "";
      if (mentionInput === "here") mentionText = "@here";
      if (mentionInput === "everyone") mentionText = "@everyone";

      const embed = new EmbedBuilder()
        .setColor(0x00b894)
        .setTitle("📢 إعلان")
        .setDescription(script)
        .setFooter({ text: "CodeDock • Advertisement System" })
        .setTimestamp();

      await interaction.channel.send({
        content: mentionText || undefined,
        embeds: [embed],
        allowedMentions: { parse: ["everyone"] }
      });

      return;
    }

  } catch (err) {
    console.error("INTERACTION ERROR:", err);

    if (!interaction.replied && !interaction.deferred) {
      interaction.reply({
        content: "❌ حصل خطأ غير متوقع",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

/* =========================
   AUTO LINE SYSTEM
========================= */

const autoLineImagePath = path.join(__dirname, "assets", "codedock-line.png");

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!AUTO_LINE_CHANNELS.includes(message.channel.id)) return;

  try {
    await message.channel.send({
      files: [autoLineImagePath]
    });
  } catch (err) {
    console.error("AUTO LINE ERROR:", err);
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
require("./handlers/encrypt")(client);

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(token);

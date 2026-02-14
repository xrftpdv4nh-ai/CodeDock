require("dotenv").config();
require("./database/mongo")();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

/* =========================
   CONFIG
========================= */
const token = process.env.TOKEN;

// ===== Publish System =====
const PUBLISH_ALLOWED_CHANNELS = [
  "1471922711860089054",
  "1471922345387233475"
];
const PUBLISH_CHANNEL_ID = "1471923136806260991";

// ===== Roles =====
const DEV_ROLE_ID = "1471916122595921964";
const MEMBERS_ROLE_ID = "1471915317373698211";

// ===== Welcome =====
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
   INTERACTIONS (ONE PLACE)
========================= */
client.on("interactionCreate", async (interaction) => {
  try {

    /* ===== SLASH COMMANDS ===== */
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
      return command.execute(interaction);
    }

    /* ===== BUTTONS ===== */
    if (interaction.isButton()) {

      // Encrypt Button
      if (interaction.customId === "encrypt_post") {

        const modal = new ModalBuilder()
          .setCustomId("encrypt_modal")
          .setTitle("🔐 تشفير منشور");

        const input = new TextInputBuilder()
          .setCustomId("encrypt_text")
          .setLabel("اكتب النص المراد تشفيره")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );

        return interaction.showModal(modal);
      }
    }

    /* ===== MODALS ===== */
    if (interaction.isModalSubmit()) {

      /* === Publish Modal === */
      if (interaction.customId === "publish_modal") {

        const title = interaction.fields.getTextInputValue("title");
        const lang = interaction.fields.getTextInputValue("lang");
        const code = interaction.fields.getTextInputValue("code");

        const embed = new EmbedBuilder()
          .setColor("#2f3136")
          .setTitle(`📦 ${title}`)
          .setDescription(
            `\`\`\`${lang}\n${code}\n\`\`\`\n` +
            `👨‍💻 **Published by:** ${interaction.user}\n` +
            `📢 <@&${DEV_ROLE_ID}>`
          )
          .setTimestamp();

        const publishChannel =
          await interaction.guild.channels.fetch(PUBLISH_CHANNEL_ID);

        await publishChannel.send({
          embeds: [embed],
          allowedMentions: { roles: [DEV_ROLE_ID] }
        });

        return interaction.reply({
          content: "✅ تم نشر الكود بنجاح",
          ephemeral: true
        });
      }

      /* === Post Ad Modal === */
      if (interaction.customId === "post_ad_modal") {

        const script =
          interaction.fields.getTextInputValue("ad_script");
        let mention =
          interaction.fields.getTextInputValue("ad_mention") || "none";

        mention = mention.toLowerCase();

        let mentionText = "";
        let allowedMentions = { parse: [] };

        if (mention === "here") {
          mentionText = "@here";
          allowedMentions.parse = ["everyone"];
        } else if (mention === "everyone") {
          mentionText = "@everyone";
          allowedMentions.parse = ["everyone"];
        }

        await interaction.channel.send({
          content: `${mentionText}\n${script}`,
          allowedMentions
        });

        return interaction.reply({
          content: "✅ تم نشر الإعلان",
          ephemeral: true
        });
      }

      /* === Embed Modal === */
      if (interaction.customId === "embed_modal") {

        const title =
          interaction.fields.getTextInputValue("embed_title");
        const desc =
          interaction.fields.getTextInputValue("embed_desc");
        const image =
          interaction.fields.getTextInputValue("embed_image");
        let mention =
          interaction.fields.getTextInputValue("embed_mention") || "none";

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

        const embed = new EmbedBuilder().setColor(0x2b2d31);

        if (title) embed.setTitle(`**__${title}__**`);
        if (desc) embed.setDescription(`**${desc}**\n\n${mentionText}`);
        if (image && image.startsWith("http")) embed.setImage(image);

        await interaction.channel.send({
          embeds: [embed],
          allowedMentions
        });

        return interaction.reply({
          content: "✅ تم إرسال الـ Embed",
          ephemeral: true
        });
      }

      /* === Encrypt Modal (Only See) === */
      if (interaction.customId === "encrypt_modal") {

        const text =
          interaction.fields.getTextInputValue("encrypt_text");

        // تشفير Base64 (آمن للنسخ)
        const encrypted =
          Buffer.from(text, "utf8").toString("base64");

        return interaction.reply({
          content:
            `🔐 **النص المشفّر:**\n\`\`\`\n${encrypted}\n\`\`\`\n📋 يمكنك نسخه الآن`,
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
   WELCOME + AUTO ROLE
========================= */
client.on("guildMemberAdd", async (member) => {
  try {
    const role = member.guild.roles.cache.get(MEMBERS_ROLE_ID);
    if (role) await member.roles.add(role);

    const channel =
      member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    await channel.send(
      `👋 أهلاً بيك ${member} نورت **CodeDock** 💙`
    );
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

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(token);

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

// ORDER SYSTEM
const OPEN_ORDER_CHANNEL_ID = "1472297285646811358";
const ORDERS_CHANNEL_ID = "1472297493776826481";
const DEVELOPER_ROLE_ID = "1471915084249829572";
const MEMBER_ROLE_ID = "1471915317373698211";

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
   MESSAGE COMMAND (order)
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.toLowerCase() !== "order") return;
  if (message.channel.id !== OPEN_ORDER_CHANNEL_ID) return;

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle("📦 Create Order")
    .setDescription(
      `**لإنشاء طلب جديد اضغط على الزر بالأسفل 👇**\n\n<@&${MEMBER_ROLE_ID}>`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_order")
      .setLabel("𝗢𝗥𝗗𝗘𝗥")
      .setStyle(ButtonStyle.Primary)
  );

  await message.delete().catch(() => {});
  await message.channel.send({
    embeds: [embed],
    components: [row],
    allowedMentions: { roles: [MEMBER_ROLE_ID] }
  });
});

/* =========================
   INTERACTIONS
========================= */
client.on("interactionCreate", async (interaction) => {
  try {

    /* ===== SLASH COMMANDS ===== */
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      return command.execute(interaction);
    }

    /* ===== BUTTONS ===== */
    if (interaction.isButton()) {

      // OPEN ORDER
      if (interaction.customId === "open_order") {
        const modal = new ModalBuilder()
          .setCustomId("order_modal")
          .setTitle("📦 تفاصيل الطلب");

        const input = new TextInputBuilder()
          .setCustomId("order_text")
          .setLabel("اكتب تفاصيل طلبك")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );

        return interaction.showModal(modal);
      }

      // DELETE ORDER (Developer فقط)
      if (interaction.customId.startsWith("delete_order_")) {

        if (!interaction.member.roles.cache.has(DEVELOPER_ROLE_ID)) {
          return interaction.reply({
            content: "❌ الحذف مسموح للـ Developer فقط",
            ephemeral: true
          });
        }

        await interaction.message.delete().catch(() => {});
      }
    }

    /* ===== MODALS ===== */
    if (interaction.isModalSubmit()) {

      // ORDER MODAL
      if (interaction.customId === "order_modal") {

        const orderText =
          interaction.fields.getTextInputValue("order_text");

        const ordersChannel =
          await interaction.guild.channels.fetch(ORDERS_CHANNEL_ID);

        const embed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle("📦 طلب جديد")
          .setDescription(
            `👤 **صاحب الطلب:** ${interaction.user}\n` +
            `💻 **Developer:** <@&${DEVELOPER_ROLE_ID}>\n\n` +
            `📝 **تفاصيل الطلب:**\n${orderText}`
          );

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`delete_order_${interaction.user.id}`)
            .setLabel("𝗗𝗘𝗟𝗘𝗧𝗘")
            .setStyle(ButtonStyle.Danger)
        );

        await ordersChannel.send({
          content: `${interaction.user} <@&${DEVELOPER_ROLE_ID}>`,
          embeds: [embed],
          components: [row],
          allowedMentions: {
            users: [interaction.user.id],
            roles: [DEVELOPER_ROLE_ID]
          }
        });

        return interaction.reply({
          content: "✅ تم إرسال طلبك بنجاح",
          ephemeral: true
        });
      }
    }

  } catch (err) {
    console.error("Interaction Error:", err);
  }
});

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log("🚀 CodeDock Bot is online");
});

client.login(token);

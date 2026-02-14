require("dotenv").config();
require("./database/mongo")();

const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

/* =========================
   CONFIG
========================= */
const token = process.env.TOKEN;

// روم فتح الطلب
const OPEN_ORDER_CHANNEL_ID = "1472297285646811358";
// روم عرض الطلبات
const ORDERS_CHANNEL_ID = "1472297493776826481";
// رول Developer
const DEVELOPER_ROLE_ID = "1471915084249829572";

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

/* =========================
   MESSAGE COMMAND (order)
========================= */
client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot || !message.guild) return;

    if (message.content.toLowerCase() !== "order") return;
    if (message.channel.id !== OPEN_ORDER_CHANNEL_ID) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_order")
        .setLabel("𝗢𝗥𝗗𝗘𝗥")
        .setStyle(ButtonStyle.Primary)
    );

    await message.delete().catch(() => {});
    await message.channel.send({
      content: `${message.author}`,
      components: [row]
    });

  } catch (err) {
    console.error("ORDER MESSAGE ERROR:", err);
  }
});

/* =========================
   INTERACTIONS
========================= */
client.on("interactionCreate", async (interaction) => {
  try {

    /* ===== Open Order Button ===== */
    if (interaction.isButton()) {

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

      /* ===== Delete Order ===== */
      if (interaction.customId.startsWith("delete_order_")) {

        const ownerId = interaction.customId.split("_")[2];

        if (
          interaction.user.id !== ownerId &&
          !interaction.member.roles.cache.has(DEVELOPER_ROLE_ID)
        ) {
          return interaction.reply({
            content: "❌ لا تملك صلاحية حذف هذا الطلب",
            ephemeral: true
          });
        }

        await interaction.message.delete().catch(() => {});
      }
    }

    /* ===== Order Modal Submit ===== */
    if (interaction.isModalSubmit()) {

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
          )
          .setTimestamp();

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

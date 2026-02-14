const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const OPEN_ORDER_CHANNEL_ID = "1472297285646811358";
const ORDERS_CHANNEL_ID = "1472297493776826481";
const DEVELOPER_ROLE_ID = "1471915084249829572";
const MEMBER_ROLE_ID = "1471915317373698211";

module.exports = (client) => {

  /* ===== order message ===== */
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.channel.id !== OPEN_ORDER_CHANNEL_ID) return;
    if (message.content.toLowerCase() !== "order") return;

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("📦 Create Order")
      .setDescription(
        "اضغط على الزر بالأسفل لإنشاء طلب جديد 👇\n\n" +
        `<@&${MEMBER_ROLE_ID}>`
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

  /* ===== interactions ===== */
  client.on("interactionCreate", async (interaction) => {

    /* open modal */
    if (interaction.isButton() && interaction.customId === "open_order") {
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

    /* submit order */
    if (interaction.isModalSubmit() && interaction.customId === "order_modal") {

      const text = interaction.fields.getTextInputValue("order_text");
      const ordersChannel = await interaction.guild.channels.fetch(ORDERS_CHANNEL_ID);

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("📦 Order Request")
        .setDescription(
          `👤 **User:** ${interaction.user}\n` +
          `💻 **Developer:** <@&${DEVELOPER_ROLE_ID}>\n\n` +
          `📝 **Details:**\n${text}`
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("delete_order")
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

    /* delete (developer only) */
    if (interaction.isButton() && interaction.customId === "delete_order") {
      if (!interaction.member.roles.cache.has(DEVELOPER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ الحذف مخصص لفريق التطوير فقط",
          ephemeral: true
        });
      }

      await interaction.message.delete().catch(() => {});
    }
  });
};

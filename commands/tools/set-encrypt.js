const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const hasAdminAccess = require("../../../utils/permissions");

// نخزن الرومات اللي اتفعل فيها التشفير (مؤقت)
const encryptChannels = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-encrypt")
    .setDescription("إنشاء لوحة تشفير المنشورات")
    .addChannelOption(opt =>
      opt
        .setName("channel")
        .setDescription("الروم اللي هيتحط فيه زر التشفير")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasAdminAccess(interaction.member)) {
      return interaction.reply({
        content: "❌ لا تملك صلاحية استخدام الأمر",
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel("channel");

    if (encryptChannels.has(channel.id)) {
      return interaction.reply({
        content: "⚠️ التشفير مفعل بالفعل في هذا الروم",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("🔐 تشفير منشورك")
      .setDescription(
        "**▸ اضغط على الزر بالأسفل**\n" +
        "**▸ اكتب منشورك وسيتم تشفيره**\n\n" +
        "**▸ لن يتم نشر أي شيء تلقائيًا**\n" +
        "**▸ التشفير للعرض فقط (Only See)**"
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("encrypt_post")
        .setLabel("🔐 تشفير منشورك")
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    encryptChannels.add(channel.id);

    await interaction.reply({
      content: `✅ تم تفعيل التشفير في ${channel}`,
      ephemeral: true
    });
  }
};

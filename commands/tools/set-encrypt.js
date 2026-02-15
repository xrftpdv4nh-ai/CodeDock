const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-encrypt")
    .setDescription("إنشاء لوحة تشفير المنشورات")
    .addChannelOption(opt =>
      opt
        .setName("channel")
        .setDescription("الروم اللي هيتحط فيه التشفير")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("**شفر منشورك · Code||D||ock Encrypt Your Post**")
      .setDescription(
        "▸ لتشفير منشورك بطريقة ذكية وآمنة\n" +
        "▸ اضغط على الزر بالأسفل\n" +
        "▸ اكتب إعلانك وسيتم تشفيره\n\n" +
        "📋 ستحصل على النص المشفّر فقط"
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("encrypt_post")
        .setLabel("تشفير منشورك")
        .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ تم تفعيل التشفير في ${channel}`,
      ephemeral: true
    });
  }
};

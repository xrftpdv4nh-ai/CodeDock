const { PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const Shop = require("../../database/models/Shop");

const SHOP_CATEGORY_ID = "1471948855821078620";

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.guild) return;

      // Admin فقط
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

      // لازم الأمر يبدأ بـ "فتح شوب"
      if (!message.content.startsWith("openshop")) return;

      const user = message.mentions.users.first();
      if (!user) {
        return message.reply("❌ منشن الشخص اللي هتفتحله الشوب.");
      }

      const category = message.guild.channels.cache.get(SHOP_CATEGORY_ID);
      if (!category || category.type !== ChannelType.GuildCategory) {
        return message.reply("❌ كاتيجوري الشوب غير موجودة.");
      }

      /* =========================
         🕒 حساب المدة (7 أيام)
      ========================= */
      const startsAt = Date.now();
      const durationDays = 7;
      const endsAt = startsAt + durationDays * 24 * 60 * 60 * 1000;

      /* =========================
         📢 إنشاء روم الشوب
      ========================= */
      const channel = await message.guild.channels.create({
        name: `shop-${user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        parent: SHOP_CATEGORY_ID,
        lockPermissions: false,
        topic: `Shop Owner: ${user.tag} | Ends: ${new Date(endsAt).toLocaleString()}`,
        permissionOverwrites: [
  // 👁️ everyone يشوف بس
  {
    id: message.guild.roles.everyone.id,
    allow: ["ViewChannel"],
    deny: [
      "SendMessages",
      "CreatePublicThreads",
      "CreatePrivateThreads",
      "CreateInstantInvite",
      "AddReactions"
    ]
  },

  // 🛒 صاحب الشوب
  {
    id: user.id,
    allow: [
      "ViewChannel",
      "SendMessages",
      "AttachFiles",
      "EmbedLinks",
      "ReadMessageHistory"
    ],
    deny: [
      "CreatePublicThreads",
      "CreatePrivateThreads"
    ]
  }
]
      });

      /* =========================
         🧾 Embed معلومات الشوب
      ========================= */
      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("🛒 Shop Opened")
        .setDescription(
          `👤 **المالك:** <@${user.id}>\n\n` +
          `📅 **تاريخ البداية:** <t:${Math.floor(startsAt / 1000)}:F>\n` +
          `⏳ **تاريخ الانتهاء:** <t:${Math.floor(endsAt / 1000)}:F>\n\n` +
          `⚠️ الروم مخصص للمالك فقط`
        )
        .setFooter({ text: "CodeDock • Shop System" })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      /* =========================
         ✅ رد في روم الأمر
      ========================= */
      await message.reply(
        `✅ تم فتح شوب لـ <@${user.id}>\n📂 الشوب: ${channel}\n⏳ المدة: ${durationDays} أيام`
      );

      /* =========================
         💾 حفظ في الداتابيز
      ========================= */
      await Shop.create({
        guildId: message.guild.id,
        channelId: channel.id,
        ownerId: user.id,
        endAt: new Date(endsAt)
      });

    } catch (err) {
      console.error("OPEN SHOP TEXT CMD ERROR:", err);

      message.channel.send(
        `❌ حصل خطأ أثناء فتح الشوب\n\`\`\`${err.message}\`\`\``
      ).catch(() => {});
    }
  });
};

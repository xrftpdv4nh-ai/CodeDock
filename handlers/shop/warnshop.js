const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Shop = require("../../database/models/Shop");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot || !message.guild) return;
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

      const content = message.content.trim();
      const args = content.split(/\s+/);
      const command = args.shift().toLowerCase();

      if (command !== "warnshop") return;

      const reason = args.join(" ") || "لم يتم تحديد سبب";

      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) {
        return message.reply("❌ هذا الروم ليس شوب.");
      }

      /* =========================
         زيادة التحذير
      ========================= */
      shop.warnings += 1;
      await shop.save();

      /* =========================
         تعديل الكارت الأساسي
      ========================= */
      const mainMsg = await message.channel.messages
        .fetch(shop.messageId)
        .catch(() => null);

      if (mainMsg) {
        const updatedEmbed = new EmbedBuilder()
          .setColor(shop.warnings >= 3 ? 0xff0000 : 0xffa500)
          .setTitle("🛒 Shop Information")
          .setDescription(
            `👤 **المالك:** <@${shop.ownerId}>\n\n` +
            `⚠️ **عدد التحذيرات:** ${shop.warnings}/3\n` +
            `👮 **تم التحذير بواسطة:** ${message.author}\n\n` +
            `📅 **تاريخ الانتهاء:** <t:${Math.floor(
              shop.endAt.getTime() / 1000
            )}:F>`
          )
          .setFooter({ text: "CodeDock • Shop System" })
          .setTimestamp();

        await mainMsg.edit({ embeds: [updatedEmbed] });
      }

      /* =========================
         إغلاق تلقائي عند 3 تحذيرات
      ========================= */
      if (shop.warnings >= 3) {
        const owner = await message.guild.members
          .fetch(shop.ownerId)
          .catch(() => null);

        // DM لصاحب الشوب (مرة واحدة بس)
        if (owner) {
          owner.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("🚫 تم إغلاق الشوب")
                .setDescription(
                  `تم إغلاق شوبك تلقائيًا بسبب الوصول إلى **3 تحذيرات**.\n\n` +
                  `📄 **آخر سبب:**\n${reason}`
                )
                .setFooter({ text: "CodeDock • Shop System" })
                .setTimestamp()
            ]
          }).catch(() => {});
        }

        // حذف الشوب
        await Shop.deleteOne({ channelId: message.channel.id });

        await message.channel.send(
          "🚫 تم إغلاق هذا الشوب تلقائيًا بسبب الوصول إلى **3 تحذيرات**"
        );

        return await message.channel.delete(
          "Shop closed automatically (3 warnings)"
        );
      }

      // تأكيد بسيط
      await message.reply(`⚠️ تم إعطاء تحذير (${shop.warnings}/3)`);

    } catch (err) {
      console.error("WARN SHOP ERROR:", err);
      message.channel.send("❌ حصل خطأ أثناء تنفيذ التحذير").catch(() => {});
    }
  });
};

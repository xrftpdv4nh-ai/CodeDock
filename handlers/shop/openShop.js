const { PermissionFlagsBits } = require("discord.js");
const Shop = require("../../database/models/Shop");

const SHOP_CATEGORY_ID = "1471948855821078620";

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    if (!message.content.startsWith("فتح شوب")) return;

    try {
      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ منشن الشخص اللي هتفتحله الشوب.");

      const durationDays = 7;
      const now = new Date();
      const endAt = new Date(now.getTime() + durationDays * 86400000);

      const channel = await message.guild.channels.create({
        name: `shop-${member.user.username}`,
        parent: SHOP_CATEGORY_ID,
        lockPermissions: false,
        topic: `Shop Owner: ${member.user.tag} | Ends: ${endAt.toLocaleString()}`,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone,
            allow: ["ViewChannel"],
            deny: ["SendMessages"]
          },
          {
            id: member.id,
            allow: ["ViewChannel", "SendMessages", "AttachFiles", "EmbedLinks"]
          }
        ]
      });

      await Shop.create({
        guildId: message.guild.id,
        channelId: channel.id,
        ownerId: member.id,
        endAt
      });

      await channel.send({
        embeds: [{
          color: 0x2f3136,
          title: "🛒 Shop Details",
          fields: [
            { name: "👤 صاحب الشوب", value: `${member}`, inline: true },
            { name: "📅 الفتح", value: `<t:${Math.floor(now / 1000)}:F>`, inline: true },
            { name: "⏰ الانتهاء", value: `<t:${Math.floor(endAt / 1000)}:F>`, inline: true },
            { name: "⌛ المدة", value: `${durationDays} أيام`, inline: false }
          ],
          footer: { text: "CodeDock • Shop System" }
        }]
      });

      await message.reply(
        `✅ تم فتح شوب لـ ${member}\n📂 الشوب: ${channel}`
      );

      setTimeout(async () => {
        await channel.delete().catch(() => {});
        await Shop.deleteOne({ channelId: channel.id });
      }, durationDays * 86400000);

    } catch (err) {
      console.error("OpenShop Error:", err);
      message.reply("❌ حصل خطأ أثناء فتح الشوب.");
    }
  });
};

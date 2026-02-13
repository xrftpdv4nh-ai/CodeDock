const { PermissionFlagsBits } = require("discord.js");
const Shop = require("../database/models/Shop");

const SHOP_CATEGORY_ID = "1471948855821078620";

module.exports = (client) => {

  /* =====================
     CHECK SHOPS ON READY
  ===================== */
  client.once("ready", async () => {
    const shops = await Shop.find();

    for (const shop of shops) {
      const remaining = shop.endAt.getTime() - Date.now();

      const guild = client.guilds.cache.get(shop.guildId);
      const channel = guild?.channels.cache.get(shop.channelId);

      if (!channel) {
        await Shop.deleteOne({ _id: shop._id });
        continue;
      }

      if (remaining <= 0) {
        await channel.delete().catch(() => {});
        await Shop.deleteOne({ _id: shop._id });
      } else {
        setTimeout(async () => {
          await channel.delete().catch(() => {});
          await Shop.deleteOne({ _id: shop._id });
        }, remaining);
      }
    }
  });

  /* =====================
     MESSAGE COMMANDS
  ===================== */
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Admin only
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();

    /* =====================
       OPEN SHOP (7 DAYS)
    ===================== */
    if (command === "فتح شوب") {
      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ منشن الشخص اللي هتفتحله الشوب.");

      const channel = await message.guild.channels.create({
        name: `shop-${member.user.username}`,
        parent: SHOP_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone,
            deny: ["ViewChannel"]
          },
          {
            id: member.id,
            allow: ["ViewChannel", "SendMessages", "AttachFiles", "EmbedLinks"]
          }
        ]
      });

      const endAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await Shop.create({
        guildId: message.guild.id,
        channelId: channel.id,
        ownerId: member.id,
        endAt
      });

      setTimeout(async () => {
        await channel.delete().catch(() => {});
        await Shop.deleteOne({ channelId: channel.id });
      }, 7 * 24 * 60 * 60 * 1000);

      return message.reply(`✅ تم فتح شوب لـ ${member} لمدة 7 أيام`);
    }

    /* =====================
       CLOSE SHOP
    ===================== */
    if (command === "قفل شوب") {
      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) return message.reply("❌ الروم ده مش شوب.");

      await Shop.deleteOne({ channelId: message.channel.id });
      await message.channel.delete().catch(() => {});
    }

    /* =====================
       RENAME SHOP
    ===================== */
    if (command === "تسميه") {
      const newName = args.join("-");
      if (!newName) return message.reply("❌ اكتب الاسم الجديد.");

      await message.channel.setName(newName);
      return message.reply("✏️ تم تغيير اسم الشوب.");
    }

    /* =====================
       RENEW SHOP (ADD DAYS)
    ===================== */
    if (command === "تجديد شوب") {
      const days = parseInt(args[0]);
      if (!days || days <= 0) {
        return message.reply("❌ اكتب عدد أيام صحيح.");
      }

      const shop = await Shop.findOne({ channelId: message.channel.id });
      if (!shop) return message.reply("❌ الروم ده مش شوب.");

      shop.endAt = new Date(shop.endAt.getTime() + days * 86400000);
      await shop.save();

      const remaining = shop.endAt.getTime() - Date.now();

      setTimeout(async () => {
        await message.channel.delete().catch(() => {});
        await Shop.deleteOne({ channelId: message.channel.id });
      }, remaining);

      return message.reply(`⏳ تم تجديد الشوب ${days} يوم`);
    }

  });
};

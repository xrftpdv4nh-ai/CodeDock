const { PermissionFlagsBits } = require("discord.js");
const mongoose = require("mongoose");
const Shop = require("../database/models/Shop");

const SHOP_CATEGORY_ID = "1471948855821078620";

/* =====================
   LOAD SHOPS SAFELY
===================== */
async function loadShops(client) {
  if (mongoose.connection.readyState !== 1) return;

  try {
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
  } catch (err) {
    console.error("Shop loader error:", err);
  }
}

module.exports = (client) => {

  /* =====================
     ON READY (SAFE)
  ===================== */
  client.once("ready", () => {
    setTimeout(() => loadShops(client), 5000);
  });

  /* =====================
     MESSAGE COMMANDS
  ===================== */
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.guild) return;

      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

      const content = message.content.trim();
      const args = content.split(/\s+/);

      /* =====================
         فتح شوب @user
      ===================== */
      if (content.startsWith("فتح شوب")) {
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
         قفل شوب
      ===================== */
      if (content === "قفل شوب") {
        const shop = await Shop.findOne({ channelId: message.channel.id });
        if (!shop) return message.reply("❌ الروم ده مش شوب.");

        await Shop.deleteOne({ channelId: message.channel.id });
        await message.channel.delete().catch(() => {});
      }

      /* =====================
         تسميه اسم-جديد
      ===================== */
      if (content.startsWith("تسميه")) {
        const newName = args.slice(1).join("-");
        if (!newName) return message.reply("❌ اكتب الاسم الجديد.");

        await message.channel.setName(newName);
        return message.reply("✏️ تم تغيير اسم الشوب.");
      }

      /* =====================
         تجديد شوب 10
      ===================== */
      if (content.startsWith("تجديد شوب")) {
        const days = parseInt(args[2]);
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

    } catch (err) {
      console.error("Shop command error:", err);
    }
  });
};

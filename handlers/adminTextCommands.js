const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Administrator فقط
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    /* =====================
       ADD ROLE
    ===================== */
    if (command === "addrole") {
      const member = message.mentions.members.first();
      const role = message.mentions.roles.first();
      if (!member || !role) return;

      await member.roles.add(role);
      return message.reply(`✅ تم إضافة ${role} لـ ${member}`);
    }

    /* =====================
       REMOVE ROLE
    ===================== */
    if (command === "removerole") {
      const member = message.mentions.members.first();
      const role = message.mentions.roles.first();
      if (!member || !role) return;

      await member.roles.remove(role);
      return message.reply(`✅ تم إزالة ${role} من ${member}`);
    }

    /* =====================
       BAN
    ===================== */
    if (command === "ban") {
      const member = message.mentions.members.first();
      const reason = args.join(" ") || "No reason";
      if (!member) return;

      await member.ban({ reason });
      return message.reply(`🔨 تم حظر ${member.user.tag}`);
    }

    /* =====================
       UNBAN
    ===================== */
    if (command === "unban") {
      const userId = args[0];
      if (!userId) return;

      await message.guild.members.unban(userId);
      return message.reply(`✅ تم فك الحظر عن ${userId}`);
    }

    /* =====================
       MUTE (TIMEOUT)
    ===================== */
    if (command === "mute") {
      const member = message.mentions.members.first();
      const time = args[1]; // مثال: 10m
      if (!member || !time) return;

      let duration = 0;
      if (time.endsWith("m")) duration = parseInt(time) * 60 * 1000;
      if (time.endsWith("h")) duration = parseInt(time) * 60 * 60 * 1000;

      if (!duration) return message.reply("❌ حدد وقت صحيح مثل 10m أو 1h");

      await member.timeout(duration);
      return message.reply(`🔇 تم ميوت ${member} لمدة ${time}`);
    }

    /* =====================
       UNMUTE
    ===================== */
    if (command === "unmute") {
      const member = message.mentions.members.first();
      if (!member) return;

      await member.timeout(null);
      return message.reply(`🔊 تم فك الميوت عن ${member}`);
    }

    /* =====================
       SHOW CHANNEL
    ===================== */
    if (command === "show") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { ViewChannel: true }
      );
      return message.reply("👁️ تم إظهار الروم");
    }

    /* =====================
       HIDE CHANNEL
    ===================== */
    if (command === "unshow") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { ViewChannel: false }
      );
      return message.reply("🚫 تم إخفاء الروم");
    }

    /* =====================
       LOCK
    ===================== */
    if (command === "lock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: false }
      );
      return message.reply("🔒 تم قفل الروم");
    }
/* =====================
   HELP (ADMIN ONLY)
===================== */
if (command === "help") {
  return message.reply(`
📌 **Admin Commands Help**

**Role Management**
- addrole @user @role
- removerole @user @role

**Moderation**
- ban @user [reason]
- unban userId
- mute @user time (10m / 1h)
- unmute @user

**Channel Control**
- show
- unshow
- lock
- unlock
`);
}
    /* =====================
       UNLOCK
    ===================== */
    if (command === "unlock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: true }
      );
      return message.reply("🔓 تم فتح الروم");
    }

  });

};

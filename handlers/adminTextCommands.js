const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Administrator فقط
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // 🧹 امسح رسالة الأمر
    await message.delete().catch(() => {});

    // 📩 رسالة تأكيد خاصة
    const sendPrivate = async (text) => {
      try {
        const msg = await message.author.send(text);
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      } catch (err) {
        console.log("DM Closed");
      }
    };

    /* =====================
       ADD ROLE
    ===================== */
    if (command === "addrole") {
      const member = message.mentions.members.first();
      const role = message.mentions.roles.first();
      if (!member || !role) return;

      await member.roles.add(role);
      return sendPrivate(`✅ تم إضافة ${role.name} إلى ${member.user.tag}`);
    }

    /* =====================
       REMOVE ROLE
    ===================== */
    if (command === "removerole") {
      const member = message.mentions.members.first();
      const role = message.mentions.roles.first();
      if (!member || !role) return;

      await member.roles.remove(role);
      return sendPrivate(`✅ تم إزالة ${role.name} من ${member.user.tag}`);
    }

    /* =====================
       BAN
    ===================== */
    if (command === "ban") {
      const member = message.mentions.members.first();
      const reason = args.join(" ") || "No reason";
      if (!member) return;

      await member.ban({ reason });
      return sendPrivate(`🔨 تم حظر ${member.user.tag}`);
    }

    /* =====================
       UNBAN
    ===================== */
    if (command === "unban") {
      const userId = args[0];
      if (!userId) return;

      await message.guild.members.unban(userId);
      return sendPrivate(`✅ تم فك الحظر عن ${userId}`);
    }

    /* =====================
       MUTE
    ===================== */
    if (command === "mute") {
      const member = message.mentions.members.first();
      const time = args[1];
      if (!member || !time) return;

      let duration = 0;
      if (time.endsWith("m")) duration = parseInt(time) * 60 * 1000;
      if (time.endsWith("h")) duration = parseInt(time) * 60 * 60 * 1000;
      if (!duration) return sendPrivate("❌ وقت غير صحيح (10m / 1h)");

      await member.timeout(duration);
      return sendPrivate(`🔇 تم ميوت ${member.user.tag} لمدة ${time}`);
    }

    /* =====================
       UNMUTE
    ===================== */
    if (command === "unmute") {
      const member = message.mentions.members.first();
      if (!member) return;

      await member.timeout(null);
      return sendPrivate(`🔊 تم فك الميوت عن ${member.user.tag}`);
    }

    /* =====================
       SHOW CHANNEL
    ===================== */
    if (command === "show") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { ViewChannel: true }
      );
      return sendPrivate("👁️ تم إظهار الروم");
    }

    /* =====================
       HIDE CHANNEL
    ===================== */
    if (command === "unshow") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { ViewChannel: false }
      );
      return sendPrivate("🚫 تم إخفاء الروم");
    }

    /* =====================
       LOCK
    ===================== */
    if (command === "lock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: false }
      );
      return sendPrivate("🔒 تم قفل الروم");
    }

    /* =====================
       UNLOCK
    ===================== */
    if (command === "unlock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: true }
      );
      return sendPrivate("🔓 تم فتح الروم");
    }

    /* =====================
       HELP
    ===================== */
    if (command === "help") {
      return sendPrivate(`
📌 Admin Commands

addrole @user @role
removerole @user @role
ban @user [reason]
unban userId
mute @user 10m / 1h
unmute @user
show / unshow
lock / unlock
`);
    }

  });

};

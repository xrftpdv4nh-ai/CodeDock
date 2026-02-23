const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Administrator فقط
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // 🗑️ رد مؤقت في نفس الشات
    const replyTemp = async (text) => {
      try {
        const botMsg = await message.channel.send({
          content: `<@${message.author.id}> ${text}`
        });

        // حذف رد البوت بعد 5 ثواني
        setTimeout(() => {
          botMsg.delete().catch(() => {});
        }, 5000);

        // حذف رسالة الأمر بعد إرسال الرد
        await message.delete().catch(() => {});
      } catch (err) {
        console.log("Reply Error:", err.message);
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
      return replyTemp(`✅ تم إضافة ${role} لـ ${member}`);
    }

    /* =====================
       REMOVE ROLE
    ===================== */
    if (command === "removerole") {
      const member = message.mentions.members.first();
      const role = message.mentions.roles.first();
      if (!member || !role) return;

      await member.roles.remove(role);
      return replyTemp(`✅ تم إزالة ${role} من ${member}`);
    }

    /* =====================
       BAN
    ===================== */
    if (command === "ban") {
      const member = message.mentions.members.first();
      const reason = args.join(" ") || "No reason";
      if (!member) return;

      await member.ban({ reason });
      return replyTemp(`🔨 تم حظر ${member.user.tag}`);
    }

    /* =====================
       UNBAN
    ===================== */
    if (command === "unban") {
      const userId = args[0];
      if (!userId) return;

      await message.guild.members.unban(userId);
      return replyTemp(`✅ تم فك الحظر عن ${userId}`);
    }

    /* =====================
       MUTE (TIMEOUT)
    ===================== */
    if (command === "mute") {
      const member = message.mentions.members.first();
      const time = args[1];
      if (!member || !time) return;

      let duration = 0;
      if (time.endsWith("m")) duration = parseInt(time) * 60 * 1000;
      if (time.endsWith("h")) duration = parseInt(time) * 60 * 60 * 1000;
      if (!duration) return replyTemp("❌ حدد وقت صحيح مثل 10m أو 1h");

      await member.timeout(duration);
      return replyTemp(`🔇 تم ميوت ${member.user.tag} لمدة ${time}`);
    }

    /* =====================
       UNMUTE
    ===================== */
    if (command === "unmute") {
      const member = message.mentions.members.first();
      if (!member) return;

      await member.timeout(null);
      return replyTemp(`🔊 تم فك الميوت عن ${member.user.tag}`);
    }

    /* =====================
       SHOW CHANNEL
    ===================== */
    if (command === "show") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { ViewChannel: true }
      );
      return replyTemp("👁️ تم إظهار الروم");
    }

    /* =====================
       HIDE CHANNEL
    ===================== */
    if (command === "unshow") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { ViewChannel: false }
      );
      return replyTemp("🚫 تم إخفاء الروم");
    }

    /* =====================
       LOCK
    ===================== */
    if (command === "lock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: false }
      );
      return replyTemp("🔒 تم قفل الروم");
    }

    /* =====================
       UNLOCK
    ===================== */
    if (command === "unlock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: true }
      );
      return replyTemp("🔓 تم فتح الروم");
    }

    /* =====================
       HELP
    ===================== */
    if (command === "help") {
      return replyTemp(`
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

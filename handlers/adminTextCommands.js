const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // 🧹 حذف رسالة الأمر
    await message.delete().catch(() => {});

    // 🗑️ رد مؤقت في نفس الشات
    const replyTemp = async (text) => {
      const msg = await message.channel.send({
        content: `<@${message.author.id}> ${text}`
      });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
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
      if (!member) return;

      await member.ban();
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

  });

};

const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content.toLowerCase() !== "role-sale") return;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f) // لون ذهبي
      .setTitle("💎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐑𝐎𝐋𝐄")
      .setDescription(
        `
🚀 **مميزات رول Premium:**

✨ أولوية في الدعم الفني  
✨ الوصول لرومات حصرية  
✨ نشر أكواد وموارد مميزة  
✨ طلبات خاصة وسريعة  
✨ تفاعل مباشر مع فريق التطوير  
✨ مزايا مستقبلية حصرية  

━━━━━━━━━━━━━━━
💰 **السعر:** **300,000 Credit**
━━━━━━━━━━━━━━━

📩 **للشراء:** تواصل مع الإدارة
        `
      )
      .setFooter({ text: "CodeDock • Premium System" });

    await message.channel.send({ embeds: [embed] });
  });
};

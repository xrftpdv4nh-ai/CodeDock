const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { token } = require("./config");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
const commandsArray = [];

// قراءة كل فولدر الأوامر
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);

  for (const file of fs.readdirSync(folderPath)) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
  }
}

// تسجيل الأوامر تلقائي
const rest = new REST({ version: "10" }).setToken(token);
(async () => {
  const app = await rest.get(Routes.oauth2CurrentApplication());
  await rest.put(Routes.applicationCommands(app.id), {
    body: commandsArray
  });
  console.log("✅ Commands Registered");
})();

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isModalSubmit()) return;

  const command = client.commands.get(interaction.commandName);
  if (command) await command.execute(interaction);
});

client.once("ready", () => {
  console.log(`🚀 CodeDock Bot is online`);
});

client.login(token);

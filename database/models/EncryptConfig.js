const mongoose = require("mongoose");

const encryptConfigSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  channels: { type: [String], default: [] }
});

module.exports = mongoose.model("EncryptConfig", encryptConfigSchema);

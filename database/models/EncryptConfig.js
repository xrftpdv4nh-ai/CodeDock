const mongoose = require("mongoose");

const EncryptConfigSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  channels: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model(
  "EncryptConfig",
  EncryptConfigSchema
);

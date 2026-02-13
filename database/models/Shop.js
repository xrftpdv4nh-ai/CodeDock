const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },
  endAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("Shop", shopSchema);

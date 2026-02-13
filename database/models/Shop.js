const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },

  channelId: {
    type: String,
    required: true,
    unique: true
  },

  ownerId: {
    type: String,
    required: true
  },

  endAt: {
    type: Date,
    required: true
  },

  // ID رسالة الكارت الأساسية في أول الروم
  messageId: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Shop", shopSchema);

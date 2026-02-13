const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
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

    // 🧾 ID رسالة الكارت (اختياري)
    messageId: {
      type: String,
      required: false, // ⭐ مهم جدًا
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Shop", shopSchema);

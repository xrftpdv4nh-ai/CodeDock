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

    warnings: {
      type: Number,
      default: 0   // ✅ ده المهم
    },

    messageId: {
      type: String,
      default: null // لو حابب تستخدمه بعدين لتعديل الإيمبيد
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Shop", shopSchema);

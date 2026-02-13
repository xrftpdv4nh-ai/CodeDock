const mongoose = require("mongoose");

module.exports = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI غير موجود في Environment Variables");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected");

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

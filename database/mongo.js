const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("🟢 MongoDB Connected");
  } catch (err) {
    console.error("🔴 MongoDB Connection Failed");
    console.error(err);
  }
};

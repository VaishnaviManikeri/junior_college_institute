require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const createAdmin = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const adminExists = await Admin.findOne({ username: "jadhavar" });

    if (adminExists) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const admin = new Admin({
      username: "jadhavar",
      password: "jadhavar2020",
    });

    await admin.save();

    console.log("✅ Admin created successfully");
    console.log("Username: jadhavar");
    console.log("Password: jadhavar2020");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();

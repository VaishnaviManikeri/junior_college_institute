const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* ================= CORS CONFIG (RENDER SAFE) ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://jadhavarjuniorcollege.com",
  "https://www.jadhavarjuniorcollege.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, Render health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ❗ DO NOT THROW ERROR ON RENDER
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= DATABASE ================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

/* ================= ROUTES ================= */
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

// IMPORTANT: bind to all interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

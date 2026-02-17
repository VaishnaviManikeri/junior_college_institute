const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

/* ================= CORS CONFIG ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://junior-college-institute.onrender.com",
  "https://jadhavarjuniorcollege.com",
  "https://www.jadhavarjuniorcollege.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */
// Serve static files from public directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, "public/uploads/blogs");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

/* ================= DATABASE ================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

/* ================= ROUTES ================= */
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));

/* ================= ROOT ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully!");
});

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

/* ================= ERROR HANDLING MIDDLEWARE ================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    message: err.message 
  });
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
const router = require("express").Router();
const c = require("../controllers/blogController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/blogs"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Public routes
router.get("/", c.getBlogs);
router.get("/latest", c.getLatestBlogs);
router.get("/popular", c.getPopularBlogs);
router.get("/:slug", c.getBlog);

// Protected admin routes
router.post("/", auth, upload.single("image"), c.createBlog);
router.get("/admin/all", auth, c.getAdminBlogs);
router.put("/:id", auth, upload.single("image"), c.updateBlog);
router.delete("/:id", auth, c.deleteBlog);

module.exports = router;
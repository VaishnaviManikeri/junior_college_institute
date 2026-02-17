const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

// Public
router.get("/", getBlogs);
router.get("/:id", getBlog);

// Admin protected
router.post("/", auth, createBlog);
router.put("/:id", auth, updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;

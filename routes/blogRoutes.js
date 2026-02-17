const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/blogController");

/* ADMIN FIRST */
router.post("/", auth, ctrl.createBlog);
router.get("/admin/all", auth, ctrl.getAllBlogs);
router.put("/:id", auth, ctrl.updateBlog);
router.delete("/:id", auth, ctrl.deleteBlog);

/* PUBLIC LAST */
router.get("/", ctrl.getPublishedBlogs);
router.get("/:slug", ctrl.getSingleBlog);

module.exports = router;

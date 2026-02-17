const router = require("express").Router();
const c = require("../controllers/blogController");

router.post("/", c.createBlog);
router.get("/", c.getBlogs);
router.get("/admin", c.getAdminBlogs);
router.get("/:slug", c.getBlog);
router.put("/:id", c.updateBlog);
router.delete("/:id", c.deleteBlog);

module.exports = router;

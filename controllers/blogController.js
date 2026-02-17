const Blog = require("../models/Blog");
const slugify = require("slugify");

/* CREATE */
exports.createBlog = async (req, res) => {
  const slug = slugify(req.body.title, { lower: true });

  const blog = await Blog.create({
    ...req.body,
    slug,
  });

  res.json(blog);
};

/* READ ALL */
exports.getBlogs = async (req, res) => {
  const blogs = await Blog.find({ status: true }).sort("-createdAt");
  res.json(blogs);
};

/* READ ONE */
exports.getBlog = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  res.json(blog);
};

/* ADMIN ALL */
exports.getAdminBlogs = async (req, res) => {
  res.json(await Blog.find().sort("-createdAt"));
};

/* UPDATE */
exports.updateBlog = async (req, res) => {
  await Blog.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
};

/* DELETE */
exports.deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

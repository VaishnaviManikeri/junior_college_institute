const Blog = require("../models/Blog");

/* ADMIN */

exports.createBlog = async (req, res) => {
  const blog = await Blog.create(req.body);
  res.json(blog);
};

exports.getAllBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
};

exports.updateBlog = async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(blog);
};

exports.deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* PUBLIC */

exports.getPublishedBlogs = async (req, res) => {
  const blogs = await Blog.find({ isPublished: true }).sort({
    createdAt: -1,
  });
  res.json(blogs);
};

exports.getSingleBlog = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  res.json(blog);
};

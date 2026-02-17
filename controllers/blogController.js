const Blog = require("../models/Blog");

// CREATE
exports.createBlog = async (req, res) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/ /g, "-");

    const blog = await Blog.create({
      ...req.body,
      slug,
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// PUBLIC LIST
exports.getBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
};

// SINGLE
exports.getBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
};

// UPDATE
exports.updateBlog = async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(blog);
};

// DELETE
exports.deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

const Blog = require("../models/Blog");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");

/* CREATE with image upload */
exports.createBlog = async (req, res) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/blogs/${req.file.filename}`;
    }

    const blog = await Blog.create({
      title: req.body.title,
      description: req.body.description,
      slug,
      image: imagePath,
      status: req.body.status === 'true' || req.body.status === true,
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* READ ALL (public) */
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: true })
      .sort("-createdAt")
      .select("title slug description image createdAt views");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* READ ONE with view count */
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ADMIN ALL */
exports.getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort("-createdAt");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* UPDATE with image */
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update fields
    blog.title = req.body.title || blog.title;
    blog.description = req.body.description || blog.description;
    blog.status = req.body.status !== undefined ? req.body.status : blog.status;
    
    // Update slug if title changed
    if (req.body.title) {
      blog.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (blog.image) {
        const oldImagePath = path.join(__dirname, "../public", blog.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.image = `/uploads/blogs/${req.file.filename}`;
    }

    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DELETE */
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Delete image file
    if (blog.image) {
      const imagePath = path.join(__dirname, "../public", blog.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET LATEST BLOGS */
exports.getLatestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: true })
      .sort("-createdAt")
      .limit(6)
      .select("title slug description image createdAt");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET POPULAR BLOGS */
exports.getPopularBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: true })
      .sort("-views")
      .limit(5)
      .select("title slug views image");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
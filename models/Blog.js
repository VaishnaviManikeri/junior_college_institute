const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    image: String,
    author: { type: String, default: "Admin" },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogSchema.pre("save", function (next) {
  this.slug = this.title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  next();
});

module.exports = mongoose.model("Blog", blogSchema);

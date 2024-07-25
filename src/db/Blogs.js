const mongoose = require('mongoose');

const BlogsSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  headerImage: { type: String },
  metaTitle: { type: String },
  metaImage: { type: String },
  metaDescription: { type: String},
  image: { type: String }, // New field for storing image URL
});

const Blogs = mongoose.model('Blogs', BlogsSchema);
module.exports = Blogs;

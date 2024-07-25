const Blog = require('../db/Blogs');
const cloudinary = require('../configs/Cloudnary');

//Get all blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({ message: 'Single blog page', blogs: blogs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get a single blog by Id
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json({ message: 'All blogs pages', blog: blog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//create a new blog

exports.createBlog = async (req, res) => {
  const {
    title,
    description,
    headerImage,
    metaTitle,
    metaImage,
    metaDescription,
  } = req.body;
  console.log('title:', title);
  console.log('description:', description);
  console.log('headerImage:', headerImage);
  console.log('metaTitle:', metaTitle);
  console.log('metaImage:', metaImage);
  console.log('metaDescription:', metaDescription);
  let image = '';
  try {
    if (
      !title ||
      !description ||
      !headerImage ||
      !metaTitle ||
      !metaImage ||
      !metaDescription
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (req.file) {
      console.log('line number 55', req.file);
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log('images upload', result);
      image = result.secure_url;
    }
    const newBlog = new Blog({
      title,
      description,
      headerImage,
      metaTitle,
      metaImage,
      metaDescription,
      image,
    });
    await newBlog.save();
    res
      .status(201)
      .json({ message: 'Blog created succesfully', blogs: newBlog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update a blog

exports.UpdateBlog = async (req, res) => {
  const { title, description, headerImage, metaTitle, metaImage } = req.body;

  let image = '';

  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = result.secure_url;
    }
    const updateBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, headerImage, metaTitle, metaImage },
      { new: true }
    );
    await updateBlog.save();
    res
      .status(200)
      .json({ message: 'Blog updated sucessfully ', blogs: updateBlog });
    if (!updateBlog) return res.status(404).json({ message: 'Blog not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete a blog

exports.DeleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog)
      return res.status(404).json({ message: 'blog not found' });
    res.status(200).json({ message: 'blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

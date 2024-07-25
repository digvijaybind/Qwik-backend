const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async-middleware');
const BlogController = require('../controller/C-Blogs');
const upload = require('../configs/multer');

router.post('/createblog', upload.single('image'), BlogController.createBlog); // Multer middleware added here
router.put('/Updateblog/:id', upload.single('image'), BlogController.UpdateBlog); // Multer middleware added here
router.get('/Allblogs', asyncMiddleware(BlogController.getBlogs));
router.get('/Singleblog/:id', asyncMiddleware(BlogController.getBlog));
router.delete('/deleteBlog/:id', asyncMiddleware(BlogController.DeleteBlog));

module.exports = router;

const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Require the fs module

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads'); // Adjust path as needed
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

//Multer filter configuration
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;

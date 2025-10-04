const multer = require('multer');
const { MAX_FILE_SIZE } = require('../config');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE || 50 * 1024 * 1024 // 50MB default
  }
});

module.exports = upload;
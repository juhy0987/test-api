const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Max 5 files
  }
});

/**
 * Middleware for handling multiple image uploads (max 5)
 */
const uploadImages = upload.array('images', 5);

/**
 * Error handling middleware for multer errors
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기는 5MB를 초과할 수 없습니다.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: '이미지는 최대 5장까지 업로드할 수 있습니다.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '예상치 못한 파일 필드입니다.'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다.'
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || '파일 업로드 중 오류가 발생했습니다.'
    });
  }

  next();
};

/**
 * Combined middleware for image upload with error handling
 */
const uploadImagesWithErrorHandling = (req, res, next) => {
  uploadImages(req, res, (err) => {
    handleUploadError(err, req, res, next);
  });
};

module.exports = {
  uploadImages,
  uploadImagesWithErrorHandling,
  handleUploadError
};

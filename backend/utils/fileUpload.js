const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create subdirectories based on file type
        let subDir = 'general';
        if (file.fieldname === 'profileImage') {
            subDir = 'profiles';
        } else if (file.fieldname === 'artworkImages') {
            subDir = 'artwork';
        } else if (file.fieldname === 'referenceImages') {
            subDir = 'references';
        } else if (file.fieldname === 'galleryImages') {
            subDir = 'gallery';
        }

        const fullPath = path.join(uploadDir, subDir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 10 // Maximum 10 files
    }
});

// Single file upload
const uploadSingle = upload.single('image');

// Multiple files upload
const uploadMultiple = upload.array('images', 10);

// Specific field uploads
const uploadProfile = upload.single('profileImage');
const uploadArtwork = upload.array('artworkImages', 5);
const uploadReference = upload.array('referenceImages', 5);
const uploadGallery = upload.array('galleryImages', 10);

// Helper function to get file URL
const getFileUrl = (filename, type = 'general') => {
    if (!filename) return null;
    return `/uploads/${type}/${filename}`;
};

// Helper function to delete file
const deleteFile = (filepath) => {
    if (!filepath) return;
    
    const fullPath = path.join(__dirname, '..', filepath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

// Helper function to delete multiple files
const deleteFiles = (filepaths) => {
    if (!Array.isArray(filepaths)) return;
    
    filepaths.forEach(filepath => {
        deleteFile(filepath);
    });
};

// Middleware wrapper for error handling
const handleUpload = (uploadFunction) => {
    return (req, res, next) => {
        uploadFunction(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'File too large. Maximum size is 5MB.'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Too many files. Maximum is 10 files.'
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Unexpected file field.'
                    });
                }
                return res.status(400).json({
                    status: 'error',
                    message: 'File upload error: ' + err.message
                });
            } else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }
            next();
        });
    };
};

module.exports = {
    uploadSingle: handleUpload(uploadSingle),
    uploadMultiple: handleUpload(uploadMultiple),
    uploadProfile: handleUpload(uploadProfile),
    uploadArtwork: handleUpload(uploadArtwork),
    uploadReference: handleUpload(uploadReference),
    uploadGallery: handleUpload(uploadGallery),
    getFileUrl,
    deleteFile,
    deleteFiles
}; 
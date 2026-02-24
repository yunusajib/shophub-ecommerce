const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const memoryStorage = multer.memoryStorage();

const uploadMemory = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

/**
 * Upload image buffer to Cloudinary
 */
async function uploadToCloudinary(fileBuffer, folder = 'shophub-products') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [{ width: 800, height: 800, crop: 'limit' }]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height
                    });
                }
            }
        );

        // Convert buffer to stream and upload
        const streamifier = require('streamifier');
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
}

module.exports = {
    cloudinary,
    uploadMemory,
    uploadToCloudinary
};

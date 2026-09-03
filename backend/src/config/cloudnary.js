const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// ==========================================
// CLOUDINARY CONFIG
// ==========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// MULTER MEMORY STORAGE
// Files server par save nahi hongi
// Direct buffer se Cloudinary jayengi
// ==========================================

const storage = multer.memoryStorage();

// 50MB limit
// Video ke liye 10MB bahut kam ho sakta hai
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// ==========================================
// HERO SLIDE IMAGE UPLOAD
// Existing Hero Slide system ke liye
// ==========================================

const uploadToCloudinary = (
  fileBuffer,
  folderName = "rodio_hero_slides"
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

// ==========================================
// MEDIA / STORY IMAGE + VIDEO UPLOAD
// New Admin Media Post system
// ==========================================

const uploadMediaToCloudinary = (
  fileBuffer,
  folderName = "rodio_media"
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          duration: result.duration || null,
        });
      }
    );

    stream.end(fileBuffer);
  });
};

// ==========================================
// DELETE FILE FROM CLOUDINARY
// Image / Video dono ke liye
// ==========================================

const deleteFromCloudinary = (
  publicId,
  resourceType = "image"
) => {
  return new Promise((resolve, reject) => {
    if (!publicId) {
      return reject(new Error("Cloudinary publicId is required"));
    }

    cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );
  });
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
  uploadMediaToCloudinary,
  deleteFromCloudinary,
};
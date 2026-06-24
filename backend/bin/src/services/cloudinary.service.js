const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloudinary_cloud_name';

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  console.log('Cloudinary credentials missing or default. Local fallback will be used for file uploads.');
}

const uploadFile = async (localFilePath, folder = 'telehealth') => {
  if (useCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
        resource_type: 'auto'
      });
      // Delete temporary local file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload failure:', error);
      throw error;
    }
  } else {
    // Local fallback: move file to static upload folder
    try {
      const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = path.basename(localFilePath);
      const destination = path.join(uploadDir, fileName);

      fs.copyFileSync(localFilePath, destination);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      // Return a relative path URL or a local server URL
      const port = process.env.PORT || 5000;
      return {
        url: `http://localhost:${port}/uploads/${fileName}`,
        publicId: fileName
      };
    } catch (error) {
      console.error('Local fallback upload failure:', error);
      throw error;
    }
  }
};

const deleteFile = async (publicId) => {
  if (useCloudinary) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return { success: true };
    } catch (error) {
      console.error('Cloudinary delete failure:', error);
      throw error;
    }
  } else {
    try {
      const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
      const filePath = path.join(uploadDir, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { success: true };
    } catch (error) {
      console.error('Local file delete failure:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  uploadFile,
  deleteFile
};

const { uploadToS3, deleteFromS3 } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

exports.uploadFile = async (file, folder = 'uploads') => {
  if (!file) return null;

  try {
    const result = await uploadToS3(file, folder);
    return {
      url: result.Location,
      key: result.Key,
      type: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

exports.deleteFile = async (key) => {
  if (!key) return;

  try {
    await deleteFromS3(key);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

exports.generateFileKey = (originalname) => {
  const ext = originalname.split('.').pop();
  return `${uuidv4()}.${ext}`;
};
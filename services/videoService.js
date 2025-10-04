const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');
const { VIDEO_BUCKET } = require('../config');

const storage = new Storage();
const bucket = storage.bucket(VIDEO_BUCKET);

exports.generateVideoUploadURL = async (userId) => {
  const filename = `${userId}/${uuidv4()}.mp4`;
  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: 'video/mp4'
  };

  const [url] = await bucket.file(filename).getSignedUrl(options);
  return { url, filename };
};

exports.getVideoStreamURL = (filename) => {
  const file = bucket.file(filename);
  return file.publicUrl();
};

exports.processVideo = async (filename) => {
  // Implement video processing logic (transcoding, thumbnails, etc.)
  // This would typically be triggered by a Cloud Function or separate worker
  console.log(`Processing video: ${filename}`);
};
const AWS = require('aws-sdk');
//const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_BUCKET } = require('./');
// Fix the import
const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_BUCKET } = require('./index');

const s3 = new AWS.S3({
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_SECRET_KEY,
  region: S3_REGION
});

const uploadToS3 = (file, folder = 'uploads') => {
  const params = {
    Bucket: S3_BUCKET,
    Key: `${folder}/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
};

const deleteFromS3 = (key) => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key
  };

  return s3.deleteObject(params).promise();
};

module.exports = { uploadToS3, deleteFromS3 };
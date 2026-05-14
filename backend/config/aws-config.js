const { S3Client } = require("@aws-sdk/client-s3");

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const S3_BUCKET = process.env.S3_BUCKET || "insert_bucket_name";

const s3 = new S3Client({ region: AWS_REGION });

module.exports = { s3, S3_BUCKET };

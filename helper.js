const AWS = require('aws-sdk');
const formidable = require('formidable');
const form = new formidable.IncomingForm();
  
exports.parseForm = async (request) => {
    return new Promise((resolve, reject) => {
        form.parse(request, (err, fields, files) => {
        if (err) {
            reject(err);
        } else {
            resolve({ fields, files });
        }
        });
    });
}

exports.uploadToS3 = async(Key, Body) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    const s3 = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET
    });
    const params = {
        Bucket: BUCKET_NAME,
        Key,
        Body
    };
    return s3.upload(params).promise();
}

exports.getLaunchPath = async (entry) => {
    const xmlStr = await entry.getData().toString("utf8");
    const match = xmlStr.match(/<resource [^>]*href=["']([^"']*)["'][^>]*>/i);
    return match[0].slice(match[0].indexOf('href')+6, -2);
} 
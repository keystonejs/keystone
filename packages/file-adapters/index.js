const LocalFileAdapter = require('./lib/local-file');
const CloudinaryAdapter = require('./lib/cloudinary');
const S3Adapter = require('./lib/s3');
const AzureAdapter = require('./lib/azure');

module.exports = { LocalFileAdapter, CloudinaryAdapter, S3Adapter, AzureAdapter };

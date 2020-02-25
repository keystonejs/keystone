const urlJoin = require('url-join');
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = class AzureAdapter {
  constructor({ accountName, accountKey, containerName }) {
    this.accountName = accountName;
    this.containerName = containerName;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`
    );
    this.containerClient = blobServiceClient.getContainerClient(this.containerName);
  }

  save({ stream, filename: originalFilename, id, mimetype, encoding }) {
    const filename = this.getFilename({ id, originalFilename });
    if (!filename) {
      throw new Error('Custom function AzureAdapter.getFilename() returned no or invalid value.');
    }
    return new Promise(async (resolve, reject) => {
      const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
      try {
        const uploadBlobResponse = await blockBlobClient.uploadStream(
          stream,
          undefined,
          undefined,
          { blobHTTPHeaders: { blobContentType: mimetype, blobContentEncoding: encoding } }
        );
        if (uploadBlobResponse.requestId) {
          resolve({ ...uploadBlobResponse, filename });
        } else {
          reject();
        }
      } catch (error) {
        reject();
      }
    });
  }

  /**
   * Deletes the given file from Azure Blob Storage
   * @param file file field data
   */

  delete(file) {
    if (!file) throw new Error("Missing required argument 'file'.");
    return new Promise(async (resolve, reject) => {
      const blockBlobClient = this.containerClient.getBlockBlobClient(file.filename);
      try {
        const uploadBlobResponse = await blockBlobClient.delete();
        if (uploadBlobResponse.requestId) {
          resolve({ ...uploadBlobResponse });
        } else {
          reject();
        }
      } catch (error) {
        reject();
      }
    });
  }

  getFilename({ id, originalFilename }) {
    return `${id}-${originalFilename}`;
  }

  publicUrl({ filename }) {
    return urlJoin(
      `https://${this.accountName}.blob.core.windows.net`,
      this.containerName,
      filename
    );
  }
};

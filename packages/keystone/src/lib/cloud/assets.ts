import { Readable } from 'stream';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { FileData, ImageExtension, ImageMetadata } from '../../types/context';

function formUploadBody({
  fieldName,
  fileName,
  data,
}: {
  fieldName: string;
  fileName: string;
  data: Buffer | Readable;
}) {
  const form = new FormData();
  form.append(fieldName, data, fileName);
  return form;
}

export type CloudAssetsAPI = {
  images: {
    upload(buffer: Buffer, id: string, extension: ImageExtension): Promise<ImageMetadata>;
    url(id: string, extension: ImageExtension): string;
    metadata(id: string, extension: ImageExtension): Promise<ImageMetadata>;
  };
  files: {
    upload(stream: Readable, filename: string): Promise<FileData>;
    url(filename: string): string;
    metadata(filename: string): Promise<FileData>;
  };
};

type ImageMetadataResponse = {
  width: number;
  height: number;
  filesize: number;
  extension: ImageExtension;
};

const cloudAssetsConfigCache = new Map();

export async function getCloudAssetsAPI({ apiKey }: { apiKey: string }): Promise<CloudAssetsAPI> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'x-keystone-version': `TODO 6 RC`,
  };
  if (!cloudAssetsConfigCache.has(apiKey)) {
    const res = await fetch('https://api.staging-keystonejs.cloud/api/rest/config', { headers });
    if (!res.ok) {
      throw new Error(`Failed to load cloud config: ${res.status}\n${await res.text()}`);
    }
    const json = await res.json();
    cloudAssetsConfigCache.set(apiKey, json);
  }

  const {
    // project,
    assets,
  } = cloudAssetsConfigCache.get(apiKey)!;
  const {
    fileGetUrl,
    // fileDownloadUrl,
    fileUploadUrl,
    fileMetaUrl,
    imageGetUrl,
    imageUploadUrl,
    imageMetaUrl,
  } = assets;

  return {
    images: {
      url(id, extension) {
        return `${imageGetUrl}/${id}.${extension}`;
      },
      async metadata(id, extension): Promise<ImageMetadata> {
        const metadata: ImageMetadataResponse = await fetch(`${imageMetaUrl}/${id}.${extension}`, {
          method: 'GET',
          headers,
        }).then(x => x.json());
        return {
          extension: metadata.extension,
          height: metadata.height,
          width: metadata.width,
          filesize: metadata.filesize,
        };
      },
      async upload(buffer, id, extension) {
        const res = await fetch(imageUploadUrl, {
          method: 'POST',
          body: formUploadBody({
            data: buffer,
            fieldName: 'image',
            fileName: `${id}.${extension}`,
          }),
          headers,
        });
        if (!res.ok) {
          console.error(`${res.status} ${await res.text()}`);
          throw new Error('Error occurred when uploading image');
        }
        const metadata: ImageMetadataResponse = await res.json();
        return {
          extension: metadata.extension,
          filesize: metadata.filesize,
          height: metadata.height,
          width: metadata.width,
        };
      },
    },
    files: {
      url(filename) {
        return `${fileGetUrl}/${filename}`;
      },
      async metadata(filename) {
        const metadata = await fetch(`${fileMetaUrl}/${filename}`, { method: 'GET', headers }).then(
          x => x.json()
        );
        return {
          mode: 'cloud',
          filesize: metadata.filesize,
          filename,
        };
      },
      async upload(stream, filename) {
        const metadata = await fetch(fileUploadUrl, {
          method: 'POST',
          body: formUploadBody({ data: stream, fieldName: 'file', fileName: filename }),
          headers,
        }).then(x => x.json());
        return {
          mode: 'cloud',
          filesize: metadata.filesize,
          filename,
        };
      },
    },
    // project,
    // fileGetUrl,
    // fileDownloadUrl,
    // imageGetUrl,
    // file: { upload: fileUpload, meta: fileGetMeta },
    // image: { upload: imageUpload, meta: imageGetMeta },
  };
}

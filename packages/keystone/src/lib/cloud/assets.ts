import fetch from 'node-fetch';
import FormData from 'form-data';
import { ImageMetadata } from '../../types';
import { Readable } from 'stream';

export type MetaFile = {
  mode: AssetMode;
  filename: string;
  filesize: number;
}

export type ImageExtension = 'jpg' | 'png' | 'webp' | 'gif';
export type MetaImage = MetaFile & {
  extension: ImageExtension;
  width: number;
  height: number;
}

export type ImageData = {
  mode: AssetMode;
  id: string;
} & ImageMetadata;

function formUploadBody ({
  fieldName,
  fileName,
  stream,
}: {
  fieldName: string,
  fileName: string,
  stream: Readable,
}) {
  const form = new FormData();
  form.append(fieldName, stream, fileName);
  return form;
}

async function getCloudContext ({ apiKey }: { apiKey: string }) {
  if (!apiKey) throw new Error('No API key provided');

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'x-keystone-version': `TODO 6 RC`
  };

  const res = await fetch('https://init.keystonejs.cloud/v1/', { headers, });
  const json = await res.json();

  const { project, assets } = json;
  const {
    fileGetUrl,
    fileDownloadUrl,
    fileUploadUrl,
    fileMetaUrl,
    imageGetUrl,
    imageUploadUrl,
    imageMetaUrl,
  } = assets;

  async function fileUpload (fileName: string, body: FormData) {
    return await fetch(fileUploadUrl, {
      method: 'POST',
      body,
      headers,
    });
  }

  async function imageUpload (fileName: string, body: FormData) {
    return await fetch(imageUploadUrl, {
      method: 'POST',
      body,
      headers,
    });
  }

  async function fileGet (fileId: string, filePath: string) {
    const path = `${fileId}/${filePath}`;
    return await fetch(`${fileGetUrl}/${path}`, { method: 'GET', headers, });
  }

  async function fileDownload (fileId: string, filePath: string) {
    const path = `${fileId}/${filePath}`;
    return await fetch(`${fileDownloadUrl}/${path}`, { method: 'GET', headers, });
  }

  async function fileGetMeta (fileId: string, filePath: string) {
    const path = `${fileId}/${filePath}`;
    return await fetch(`${fileMetaUrl}/${path}`, { method: 'GET', headers, });
  }

  async function imageGet (fileId: string, filePath: string) {
    const path = `${fileId}/${filePath}`;
    return await fetch(`${imageGetUrl}/${path}`, { method: 'GET', headers, });
  }

  async function imageGetMeta (fileId: string, filePath: string) {
    const path = `${fileId}/${filePath}`;
    return await fetch(`${imageMetaUrl}/${path}`, { method: 'GET', headers, });
  }

  return {
    project,
    file: {
      get: fileGet,
      download: fileDownload,
      upload: fileUpload,
      meta: fileGetMeta,
    },
    image: {
      get: imageGet,
      upload: imageUpload,
      meta: imageGetMeta,
    },
  };
}

export { getCloudContext };

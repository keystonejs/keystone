import { Readable } from 'stream';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { ImageMetadata } from '@keystone-next/types';

export const CLOUD_GRAPHQL_API_ENDPOINT = 'localhost:4000/api/graphql';
export const CLOUD_REST_API_ENDPOINT = 'localhost:4000/api/rest';

export const buildCloudImageSrc = (domain: string, filename: string) =>
  `http://${domain}/${filename}`;

/**
 * This function and request to the cloud API will not be necessary if we can
 * encode the project's image subdomain in the apiKey.
 */
export const getImagesDomain = async (apiKey: string) => {
  const response = await fetch(CLOUD_GRAPHQL_API_ENDPOINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `  
        allImgixSources(where: { project: { apiKeys: { apiKey: $apiKey } } }) {
          domain
        }
      `,
      variables: {
        apiKey,
      },
    }),
  });
  const { data } = await response.json();
  const { allImgixSources } = data;

  return allImgixSources[0].domain;
};

export const getImageMetadataFromCloud = async (
  apiKey: string,
  filename: string
): Promise<ImageMetadata> => {
  const response = await fetch(`${CLOUD_REST_API_ENDPOINT}/images?apiKey=${apiKey}&id=${filename}`);

  return await response.json();
};

const uploadAssetToCloud = async (
  apiKey: string,
  stream: Readable,
  apiRoute: string
): Promise<any> => {
  const form = new FormData();

  form.append('image', stream);

  const response = await fetch(`${CLOUD_REST_API_ENDPOINT}/${apiRoute}`, {
    method: 'POST',
    body: form,
  });

  return await response.json();
};

export const uploadImageToCloud = async (
  apiKey: string,
  stream: Readable
): Promise<ImageMetadata> => uploadAssetToCloud(apiKey, stream, 'images');

export const uploadFileToCloud = async (apiKey: string, stream: Readable) =>
  uploadAssetToCloud(apiKey, stream, 'files');
